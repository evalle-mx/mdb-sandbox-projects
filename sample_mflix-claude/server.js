require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const { connectDB, closeDB } = require('./config/db');
const moviesRouter = require('./routes/movies');

const app  = express();
const PORT = process.env.NODE_PORT || 3000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: 'Movies API is running 🎬',
    endpoints: {
      'GET    /api/movies'       : 'List movies (paginated). Query: page, limit, title, genre, year, rated',
      'GET    /api/movies/:id'   : 'Get a single movie by id',
      'POST   /api/movies'       : 'Create a new movie',
      'PUT    /api/movies/:id'   : 'Fully replace a movie',
      'PATCH  /api/movies/:id'   : 'Partially update a movie',
      'DELETE /api/movies/:id'   : 'Delete a movie',
    },
  });
});

app.use('/api/movies', moviesRouter);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found.` });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error.' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
async function start() {
  await connectDB();
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });

  // Graceful shutdown
  process.on('SIGINT',  () => shutdown(server));
  process.on('SIGTERM', () => shutdown(server));
}

async function shutdown(server) {
  console.log('\nShutting down gracefully...');
  server.close(async () => {
    await closeDB();
    process.exit(0);
  });
}

start();
