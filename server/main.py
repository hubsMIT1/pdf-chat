from fastapi import FastAPI, File, UploadFile,Body
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from PyPDF2 import PdfReader
from langchain.text_splitter import RecursiveCharacterTextSplitter
# import google.generativeai as genai
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_google_genai import GoogleGenerativeAIEmbeddings
# from langchain_community.vectorstores import Chroma
from langchain_community.vectorstores import FAISS
from langchain.chains.question_answering import load_qa_chain 
from langchain.prompts import PromptTemplate
from dotenv import dotenv_values

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:5173", 
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)
env_vars = dotenv_values()

GOOGLE_API_KEY = env_vars.get("GOOGLE_API_KEY")

chat_history = {}

def get_conversation_chain():
    # Define the prompt
    prompt_template = """
    For the given context, answer the question as detailed as possible. Make sure to provide all relevant details.
    Context:\n {context}?\n
    Question: \n{question}\n

    Answer:
    """
    model = ChatGoogleGenerativeAI(
        model="gemini-pro", google_api_key=GOOGLE_API_KEY, temperatue=0.3
    )  # Create object of gemini-pro
    prompt = PromptTemplate(template=prompt_template, input_variables=["context", "question", "chat_history"])
    chain = load_qa_chain(model, chain_type="stuff", prompt=prompt)
    return chain


def user_input(user_question, uuid):
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=GOOGLE_API_KEY)
    new_db = FAISS.load_local(f"faiss_index_{uuid}", embeddings, allow_dangerous_deserialization=True)
    docs = new_db.similarity_search(user_question)
    chain = get_conversation_chain()
    response = chain(
        {"input_documents": docs, "question": user_question, "chat_history": chat_history.get(uuid, [])},
        return_only_outputs=True,
    )
    chat_history[uuid] = chat_history.get(uuid, []) + [f"You: {user_question}\n", f"gemini: {response}\n"]
    return response["output_text"]

@app.post("/upload/{uuid}")
async def upload_pdf(uuid: str, pdf: UploadFile = File(...)):
    try:
        if pdf is not None:
            pdf_reader = PdfReader(pdf.file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text()
            text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
            chunks = text_splitter.split_text(text)
            embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=GOOGLE_API_KEY)
            vector_store = FAISS.from_texts(chunks, embeddings)
            vector_store.save_local(f"faiss_index_{uuid}")
            return JSONResponse(content={"message": "File uploaded successfully"})
    except Exception as e:
        print(str(e))
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.post("/question/{uuid}")
async def process_question(uuid: str, question: str = Body(embed=True)):
    try:
        result = user_input(question, uuid)
        return JSONResponse(content={"answer": result})
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

def delete_old_faiss_indexes():
    '''
    to delete the old faiss index files ...?(if it's older than 24 hours)
    '''
    pass