from langchain_core.globals import set_verbose
from langchain_ollama import ChatOllama, OllamaEmbeddings
from langchain.schema.output_parser import StrOutputParser
from langchain_community.vectorstores import Chroma
from langchain_community.document_loaders import UnstructuredMarkdownLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema.runnable import RunnablePassthrough
from langchain_core.prompts import ChatPromptTemplate
import chromadb
import logging
import os
import glob

set_verbose(True)

# Disable Chroma telemetry
client_settings = chromadb.Settings(anonymized_telemetry=False)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MarkdownRAG:
    def __init__(self, docs_folder: str, llm_model: str = "llama3.1", embedding_model: str = "mxbai-embed-large"):
        self.docs_folder = docs_folder
        self.model = ChatOllama(model=llm_model)
        self.embeddings = OllamaEmbeddings(model=embedding_model)
        self.text_splitter = RecursiveCharacterTextSplitter(chunk_size=1024, chunk_overlap=100)
        self.prompt = ChatPromptTemplate.from_template(
            """
            Bạn là một trợ lý AI được thiết kế để giúp các sinh viên tương lai và sinh viên mới điều hướng hành trình học tập của họ. Sử dụng thông tin được truy xuất từ cơ sở tri thức, cung cấp hướng dẫn rõ ràng, chính xác và thân thiện về các chủ đề như tuyển sinh, lựa chọn khóa học, đời sống đại học, chỗ ở, hỗ trợ tài chính và cơ hội nghề nghiệp. Nếu thông tin truy xuất không đủ, hãy sử dụng kiến thức chung để hỗ trợ. Giữ câu trả lời đầy đủ thông tin và đưa ra lời khuyên mang tính thực tiễn khi có thể.
            Bối cảnh: {context}
            Câu hỏi: {question}
            """
        )
        self.vector_store = None
        self.retriever = None

    def load_documents(self):
        """Load all markdown files from the specified folder."""
        logger.info(f"Loading markdown files from {self.docs_folder}")
        self.vector_store = None
        self.retriever = None
        
        markdown_files = glob.glob(os.path.join(self.docs_folder, "**/*.md"), recursive=True)
        if not markdown_files:
            raise ValueError(f"No markdown files found in {self.docs_folder}")

        all_chunks = []
        for file_path in markdown_files:
            try:
                loader = UnstructuredMarkdownLoader(file_path)
                docs = loader.load()
                chunks = self.text_splitter.split_documents(docs)
                # Add source filename to metadata
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
        logger.info(f"Loaded {len(markdown_files)} files with {len(all_chunks)} chunks")

    def ask(self, query: str, k: int = 3):
        if not self.vector_store:
            raise ValueError("No documents loaded. Call load_documents() first.")

        if not self.retriever:
            self.retriever = self.vector_store.as_retriever(search_kwargs={"k": k})

        retrieved_docs = self.retriever.invoke(query)
        
        # Include source files in context
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
