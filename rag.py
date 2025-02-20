from langchain_core.globals import set_verbose, set_debug
from langchain_ollama import ChatOllama, OllamaEmbeddings
from langchain.schema.output_parser import StrOutputParser
from langchain_community.vectorstores import Chroma
from langchain_community.document_loaders import (
    PyPDFLoader,
    UnstructuredPowerPointLoader,
    UnstructuredWordDocumentLoader,
    TextLoader,
    UnstructuredMarkdownLoader
)
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema.runnable import RunnablePassthrough
from langchain_community.vectorstores.utils import filter_complex_metadata
from langchain_core.prompts import ChatPromptTemplate
import logging
import os
from typing import List, Union

set_debug(True)
set_verbose(True)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ChatDOC:
    def __init__(self, llm_model: str = "llama3.2:latest", embedding_model: str = "mxbai-embed-large"):
        self.model = ChatOllama(model=llm_model)
        self.embeddings = OllamaEmbeddings(model=embedding_model)
        self.text_splitter = RecursiveCharacterTextSplitter(chunk_size=1024, chunk_overlap=100)
        self.prompt = ChatPromptTemplate.from_template(
            """
            You are a helpful assistant answering questions based on the uploaded document.
            Context:
            {context}
            
            Question:
            {question}
            
            Answer concisely and accurately in three sentences or less.
            """
        )
        self.vector_store = None
        self.retriever = None

    def _get_loader(self, file_path: str):
        """Helper method to get the appropriate loader based on file extension."""
        ext = os.path.splitext(file_path)[1].lower()
        if ext == '.pdf':
            return PyPDFLoader(file_path)
        elif ext == '.pptx':
            return UnstructuredPowerPointLoader(file_path)
        elif ext == '.docx':
            return UnstructuredWordDocumentLoader(file_path)
        elif ext in ['.txt', '.md']:  # Handle both text and markdown files
            return TextLoader(file_path)
        else:
            raise ValueError(f"Unsupported file type: {ext}")

    def ingest(self, file_paths: Union[str, List[str]]):
        """
        Ingest one or more documents into the vector store.
        
        Args:
            file_paths: Single file path or list of file paths to process
        """
        if isinstance(file_paths, str):
            file_paths = [file_paths]

        all_chunks = []
        for file_path in file_paths:
            logger.info(f"Starting ingestion for file: {file_path}")
            try:
                loader = self._get_loader(file_path)
                docs = loader.load()
                chunks = self.text_splitter.split_documents(docs)
                chunks = filter_complex_metadata(chunks)
                all_chunks.extend(chunks)
            except Exception as e:
                logger.error(f"Error processing file {file_path}: {str(e)}")
                continue

        if not all_chunks:
            raise ValueError("No documents were successfully processed")

        self.vector_store = Chroma.from_documents(
            documents=all_chunks,
            embedding=self.embeddings,
            persist_directory="chroma_db",
        )
        logger.info(f"Ingestion completed. {len(all_chunks)} chunks stored successfully.")

    def ask(self, query: str, k: int = 5, score_threshold: float = 0.2):
        if not self.vector_store:
            raise ValueError("No vector store found. Please ingest a document first.")

        if not self.retriever:
            self.retriever = self.vector_store.as_retriever(
                search_type="similarity_score_threshold",
                search_kwargs={"k": k, "score_threshold": score_threshold},
            )

        logger.info(f"Retrieving context for query: {query}")
        retrieved_docs = self.retriever.invoke(query)

        if not retrieved_docs:
            return "No relevant context found in the document to answer your question."

        formatted_input = {
            "context": "\n\n".join(doc.page_content for doc in retrieved_docs),
            "question": query,
        }

        # Build the RAG chain
        chain = (
            RunnablePassthrough()  # Passes the input as-is
            | self.prompt           # Formats the input for the LLM
            | self.model            # Queries the LLM
            | StrOutputParser()     # Parses the LLM's output
        )

        logger.info("Generating response using the LLM.")
        return chain.invoke(formatted_input)

    def clear(self):
        """
        Reset the vector store and retriever.
        """
        logger.info("Clearing vector store and retriever.")
        self.vector_store = None
        self.retriever = None
