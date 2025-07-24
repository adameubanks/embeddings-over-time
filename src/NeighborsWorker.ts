// src/NeighborsWorker.ts

export type NeighborRequest = {
  vectors: Record<string, number[]>;
  targetWord: string;
  n: number;
};

export type NeighborResult = {
  word: string;
  similarity: number;
}[];

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

self.onmessage = (e: MessageEvent) => {
  const { vectors, targetWord, n } = e.data as NeighborRequest;
  const targetVec = vectors[targetWord];
  if (!targetVec) {
    self.postMessage([]);
    return;
  }
  const results: NeighborResult = [];
  for (const [word, vec] of Object.entries(vectors)) {
    if (word === targetWord) continue;
    const sim = cosineSimilarity(targetVec, vec);
    results.push({ word, similarity: sim });
  }
  results.sort((a, b) => b.similarity - a.similarity);
  self.postMessage(results.slice(0, n));
}; 