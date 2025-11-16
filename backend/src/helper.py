
from langchain_text_splitters import RecursiveCharacterTextSplitter


# NEW (Updated)
from langchain_huggingface import HuggingFaceEmbeddings  

# New (Updated)
from langchain_community.document_loaders import PyPDFLoader, DirectoryLoader

 

# Load multiple PDFs (from different files or directories)
# Here extraction of data from the pdf using different form the pdf 


def load_multiple_pdfs(folder_path):
    documents = []
    for path in folder_path:
        if path.endswith(".pdf"):
            # Load a single PDF file
            loader = PyPDFLoader(path)
            documents.extend(loader.load())
        else:
            # Load all PDFs from a directory
            loader = DirectoryLoader(path, glob="*.pdf", loader_cls=PyPDFLoader)
            documents.extend(loader.load())
    return documents


# Example usage:Remember to use you own path here this is loacation of my path 
pdf_files = [
    r"D:\ANKESH\PROJECTS\Customs Clearance\Ankesh\Custom-Clearance\backend\data\Customs Tariff 2024-25_zz1tedk.pdf",
    r"D:\ANKESH\PROJECTS\Customs Clearance\Ankesh\Custom-Clearance\backend\data\Navigating Import.pdf",
    r"D:\ANKESH\PROJECTS\Customs Clearance\Ankesh\Custom-Clearance\backend\data\nepal.pdf",
    r"D:\ANKESH\PROJECTS\Customs Clearance\Ankesh\Custom-Clearance\backend\data\np_e.pdf",
    r"D:\ANKESH\PROJECTS\Customs Clearance\Ankesh\Custom-Clearance\backend\data\trade_industry_tax.pdf"
    

]



all_documents = load_multiple_pdfs(pdf_files)
# print(len(all_documents))  



# split the data  into text chunks 
def text_split(all_documents) :
    text_splitter = RecursiveCharacterTextSplitter(chunk_size = 750, chunk_overlap = 70 )
    text_chunks = text_splitter.split_documents(all_documents)

    return text_chunks





def download_hugging_face_embeddings():
    # NEW (Updated)
    embeddings = HuggingFaceEmbeddings(model_name='sentence-transformers/all-MiniLM-L6-v2')
    return embeddings

embeddings = download_hugging_face_embeddings()
