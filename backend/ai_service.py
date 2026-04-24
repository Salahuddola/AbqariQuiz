from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

MODEL = "llama-3.1-8b-instant"  # working model

def generate_quiz(chunk):
    prompt = f"""
Generate  MCQs from the text below.

STRICT RULES:
- ONLY normal MCQs (NO assertion-reason)
- NO i, ii or multi-part questions
- Each question must be single and clear
- 4 options (A, B, C, D)
- Only ONE correct answer
- Questions should be exam-level
- Avoid repetition

Return in JSON format ONLY:
{{
  "questions": [
    {{
      "question": "...",
      "options": {{
        "A": "...",
        "B": "...",
        "C": "...",
        "D": "..."
      }},
      "answer": "A",
      "explanation": "..."
    }}
  ]
}}

TEXT:
{chunk}
"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}]
    )

    return response.choices[0].message.content



   