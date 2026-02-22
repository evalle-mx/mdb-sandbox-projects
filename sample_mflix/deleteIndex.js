// import { MongoClient } from "mongodb";
const { MongoClient } = require("mongodb");
require("dotenv").config();

// connect to your Atlas deployment
const uri = process.env.ATLAS_ADMIN_URI;
const dbName = "sample_mflix", collName="movies"; 

const { plotTitleIndexDefinition,
  plotReleasedIndexDefinition,
  autoCompleteIndexDefinition,
  dynamovies } = require("./playgrounds/SearchIndexes-repo");
 

const client = new MongoClient(uri);

// async function run(indexName) {
//     console.log(`Deleting ${"autocomplete"}`);
    
//   try {
    // const database = client.db(dbName);
    // const collection = database.collection(collName);

//     // run the helper method
//     await collection.dropSearchIndex(indexName);
    
//   } finally {
//     await client.close();
//   }
// }

//run("plotTitleIndex").catch(console.dir);


const indexesToDelete = [
      "autocomplete",
      "dynamovies",
    //   "index-three"
    ];

async function run() {
  try {
    await client.connect();

    const database = client.db(dbName);
    const collection = database.collection(collName);

    // List of index names to delete
    for (const indexName of indexesToDelete) {
      try {
        await collection.dropSearchIndex(indexName);
        console.log(`Deleted search index: ${indexName}`);
      } catch (err) {
        console.error(`Failed to delete ${indexName}:`, err.message);
      }
    }

  } finally {
    await client.close();
  }
}

//run().catch(console.dir);


async function deleteAll() {
  try {
    await client.connect();

    const database = client.db(dbName);
    const collection = database.collection(collName);

    const indexes = await collection.listSearchIndexes().toArray();

    for (const index of indexes) {
      await collection.dropSearchIndex(index.name);
      console.log(`Deleted search index: ${index.name}`);
    }

  } finally {
    await client.close();
  }
}
deleteAll().catch(console.dir);
