from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

def generate_quiz_pdf(questions, file_path="quiz.pdf"):
    doc = SimpleDocTemplate(file_path)
    styles = getSampleStyleSheet()

    content = []

    # 📝 Questions
    for i, q in enumerate(questions):
        content.append(Paragraph(f"{i+1}. {q['question']}", styles["Normal"]))
        content.append(Spacer(1, 10))

        for key, value in q["options"].items():
            content.append(Paragraph(f"{key}. {value}", styles["Normal"]))

        content.append(Spacer(1, 20))

    # 📌 Answers Section
    content.append(Paragraph("Answers:", styles["Heading2"]))
    content.append(Spacer(1, 10))

    for i, q in enumerate(questions):
        content.append(Paragraph(f"{i+1}. {q['answer']}", styles["Normal"]))

    doc.build(content)

    return file_path