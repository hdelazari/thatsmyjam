import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [inputValue, setInputValue] = useState("");
  const [modifiedText, setModifiedText] = useState("");

  // Helper to normalize words (lowercase + remove apostrophes)
  const normalizeWord = (word: string) =>
    word.toLowerCase().replace(/['’]/g, "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Clear input if space is typed
    if (newValue.endsWith(" ")) {
      setInputValue("");
    } else {
      setInputValue(newValue);
    }

    if (newValue.trim() !== "") {
      const normalizedInput = normalizeWord(newValue);

      // Split text into segments by word boundaries
      const updated = modifiedText
        .split(/\b/)
        .map((segment) => {
          const normalizedSegment = normalizeWord(segment);
          if (normalizedSegment === normalizedInput) {
            return `<span class="highlight">${segment}</span>`;
          }
          return segment;
        })
        .join("");

      setModifiedText(updated);
    }
  };

  useEffect(() => {
    // Fetch the file from public/songs/test.txt
    fetch("/songs/test.txt")
      .then((response) => response.text())
      .then((data) => {
        setModifiedText(data);
      })
      .catch((error) => {
        console.error("Error loading file:", error);
      });
  }, []);

  return (
    <div className="app-container">
      <div className="song-text">
        <h3>Song Text</h3>
        <pre dangerouslySetInnerHTML={{ __html: modifiedText }} />
      </div>

      <form className="input-box" onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          placeholder="Type something..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default App;