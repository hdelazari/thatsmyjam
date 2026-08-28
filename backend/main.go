package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"strings"
	"sync"
	"time"
)

// Song represents a song with its lyrics
type Song struct {
	ID    string `json:"id"`
	Title string `json:"title"`
	Lyrics string `json:"lyrics"`
}

const (
	lrclibURL = "https://lrclib.net/api/get"
)

var httpClient = &http.Client{Timeout: 10 * time.Second}
var songCache struct {
	sync.Mutex
	id   string
	song *Song
}

type lrclibResponse struct {
	ID          int    `json:"id"`
	TrackName   string `json:"trackName"`
	ArtistName  string `json:"artistName"`
	PlainLyrics string `json:"plainLyrics"`
}

type lrclibSearchResult struct {
	ID         int    `json:"id"`
	TrackName  string `json:"trackName"`
	ArtistName string `json:"artistName"`
}

func fetchSong(lrclibID string) (Song, error) {
	songCache.Lock()
	defer songCache.Unlock()

	if songCache.song != nil && songCache.id == lrclibID {
		return *songCache.song, nil
	}

	lyricsRequestURL := lrclibURL + "/" + url.PathEscape(lrclibID)
	request, err := http.NewRequest(http.MethodGet, lyricsRequestURL, nil)
	if err != nil {
		return Song{}, fmt.Errorf("create lyrics request: %w", err)
	}
	request.Header.Set("User-Agent", "ThatsMyJam/DEV https://github.com/hdelazari/thatsmyjam")

	response, err := httpClient.Do(request)
	if err != nil {
		return Song{}, fmt.Errorf("request lyrics: %w", err)
	}
	defer response.Body.Close()

	if response.StatusCode != http.StatusOK {
		return Song{}, fmt.Errorf("LRCLIB returned status %d", response.StatusCode)
	}

	var payload lrclibResponse
	if err := json.NewDecoder(response.Body).Decode(&payload); err != nil {
		return Song{}, fmt.Errorf("decode lyrics response: %w", err)
	}
	lyrics := strings.TrimSpace(payload.PlainLyrics)
	if lyrics == "" {
		return Song{}, fmt.Errorf("LRCLIB returned no plain lyrics")
	}

	songID := lrclibID
	if payload.ID != 0 {
		songID = fmt.Sprintf("%d", payload.ID)
	}
	title := payload.TrackName
	if title == "" {
		title = "Unknown song"
	}

	song := Song{
		ID:     songID,
		Title:  title,
		Lyrics: lyrics,
	}
	songCache.song = &song
	songCache.id = lrclibID
	return song, nil
}

// handleGetSong returns a song selected by its LRCLIB ID.
func handleGetSong(w http.ResponseWriter, r *http.Request) {
	lrclibID := r.URL.Query().Get("lrclib_id")
	if lrclibID == "" {
		http.Error(w, "lrclib_id query parameter is required", http.StatusBadRequest)
		return
	}

	song, err := fetchSong(lrclibID)
	if err != nil {
		log.Printf("Could not fetch LRCLIB song %q: %v", lrclibID, err)
		http.Error(w, "Unable to load song lyrics", http.StatusBadGateway)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(song)
}

// handleSearchSongs searches for songs by title
func handleSearchSongs(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	if query == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Search query required"})
		return
	}

	searchURL := "https://lrclib.net/api/search?" + url.Values{
		"track_name": {query},
	}.Encode()
	request, err := http.NewRequest(http.MethodGet, searchURL, nil)
	if err != nil {
		http.Error(w, "Unable to create search request", http.StatusInternalServerError)
		return
	}
	request.Header.Set("User-Agent", "ThatsMyJam/1.0")

	response, err := httpClient.Do(request)
	if err != nil {
		log.Printf("Could not search songs: %v", err)
		http.Error(w, "Unable to search songs", http.StatusBadGateway)
		return
	}
	defer response.Body.Close()

	if response.StatusCode != http.StatusOK {
		http.Error(w, "Lyrics provider search failed", http.StatusBadGateway)
		return
	}

	var matches []lrclibSearchResult
	if err := json.NewDecoder(response.Body).Decode(&matches); err != nil {
		http.Error(w, "Unable to decode search results", http.StatusBadGateway)
		return
	}

	results := make([]Song, 0, len(matches))
	for _, match := range matches {
		results = append(results, Song{
			ID:    fmt.Sprintf("%d", match.ID),
			Title: fmt.Sprintf("%s - %s", match.TrackName, match.ArtistName),
		})
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(results)
}

// handleListSongs returns all available songs
func handleListSongs(w http.ResponseWriter, r *http.Request) {
	if r.URL.Query().Get("lrclib_id") != "" {
		handleGetSong(w, r)
		return
	}

	songs := []Song{{ID: "test", Title: "Test Song"}}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(songs)
}

// handleHealth returns a health check
func handleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

func main() {
	// API routes
	http.HandleFunc("/api/health", handleHealth)
	http.HandleFunc("/api/songs/search", handleSearchSongs)
	http.HandleFunc("/api/songs", handleListSongs)

	port := ":8080"
	fmt.Printf("Starting server on http://localhost%s\n", port)
	log.Fatal(http.ListenAndServe(port, nil))
}
