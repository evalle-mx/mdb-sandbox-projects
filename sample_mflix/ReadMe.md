# MDB-sample_mflix subProject

(Postman: mdb-COMMON-backend)

#### Standard Query-Filter list:

http://localhost:3000/api/movies

#### Using search-Query (optional defaults):

(It requires Search index: 'plotReleasedIndex')

- http://localhost:3000/api/movieagg
- http://localhost:3000/api/movieagg?indexname=MyIndice&page=5&limit=25

Cluster: [Search & Vector Search](https://cloud.mongodb.com/v2/6852f0c0c59e4f19f9b24ed9#/clusters/atlasSearch/MongoTest)

## Playgrounds:

- GenericPlayground-1 : Simple testing with query
- AtlasSearch-1: Atlas search fundamentals

> mongosh:
> const fs = require('fs');
> const plotReleasedIndexDef = JSON.parse(fs.readFileSync('sample_mflix/playgrounds/plotReleasedIndex_def.json', 'utf8'));
> db.runCommand({ createSearchIndexes: "movies", indexes: [ { name: "plotReleasedIndex", definition: plotReleasedIndexDef } ] });
