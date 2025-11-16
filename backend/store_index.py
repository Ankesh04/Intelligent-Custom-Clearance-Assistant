import os
from pinecone import Pinecone, ServerlessSpec
from langchain_pinecone import PineconeVectorStore
from dotenv import load_dotenv

from src.helper import (
    load_multiple_pdfs,
    text_split,
    download_hugging_face_embeddings
)

import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)

# Load .env variables
load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")

if not PINECONE_API_KEY:
    raise ValueError("❌ PINECONE_API_KEY is missing. Add it to your .env file.")

# Use correct Pinecone client
pc = Pinecone(api_key=PINECONE_API_KEY)

# -------------------------------
# FIXED PDF PATHS - use raw strings
# -------------------------------
pdf_files = [
    r"C:\Users\HP\Desktop\Ankesh\Custom-Clearance\chatbot_backend\intelligent_customs_clearance_chatbot_1\data\Customs Tariff 2024-25_zz1tedk.pdf",
    r"C:\Users\HP\Desktop\Ankesh\Custom-Clearance\chatbot_backend\intelligent_customs_clearance_chatbot_1\data\Navigating Import.pdf",
    r"C:\Users\HP\Desktop\Ankesh\Custom-Clearance\chatbot_backend\intelligent_customs_clearance_chatbot_1\data\nepal.pdf",
    r"C:\Users\HP\Desktop\Ankesh\Custom-Clearance\chatbot_backend\intelligent_customs_clearance_chatbot_1\data\np_e.pdf",
    r"C:\Users\HP\Desktop\Ankesh\Custom-Clearance\chatbot_backend\intelligent_customs_clearance_chatbot_1\data\trade_industry_tax.pdf"
]



# Load text
extracted_data = load_multiple_pdfs(pdf_files)
text_chunks = text_split(extracted_data)

# Load embedding model
embeddings = download_hugging_face_embeddings()

index_name = "customs-clearance-chatbot"

# -----------------------------------
# Create index only if it doesn't exist
# -----------------------------------
if index_name not in pc.list_indexes().names():
    pc.create_index(
        name=index_name,
        dimension=384,
        metric="cosine",
        spec=ServerlessSpec(
            cloud="aws",
            region="us-east-1"
        )
    )

# -----------------------------------
# Upload embeddings
# -----------------------------------
docsearch = PineconeVectorStore.from_documents(
    documents=text_chunks,
    index_name=index_name,
    embedding=embeddings
)

print("✅ Index created and embeddings uploaded successfully!")
