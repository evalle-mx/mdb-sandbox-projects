const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

const COLLECTION = "movies";

// Helper – validate ObjectId
function isValidId(id) {
  return ObjectId.isValid(id) && String(new ObjectId(id)) === id;
}

// ─── GET /api/movies ──────────────────────────────────────────────────────────
// Query params:
//   page     (default 1)
//   limit    (default 10, max 50)
//   title    – partial, case-insensitive search
//   genre    – exact genre match inside the genres array
//   year     – release year (number)
//   rated    – e.g. PG, R, G
router.get("/", async (req, res) => {
  try {
    const db = await getDB();
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.title)
      filter.title = { $regex: req.query.title, $options: "i" };
    if (req.query.genre) filter.genres = req.query.genre;
    if (req.query.year) filter.year = parseInt(req.query.year);
    if (req.query.rated) filter.rated = req.query.rated.toUpperCase();

    const [movies, total] = await Promise.all([
      db.collection(COLLECTION).find(filter).skip(skip).limit(limit).toArray(),
      db.collection(COLLECTION).countDocuments(filter),
    ]);

    res.json({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: movies,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/movies/:id ──────────────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id))
      return res.status(400).json({ error: "Invalid movie id." });

    const db = await getDB();
    const movie = await db
      .collection(COLLECTION)
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!movie) return res.status(404).json({ error: "Movie not found." });
    res.json(movie);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/movies ─────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const body = req.body;

    // Basic required field validation
    if (!body.title)
      return res.status(400).json({ error: 'Field "title" is required.' });

    // Coerce types that arrive as strings from Postman form-data
    if (body.year) body.year = parseInt(body.year);
    if (body.runtime) body.runtime = parseInt(body.runtime);
    if (body.released && typeof body.released === "string")
      body.released = new Date(body.released);

    // Default type
    if (!body.type) body.type = "movie";

    const db = await getDB();
    const result = await db.collection(COLLECTION).insertOne(body);

    res.status(201).json({ insertedId: result.insertedId, data: body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PUT /api/movies/:id ──────────────────────────────────────────────────────
// Full replacement of the document (except _id).
router.put("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id))
      return res.status(400).json({ error: "Invalid movie id." });

    const body = { ...req.body };
    delete body._id; // never replace _id

    if (!body.title)
      return res.status(400).json({ error: 'Field "title" is required.' });
    if (body.year) body.year = parseInt(body.year);
    if (body.runtime) body.runtime = parseInt(body.runtime);
    if (body.released && typeof body.released === "string")
      body.released = new Date(body.released);

    const db = await getDB();
    const result = await db
      .collection(COLLECTION)
      .replaceOne({ _id: new ObjectId(req.params.id) }, body);

    if (result.matchedCount === 0)
      return res.status(404).json({ error: "Movie not found." });

    res.json({
      message: "Movie replaced successfully.",
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PATCH /api/movies/:id ────────────────────────────────────────────────────
// Partial update – only provided fields are updated.
router.patch("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id))
      return res.status(400).json({ error: "Invalid movie id." });

    const updates = { ...req.body };
    delete updates._id;

    if (Object.keys(updates).length === 0)
      return res.status(400).json({ error: "No fields provided for update." });

    if (updates.year) updates.year = parseInt(updates.year);
    if (updates.runtime) updates.runtime = parseInt(updates.runtime);
    if (updates.released && typeof updates.released === "string")
      updates.released = new Date(updates.released);

    const db = await getDB();
    const result = await db
      .collection(COLLECTION)
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updates });

    if (result.matchedCount === 0)
      return res.status(404).json({ error: "Movie not found." });

    res.json({
      message: "Movie updated successfully.",
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE /api/movies/:id ───────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id))
      return res.status(400).json({ error: "Invalid movie id." });

    const db = await getDB();
    const result = await db
      .collection(COLLECTION)
      .deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0)
      return res.status(404).json({ error: "Movie not found." });

    res.json({ message: "Movie deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
