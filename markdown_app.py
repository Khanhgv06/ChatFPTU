import streamlit as st
from streamlit_chat import message
from markdown_rag import MarkdownRAG
import os

DOCS_FOLDER = "data\\md\\"  # Change this to your markdown folder path

def init_session():
    if "messages" not in st.session_state:
        st.session_state.messages = []
    if "assistant" not in st.session_state:
        st.session_state.assistant = MarkdownRAG(DOCS_FOLDER)
        try:
            st.session_state.assistant.load_documents()
        except ValueError as e:
            st.error(str(e))

def display_chat():
    for i, (msg, is_user) in enumerate(st.session_state.messages):
        message(msg, is_user=is_user, key=str(i))

def process_input():
    if st.session_state.user_input and len(st.session_state.user_input.strip()) > 0:
        user_text = st.session_state.user_input.strip()
        with st.spinner("Thinking..."):
            try:
                agent_text = st.session_state.assistant.ask(
                    user_text,
                    k=st.session_state.num_results
                )
            except ValueError as e:
                agent_text = str(e)

        st.session_state.messages.append((user_text, True))
        st.session_state.messages.append((agent_text, False))

def main():
    st.set_page_config(page_title="Markdown Documentation Assistant")
    st.title("Markdown Documentation Assistant")

    init_session()

    # Sidebar
    with st.sidebar:
        st.header("Settings")
        st.session_state.num_results = st.slider(
            "Number of relevant chunks", 
            min_value=1, 
            max_value=10, 
            value=3
        )
        
        if st.button("Reload Documents"):
            with st.spinner("Reloading documents..."):
                try:
                    st.session_state.assistant.load_documents()
                    st.success("Documents reloaded successfully!")
                except ValueError as e:
                    st.error(str(e))
        
        if st.button("Clear Chat"):
            st.session_state.messages = []
            st.rerun()

    # Main chat interface
    display_chat()
    st.text_input(
        "Ask about the documentation",
        key="user_input",
        on_change=process_input
    )

    # Show loaded files
    with st.expander("Loaded Documentation Files"):
        docs_path = DOCS_FOLDER
        if os.path.exists(docs_path):
            markdown_files = [f for f in os.listdir(docs_path) if f.endswith('.md')]
            for file in markdown_files:
                st.text(file)
        else:
            st.warning(f"Documentation folder not found: {docs_path}")

if __name__ == "__main__":
    main()
