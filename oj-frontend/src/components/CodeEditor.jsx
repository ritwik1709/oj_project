const CodeEditor = ({ code, setCode, language, disabled }) => {
  return (
    <div className="w-full">
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className={`w-full h-96 font-mono p-4 bg-gray-800 text-white rounded ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        placeholder={`Write your ${language} code here...`}
        disabled={disabled}
      />
    </div>
  );
};

export default CodeEditor; 