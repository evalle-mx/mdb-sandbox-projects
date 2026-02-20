/* This is a non-executable file with index definitions to be used in the Atlas Search Workshop. */

const plotTitleIndexDefinition = {
  name: "plotTitleIndex",
  collectionName: "movies",
  database: "sample_mflix",
  mappings: {
    dynamic: false,
    fields: {
      plot: { type: "string" },
      title: { type: "string" },
    },
  },
};

const plotReleasedIndexDefinition = {
  name: "plotReleasedIndex",
  collectionName: "movies",
  database: "sample_mflix",
  mappings: {
    dynamic: false,
    fields: {
      plot: { type: "string" },
      released: { type: "date" },
    },
  },
};

const autoCompleteIndexDefinition = {
  name: "autocomplete",
  collectionName: "movies",
  database: "sample_mflix",
  mappings: {
    dynamic: false,
    fields: {
      title: {
        type: "autocomplete",
        analyzer: "lucene.standard",
        tokenization: "edgeGram",
        minGrams: 4,
        maxGrams: 7,
        foldDiacritics: true,
      },
      plot: {
        type: "autocomplete",
        analyzer: "lucene.keyword",
        maxGrams: 7,
        minGrams: 4,
        foldDiacritics: false,
      },
    },
  },
};
