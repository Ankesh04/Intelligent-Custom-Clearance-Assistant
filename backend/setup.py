from setuptools import setup, find_packages

setup(
    name="intelligent_customs_clearance_chatbot",  # Replace with your project name
    version="0.0.1",  # Version number
    author="Bablu kumar pandey",
    author_email="bablupandey446@gmail.com",
    description="A medical chatbot using Python",
    # long_description=open("README.md", encoding="utf-8").read() ,  # Reads the project description from README.md
    long_description_content_type="text/markdown",
    # url="https://github.com/Creator-Turbo/medical-chatbot",  # Replace with your repo URL
    packages=find_packages(),  
    include_package_data=True,
   install_requires=[
   "flask",
        "pypdf",
        "python-dotenv",
        "requests",
        "torch",
        "transformers",
        "sentence-transformers",
        "langchain",
        "langchain-community",
        "langchain-pinecone",
        "langchain-huggingface",
        "pinecone-client",
   ]
)

