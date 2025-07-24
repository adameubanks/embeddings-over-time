import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import EmbeddingService from './EmbeddingService';
import WordAutocompleteBox from './components/WordAutocompleteBox';

interface CosineSimilarityPanelProps {
  vocab: string[];
}

const CosineSimilarityPanel: React.FC<CosineSimilarityPanelProps> = ({ vocab }) => {
  const [wordA, setWordA] = useState('');
  const [wordB, setWordB] = useState('');
  const [data, setData] = useState<{year: number, similarity: number}[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePlot = async () => {
    if (!wordA || !wordB || wordA === wordB) return;
    setLoading(true);
    const result = await EmbeddingService.getCosineOverTime(wordA, wordB);
    setData(result);
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
      }}
    >
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, letterSpacing: 0.5 }}>
        {wordA && wordB && wordA !== wordB
          ? `Cosine Similarity: ${wordA} vs ${wordB}`
          : 'Cosine Similarity Over Time'}
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Word A input */}
        <WordAutocompleteBox
          options={vocab}
          value={wordA}
          onChange={v => setWordA(typeof v === 'string' ? v : '')}
          label="Word 1"
          helperText="Type at least 2 letters to search"
          sx={{ minWidth: 200, flex: 1 }}
        />
        {/* Word B input */}
        <WordAutocompleteBox
          options={vocab}
          value={wordB}
          onChange={v => setWordB(typeof v === 'string' ? v : '')}
          label="Word 2"
          helperText="Type at least 2 letters to search"
          sx={{ minWidth: 200, flex: 1 }}
        />
        <Button variant="contained" onClick={handlePlot} disabled={!wordA || !wordB || wordA === wordB} sx={{ alignSelf: 'flex-start', height: 40, minWidth: 100, boxShadow: 'none', textTransform: 'none', fontWeight: 500 }}>
          Plot
        </Button>
      </Box>
      {loading && <Typography>Loading similarity data...</Typography>}
      {data && (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
            <YAxis domain={[-1, 1]} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v: number) => v.toFixed(4)} />
            <Line type="monotone" dataKey="similarity" stroke="#1976d2" dot />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
};

export default CosineSimilarityPanel; 