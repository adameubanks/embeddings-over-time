<img src="https://raw.githubusercontent.com/adameubanks/embeddings-over-time/3aee3a88bb40ad58bfe0c1a95e47ce01f4bd5a9a/favicon.svg" height="100">

# Embeddings Over Time Explorer

An interactive platform for exploring how language has evolved over time through word embeddings. This project visualizes word2vec embeddings trained on the FineWeb dataset from 2005-2022, allowing users to track semantic changes and discover linguistic patterns across nearly two decades.

## 🚀 Live Demo

**[Try it out here](https://adameubanks.github.io/embeddings-over-time/)**

## ✨ Features

- **Nearest Neighbors**: Find the most semantically similar words for any term in a given year
- **Semantic Evolution**: Track how the relationship between word groups changes across years
- **Embedding Projection**: Interactive 1D and 2D projections with customizable semantic axes
- **Word Analogies**: Explore semantic relationships through vector arithmetic (e.g., "king - man + woman")

## 🛠️ Technology

- **Frontend**: React + TypeScript
- **UI**: Material-UI
- **Visualization**: Recharts
- **Deployment**: GitHub Pages
- **Data**: Word2vec embeddings from FineWeb dataset (2005-2025)

## 🎯 Research Context

This project is part of a larger research initiative exploring how embedding spaces can quantify language evolution over time. By analyzing semantic shifts in word vectors across different years, we can gain insights into how language, culture, and technology have influenced our vocabulary and communication patterns.

## 📊 Dataset

The embeddings are based on the FineWeb dataset, specifically from the first 3 and last 3 web crawls of this comprehensive web corpus. To create yearly snapshots of language evolution, we filtered articles by identifying those containing years in their URLs (2020, 2019, etc.) and grouped them accordingly. This process allowed us to create distinct yearly subsets spanning 2005-2025.

For each year's article group, we trained word2vec embeddings using the word2vec library, capturing the semantic relationships present in that time period's web content. The resulting embeddings were then compressed for efficient storage and loading, providing a comprehensive view of language evolution across nearly two decades.

---

*Built for research on quantifying language change through embedding spaces* 

Deployment instructions:
- `npm run dev`
- `git add . && git commit -m "message" && git push`
- `npm run deploy`