import Editor from "@monaco-editor/react";
import { useTheme } from '../context/ThemeContext';

const CodeEditor = ({ code, setCode, language, disabled }) => {
  const { darkMode } = useTheme();

  const getMonacoLanguage = () => {
    switch (language) {
      case "cpp":
        return "cpp";
      case "java":
        return "java";
      case "python":
        return "python";
      case "javascript":
        return "javascript";
      default:
        return "plaintext";
    }
  };

  return (
    <div className="w-full h-96">
      <Editor
        height="100%"
        language={getMonacoLanguage()}
        value={code}
        onChange={(value) => setCode(value || "")}
        theme={darkMode ? "vs-dark" : "vs-light"}
        options={{
          readOnly: disabled,
          fontSize: 14,
          minimap: { enabled: false },
          automaticLayout: true,
        }}
      />
    </div>
  );
};

export default CodeEditor;

