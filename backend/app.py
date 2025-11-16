from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from src.helper import download_hugging_face_embeddings
from langchain_pinecone import PineconeVectorStore
from langchain_classic.chains import create_retrieval_chain
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from langchain_core.chat_history import InMemoryChatMessageHistory
from dotenv import load_dotenv
from deep_translator import GoogleTranslator
from langdetect import detect
from src.prompt import *
import os
import tempfile
from werkzeug.utils import secure_filename
from PyPDF2 import PdfReader
from docx import Document
from PIL import Image
import pytesseract

# -------------------------------------------------------------------
# Flask Setup
# -------------------------------------------------------------------
app = Flask(__name__)
CORS(app)      # Allow frontend → backend connection
load_dotenv()

# -------------------------------------------------------------------
# Load API Keys
# -------------------------------------------------------------------
PINECONE_API_KEY = os.getenv('PINECONE_API_KEY')
HUGGINGFACEHUB_API_TOKEN = os.getenv('HUGGINGFACEHUB_API_TOKEN')

if not PINECONE_API_KEY or not HUGGINGFACEHUB_API_TOKEN:
    raise ValueError("❌ Missing API keys. Check your .env file.")

os.environ['PINECONE_API_KEY'] = PINECONE_API_KEY
os.environ['HUGGINGFACEHUB_API_TOKEN'] = HUGGINGFACEHUB_API_TOKEN
print("✅ API Keys Loaded")

# -------------------------------------------------------------------
# Embeddings + Pinecone
# -------------------------------------------------------------------
embeddings = download_hugging_face_embeddings()
index_name = "customs-clearance-chatbot"

docsearch = PineconeVectorStore.from_existing_index(
    index_name=index_name,
    embedding=embeddings
)
retriever = docsearch.as_retriever(search_type="similarity", search_kwargs={"k": 3})

# -------------------------------------------------------------------
# LLM
# -------------------------------------------------------------------
llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0.7,
    max_tokens=512,
    max_retries=3,
)

# -------------------------------------------------------------------
# Prompt Template
# -------------------------------------------------------------------
prompt = ChatPromptTemplate.from_messages([
    ("system", system_prompt),
    ("placeholder", "{chat_history}"),
    ("human", "{input}"),
])

# -------------------------------------------------------------------
# Conversation Memory
# -------------------------------------------------------------------
store = {}

def get_session_history(session_id: str):
    if session_id not in store:
        store[session_id] = InMemoryChatMessageHistory()
    return store[session_id]

# -------------------------------------------------------------------
# RAG Chain
# -------------------------------------------------------------------
question_answer_chain = create_stuff_documents_chain(llm, prompt)
rag_chain = create_retrieval_chain(retriever, question_answer_chain)

rag_chain_with_memory = RunnableWithMessageHistory(
    rag_chain,
    get_session_history,
    input_messages_key="input",
    history_messages_key="chat_history",
    output_messages_key="answer"
)

# -------------------------------------------------------------------
# Routes
# -------------------------------------------------------------------
@app.route("/")
def home():
    return "Customs Clearance AI Backend Running!"

# -------------------------------------------------------------------
# Chat Endpoint (🚀 React Uses This)
# -------------------------------------------------------------------
@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    msg = data.get("query")

    if not msg:
        return jsonify({"error": "No query provided"}), 400

    print("🧍 User:", msg)

    # Language detection
    try:
        detected_lang = detect(msg)
    except:
        detected_lang = "en"

    supported_langs = {"en": "en", "hi": "hi", "ne": "ne", "mai": "mai"}
    user_lang = supported_langs.get(detected_lang, "en")

    # Translate → English
    if user_lang != "en":
        translated_input = GoogleTranslator(source=user_lang, target="en").translate(msg)
    else:
        translated_input = msg

    session_id = "default_user"

    # RAG
    response = rag_chain_with_memory.invoke(
        {"input": translated_input},
        config={"configurable": {"session_id": session_id}}
    )

    english_answer = response["answer"]

    # Translate back to original language
    if user_lang != "en":
        final_answer = GoogleTranslator(source="en", target=user_lang).translate(english_answer)
    else:
        final_answer = english_answer

    return jsonify({
        "answer": final_answer,
        "source": "Customs Clearance AI"
    })

# -------------------------------------------------------------------
# File Upload & Verification
# -------------------------------------------------------------------
ALLOWED_EXTENSIONS = {"pdf", "docx", "jpg", "jpeg", "png"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type"}), 400

    filename = secure_filename(file.filename)

    # Save temp
    with tempfile.NamedTemporaryFile(delete=False) as temp:
        file.save(temp.name)
        file_path = temp.name

    ext = filename.rsplit(".", 1)[1].lower()
    extracted_text = ""

    # Extract Text
    try:
        if ext == "pdf":
            reader = PdfReader(file_path)
            for page in reader.pages:
                extracted_text += page.extract_text() or ""

        elif ext == "docx":
            doc = Document(file_path)
            for para in doc.paragraphs:
                extracted_text += para.text + "\n"

        elif ext in ["jpg", "jpeg", "png"]:
            image = Image.open(file_path)
            extracted_text = pytesseract.image_to_string(image)

        os.remove(file_path)

        if not extracted_text.strip():
            return jsonify({"reply": "No readable text found."})

        # ---- Verification Prompt ----
        verification_prompt = (
            "You are a Customs Document Verification Assistant.\n"
            "Analyze the text and classify the document type.\n"
            "Check for: HS Code, Product Description, Origin, Value, Importer/Exporter.\n"
            "Respond in this format:\n"
            "📄 Document Type: \n"
            "📋 Status: \n"
            "🔍 Verification: \n"
            "💡 Issues: \n\n"
            f"Document:\n{extracted_text[:3000]}"
        )

        verification_response = llm.invoke(verification_prompt)
        verification_result = verification_response.content.strip()

        # ---- RAG Explanation ----
        session_id = "default_user"

        response = rag_chain_with_memory.invoke(
            {"input": extracted_text},
            config={"configurable": {"session_id": session_id}}
        )

        english_answer = response["answer"]

        try:
            detected_lang = detect(extracted_text)
        except:
            detected_lang = "en"

        supported_langs = {"en": "en", "hi": "hi", "ne": "ne", "mai": "mai"}
        user_lang = supported_langs.get(detected_lang, "en")

        if user_lang != "en":
            translated_analysis = GoogleTranslator(source="en", target=user_lang).translate(english_answer)
            translated_verification = GoogleTranslator(source="en", target=user_lang).translate(verification_result)
        else:
            translated_analysis = english_answer
            translated_verification = verification_result

        return jsonify({
            "verification": translated_verification,
            "analysis": translated_analysis
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -------------------------------------------------------------------
# Run Server
# -------------------------------------------------------------------
if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)

