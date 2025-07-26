// EmbeddingService.ts
// Utility for fetching/caching embedding BINs and computing similarities

export type EmbeddingIndexEntry = {
  year: number;
  vocab: string[];
};

export type EmbeddingYearData = {
  year: number;
  vocab: string[];
  vectors: Record<string, number[]>;
};

let neighborsWorker: Worker | null = null;
function getNeighborsWorker(): Worker {
  if (!neighborsWorker) {
    neighborsWorker = new Worker(new URL('./NeighborsWorker.ts', import.meta.url), { type: 'module' });
  }
  return neighborsWorker;
}

class EmbeddingService {
  private static vocab: string[] | null = null;
  private static vocabPromise: Promise<string[]> | null = null;
  private static yearCache: Map<number, EmbeddingYearData> = new Map();
  private static neighborCache: Map<string, {word: string, similarity: number}[]> = new Map();

  static async fetchVocab(): Promise<string[]> {
    if (this.vocab) return this.vocab;
    if (this.vocabPromise) return this.vocabPromise;
    this.vocabPromise = fetch('embeddings/vocab.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch vocab.json');
        return res.json();
      })
      .then(vocab => {
        this.vocab = vocab;
        return vocab;
      });
    return this.vocabPromise;
  }

  static async fetchYear(year: number): Promise<EmbeddingYearData> {
    if (this.yearCache.has(year)) return this.yearCache.get(year)!;
    const vocab = await this.fetchVocab();
    const res = await fetch(`embeddings/embeddings_${year}.bin`);
    if (!res.ok) throw new Error(`Failed to fetch embeddings_${year}.bin`);
    const buffer = await res.arrayBuffer();
    const data = this.parseEmbeddingBin(buffer, vocab, year);
    this.yearCache.set(year, data);
    return data;
  }

  private static parseEmbeddingBin(buffer: ArrayBuffer, vocab: string[], year: number): EmbeddingYearData {
    const dv = new DataView(buffer);
    let offset = 0;
    // Magic number
    const magic = String.fromCharCode(
      dv.getUint8(offset),
      dv.getUint8(offset + 1),
      dv.getUint8(offset + 2),
      dv.getUint8(offset + 3)
    );
    if (magic !== 'EMBD') {
      throw new Error(`Invalid magic number in embeddings_${year}.bin: ${magic}`);
    }
    offset += 4;
    // Vector dimension
    const dim = dv.getUint16(offset, true);
    offset += 2;
    // Number of words
    const numWords = dv.getUint32(offset, true);
    offset += 4;
    const vectors: Record<string, number[]> = {};
    const presentWords: string[] = [];
    for (let i = 0; i < numWords; ++i) {
      if (offset + 4 > buffer.byteLength) {
        throw new Error(`Unexpected end of file while reading word index at word ${i}`);
      }
      const wordIdx = dv.getUint32(offset, true);
      offset += 4;
      if (wordIdx < 0 || wordIdx >= vocab.length) {
        throw new Error(`Word index ${wordIdx} out of bounds in embeddings_${year}.bin`);
      }
      if (offset + dim * 4 > buffer.byteLength) {
        throw new Error(`Unexpected end of file while reading vector for word index ${wordIdx}`);
      }
      const vec: number[] = [];
      for (let d = 0; d < dim; ++d) {
        vec.push(dv.getFloat32(offset, true));
        offset += 4;
      }
      const word = vocab[wordIdx];
      vectors[word] = vec;
      presentWords.push(word);
    }
    return {
      year,
      vocab: presentWords,
      vectors
    };
  }

  static cosineSimilarity(vecA: number[], vecB: number[]): number {
    const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dot / (normA * normB);
  }

  static async getNeighbors(year: number, word: string, n: number): Promise<{word: string, similarity: number}[]> {
    const cacheKey = `${year}:${word}:${n}`;
    if (this.neighborCache.has(cacheKey)) return this.neighborCache.get(cacheKey)!;
    const data = await this.fetchYear(year);
    // Use Web Worker for similarity calculation
    try {
      const worker = getNeighborsWorker();
      const vectors = data.vectors;
      const targetWord = word;
      return await new Promise((resolve) => {
        const handleMessage = (e: MessageEvent) => {
          worker.removeEventListener('message', handleMessage);
          this.neighborCache.set(cacheKey, e.data);
          resolve(e.data);
        };
        worker.addEventListener('message', handleMessage);
        worker.postMessage({ vectors, targetWord, n });
      });
    } catch (err) {
      // Fallback to main thread if worker fails
      const targetVec = data.vectors[word];
      if (!targetVec) return [];
      const results: {word: string, similarity: number}[] = [];
      for (const w of data.vocab) {
        if (w === word) continue;
        const sim = this.cosineSimilarity(targetVec, data.vectors[w]);
        results.push({word: w, similarity: sim});
      }
      results.sort((a, b) => b.similarity - a.similarity);
      const topN = results.slice(0, n);
      this.neighborCache.set(cacheKey, topN);
      return topN;
    }
  }

  static async getCosineOverTime(wordA: string, wordB: string): Promise<{year: number, similarity: number}[]> {
    // Use index.json to get available years
    const res = await fetch('embeddings/index.json');
    const index: EmbeddingIndexEntry[] = await res.json();
    const results: {year: number, similarity: number}[] = [];
    for (const entry of index) {
      const data = await this.fetchYear(entry.year);
      const vecA = data.vectors[wordA];
      const vecB = data.vectors[wordB];
      if (vecA && vecB) {
        results.push({year: entry.year, similarity: this.cosineSimilarity(vecA, vecB)});
      }
    }
    return results;
  }

  static async getVocabForYear(year: number): Promise<string[]> {
    const data = await this.fetchYear(year);
    return data.vocab;
  }

  static getAverageVector(words: string[], vectors: Record<string, number[]>): number[] | null {
    if (words.length === 0) return null;
    
    const validVectors = words
      .map(word => vectors[word])
      .filter(vec => vec !== undefined);
    
    if (validVectors.length === 0) return null;
    
    const dim = validVectors[0].length;
    const avgVector = new Array(dim).fill(0);
    
    for (const vec of validVectors) {
      for (let i = 0; i < dim; i++) {
        avgVector[i] += vec[i];
      }
    }
    
    for (let i = 0; i < dim; i++) {
      avgVector[i] /= validVectors.length;
    }
    
    return avgVector;
  }

  static async getNeighborsMultiple(year: number, words: string[], n: number): Promise<{word: string, similarity: number}[]> {
    const data = await this.fetchYear(year);
    
    // Calculate average vector of all input words
    const avgVector = this.getAverageVector(words, data.vectors);
    if (!avgVector) return [];
    
    // Find neighbors to the average vector
    const results: {word: string, similarity: number}[] = [];
    for (const w of data.vocab) {
      if (words.includes(w)) continue; // Skip the input words themselves
      const sim = this.cosineSimilarity(avgVector, data.vectors[w]);
      results.push({word: w, similarity: sim});
    }
    
    results.sort((a, b) => b.similarity - a.similarity);
    return results.slice(0, n);
  }

  static async getCosineOverTimeMultiple(wordGroups: string[][]): Promise<{year: number, similarities: {groupIndex: number, similarity: number}[]}[]> {
    const res = await fetch('embeddings/index.json');
    const index: EmbeddingIndexEntry[] = await res.json();
    const results: {year: number, similarities: {groupIndex: number, similarity: number}[]}[] = [];
    
    for (const entry of index) {
      const data = await this.fetchYear(entry.year);
      const yearResult: {year: number, similarities: {groupIndex: number, similarity: number}[]} = {
        year: entry.year,
        similarities: []
      };
      
      // Calculate similarities between all pairs of groups
      for (let i = 0; i < wordGroups.length; i++) {
        for (let j = i + 1; j < wordGroups.length; j++) {
          const vecA = this.getAverageVector(wordGroups[i], data.vectors);
          const vecB = this.getAverageVector(wordGroups[j], data.vectors);
          
          if (vecA && vecB) {
            const similarity = this.cosineSimilarity(vecA, vecB);
            yearResult.similarities.push({
              groupIndex: i * wordGroups.length + j,
              similarity
            });
          }
        }
      }
      
      if (yearResult.similarities.length > 0) {
        results.push(yearResult);
      }
    }
    
    return results;
  }
}

export default EmbeddingService; 