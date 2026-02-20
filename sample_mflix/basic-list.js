/* ####  SINGLETON TO READ CONTENT FROM sample_mfix.movies collection (sample dataset) [projection, limit to 10 and pagination]:
 - Find
 - Aggregate with Search Index
 - Pagination with limit and page query params
 - Default Limit Pattern (Common in APIs)
 
 USAGE: http://localhost:3000/api/movies || http://localhost:3000/api/movies?limit=20&page=2
        http://localhost:3000/api/movieagg?plot=token || http://localhost:3000/api/movieagg?released=1994
        (You can also combine plot and released for more specific queries)
        
 To Run: 
 1) Set your MongoDB Atlas URI in a .env file (ATLAS_MONGOTEST)
 2) Run the server with `npm run basic` or `npm run dev`
 3) Test the endpoints using a REST client or browser:
  http://localhost:3000/api/movies || http://localhost:3000/api/movies?limit=20&page=2
  $ cd mdb-sample_mfix  nodemon basic-list.js
*/

const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const app = express();
const PORT = process.env.NODE_PORT;

app.use(cors());

const uri = process.env.ATLAS_MONGOTEST; // Set this in a .env file
console.log(`Connecting to uri: ${uri}`);

const client = new MongoClient(uri);

const vProjection = {
  projection: {
    title: 1,
    poster: 1,
    year: 1,
    genres: 1,
    directors: 1,
    // imdb: 1,
    "imdb.rating": 1,
  },
};

//This endpoint uses FIND
app.get("/api/movies", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  console.log(`<GET> page:${page}, limit: ${limit}, skip: ${skip}`);

  const vQuery = { type: "movie" };
  try {
    await client.connect();
    const db = client.db("sample_mflix");
    const collection = db.collection("movies");

    const movies = await collection
      .find(vQuery, vProjection)
      .skip(skip)
      .limit(limit)
      .toArray();

    res.json(movies);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

/* Endpoint para usar el Search Index USES AGGREGATE */
app.get("/api/movieagg", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 0;
  const skip = (page - 1) * limit;
  // const indexName = req.query.indexname || "plotReleasedIndex";
  console.log(`<movieagg> page:${page}, limit: ${limit}, skip: ${skip}`);

  var searchCriteria;

  if ((req.query.plot || req.query.text) && !req.query.released) {
    searchCriteria = {
      $search: {
        //index: indexName,
        index: "plotTitleIndex",
        text: {
          query: req.query.plot,
          path: ["plot", "title"],
        },
      },
    };
  } else if (req.query.released) {
    console.log(`released: ${req.query.released}`);
    const year = parseInt(req.query.released);

    searchCriteria = {
      $search: {
        index: "plotReleasedIndex",
        range: {
          path: "released",
          gt: new Date(year + "-01-01"), // ISODate("1994-01-01T00:00:00.000Z"), //Min
          lt: new Date(year + "-12-31"), //ISODate("1999-12-31T23:59:59.000Z"), //Max
        },
      },
    };
  } else {
    //Default to a simple match-all if no query is provided
    searchCriteria = {
      $match: { type: "movie" },
    };
  }

  console.log("searchCriteria: ", JSON.stringify(searchCriteria, null, 2));

  const pipeline = [
    searchCriteria,
    {
      $project: {
        _id: 0,
        title: 1,
        released: 1,
        poster: 1,
        cast: 1,
        year: 1,
        score: { $meta: "searchScore" },
      },
    },
  ];

  /* If LIMIT is not defined by the user, we can set a default limit to prevent overwhelming the server with too many results.
      We can also set a maximum limit to prevent abuse (e.g., if someone tries to set limit=1000).
   */
  if (typeof limit === "number" && limit > 0) {
    pipeline.push({ $limit: limit });
  }

  /* Default Limit Pattern (Common in APIs) */
  // const DEFAULT_LIMIT = 20,
  //   MAX_LIMIT = 100;

  // pipeline.push({ $limit: Math.min(limit || DEFAULT_LIMIT, MAX_LIMIT) });

  // const vQuery = { type: "movie" };
  console.log("pipeline: ", JSON.stringify(pipeline, null, 2));

  try {
    await client.connect();
    const db = client.db("sample_mflix");
    const collection = db.collection("movies");

    const movies = await collection.aggregate(pipeline).toArray();

    res.json(movies);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
