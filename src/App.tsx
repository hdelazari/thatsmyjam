import { useState, useEffect } from "react";
import "./App.css";

interface WordIndexEntry {
  index: number;
  originalToken: string;
}

interface WordIndex {
  [normalizedWord: string]: WordIndexEntry[];
}

interface SearchResult {
  id: string;
  title: string;
}

// Extract words while preserving Unicode letters, numbers, apostrophes, and hyphens.
const extractWord = (token: string): string => {
  return token.replace(/[^\p{L}\p{N}'’-]/gu, "");
};

// Normalize case, diacritics, and apostrophes while preserving hyphens.
const normalizeWord = (word: string): string => {
  return word
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['']/g, "");
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
  const [searchQuery, setSearchQuery] = useState(
    () => new URLSearchParams(window.location.search).get("q") || ""
  );
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [originalText, setOriginalText] = useState("");
  const [songTitle, setSongTitle] = useState("");
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

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = searchQuery.trim();
    const params = new URLSearchParams(window.location.search);
    params.delete("song");

    if (!query) {
      setSearchResults([]);
      params.delete("q");
      window.history.pushState({}, "", window.location.pathname);
      return;
    }

    setOriginalText("");
    setSongTitle("");
    setWordIndex({});
    setRevealedWords(new Set());
    params.set("q", query);
    window.history.pushState({}, "", `${window.location.pathname}?${params}`);

    fetch(`/api/songs/search?q=${encodeURIComponent(query)}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to search songs: ${response.status}`);
        }
        return response.json();
      })
      .then((results: SearchResult[]) => setSearchResults(results))
      .catch((error) => {
        console.error("Error searching songs:", error);
        setSearchResults([]);
      });
  };

  const handleSongSelect = (songId: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set("song", songId);
    params.delete("q");
    window.history.pushState({}, "", `${window.location.pathname}?${params}`);

    fetch(`/api/songs?lrclib_id=${encodeURIComponent(songId)}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load song: ${response.status}`);
        }
        return response.json();
      })
      .then((song: { title: string; lyrics: string }) => {
        setSongTitle(song.title);
        setOriginalText(song.lyrics);
        setWordIndex(buildIndex(song.lyrics));
        setRevealedWords(new Set());
        setSearchResults([]);
      })
      .catch((error) => console.error("Error loading song:", error));
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const songId = params.get("song");
    const query = params.get("q");

    if (query) {
      fetch(`/api/songs/search?q=${encodeURIComponent(query)}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to search songs: ${response.status}`);
          }
          return response.json();
        })
        .then((results: SearchResult[]) => setSearchResults(results))
        .catch((error) => console.error("Error searching songs:", error));
    }

    const selectedSongId = songId || (query ? null : "34858080");
    if (!selectedSongId) {
      return;
    }

    params.set("song", selectedSongId);
    window.history.replaceState({}, "", `${window.location.pathname}?${params}`);

    // Fetch the selected song from the Go backend
    fetch(`/api/songs?lrclib_id=${encodeURIComponent(selectedSongId)}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load song: ${response.status}`);
        }
        return response.json();
      })
      .then((song: { title: string; lyrics: string }) => {
        setSongTitle(song.title);
        setOriginalText(song.lyrics);
        const index = buildIndex(song.lyrics);
        setWordIndex(index);
      })
      .catch((error) => {
        console.error("Error loading song:", error);
      });
  }, []);

  const displayText = rebuildText(originalText, revealedWords);
  const totalUniqueWords = Object.keys(wordIndex).length;
  const revealedWordCount = revealedWords.size;
  const hasSelectedSong = Boolean(
    new URLSearchParams(window.location.search).get("song")
  );

  return (
    <div className={`app-container ${hasSelectedSong ? "" : "search-page"}`}>
      <form className="search-box" onSubmit={handleSearch}>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for a song..."
        />
        <button type="submit">Search</button>
      </form>

      {searchResults.length > 0 && (
        <div className="search-results">
          {searchResults.map((result) => (
            <button
              key={result.id}
              type="button"
              onClick={() => handleSongSelect(result.id)}
            >
              {result.title}
            </button>
          ))}
        </div>
      )}

      {hasSelectedSong && (
        <>
          <div className="progress-tracker">
            <h2>Progress: {revealedWordCount} / {totalUniqueWords}</h2>
          </div>

          <div className="song-text">
            <h3>{songTitle || "Loading..."}</h3>
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
        </>
      )}
    </div>
  );
}

export default App;