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

      const response = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.questions) {
        setQuiz(data.questions);
      } else {
        alert("No quiz generated");
      }

    } catch (error) {
      console.error(error);
      alert("Error uploading file");
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
      const response = await fetch("http://localhost:8000/download-pdf", {
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
      background: "#f5f6fa",
      minHeight: "100vh",
      padding: "20px"
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

        <h1 style={{ textAlign: "center" }}>AbqariQuiz 🚀</h1>
        <p style={{ textAlign: "center", color: "gray" }}>
          Convert your PDF into a practice Quiz
        </p>

        <hr />

        {/* Upload */}
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <br /><br />

        {/* Questions */}
        <label>Number of Questions:</label>
        <input
          type="number"
          value={numQuestions}
          onChange={(e) => setNumQuestions(e.target.value)}
          style={{ marginLeft: "10px", width: "60px" }}
        />

        <br /><br />

        <button onClick={handleUpload} disabled={loading} style={{
          padding: "10px 15px",
          background: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "5px"
        }}>
          Generate Quiz
        </button>

        <hr />

        {loading && <p>⏳ Generating Quiz (30-120 sec)...</p>}
        

        {/* Quiz */}
        {quiz.map((q, index) => (
          <div key={index} style={{ marginBottom: "20px" }}>
            <h3>{index + 1}. {q.question}</h3>

            {Object.entries(q.options).map(([key, value]) => (
              <div key={key}>
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
    marginLeft: "10px",
    background: "#98b4d2",
    color: "white",
    padding: "8px",
    borderRadius: "5px"
  }}
>
  📄 Download PDF
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
  

