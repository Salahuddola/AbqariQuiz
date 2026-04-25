from fastapi import FastAPI, UploadFile,Form
import shutil
import os
import time
import json
import re

from pdf_utils import extract_text_from_pdf
from chunking import split_text
from concurrent.futures import ThreadPoolExecutor

from fastapi.middleware.cors import CORSMiddleware
from ai_service import  generate_quiz
from pdf_generator import generate_quiz_pdf
from fastapi.responses import FileResponse
from pydantic import BaseModel

class QuizRequest(BaseModel):
    questions: list


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # sab allow
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = "uploads"

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
def safe_parse_quiz(response_text):
    try:
        json_str = re.search(r'\{.*\}', response_text, re.DOTALL).group()
        return json.loads(json_str)
    except Exception as e:
        print("❌ JSON parse error:", e)
        return None   
    
@app.post("/download-pdf")
async def download_pdf(data: QuizRequest):

    file_path = generate_quiz_pdf(data.questions)

    return FileResponse(
        path=file_path,
        filename="quiz.pdf",
        media_type='application/pdf'
    )



@app.post("/upload")
async def upload_pdf(
    file: UploadFile,
    type: str = Form(...),
    num_questions: int = Form(20)   # 👈 yaha add karo
):

    try:
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)

        # save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # extract text
        text = extract_text_from_pdf(file_path)

        # 🔥 split into chunks
        chunks = split_text(text)

        if type == "quiz":
          all_questions = []

          for chunk in chunks:
              try:
                  quiz_text = generate_quiz(chunk)
                  print("RAW:", quiz_text)

                  quiz_json = safe_parse_quiz(quiz_text)

                  if quiz_json and "questions" in quiz_json:
                      all_questions.extend(quiz_json["questions"])

                  time.sleep(1)

              except Exception as e:
                 print("❌ Error:", e)
                 continue

          if not all_questions:
               return {"error": "No quiz generated"}

          final_questions = all_questions[:num_questions]

          return {"questions": final_questions}
        return {"error": "Invalid type. Use 'quiz'"}


    except Exception as e:
        return {"error": str(e)}