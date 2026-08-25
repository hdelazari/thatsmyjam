import { useState, useEffect } from "react";
import "./App.css";

interface WordIndexEntry {
  index: number;
  originalToken: string;
}

interface WordIndex {
  [normalizedWord: string]: WordIndexEntry[];
}

function App() {
  const [inputValue, setInputValue] = useState("");
  const [originalText, setOriginalText] = useState("");
  const [wordIndex, setWordIndex] = useState<WordIndex>({});
  const [highlightedWords, setHighlightedWords] = useState<Set<string>>(
    new Set()
  );

  // Extract word from token (keep alphanumeric and apostrophes only)
  const extractWord = (token: string): string => {
    return token.replace(/[^a-zA-Z0-9'']/g, "");
  };

  // Normalize a word (lowercase + remove apostrophes)
  const normalizeWord = (word: string): string => {
    return word.toLowerCase().replace(/['']/g, "");
  };

  // Build inverted index from original text
  const buildIndex = (text: string): WordIndex => {
    const tokens = text.split(/\s+/);
    const index: WordIndex = {};

    tokens.forEach((token, idx) => {
      if (token.trim()) {
        const word = extractWord(token);
        const normalized = normalizeWord(word);

        if (normalized) {
          if (!index[normalized]) {
            index[normalized] = [];
          }
          index[normalized].push({
            index: idx,
            originalToken: token,
          });
        }
      }
    });

    return index;
  };

  // Rebuild the text display based on original text and highlighted words
  const rebuildText = (
    text: string,
    highlighted: Set<string>
  ): string => {
    // Split on whitespace while preserving it
    const tokens = text.split(/(\s+)/);

    tokens.forEach((token, idx) => {
      // Skip pure whitespace tokens
      if (!token.trim()) return;

      const word = extractWord(token);
      const normalized = normalizeWord(word);

      if (highlighted.has(normalized)) {
        tokens[idx] = `<span class="highlight">${token}</span>`;
      }
    });

    // Join with empty string since whitespace is already preserved in tokens
    return tokens.join("");
  };

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

      // Check if this word exists in the index
      if (wordIndex[normalizedInput]) {
        // Add to highlighted words
        const newHighlighted = new Set(highlightedWords);
        newHighlighted.add(normalizedInput);
        setHighlightedWords(newHighlighted);
      }
    }
  };

  useEffect(() => {
    // Fetch the file from public/songs/test.txt
    fetch("/songs/test.txt")
      .then((response) => response.text())
      .then((data) => {
        setOriginalText(data);
        const index = buildIndex(data);
        setWordIndex(index);
      })
      .catch((error) => {
        console.error("Error loading file:", error);
      });
  }, []);

  const displayText = rebuildText(originalText, highlightedWords);

  return (
    <div className="app-container">
      <div className="song-text">
        <h3>Song Text</h3>
        <pre dangerouslySetInnerHTML={{ __html: displayText }} />
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