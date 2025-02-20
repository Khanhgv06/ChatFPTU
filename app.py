import os
import time
import streamlit as st
from streamlit_chat import message
from rag import ChatDOC

st.set_page_config(page_title="RAG")


def display_messages():
    st.subheader("Chat History")
    for i, (msg, is_user) in enumerate(st.session_state["messages"]):
        message(msg, is_user=is_user, key=str(i))
    st.session_state["thinking_spinner"] = st.empty()


def process_input():
    if st.session_state["user_input"] and len(st.session_state["user_input"].strip()) > 0:
        user_text = st.session_state["user_input"].strip()
        with st.session_state["thinking_spinner"], st.spinner("Thinking..."):
            try:
                agent_text = st.session_state["assistant"].ask(
                    user_text,
                    k=st.session_state["retrieval_k"],
                    score_threshold=st.session_state["retrieval_threshold"],
                )
            except ValueError as e:
                agent_text = str(e)

        st.session_state["messages"].append((user_text, True))
        st.session_state["messages"].append((agent_text, False))


def read_and_save_file():
    st.session_state["assistant"].clear()
    st.session_state["messages"] = []
    st.session_state["user_input"] = ""

    for uploaded_file in st.session_state["file_uploader"]:
        with st.session_state["ingestion_spinner"], st.spinner(f"Ingesting {uploaded_file.name}..."):
            t0 = time.time()
            file_content = uploaded_file.read()
            
            # Create a temporary file in memory
            file_path = os.path.join(os.getcwd(), uploaded_file.name)
            with open(file_path, 'wb') as f:
                f.write(file_content)
            
            try:
                st.session_state["assistant"].ingest(file_path)
                t1 = time.time()
                st.session_state["messages"].append(
                    (f"Ingested {uploaded_file.name} in {t1 - t0:.2f} seconds", False)
                )
            finally:
                # Clean up the file after ingestion
                if os.path.exists(file_path):
                    os.remove(file_path)


def page():
    if len(st.session_state) == 0:
        st.session_state["messages"] = []
        st.session_state["assistant"] = ChatDOC()

    st.header("RAG")

    st.subheader("Upload a Document")
    st.file_uploader(
        "Upload a PDF document",
        type=["pdf", "docx", "pptx", "txt", "md"],
        key="file_uploader",
        on_change=read_and_save_file,
        label_visibility="collapsed",
        accept_multiple_files=True,
    )

    st.session_state["ingestion_spinner"] = st.empty()

    st.subheader("Settings")
    st.session_state["retrieval_k"] = st.slider(
        "Number of Retrieved Results (k)", min_value=1, max_value=10, value=5
    )
    st.session_state["retrieval_threshold"] = st.slider(
        "Similarity Score Threshold", min_value=0.0, max_value=1.0, value=0.2, step=0.05
    )

    display_messages()
    st.text_input("Message", key="user_input", on_change=process_input)

    if st.button("Clear Chat"):
        st.session_state["messages"] = []
        st.session_state["assistant"].clear()


if __name__ == "__main__":
    page()
