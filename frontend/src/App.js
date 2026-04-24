import React, { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [numQuestions, setNumQuestions] = useState(20);
  const [quiz, setQuiz] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a PDF file");
      return;
    }

    setLoading(true);
    setQuiz([]);
    setSelectedAnswers({});
    setShowResult(false);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "quiz");
      formData.append("num_questions", numQuestions);

      const response = await fetch("https://abqariquiz.onrender.com/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.questions) {
        setQuiz(data.questions);
      } else {
        alert("❌ No quiz generated. Try another PDF.");
      }

    } catch (error) {
      console.error(error);
      alert("⚠️ Something went wrong. Try smaller PDF or check your internet.");
    }

    setLoading(false);
  };

  const handleOptionSelect = (qIndex, optionKey) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [qIndex]: optionKey
    });
  };

  const calculateScore = () => {
    let score = 0;

    quiz.forEach((q, index) => {
      if (selectedAnswers[index] === q.answer) {
        score++;
      }
    });

    return score;
  };

  const downloadPDF = async () => {
    try {
      const response = await fetch("https://abqariquiz.onrender.com/download-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(quiz)
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "quiz.pdf";
      a.click();

    } catch (error) {
      console.error(error);
      alert("PDF download failed");
    }
  };

  return (
    <div style={{
  width: "100%",    
  padding: "20px",
  maxWidth: "600px",
  margin: "auto",
  textAlign: "center"
}}>
    

      {/* CARD */}
      <div style={{
        maxWidth: "800px",
        margin: "auto",
        background: "white",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)"
      }}>

        <h1 style={{ marginBottom: "5px" }}>
          <span style={{ color: "#0B3C5D" }}>Abqari</span>
          <span style={{ color: "#FF7A00" }}>Quiz</span>
        </h1>
        <p style={{ textAlign: "center", color: "gray" }}>
          Convert your PDF into a practice Quiz
        </p>

        <hr />

        {/* Upload */}
        <input
         type="file"
         accept="application/pdf"
         onChange={(e) => setFile(e.target.files[0])}
         style={{ width: "100%", marginBottom: "10px" }}
         />

        <br /><br />

        {/* Questions */}
        <label>Number of Questions:</label>
        <input
         type="number"
         value={numQuestions}
         onChange={(e) => setNumQuestions(e.target.value)}
         style={{
         width: "80%",
         padding: "10px",
         marginTop: "10px"
         }}
         />

        <br /><br />

        <button
  onClick={handleUpload}
  disabled={loading}
  style={{
    width: "100%",
    padding: "10px 15px",
    background: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "5px",
     fontSize: "16px",
    marginTop: "10px"
  }}
>
  {loading ? "Generating..." : "Generate Quiz"}
</button>

        <hr />

        {loading && <p>⏳ Generating Quiz (30-120 sec)...</p>}
        

        {/* Quiz */}
        {quiz.map((q, index) => (
          <div key={index} style={{ marginBottom: "20px" }}>
            <h3 style={{ fontSize: "18px", textAlign: "left" }}>
              {index + 1}. {q.question}
            </h3>

            {Object.entries(q.options).map(([key, value]) => (
              <div key={key} style={{ marginBottom: "8px", textAlign: "left" }}>
                <label>
                  <input
                    type="radio"
                    name={`question-${index}`}
                    value={key}
                    checked={selectedAnswers[index] === key}
                    disabled={showResult}
                    onChange={() => handleOptionSelect(index, key)}
                  />
                  {key}. {value}
                </label>
              </div>
            ))}

            {showResult && (
              <div>
                <p><b>Answer:</b> {q.answer}</p>
                <p><b>Explanation:</b> {q.explanation}</p>
              </div>
            )}

            <hr />
          </div>
        ))}

        {/* Submit */}
        {quiz.length > 0 && !showResult && (
  <div style={{ marginTop: "10px" }}>
    
    <button onClick={() => setShowResult(true)} style={{ marginRight: "10px" }}>
      Submit Quiz
    </button>

     <button
    onClick={downloadPDF}
    style={{
      width: "100%",
      padding: "12px",
      background: "#0B3C5D",
      color: "white",
      border: "none",
      borderRadius: "8px",
      marginTop: "10px"
    }}
  >
    📄 Download Quiz PDF
  </button>

  </div>
)}

        {/* Result */}
        {showResult && (
          <div>
            <h2>Score: {calculateScore()} / {quiz.length}</h2>

            <button onClick={downloadPDF}>
              📄 Download PDF
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
  

