// EmbeddingService.ts
// Utility for fetching/caching embedding BINs and computing similarities

import { addVec, subVec } from './utils/vectorMath';

export type EmbeddingIndexEntry = {
  words: string[];
};

export type EmbeddingYearData = {
  year: number;
  vocab: string[];
  vectors: Record<string, number[]>;
};



class EmbeddingService {
  private static vocab: string[] | null = null;
  private static vocabPromise: Promise<string[]> | null = null;
  private static yearCache: Map<number, EmbeddingYearData> = new Map();
  private static neighborCache: Map<string, {word: string, similarity: number}[]> = new Map();
  private static indexCache: Map<number, string[]> = new Map();
  private static indexPromise: Promise<Record<string, {words: string[]}>> | null = null;

  static async fetchVocab(): Promise<string[]> {
    if (this.vocab) return this.vocab;
    if (this.vocabPromise) return this.vocabPromise;
    this.vocabPromise = this.fetchYear(2005)
      .then(data => {
        this.vocab = data.vocab;
        return data.vocab;
      });
    return this.vocabPromise;
  }

  static async fetchIndex(): Promise<Record<string, {words: string[]}>> {
    if (this.indexPromise) return this.indexPromise;
    this.indexPromise = fetch('embeddings/index.bin')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch index.bin');
        return res.arrayBuffer();
      })
      .then(buffer => {
        const dv = new DataView(buffer);
        let offset = 0;
        
        // Read number of years (4 bytes)
        const numYears = dv.getUint32(offset, true);
        offset += 4;
        
        const index: Record<string, {words: string[]}> = {};
        for (let i = 0; i < numYears; i++) {
          // Read year, vocab_size, dimension (each 4 bytes)
          const year = dv.getUint32(offset, true);
          offset += 4;
          const vocabSize = dv.getUint32(offset, true);
          offset += 4;
          offset += 4; // Skip dimension (not needed for index)
          
          index[year.toString()] = {
            words: Array.from({length: vocabSize}, (_, i) => i.toString())
          };
        }
        
        return index;
      });
    return this.indexPromise;
  }

  static async fetchYear(year: number): Promise<EmbeddingYearData> {
    if (this.yearCache.has(year)) return this.yearCache.get(year)!;
    const res = await fetch(`embeddings/word2vec_${year}.bin`);
    if (!res.ok) throw new Error(`Failed to fetch word2vec_${year}.bin`);
    const buffer = await res.arrayBuffer();
    const data = this.parseEmbeddingBin(buffer, year);
    this.yearCache.set(year, data);
    return data;
  }

  private static parseEmbeddingBin(buffer: ArrayBuffer, year: number): EmbeddingYearData {
    const dv = new DataView(buffer);
    let offset = 0;
    
    // Read header: vocab_size (4 bytes), dimension (4 bytes)
    const vocabSize = dv.getUint32(offset, true);
    offset += 4;
    const dimension = dv.getUint32(offset, true);
    offset += 4;
    
    // Read vocabulary as null-terminated strings
    const vocab: string[] = [];
    for (let i = 0; i < vocabSize; i++) {
      let word = '';
      while (offset < buffer.byteLength) {
        const char = dv.getUint8(offset);
        offset++;
        if (char === 0) break; // null terminator
        word += String.fromCharCode(char);
      }
      vocab.push(word);
    }
    
    // Read vectors as float32 array
    const vectors: Record<string, number[]> = {};
    for (const word of vocab) {
      const vector: number[] = [];
      for (let j = 0; j < dimension; j++) {
        vector.push(dv.getFloat32(offset, true));
        offset += 4;
      }
      vectors[word] = vector;
    }
    
    return {
      vocab,
      vectors,
      year
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
    
    // Use main thread calculation (removed Web Worker to fix build issues)
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

  static async getCosineOverTime(wordA: string, wordB: string): Promise<{year: number, similarity: number}[]> {
    // Use index.bin to get available years
    const index = await this.fetchIndex();
    const results: {year: number, similarity: number}[] = [];
    for (const year of Object.keys(index)) {
      const yearNum = parseInt(year);
      const data = await this.fetchYear(yearNum);
      const vecA = data.vectors[wordA];
      const vecB = data.vectors[wordB];
      if (vecA && vecB) {
        results.push({year: yearNum, similarity: this.cosineSimilarity(vecA, vecB)});
      }
    }
    return results;
  }

  static async getVocabForYear(year: number): Promise<string[]> {
    if (this.indexCache.has(year)) return this.indexCache.get(year)!;
    const yearData = await this.fetchYear(year);
    const vocab = yearData.vocab;
    this.indexCache.set(year, vocab);
    return vocab;
  }



  static getAverageVector(words: string[], vectors: Record<string, number[]>): number[] | null {
    console.log('getAverageVector called:', { 
      inputWords: words, 
      vectorsKeys: Object.keys(vectors).slice(0, 10),
      totalVectors: Object.keys(vectors).length
    });
    
    if (words.length === 0) return null;
    
    const validVectors = words
      .map(word => vectors[word])
      .filter(vec => vec !== undefined);
    
    console.log('Valid vectors found:', { 
      inputWords: words, 
      validVectorsCount: validVectors.length,
      missingWords: words.filter(word => !vectors[word])
    });
    
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
    
    console.log('Average vector calculated successfully:', { 
      dimension: dim, 
      avgVectorLength: avgVector.length 
    });
    
    return avgVector;
  }

  static async getNeighborsMultiple(year: number, words: string[], n: number): Promise<{word: string, similarity: number}[]> {
    console.log('getNeighborsMultiple called:', { year, words, n });
    const data = await this.fetchYear(year);
    console.log('Year data loaded:', { 
      year: data.year, 
      vocabSize: data.vocab.length, 
      vectorsSize: Object.keys(data.vectors).length,
      sampleWords: data.vocab.slice(0, 5)
    });
    
    // Calculate average vector of all input words
    const avgVector = this.getAverageVector(words, data.vectors);
    console.log('Average vector calculated:', { 
      inputWords: words, 
      avgVectorExists: !!avgVector, 
      avgVectorLength: avgVector?.length 
    });
    if (!avgVector) return [];
    
    // Find neighbors to the average vector
    const results: {word: string, similarity: number}[] = [];
    for (const w of data.vocab) {
      if (words.includes(w)) continue; // Skip the input words themselves
      const sim = this.cosineSimilarity(avgVector, data.vectors[w]);
      results.push({word: w, similarity: sim});
    }
    
    results.sort((a, b) => b.similarity - a.similarity);
    const finalResults = results.slice(0, n);
    console.log('Final neighbors result:', { 
      totalResults: results.length, 
      returnedResults: finalResults.length,
      topResults: finalResults.slice(0, 3)
    });
    return finalResults;
  }

  static async getCosineOverTimeMultiple(wordGroups: string[][]): Promise<{year: number, similarities: {groupIndex: number, similarity: number}[]}[]> {
    const index = await this.fetchIndex();
    const results: {year: number, similarities: {groupIndex: number, similarity: number}[]}[] = [];
    
    for (const year of Object.keys(index)) {
      const yearNum = parseInt(year);
      const data = await this.fetchYear(yearNum);
      const yearResult: {year: number, similarities: {groupIndex: number, similarity: number}[]} = {
        year: yearNum,
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

  static async computeAnalogy(year: number, expression: string, n: number = 10): Promise<{word: string, similarity: number}[]> {
    const data = await this.fetchYear(year);
    
    // Parse expression like "king - man + woman"
    const parts = expression.split(/\s*([+\-])\s*/).filter(part => part.trim());
    
    if (parts.length < 3) {
      throw new Error('Invalid analogy expression. Use format like "king - man + woman"');
    }
    
    let resultVector: number[] | null = null;
    let operation: string | null = null;
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      
      if (part === '+' || part === '-') {
        operation = part;
        continue;
      }
      
      const word = part.toLowerCase();
      const vector = data.vectors[word];
      
      if (!vector) {
        throw new Error(`Word "${word}" not found in ${year} vocabulary`);
      }
      
      if (resultVector === null) {
        resultVector = [...vector];
      } else if (operation === '+') {
        resultVector = addVec(resultVector, vector);
      } else if (operation === '-') {
        resultVector = subVec(resultVector, vector);
      }
    }
    
    if (!resultVector) {
      throw new Error('Failed to compute analogy vector');
    }
    
    // Find words most similar to the result vector
    const results: {word: string, similarity: number}[] = [];
    for (const word of data.vocab) {
      if (parts.some(part => part.trim().toLowerCase() === word.toLowerCase())) {
        continue; // Skip the input words
      }
      const similarity = this.cosineSimilarity(resultVector, data.vectors[word]);
      results.push({word, similarity});
    }
    
    results.sort((a, b) => b.similarity - a.similarity);
    return results.slice(0, n);
  }
}

export default EmbeddingService; 