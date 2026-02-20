# 🎬 Movies CRUD API

A REST API built with **Node.js**, **Express**, **MongoDB** (Atlas), **CORS**, and **dotenv** for the `sample_mflix.movies` collection.

---

## 📁 Project Structure

```
movies-api/
├── config/
│   └── db.js          # MongoDB connection
├── routes/
│   └── movies.js      # All CRUD route handlers
├── .env.example       # Environment variable template
├── .gitignore
├── package.json
├── server.js          # App entry point
└── README.md
```

---

## ⚙️ Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
Copy `.env.example` to `.env` and fill in your Atlas connection string:
```bash
cp .env.example .env
```

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
PORT=3000
```

> **Note:** Your Atlas cluster must have the **Sample Dataset** loaded  
> (`sample_mflix` database → `movies` collection).

### 3. Start the server
```bash
# Production
npm start

# Development (auto-restart with nodemon)
npm run dev
```

Server runs at: `http://localhost:3000`

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/movies` | List movies (paginated + filterable) |
| GET | `/api/movies/:id` | Get single movie |
| POST | `/api/movies` | Create a new movie |
| PUT | `/api/movies/:id` | Full replacement of a movie |
| PATCH | `/api/movies/:id` | Partial update of a movie |
| DELETE | `/api/movies/:id` | Delete a movie |

---

## 🔍 GET /api/movies – Query Parameters

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (default: `1`) |
| `limit` | number | Results per page (default: `10`, max: `50`) |
| `title` | string | Case-insensitive partial match on title |
| `genre` | string | Exact genre match (e.g. `Comedy`) |
| `year` | number | Release year (e.g. `1985`) |
| `rated` | string | Rating (e.g. `PG`, `R`) |

**Example:**
```
GET /api/movies?title=back+to+the+future&page=1&limit=5
GET /api/movies?genre=Comedy&year=1985
```

---

## 🧪 Postman Examples

### GET – List all movies (page 1)
```
GET http://localhost:3000/api/movies
```

### GET – Search by title
```
GET http://localhost:3000/api/movies?title=godfather&limit=5
```

### GET – Filter by genre and year
```
GET http://localhost:3000/api/movies?genre=Sci-Fi&year=1985
```

### GET – Single movie
```
GET http://localhost:3000/api/movies/573a1398f29313caabce9682
```

### POST – Create a movie
```
POST http://localhost:3000/api/movies
Content-Type: application/json

{
  "title": "My New Movie",
  "year": 2024,
  "runtime": 120,
  "genres": ["Drama", "Thriller"],
  "rated": "PG-13",
  "plot": "A gripping new story.",
  "directors": ["Jane Doe"],
  "cast": ["Actor One", "Actor Two"],
  "languages": ["English"],
  "countries": ["USA"],
  "type": "movie",
  "imdb": { "rating": 7.5, "votes": 1000, "id": 9999999 },
  "awards": { "wins": 0, "nominations": 2, "text": "2 nominations." }
}
```

### PATCH – Update only specific fields
```
PATCH http://localhost:3000/api/movies/<id>
Content-Type: application/json

{
  "rated": "R",
  "metacritic": 90
}
```

### PUT – Full document replacement
```
PUT http://localhost:3000/api/movies/<id>
Content-Type: application/json

{
  "title": "Replaced Movie",
  "year": 2024,
  "type": "movie"
}
```

### DELETE – Remove a movie
```
DELETE http://localhost:3000/api/movies/<id>
```

---

## 📦 Response Format

### List response
```json
{
  "total": 23530,
  "page": 1,
  "limit": 10,
  "totalPages": 2353,
  "data": [ ...movies ]
}
```

### Error response
```json
{ "error": "Movie not found." }
```
