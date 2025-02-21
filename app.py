from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import logging
from langchain_core.globals import set_verbose
from langchain_ollama import ChatOllama, OllamaEmbeddings
from langchain.schema.output_parser import StrOutputParser
from langchain_community.vectorstores import Chroma
from langchain_community.document_loaders import TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema.runnable import RunnablePassthrough
from langchain_core.prompts import ChatPromptTemplate
import chromadb
import glob

set_verbose(True)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Disable Chroma telemetry
client_settings = chromadb.Settings(anonymized_telemetry=False)

app = FastAPI()

class QueryRequest(BaseModel):
    question: str

class TextRAG:
    def __init__(self, docs_folder: str, llm_model: str = "llama3.3", embedding_model: str = "mxbai-embed-large"):
        self.docs_folder = docs_folder
        self.model = ChatOllama(model=llm_model)
        self.embeddings = OllamaEmbeddings(model=embedding_model)
        self.text_splitter = RecursiveCharacterTextSplitter(chunk_size=2048, chunk_overlap=200)
        self.prompt = ChatPromptTemplate.from_template(
            """
            Bạn là một trợ lý AI hỗ trợ sinh viên. Sử dụng thông tin từ cơ sở tri thức để đưa ra câu trả lời chính xác.
            Bối cảnh: {context}
            Câu hỏi: {question}
            """
        )
        self.vector_store = None
        self.retriever = None

    def load_documents(self):
        """Load all text files from the specified folder."""
        logger.info(f"Loading text files from {self.docs_folder}")
        self.vector_store = None
        self.retriever = None
        
        text_files = glob.glob(os.path.join(self.docs_folder, "**/*.txt"), recursive=True)
        if not text_files:
            raise ValueError(f"No text files found in {self.docs_folder}")

        all_chunks = []
        for file_path in text_files:
            try:
                loader = TextLoader(file_path, encoding='utf-8')
                docs = loader.load()
                chunks = self.text_splitter.split_documents(docs)
                for chunk in chunks:
                    chunk.metadata['source'] = os.path.relpath(file_path, self.docs_folder)
                all_chunks.extend(chunks)
            except Exception as e:
                logger.error(f"Error processing {file_path}: {str(e)}")

        if not all_chunks:
            raise ValueError("No documents were successfully processed")

        self.vector_store = Chroma.from_documents(
            documents=all_chunks,
            embedding=self.embeddings,
            persist_directory="markdown_db",
            client_settings=client_settings
        )
        logger.info(f"Loaded {len(text_files)} files with {len(all_chunks)} chunks")

    def ask(self, query: str, k: int = 3):
        if not self.vector_store:
            raise ValueError("No documents loaded. Call load_documents() first.")

        if not self.retriever:
            self.retriever = self.vector_store.as_retriever(search_kwargs={"k": k})

        retrieved_docs = self.retriever.invoke(query)
        
        context_parts = []
        for doc in retrieved_docs:
            source = doc.metadata.get('source', 'unknown')
            context_parts.append(f"[From: {source}]\n{doc.page_content}")
        
        formatted_input = {
            "context": "\n\n".join(context_parts),
            "question": query
        }

        chain = (
            RunnablePassthrough()
            | self.prompt
            | self.model
            | StrOutputParser()
        )

        return chain.invoke(formatted_input)

docs_folder = "data\\txt\\" 
rag_system = TextRAG(docs_folder)
rag_system.load_documents()

@app.post("/query")
async def query(request: QueryRequest):
    try:
        response = rag_system.ask(request.question)
        return {"answer": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
