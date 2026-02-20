// General use Playground for testing Search Indexes in the sample_mflix database

/*  The current database to use. */
use("sample_mflix");
// db.movies.findOne();

/* >>> LIST of Search Indexes: <<< */
// db.movies.aggregate([{ $listSearchIndexes: {} }]);
// db.movies.aggregate([
//   { $listSearchIndexes: {} },
//   { $project: { _id: 0, name: 1, type: 1, status: 1 } },
// ]); //Reduced details

/* >>> DELETE/DROP INDEX <<< */
// db.movies.dropSearchIndex("plotReleasedIndex"); //Should return undefined

/* =================== Search Index (GEN) =============================== */
/* Create a Search Index with the following specification */
// db.movies.createSearchIndex("plotReleasedIndex", { //plotTitleIndex
//   // createSearchIndex | updateSearchIndex
//   collectionName: "movies",
//   database: "sample_mflix",
//   mappings: {
//     dynamic: false,
//     fields: {
//       plot: { type: "string" },
//      //title: { type: "string" },
//       released: { type: "date" },
//     },
//   },
// }); //This should return the name of the index

/* ==================== AutoComplete ============================== */
// db.movies.createSearchIndex("autocomplete", {
//   mappings: {
//     dynamic: false,
//     fields: {
//       title: {
//         type: "autocomplete",
//         analyzer: "lucene.standard",
//         tokenization: "edgeGram",
//         minGrams: 4,
//         maxGrams: 7,
//         foldDiacritics: true,
//       },
//       plot: {
//         type: "autocomplete",
//         analyzer: "lucene.keyword",
//         maxGrams: 7,
//         minGrams: 4,
//         foldDiacritics: false,
//       },
//     },
//   },
// }); //This should return the name of the index

// const searchTerm = "Wars Star";
// db.movies.aggregate([
//   {
//     $search: {
//       index: "autocomplete",
//       autocomplete: {
//         query: searchTerm,
//         path: "title",
//         tokenOrder: "any", // any | sequential
//       },
//     },
//   },
//   { $project: { _id: 0, title: 1, score: { $meta: "searchScore" } } },
// ]);

/* ==================== AutoComplete 2 (exact matching more Score)============================== */
// db.movies.updateSearchIndex("autocomplete", {
//   mappings: {
//     dynamic: false,
//     fields: {
//       title: [
//         {
//           type: "autocomplete",
//           analyzer: "lucene.standard",
//           tokenization: "edgeGram",
//           minGrams: 4,
//           maxGrams: 7,
//           foldDiacritics: true,
//         },
//         { type: "string" },
//       ],
//       plot: {
//         type: "autocomplete",
//         analyzer: "lucene.keyword",
//         maxGrams: 7,
//         minGrams: 4,
//         foldDiacritics: false,
//       },
//     },
//   },
// }); //This should return undefined

const searchTerm = "Star Wars Episode II - Attack of the Clones";
const autocomplete = {
  autocomplete: {
    query: searchTerm,
    path: "title",
    tokenOrder: "sequential", // any | sequential
  },
};

const text = {
  text: {
    query: searchTerm,
    path: "title",
  },
};

// db.movies.aggregate([
//   {
//     $search: {
//       index: "autocomplete", //autocompleteIndex
//       compound: {
//         should: [autocomplete, text],
//         minimumShouldMatch: 1,
//       },
//     },
//   },
//   { $project: { _id: 0, title: 1, score: { $meta: "searchScore" } } },
// ]);

// db.movies.aggregate([
//   {
//     $search: {
//       index: "autocomplete", //autocompleteIndex
//       compound: {
//         should: [
//           autocomplete,
//           {
//             text: {
//               query: searchTerm,
//               path: "title",
//             },
//           },
//         ],
//         minimumShouldMatch: 1,
//       },
//     },
//   },
//   { $project: { _id: 0, title: 1, score: { $meta: "searchScore" } } },
// ]);

/* ==================== AutoComplete 3 (Starts-with) Keyword analyzer ============================== */
/* !!! 
 - Query must be exact, 
 - Query is case sensitive if fodlDiacritics is false 
 - If Query is longer than maxGrams, results may not be as expected */

const startWithTerm = "Back to";

// db.movies.updateSearchIndex("autocomplete", {
//   mappings: {
//     dynamic: false,
//     fields: {
//       title: [
//         {
//           type: "autocomplete",
//           analyzer: "lucene.keyword",
//           tokenization: "edgeGram",
//           minGrams: 4,
//           maxGrams: 7,
//           foldDiacritics: true,
//         },
//         { type: "string" },
//       ],
//     },
//   },
// }); //This should return undefined

db.movies.aggregate([
  {
    $search: {
      index: "autocomplete",
      autocomplete: {
        query: startWithTerm,
        path: "title",
        tokenOrder: "sequential", // strict to sequential
      },
    },
  },
  { $project: { _id: 0, title: 1, score: { $meta: "searchScore" } } },
]);
