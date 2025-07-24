import React, { useState, useEffect } from 'react';
import { Box, TextField, Typography, InputAdornment, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress } from '@mui/material';
import EmbeddingService from './EmbeddingService';
import WordAutocompleteBox from './components/WordAutocompleteBox';
import YearSelectBox from './components/YearSelectBox';

interface NeighborsPanelProps {
  intersectionVocab: string[];
}

const NeighborsPanel: React.FC<NeighborsPanelProps> = ({ }) => {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [vocab, setVocab] = useState<string[]>([]);
  const [word, setWord] = useState<string>('');
  const [n, setN] = useState<number>(5);
  const [neighbors, setNeighbors] = useState<{word: string, similarity: number}[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [years, setYears] = useState<number[]>([]);

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

  // Fetch vocab for selected year
  useEffect(() => {
    if (selectedYear == null) return;
    async function fetchVocab() {
      if (selectedYear == null) return;
      const vocabList = await EmbeddingService.getVocabForYear(selectedYear);
      setVocab(vocabList.sort());
    }
    fetchVocab();
  }, [selectedYear]);

  const handleFind = async () => {
    if (!word || selectedYear == null) return;
    setLoading(true);
    const result = await EmbeddingService.getNeighbors(selectedYear, word, n);
    setNeighbors(result);
    setLoading(false);
  };

  return (
    <Box
      sx={{
        background: '#fff',
        color: '#222',
        borderRadius: 2,
        boxShadow: 1,
        p: 3,
        fontFamily: 'Lato, Roboto, serif',
        maxWidth: 1000,
        width: '100%',
        mx: 'auto'
      }}
    >
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, letterSpacing: 0.5 }}>
        Find Nearest Neighbors
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <YearSelectBox value={selectedYear} onChange={setSelectedYear} years={years} />
        <WordAutocompleteBox
          options={vocab}
          value={word}
          onChange={v => setWord(typeof v === 'string' ? v : '')}
          label="Word"
          helperText="Type at least 2 letters to search"
          sx={{ minWidth: 300, flex: 1 }}
        />
        <TextField
          label="N"
          type="number"
          size="small"
          value={n}
          onChange={e => setN(Math.max(1, Math.min(vocab.length, Number(e.target.value))))}
          sx={{ width: 150 }}
          InputProps={{
            inputProps: { min: 1, max: vocab.length, step: 1 },
            endAdornment: <InputAdornment position="end">neighbors</InputAdornment>
          }}
          helperText="# of neighbors"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleFind}
          sx={{ height: 40, minWidth: 100, boxShadow: 'none', textTransform: 'none', fontWeight: 500, alignSelf: 'flex-start' }}
          disabled={selectedYear == null || !word}
        >
          Find
        </Button>
      </Box>
      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
          <CircularProgress size={20} />
          <Typography variant="body2">Loading neighbors...</Typography>
        </Box>
      )}
      {neighbors && (
        <TableContainer component={Paper} sx={{ mt: 2, maxWidth: 900, width: '100%', boxShadow: 'none', borderRadius: 1 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ borderBottom: '1px solid #eee' }}>
                <TableCell sx={{ fontWeight: 600 }}>Rank</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Word</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Cosine Similarity</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {neighbors.map((n, i) => (
                <TableRow key={n.word} sx={{ borderBottom: '1px solid #f5f5f5' }}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{n.word}</TableCell>
                  <TableCell>{n.similarity.toFixed(4)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {/* TODO: Move neighbor similarity calculations to a Web Worker for responsiveness. */}
    </Box>
  );
};

export default NeighborsPanel; 