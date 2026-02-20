// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

const { text } = require("express");

// The current database to use.
use("sample_mflix");

const movieProjection = {
  $project: { title: 1, year: 1, plot: 1, cast: 1, awards: 1 },
};

// db.movies.findOne(); // <== Just for Connectivity Test

/* List Search Indexes on `movies` collection. */
// db.movies.aggregate([{ $listSearchIndexes: {} }]); //Obtain a detailed list of Search Indexes

// db.movies.aggregate([
//   { $listSearchIndexes: {} },
//   { $project: { _id: 0, name: 1, type: 1, status: 1 } }, //To obtain basic info list
// ]);

// db.movies.dropSearchIndex("plot_IDX"); //Should return undefined
/* __________________________________________________ */

/* TEST1: Creating a searchIndex and find movies related with Future, targeting to find 'Back to the Future' [_id: 573a1398f29313caabce9682] */
let myQuery = "Future"; // Future | DeLorean

// db.movies.find({ title: /Future/i }, { title: 1, year: 1, plot: 1 }); // Using FULL-SCAN with RegExp
db.movies.find(
  { title: "Back to the Future" },
  { title: 1, year: 1, plot: 1, cast: 1 },
); // Using FULL-SCAN with specific Title

// 1) Create a new SearchIndex "plot_IDX" to index Plot field
// db.movies.createSearchIndex("plot_IDX", {
//   mappings: {
//     fields: {
//       plot: {
//         type: "string",
//       },
//     },
//   },
// }); //This should return the name of the index

// Test: find our Token in plot:
// db.movies.aggregate([
//   {
//     $search: {
//       index: "plot_IDX",
//       text: {
//         query: myQuery,
//         path: "plot",
//       },
//     },
//   },
//   movieProjection,
// ]); // this should return a list, but is NOT INCLUDING the movie we want

// 2) Create a 2nd Search Index 'plot_title_IDX', indexing plot and title (using CLI for demonstrative purposes)
/*
```
{
  "name": "plot_title_IDX",
  "collectionName": "movies",
  "database": "sample_mflix",
  "mappings": {
    "dynamic": false,
    "fields": {
      "plot": { "type": "string" },
      "title": { "type": "string" }
    }
  }
}
```
 $ atlas clusters search indexes create --clusterName MongoTest -f ./plotTitleIndex_def.json
*/
// db.movies.aggregate([
//   {
//     $search: {
//       index: "plot_title_IDX",
//       text: {
//         query: myQuery,
//         path: ["plot", "title"],
//       },
//     },
//   },
//   movieProjection,
// ]); //should return a list of movies INCLUDING our movie

/* 3) Create a Dynamic search Query that indexes all fields (as default) */
// db.movies.createSearchIndex({
//   mappings: {
//     dynamic: true,
//   },
// }); // it should return 'default'

/* QUERY: Movies where Actor/actress is on path (cast field) [dynamically indexed] */
// db.movies.aggregate([
//   {
//     $search: {
//       text: {
//         query: "Michael J. Fox",
//         path: "cast",
//       },
//     },
//   },
//   movieProjection,
// ]);
//   .explain();
/* Query: Movie(s) that awards.text mentioned 'Won 1 Oscar. Another 18 wins & 24 nominations.' */
// db.movies.aggregate([
//   {
//     $search: {
//       // equals: {
//       //   value: 24,
//       //   path: "awards.nominations",
//       // },
//       text: {
//         query: "Won 1 Oscar. Another 18 wins & 24",
//         path: "awards.text",
//       },
//     },
//   },
//   movieProjection,
// ]);

/* Searching for movies with tomatoes 
subProj = movieProjection.$project;
subProj.tomatoes = 1;
delete subProj.cast;
delete subProj.plot;
delete subProj.awards;
//{ title: 1, year: 1, plot: 1 };
db.movies.find({ tomatoes: { $exists: true } }, subProj); */
