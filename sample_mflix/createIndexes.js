/*  Manage MongoDB Search Indexes
https://www.mongodb.com/docs/atlas/atlas-search/manage-indexes/?deployment-type=atlas&interface=driver&language=nodejs#manage-mongodb-search-indexes 
*/

// import { MongoClient } from "mongodb";
const { MongoClient } = require("mongodb");
require("dotenv").config();

// connect to your Atlas deployment
const uri = process.env.ATLAS_ADMIN_URI;

/** Reads definitions from Constants */
const { plotTitleIndexDefinition,
  plotReleasedIndexDefinition,
  autoCompleteIndexDefinition,
  dynamovies } = require("./playgrounds/SearchIndexes-repo");

const client = new MongoClient(uri);


const arrIndexes = [
    plotTitleIndexDefinition,
    , plotReleasedIndexDefinition,
    , autoCompleteIndexDefinition
    // , dynamovies
];

async function run() {
  try {
    const database = client.db("sample_mflix");
    const collection = database.collection("movies");

    // define an array of MongoDB Search indexes
    /* // De la lista de constantes */
    const indexes = [];
    arrIndexes.forEach(inx => {
        indexes.push({name:inx.name, definition:{mappings:inx.mappings} })
    });        

    /* //Explicito
    const indexes = [
        {
            name: "autocomplete",
            definition:{
                "mappings": {
                    "dynamic": false,
                    "fields": {
                    "title": [
                        {
                        "analyzer": "lucene.keyword",
                        "foldDiacritics": true,
                        "maxGrams": 7,
                        "minGrams": 4,
                        "tokenization": "edgeGram",
                        "type": "autocomplete"
                        },
                        {
                        "type": "string"
                        }
                    ]
                    }
                }
            }
        }
    ] //*/
    
    console.log('indexes: ', indexes);
    if(indexes.length>3){
        console.log('M0 no soporta mas de 3 Indices');
        return;
    }

    // run the helper method
    const result = await collection.createSearchIndexes(indexes);
    console.log(result);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
