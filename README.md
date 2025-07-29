# Embeddings Over Time Explorer

![Logo](public/favicon.svg)

An interactive platform for exploring how language has evolved over time through word embeddings. This project visualizes word2vec embeddings trained on the FineWeb dataset from 2005-2022, allowing users to track semantic changes and discover linguistic patterns across nearly two decades.

## 🚀 Live Demo

**[Try it out here](https://adameubanks.github.io/embeddings-over-time/)**

## ✨ Features

- **Nearest Neighbors**: Find the most semantically similar words for any term in a given year
- **Cosine Similarity Over Time**: Track how the relationship between word groups changes across years
- **2D Projection**: Visualize words in a customizable 2D semantic space
- **1D Projection**: Project words onto a single semantic dimension for focused analysis

## 🛠️ Technology

- **Frontend**: React + TypeScript
- **UI**: Material-UI
- **Visualization**: Recharts
- **Deployment**: GitHub Pages
- **Data**: Word2vec embeddings from FineWeb dataset (2005-2022)

## 🎯 Research Context

This project is part of a larger research initiative exploring how embedding spaces can quantify language evolution over time. By analyzing semantic shifts in word vectors across different years, we can gain insights into how language, culture, and technology have influenced our vocabulary and communication patterns.

## 📊 Dataset

Our embeddings are based on the [FineWeb dataset](https://huggingface.co/datasets/HuggingFaceFW/fineweb) from HuggingFace, specifically downloaded from the 350TB partition of this comprehensive web corpus. To create yearly snapshots of language evolution, we filtered articles by identifying those containing years in their URLs (2020, 2019, etc.) and grouped them accordingly. This process allowed us to create distinct yearly subsets spanning 2005-2022.

For each year's article group, we trained word2vec embeddings using the word2vec library, capturing the semantic relationships present in that time period's web content. The resulting embeddings were then compressed for efficient storage and loading, providing a comprehensive view of language evolution across nearly two decades.

---

*Built for research on quantifying language change through embedding spaces* 

Deployment instructions:
- `npm run dev`
- `git add . && git commit -m "message" && git push`
- `npm run deploy`