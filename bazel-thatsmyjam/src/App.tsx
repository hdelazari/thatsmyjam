import { useState, useEffect } from "react";
import "./App.css";

interface WordIndexEntry {
  index: number;
  originalToken: string;
}

interface WordIndex {
  [normalizedWord: string]: WordIndexEntry[];
}

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

function App() {
  const [inputValue, setInputValue] = useState("");
  const [originalText, setOriginalText] = useState("");
  const [wordIndex, setWordIndex] = useState<WordIndex>({});
  const [revealedWords, setRevealedWords] = useState<Set<string>>(
    new Set()
  );

  // Rebuild the text display based on original text and revealed words
  const rebuildText = (
    text: string,
    revealed: Set<string>
  ): string => {
    // Split on whitespace while preserving it
    const tokens = text.split(/(\s+)/);

    tokens.forEach((token, idx) => {
      // Skip pure whitespace tokens
      if (!token.trim()) return;

      const word = extractWord(token);
      const normalized = normalizeWord(word);

      if (revealed.has(normalized)) {
        // Word is revealed - show the actual word
        // Use fixed width to match blank word width
        tokens[idx] = `<span class="revealed-word" style="width: ${token.length}ch">${token}</span>`;
      } else {
        // Word is not revealed - show a blank rectangle
        // Use the original token length to match the revealed word width
        const blankWidth = token.length;
        tokens[idx] = `<span class="blank-word" style="width: ${blankWidth}ch">_</span>`;
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
        // Add to revealed words
        const newRevealed = new Set(revealedWords);
        newRevealed.add(normalizedInput);
        setRevealedWords(newRevealed);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setInputValue("");
  };

  useEffect(() => {
    // Fetch the song from the Go backend
    fetch("/api/songs/test")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load song: ${response.status}`);
        }
        return response.json();
      })
      .then((song: { lyrics: string }) => {
        setOriginalText(song.lyrics);
        const index = buildIndex(song.lyrics);
        setWordIndex(index);
      })
      .catch((error) => {
        console.error("Error loading file:", error);
      });
  }, []);

  const displayText = rebuildText(originalText, revealedWords);
  const totalUniqueWords = Object.keys(wordIndex).length;
  const revealedWordCount = revealedWords.size;

  return (
    <div className="app-container">
      <div className="progress-tracker">
        <h2>Progress: {revealedWordCount} / {totalUniqueWords}</h2>
      </div>

      <div className="song-text">
        <h3>Song Text</h3>
        <pre dangerouslySetInnerHTML={{ __html: displayText }} />
      </div>

      <form className="input-box" onSubmit={handleSubmit}>
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