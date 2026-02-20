/*. Lesson 3: Lab 1 & 2 
We loaded the variables into mongosh by using the following command in the mongosh tab:
load("sample_mflix/playgrounds/lab/query.js")

After loading the variables, we ran the query in the mongosh tab:
db.movies.aggregate([searchStage, projectStage, limitStage]);


In the mongosh tab, adjust the query term to "Star Wars" and then run the query again. You can do this either by reloading the query.js file, or by using the following command:
searchStage.$search.autocomplete.query = "Star Wars"

db.movies.aggregate([searchStage, projectStage, limitStage]);

Lab 2:
For next lab, use tokenOrder: sequential instead of any, and observe the results. You can do this by using the following command:
*/

// const searchStage = {
//   $search: {
//     index: "autocomplete", //autocompleteIndex
//     autocomplete: {
//       query: "Star Wars Episode II - Attack of the Clones", // adjust this query term to "Star Wars" for the next part of the lab
//       path: "title",
//       tokenOrder: "sequential", // any | sequential
//     },
//   },
// };

const projectStage = {
  $project: { title: 1, _id: 0, score: { $meta: "searchScore" } },
};

const limitStage = {
  $limit: 5,
};

/* Lesson 4 Lab 1 */

/* Next lab For Exact Matches First ()
... query: "Star Wars Episode II - Attack of the Clones",  tokenOrder: "sequential",
We loaded the variables into mongosh by using the following command in the mongosh tab:
load("sample_mflix/playgrounds/lab/query.js")

After loading the variables, we ran the query in the mongosh tab:
db.movies.aggregate([searchStage, projectStage, limitStage]);

*/
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

const searchStage = {
  $search: {
    index: "autocomplete", //autocompleteIndex
    compound: {
      should: [autocomplete, text],
      minimumShouldMatch: 1,
    },
  },
};
