import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, TextField, Button, Paper } from '@mui/material';
import EmbeddingService from './EmbeddingService';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import WordAutocompleteBox from './components/WordAutocompleteBox';
import YearSelectBox from './components/YearSelectBox';
import { meanVec, subVec, dot, normalize } from './utils/vectorMath';

const Projection2DPanel: React.FC = () => {
  // State for years and vocab
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [vocab, setVocab] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);

  // Custom pole labels
  const [xPosLabel, setXPosLabel] = useState('');
  const [xNegLabel, setXNegLabel] = useState('');
  const [yPosLabel, setYPosLabel] = useState('');
  const [yNegLabel, setYNegLabel] = useState('');

  // Axis poles (multiple words per pole)
  const [xPosWords, setXPosWords] = useState<string[]>([]);
  const [xNegWords, setXNegWords] = useState<string[]>([]);
  const [yPosWords, setYPosWords] = useState<string[]>([]);
  const [yNegWords, setYNegWords] = useState<string[]>([]);

  // Word search
  const [searchWord, setSearchWord] = useState('');

  // Projection state
  const [projectedWords, setProjectedWords] = useState<{ word: string, x: number, y: number }[]>([]);
  const [projecting, setProjecting] = useState(false);

  // --- Zoom/Pan state ---
  const [xDomain, setXDomain] = useState<[number, number] | null>(null);
  const [yDomain, setYDomain] = useState<[number, number] | null>(null);

  // --- Chart size state for dynamic label positioning ---
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // --- Filter for up to 3 words per quadrant based on different directional criteria ---
  const filteredWords = React.useMemo(() => {
    if (!projectedWords.length) return [];
    const axisWords = new Set([
      ...xPosWords,
      ...xNegWords,
      ...yPosWords,
      ...yNegWords,
    ]);

    // Track maximum values for each direction in each quadrant
    const quadrants: { [key: string]: { 
      maxX: { word: string; x: number; y: number; value: number } | null;
      maxY: { word: string; x: number; y: number; value: number } | null;
      maxDiagonal: { word: string; x: number; y: number; value: number } | null;
    }} = {
      I: { maxX: null, maxY: null, maxDiagonal: null },
      II: { maxX: null, maxY: null, maxDiagonal: null },
      III: { maxX: null, maxY: null, maxDiagonal: null },
      IV: { maxX: null, maxY: null, maxDiagonal: null }
    };

    for (const w of projectedWords) {
      if (axisWords.has(w.word)) continue; // skip axis words
      const dist = Math.sqrt(w.x * w.x + w.y * w.y);
      let quad = null;
      if (w.x >= 0 && w.y >= 0) quad = 'I';
      else if (w.x < 0 && w.y >= 0) quad = 'II';
      else if (w.x < 0 && w.y < 0) quad = 'III';
      else if (w.x >= 0 && w.y < 0) quad = 'IV';
      
      if (quad) {
        const q = quadrants[quad];
        const absX = Math.abs(w.x);
        const absY = Math.abs(w.y);
        
        // Track maximum X
        if (!q.maxX || absX > q.maxX.value) {
          q.maxX = { ...w, value: absX };
        }
        
        // Track maximum Y
        if (!q.maxY || absY > q.maxY.value) {
          q.maxY = { ...w, value: absY };
        }
        
        // Track maximum diagonal distance
        if (!q.maxDiagonal || dist > q.maxDiagonal.value) {
          q.maxDiagonal = { ...w, value: dist };
        }
      }
    }

    // Collect up to 3 unique words per quadrant
    const result: { word: string; x: number; y: number }[] = [];
    for (const quadKey of ['I', 'II', 'III', 'IV']) {
      const q = quadrants[quadKey];
      const uniqueWords = new Set<string>();
      
      // Add words from each category, avoiding duplicates
      if (q.maxX && !uniqueWords.has(q.maxX.word)) {
        result.push({ word: q.maxX.word, x: q.maxX.x, y: q.maxX.y });
        uniqueWords.add(q.maxX.word);
      }
      
      if (q.maxY && !uniqueWords.has(q.maxY.word)) {
        result.push({ word: q.maxY.word, x: q.maxY.x, y: q.maxY.y });
        uniqueWords.add(q.maxY.word);
      }
      
      if (q.maxDiagonal && !uniqueWords.has(q.maxDiagonal.word)) {
        result.push({ word: q.maxDiagonal.word, x: q.maxDiagonal.x, y: q.maxDiagonal.y });
        uniqueWords.add(q.maxDiagonal.word);
      }
    }

    // Always include highlighted word if present and not already included
    if (searchWord) {
      const found = projectedWords.find(w => w.word === searchWord);
      if (found && !result.some(w => w.word === found.word)) {
        result.push(found);
      }
    }
    return result;
  }, [projectedWords, searchWord, xPosWords, xNegWords, yPosWords, yNegWords]);

// --- Helper: Generate equidistant ticks ---
function getTicks(min: number, max: number, count: number) {
  const step = (max - min) / (count - 1);
  return Array.from({ length: count }, (_, i) => +(min + i * step).toFixed(2));
}

// --- Zoom/Pan: compute initial domain and ticks ---
const [axisTicks, setAxisTicks] = useState<{ domain: [number, number], ticks: number[] }>({ domain: [-1, 1], ticks: [-1, -0.67, -0.33, 0, 0.33, 0.67, 1] });

useEffect(() => {
  if (!projectedWords.length) return;
  const xs = projectedWords.map(w => w.x);
  const ys = projectedWords.map(w => w.y);
  const pad = 0.1;
  // Center at 0,0: find max absolute value across both axes
  const xAbsMax = Math.max(Math.abs(Math.min(...xs)), Math.abs(Math.max(...xs)));
  const yAbsMax = Math.max(Math.abs(Math.min(...ys)), Math.abs(Math.max(...ys)));
  const maxAbs = Math.max(xAbsMax, yAbsMax);
  const maxAbsPad = maxAbs * (1 + pad) || 1; // fallback to 1 if 0
  const domain: [number, number] = [-maxAbsPad, maxAbsPad];
  const ticks = getTicks(domain[0], domain[1], 7);
  setXDomain(domain);
  setYDomain(domain);
  setAxisTicks({ domain, ticks });
}, [projectedWords]);

// --- Zoom/Pan controls ---
function zoom(factor: number) {
  if (!xDomain || !yDomain) return;
  const [x0, x1] = xDomain;
  const xMid = (x0 + x1) / 2;
  const xRange = (x1 - x0) * factor / 2;
  const newDomain: [number, number] = [xMid - xRange, xMid + xRange];
  setXDomain(newDomain);
  setYDomain(newDomain);
  setAxisTicks({ domain: newDomain, ticks: getTicks(newDomain[0], newDomain[1], 7) });
}
function resetZoom() {
  // Use the same logic as initial domain: perfect square centered at 0,0
  if (!projectedWords.length) return;
  const xs = projectedWords.map(w => w.x);
  const ys = projectedWords.map(w => w.y);
  const pad = 0.1;
  const xAbsMax = Math.max(Math.abs(Math.min(...xs)), Math.abs(Math.max(...xs)));
  const yAbsMax = Math.max(Math.abs(Math.min(...ys)), Math.abs(Math.max(...ys)));
  const maxAbs = Math.max(xAbsMax, yAbsMax);
  const maxAbsPad = maxAbs * (1 + pad) || 1;
  const domain: [number, number] = [-maxAbsPad, maxAbsPad];
  const ticks = getTicks(domain[0], domain[1], 7);
  setXDomain(domain);
  setYDomain(domain);
  setAxisTicks({ domain, ticks });
}

// Project words when button clicked
async function handleProject() {
  if (typeof selectedYear !== 'number') return;
  setProjecting(true);
  const data = await EmbeddingService.fetchYear(selectedYear);
  const vectors = data.vectors;
  // Compute axis directions
  const xPos = meanVec(xPosWords, vectors);
  const xNeg = meanVec(xNegWords, vectors);
  const yPos = meanVec(yPosWords, vectors);
  const yNeg = meanVec(yNegWords, vectors);
  if (!xPos || !xNeg || !yPos || !yNeg) {
    setProjecting(false);
    return;
  }
  const xAxis = normalize(subVec(xPos, xNeg));
  const yAxis = normalize(subVec(yPos, yNeg));
  // Project all vocab words
  const result: { word: string, x: number, y: number }[] = [];
  for (const word of data.vocab) {
    const vec = vectors[word];
    if (!vec) continue;
    result.push({ word, x: dot(vec, xAxis), y: dot(vec, yAxis) });
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
    const index = await EmbeddingService.fetchIndex();
    const yearList = Object.keys(index).map(year => parseInt(year)).sort((a: number, b: number) => a - b);
    setYears(yearList);
    if (yearList.length > 0 && selectedYear == null) {
      setSelectedYear(Math.max(...yearList));
    }
  }
  fetchYears();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  return (
    <Box sx={{ background: '#fff', color: '#222', borderRadius: 2, boxShadow: 1, p: 3, fontFamily: 'Lato, Roboto, serif', maxWidth: 1000, width: '100%', mx: 'auto' }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, letterSpacing: 0.5 }}>
        2D Embedding Projection
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <YearSelectBox value={selectedYear} onChange={setSelectedYear} years={years} />
      </Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>X Axis</Typography>
        <TextField label="X Positive Pole Label" value={xPosLabel} onChange={e => setXPosLabel(e.target.value)} size="small" sx={{ mb: 2, mr: 2 }} />
        <TextField label="X Negative Pole Label" value={xNegLabel} onChange={e => setXNegLabel(e.target.value)} size="small" sx={{ mb: 2, mr: 2 }} />
        <WordAutocompleteBox
          options={vocab}
          value={xPosWords}
          onChange={v => setXPosWords(Array.isArray(v) ? v : [])}
          label="Positive Pole Words"
          sx={{ minWidth: 250, mb: 2 }}
          multiple={true}
        />
        <WordAutocompleteBox
          options={vocab}
          value={xNegWords}
          onChange={v => setXNegWords(Array.isArray(v) ? v : [])}
          label="Negative Pole Words"
          sx={{ minWidth: 250, mb: 2 }}
          multiple={true}
        />
      </Paper>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>Y Axis</Typography>
        <TextField label="Y Positive Pole Label" value={yPosLabel} onChange={e => setYPosLabel(e.target.value)} size="small" sx={{ mb: 2, mr: 2 }} />
        <TextField label="Y Negative Pole Label" value={yNegLabel} onChange={e => setYNegLabel(e.target.value)} size="small" sx={{ mb: 2, mr: 2 }} />
        <WordAutocompleteBox
          options={vocab}
          value={yPosWords}
          onChange={v => setYPosWords(Array.isArray(v) ? v : [])}
          label="Positive Pole Words"
          sx={{ minWidth: 250, mb: 2 }}
          multiple={true}
        />
        <WordAutocompleteBox
          options={vocab}
          value={yNegWords}
          onChange={v => setYNegWords(Array.isArray(v) ? v : [])}
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
        <Button variant="contained" color="primary" sx={{ height: 40, minWidth: 120, fontWeight: 500 }} onClick={handleProject} disabled={projecting || !xPosWords.length || !xNegWords.length || !yPosWords.length || !yNegWords.length}>
          Project
        </Button>
        <Button variant="outlined" sx={{ height: 40 }} onClick={() => zoom(0.5)} disabled={!xDomain || !yDomain}>Zoom In</Button>
        <Button variant="outlined" sx={{ height: 40 }} onClick={() => zoom(2)} disabled={!xDomain || !yDomain}>Zoom Out</Button>
        <Button variant="outlined" sx={{ height: 40 }} onClick={resetZoom} disabled={!xDomain || !yDomain}>Reset</Button>
      </Box>
      {/* --- Scatter plot visualization --- */}
      <Box ref={chartContainerRef} sx={{ width: '100%', height: 500, mb: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 40, right: 40, bottom: 60, left: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#bbb" vertical={true} horizontal={true} />
            <XAxis
              type="number"
              dataKey="x"
              domain={xDomain || axisTicks.domain}
              tick={true}
              axisLine={true}
              tickLine={true}
              tickFormatter={(value) => value.toFixed(2)}
              ticks={axisTicks.ticks}
              // Add X axis title below axis
              label={{
                value: `${xNegLabel || 'Negative'} – ${xPosLabel || 'Positive'}`,
                position: 'bottom',
                offset: 20,
                fontSize: 16,
                fill: '#444',
                fontWeight: 600,
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              domain={yDomain || axisTicks.domain}
              tick={true}
              axisLine={true}
              tickLine={true}
              tickFormatter={(value) => value.toFixed(2)}
              ticks={axisTicks.ticks}
              // Add Y axis title, rotated, left of axis
              label={{
                value: `${yNegLabel || 'Negative'} – ${yPosLabel || 'Positive'}`,
                angle: -90,
                position: 'left',
                offset: 20,
                fontSize: 16,
                fill: '#444',
                fontWeight: 600,
                textAnchor: 'middle',
              }}
            />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(v: any) => v} content={({ active, payload }) => {
              if (!active || !payload || !payload.length) return null;
              const d = payload[0].payload;
              return <Paper sx={{ p: 1 }}><b>{d.word}</b><br />x: {d.x.toFixed(3)}<br />y: {d.y.toFixed(3)}</Paper>;
            }} />
            <Scatter
              name="Words"
              data={filteredWords}
              fill="#222"
              shape={(d: any) => {
                // Highlight searchWord
                if (searchWord && d.word === searchWord) {
                  return <circle cx={d.cx} cy={d.cy} r={8} fill="#d32f2f" stroke="#222" strokeWidth={2} />;
                }
                return <circle cx={d.cx} cy={d.cy} r={6} fill="#222" stroke="#fff" strokeWidth={1} />;
              }}
              label={({ x, y, word }) => (
                <text x={x} y={y - 10} textAnchor="middle" fontSize={12} fill={searchWord && word === searchWord ? '#d32f2f' : '#222'}>{word}</text>
              )}
            />
            {/* Removed custom axis pole label <text> elements */}
          </ScatterChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default Projection2DPanel; 