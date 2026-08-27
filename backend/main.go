package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
)

// Song represents a song with its lyrics
type Song struct {
	ID    string `json:"id"`
	Title string `json:"title"`
	Lyrics string `json:"lyrics"`
}

// SongStore holds all available songs
var songStore map[string]Song

func init() {
	songStore = make(map[string]Song)
	loadSongs()
}

// loadSongs loads songs from the public/songs directory
func loadSongs() {
	// Read test.txt as the first song
	lyricsPath := "public/songs/test.txt"
	data, err := os.ReadFile(lyricsPath)
	if err != nil {
		log.Printf("Warning: Could not load test.txt: %v\n", err)
		return
	}

	songStore["test"] = Song{
		ID:    "test",
		Title: "Test Song",
		Lyrics: string(data),
	}
	log.Println("Loaded song: test")
}

// handleGetSong returns a song by ID
func handleGetSong(w http.ResponseWriter, r *http.Request) {
	songID := strings.TrimPrefix(r.URL.Path, "/api/songs/")

	song, exists := songStore[songID]
	if !exists {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Song not found"})
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

	var results []Song
	query = strings.ToLower(query)

	for _, song := range songStore {
		if strings.Contains(strings.ToLower(song.Title), query) {
			results = append(results, song)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(results)
}

// handleListSongs returns all available songs
func handleListSongs(w http.ResponseWriter, r *http.Request) {
	var songs []Song
	for _, song := range songStore {
		songs = append(songs, Song{
			ID:    song.ID,
			Title: song.Title,
			// Don't include lyrics in the list response
		})
	}

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
	http.HandleFunc("/api/songs/", handleGetSong)
	http.HandleFunc("/api/songs", handleListSongs)

	port := ":8080"
	fmt.Printf("Starting server on http://localhost%s\n", port)
	log.Fatal(http.ListenAndServe(port, nil))
}
