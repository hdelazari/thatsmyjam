# That's My Jam - Backend Setup

## Project Structure

```
ThatsMyJam/
├── MODULE.bazel       # Bazel 9 dependency configuration
├── BUILD              # Root build file
├── backend/           # Go backend
│   ├── BUILD          # Bazel build file for backend
│   ├── main.go        # Backend server code
│   └── go.mod         # Go module file
└── frontend/          # React TypeScript frontend
    ├── src/
    ├── package.json
    └── vite.config.ts
```

## Backend Features

The Go backend provides RESTful API endpoints for song management:

- **GET /api/health** - Health check endpoint
- **GET /api/songs** - List all available songs
- **GET /api/songs/search?q=query** - Search songs by title
- **GET /api/songs/{id}** - Get a specific song with its lyrics

## Building with Bazel

### Prerequisites

1. **Install Bazel 9** on Windows:
   ```powershell
   choco install bazel
   ```
   Or download from https://bazel.build/install

2. **Install Go** (the Bazel rules download the configured SDK):
   ```powershell
   choco install golang
   ```

### Build the Backend

```bash
# Build the backend binary
bazel build //backend:backend

# The binary will be in bazel-bin/backend/backend (or backend.exe on Windows)
```

### Run the Backend

```bash
# Run directly via Bazel
bazel run //backend:backend

# Or run the compiled binary directly
./bazel-bin/backend/backend.exe  # Windows
./bazel-bin/backend/backend      # Linux/macOS
```

The backend will start on `http://localhost:8080`.

## API Usage

### Get all songs
```bash
curl http://localhost:8080/api/songs
```

### Search for songs
```bash
curl "http://localhost:8080/api/songs/search?q=test"
```

### Get a specific song
```bash
curl http://localhost:8080/api/songs/test
```

### Health check
```bash
curl http://localhost:8080/api/health
```

## Integration with Frontend

To use the backend from the React frontend, update the fetch URL in [src/App.tsx](src/App.tsx):

```typescript
// Change from:
fetch("/songs/test.txt")

// To:
fetch("http://localhost:8080/api/songs/test")
  .then(response => response.json())
  .then(data => {
    setOriginalText(data.lyrics);
    // ... rest of your code
  })
```

## Next Steps

- Add more songs to `public/songs/` and update the backend to load them
- Add a database (PostgreSQL, SQLite) for song storage
- Add authentication/authorization
- Deploy using Bazel with Docker rules
