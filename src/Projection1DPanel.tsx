import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, TextField, Button, Paper } from '@mui/material';
import EmbeddingService from './EmbeddingService';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Scatter } from 'recharts';
import WordAutocompleteBox from './components/WordAutocompleteBox';
import YearSelectBox from './components/YearSelectBox';
import { meanVec, subVec, dot, normalize } from './utils/vectorMath';

const Projection1DPanel: React.FC = () => {
  // State for years and vocab
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [vocab, setVocab] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);

  // Custom pole labels
  const [posLabel, setPosLabel] = useState('');
  const [negLabel, setNegLabel] = useState('');

  // Axis poles (multiple words per pole)
  const [posWords, setPosWords] = useState<string[]>([]);
  const [negWords, setNegWords] = useState<string[]>([]);

  // Word search
  const [searchWord, setSearchWord] = useState('');

  // Projection state
  const [projectedWords, setProjectedWords] = useState<{ word: string, value: number }[]>([]);
  const [projecting, setProjecting] = useState(false);

  // --- Zoom/Pan state ---
  const [domain, setDomain] = useState<[number, number] | null>(null);

  // --- Get most extreme words from each side ---
  const extremeWords = useMemo(() => {
    if (!projectedWords.length) return [];
    
    const axisWords = new Set([...posWords, ...negWords]);
    const positive: { word: string; value: number }[] = [];
    const negative: { word: string; value: number }[] = [];
    
    for (const w of projectedWords) {
      if (w.word === searchWord) continue; // skip highlighted word
      if (axisWords.has(w.word)) continue; // skip axis words
      if (w.value >= 0) {
        positive.push(w);
      } else {
        negative.push(w);
      }
    }

    // Get most extreme (highest absolute value) from each side
    const mostPositive = positive.length > 0 ? positive.reduce((a, b) => a.value > b.value ? a : b) : null;
    const mostNegative = negative.length > 0 ? negative.reduce((a, b) => a.value < b.value ? a : b) : null;
    
    const result = [];
    if (mostNegative) result.push(mostNegative);
    if (mostPositive) result.push(mostPositive);
    return result;
  }, [projectedWords, searchWord, posWords, negWords]);

  // --- Get highlighted word separately ---
  const highlightedWord = useMemo(() => {
    if (!searchWord || !projectedWords.length) return null;
    return projectedWords.find(w => w.word === searchWord) || null;
  }, [projectedWords, searchWord]);

  // --- Helper: Generate equidistant ticks ---
  function getTicks(min: number, max: number, count: number) {
    const step = (max - min) / (count - 1);
    return Array.from({ length: count }, (_, i) => +(min + i * step).toFixed(2));
  }

  // --- Zoom/Pan: compute initial domain and ticks ---
  const [axisTicks, setAxisTicks] = useState<{ domain: [number, number], ticks: number[] }>({ domain: [-1, 1], ticks: [-1, -0.67, -0.33, 0, 0.33, 0.67, 1] });

  useEffect(() => {
    if (!projectedWords.length) return;
    const values = projectedWords.map(w => w.value);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = Math.max(Math.abs(minVal), Math.abs(maxVal));
    const paddedRange = range * 1.2 || 1; // Add 20% padding, fallback to 1 if 0
    const domain: [number, number] = [-paddedRange, paddedRange];
    const ticks = getTicks(domain[0], domain[1], 7);
    setDomain(domain);
    setAxisTicks({ domain, ticks });
  }, [projectedWords]);

  // --- Zoom/Pan controls ---
  function zoom(factor: number) {
    if (!domain) return;
    const [min, max] = domain;
    const mid = (min + max) / 2;
    const range = (max - min) * factor / 2;
    const newDomain: [number, number] = [mid - range, mid + range];
    setDomain(newDomain);
    setAxisTicks({ domain: newDomain, ticks: getTicks(newDomain[0], newDomain[1], 7) });
  }

  function resetZoom() {
    if (!projectedWords.length) return;
    const values = projectedWords.map(w => w.value);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = Math.max(Math.abs(minVal), Math.abs(maxVal));
    const paddedRange = range * 1.2 || 1;
    const domain: [number, number] = [-paddedRange, paddedRange];
    const ticks = getTicks(domain[0], domain[1], 7);
    setDomain(domain);
    setAxisTicks({ domain, ticks });
  }

  // Project words when button clicked
  async function handleProject() {
    if (typeof selectedYear !== 'number') return;
    setProjecting(true);
    const data = await EmbeddingService.fetchYear(selectedYear);
    const vectors = data.vectors;
    // Compute axis directions
    const pos = meanVec(posWords, vectors);
    const neg = meanVec(negWords, vectors);
    if (!pos || !neg) {
      setProjecting(false);
      return;
    }
    const axis = normalize(subVec(pos, neg));
    // Project all vocab words
    const result: { word: string, value: number }[] = [];
    for (const word of data.vocab) {
      const vec = vectors[word];
      if (!vec) continue;
      result.push({ word, value: dot(vec, axis) });
    }
    setProjectedWords(result);
    setProjecting(false);
  }

  // Fetch vocab for selected year
  useEffect(() => {
    if (typeof selectedYear !== 'number') return;
    async function fetchVocab() {
      const vocabList = await EmbeddingService.getVocabForYear(selectedYear as number);
      setVocab(vocabList.sort());
    }
    fetchVocab();
  }, [selectedYear]);

  // Fetch years and set default selectedYear
  useEffect(() => {
    async function fetchYears() {
      const res = await fetch('embeddings/index.json');
      const index = await res.json();
      const yearList = index.map((e: {year: number}) => e.year).sort((a: number, b: number) => a - b);
      setYears(yearList);
      if (yearList.length > 0 && selectedYear == null) {
        setSelectedYear(Math.max(...yearList));
      }
    }
    fetchYears();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box sx={{ background: '#fff', color: '#1976d2', borderRadius: 2, boxShadow: 1, p: 3, fontFamily: 'Lato, Roboto, serif', maxWidth: 1000, width: '100%', mx: 'auto' }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, letterSpacing: 0.5, color: '#1976d2' }}>
        1D Embedding Projection
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <YearSelectBox value={selectedYear} onChange={setSelectedYear} years={years} />
      </Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>Projection Axis</Typography>
        <TextField label="Positive Pole Label" value={posLabel} onChange={e => setPosLabel(e.target.value)} size="small" sx={{ mb: 2, mr: 2 }} />
        <TextField label="Negative Pole Label" value={negLabel} onChange={e => setNegLabel(e.target.value)} size="small" sx={{ mb: 2, mr: 2 }} />
        <WordAutocompleteBox
          options={vocab}
          value={posWords}
          onChange={v => setPosWords(Array.isArray(v) ? v : [])}
          label="Positive Pole Words"
          sx={{ minWidth: 250, mb: 2 }}
          multiple={true}
        />
        <WordAutocompleteBox
          options={vocab}
          value={negWords}
          onChange={v => setNegWords(Array.isArray(v) ? v : [])}
          label="Negative Pole Words"
          sx={{ minWidth: 250, mb: 2 }}
          multiple={true}
        />
      </Paper>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
        <WordAutocompleteBox
          options={vocab}
          value={searchWord}
          onChange={v => setSearchWord(typeof v === 'string' ? v : '')}
          label="Search Word to Highlight"
          sx={{ minWidth: 250 }}
        />
        <Button variant="contained" color="primary" sx={{ height: 40, minWidth: 120, fontWeight: 500 }} onClick={handleProject} disabled={projecting || !posWords.length || !negWords.length}>
          Project
        </Button>
        <Button variant="outlined" sx={{ height: 40 }} onClick={() => zoom(0.5)} disabled={!domain}>Zoom In</Button>
        <Button variant="outlined" sx={{ height: 40 }} onClick={() => zoom(2)} disabled={!domain}>Zoom Out</Button>
        <Button variant="outlined" sx={{ height: 40 }} onClick={resetZoom} disabled={!domain}>Reset</Button>
      </Box>

      
      {/* --- 1D scale visualization --- */}
      <Box sx={{ width: '100%', height: 400, mb: 2, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart margin={{ top: 80, right: 40, bottom: 60, left: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#bbb" vertical={true} horizontal={false} />
            <XAxis
              type="number"
              dataKey="value"
              domain={domain || axisTicks.domain}
              tick={true}
              axisLine={true}
              tickLine={true}
              tickFormatter={(value) => value.toFixed(2)}
              ticks={axisTicks.ticks}
              label={{
                value: `${negLabel || 'Negative'} – ${posLabel || 'Positive'}`,
                position: 'bottom',
                offset: 20,
                fontSize: 16,
                fill: '#444',
                fontWeight: 600,
              }}
            />
            <YAxis
              type="number"
              domain={[0, 1]}
              tick={false}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(v: any) => v} content={({ active, payload }) => {
              if (!active || !payload || !payload.length) return null;
              const d = payload[0].payload;
              return <Paper sx={{ p: 1 }}><b>{d.word}</b><br />value: {d.value.toFixed(3)}</Paper>;
            }} />
            {/* Extreme words */}
            <Scatter
              name="Words"
              data={extremeWords}
              fill="#1976d2"
              shape={(d: any) => (
                <circle cx={d.cx} cy={d.cy} r={6} fill="#1976d2" stroke="#fff" strokeWidth={1} />
              )}
            />
            {/* Highlighted word - rendered separately to ensure it always shows */}
            {highlightedWord && (
              <Scatter
                name="Highlighted"
                data={[highlightedWord]}
                fill="#d32f2f"
                shape={(d: any) => (
                  <circle cx={d.cx} cy={d.cy} r={8} fill="#d32f2f" stroke="#222" strokeWidth={2} />
                )}
              />
            )}
            <Line
              type="monotone"
              data={[{ value: domain?.[0] || -1, y: 0.5 }, { value: domain?.[1] || 1, y: 0.5 }]}
              stroke="#666"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
        
        {/* HTML labels positioned absolutely */}
        {extremeWords.map((word: { word: string; value: number }) => (
          <Box
            key={`extreme-${word.word}`}
            sx={{
              position: 'absolute',
              left: `${((word.value - (domain?.[0] || -1)) / ((domain?.[1] || 1) - (domain?.[0] || -1))) * 100}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '12px',
              color: '#222',
              fontWeight: 'normal',
              pointerEvents: 'none',
              zIndex: 10,
              mt: -4
            }}
          >
            {word.word}
          </Box>
        ))}
        
        {highlightedWord && (
          <Box
            sx={{
              position: 'absolute',
              left: `${((highlightedWord.value - (domain?.[0] || -1)) / ((domain?.[1] || 1) - (domain?.[0] || -1))) * 100}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '12px',
              color: '#d32f2f',
              fontWeight: 'bold',
              pointerEvents: 'none',
              zIndex: 11,
              mt: -4
            }}
          >
            {highlightedWord.word}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Projection1DPanel; 