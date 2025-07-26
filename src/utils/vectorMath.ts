// Vector math helpers for embedding projections

export function meanVec(words: string[], vectors: Record<string, number[]>): number[] | null {
  if (!words.length) return null;
  const validVecs = words.map(w => vectors[w]).filter(Boolean);
  if (!validVecs.length) return null;
  const dim = validVecs[0].length;
  const sum = new Array(dim).fill(0);
  for (const v of validVecs) for (let i = 0; i < dim; ++i) sum[i] += v[i];
  return sum.map(x => x / validVecs.length);
}

export function subVec(a: number[], b: number[]): number[] {
  return a.map((x, i) => x - b[i]);
}

export function dot(a: number[], b: number[]): number {
  return a.reduce((acc, x, i) => acc + x * b[i], 0);
}

export function normalize(v: number[]): number[] {
  const norm = Math.sqrt(dot(v, v));
  return norm === 0 ? v : v.map(x => x / norm);
} 