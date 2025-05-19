import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const ProblemDetail = () => {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/problems/${id}`);
        setProblem(res.data);
      } catch (err) {
        console.error("Error loading problem", err);
      }
    };
    fetchProblem();
  }, [id]);

  const handleRun = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/submissions/run", {
        problemId: id,
        language,
        code,
      });
      setOutput(res.data.resultOutput);
    } catch (err) {
      setOutput("Error running code.");
    }
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/submissions/submit", {
        problemId: id,
        language,
        code,
      });
      setOutput(`Verdict: ${res.data.verdict}`);
    } catch (err) {
      setOutput("Error submitting code.");
    }
  };

  if (!problem) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-2">{problem.title}</h2>
      <p className="mb-4">{problem.description}</p>

      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="border px-2 py-1 mb-2"
      >
        <option value="cpp">C++</option>
        <option value="java">Java</option>
        <option value="javascript">JavaScript</option>
      </select>

      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        rows={10}
        className="w-full p-2 border mb-4 rounded font-mono"
        placeholder="// Write your code here..."
      />

      <div className="flex gap-2">
        <button onClick={handleRun} className="bg-yellow-500 text-white px-4 py-2 rounded">
          Run
        </button>
        <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded">
          Submit
        </button>
      </div>

      {output && (
        <div className="mt-4 p-4 border rounded bg-gray-100">
          <strong>Output:</strong>
          <pre className="whitespace-pre-wrap">{output}</pre>
        </div>
      )}
    </div>
  );
};

export default ProblemDetail;
