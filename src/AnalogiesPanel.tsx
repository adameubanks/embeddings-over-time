import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Typography, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import EmbeddingService from './EmbeddingService';
import YearSelectBox from './components/YearSelectBox';

const AnalogiesPanel: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [expression, setExpression] = useState<string>('');
  const [n, setN] = useState<number>(10);
  const [results, setResults] = useState<{word: string, similarity: number}[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [years, setYears] = useState<number[]>([]);

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

  // Reset state when year changes
  useEffect(() => {
    setResults(null);
    setError(null);
  }, [selectedYear]);

  const handleCompute = async () => {
    if (!expression.trim() || selectedYear == null) return;
    
    setLoading(true);
    setError(null);
    setResults(null);
    
    try {
      const result = await EmbeddingService.computeAnalogy(selectedYear, expression.trim(), n);
      setResults(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleCompute();
    }
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
        Word Analogies
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, color: '#666' }}>
        Explore word relationships through vector arithmetic. Enter expressions like "king - man + woman" to find similar words.
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <YearSelectBox value={selectedYear} onChange={setSelectedYear} years={years} />
        <TextField
          label="Analogy Expression"
          placeholder="e.g., king - man + woman"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          onKeyPress={handleKeyPress}
          sx={{ minWidth: 300, flex: 1 }}
          helperText="Use format: word1 - word2 + word3"
        />
        <TextField
          label="N"
          type="number"
          size="small"
          value={n}
          onChange={(e) => setN(Math.max(1, Math.min(100, Number(e.target.value))))}
          sx={{ width: 100 }}
          InputProps={{
            inputProps: { min: 1, max: 100 }
          }}
        />
        <Button
          variant="contained"
          onClick={handleCompute}
          disabled={!expression.trim() || selectedYear == null || loading}
          sx={{ minWidth: 120 }}
        >
          {loading ? <CircularProgress size={20} /> : 'Compute'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {results && (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            Results for "{expression}" in {selectedYear}
          </Typography>
          
          <TableContainer component={Paper} elevation={1}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Rank</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Word</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Similarity</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.map((result, index) => (
                  <TableRow key={result.word} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Chip 
                        label={result.word} 
                        size="small" 
                        variant="outlined"
                        sx={{ fontFamily: 'monospace' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {result.similarity.toFixed(4)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          How it works
        </Typography>
        <Typography variant="body2" paragraph>
          Word analogies work by performing vector arithmetic on word embeddings. When you enter "king - man + woman", 
          the system:
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 2 }}>
          <Typography component="li" variant="body2">
            Takes the vector for "king"
          </Typography>
          <Typography component="li" variant="body2">
            Subtracts the vector for "man"
          </Typography>
          <Typography component="li" variant="body2">
            Adds the vector for "woman"
          </Typography>
          <Typography component="li" variant="body2">
            Finds words most similar to the resulting vector
          </Typography>
        </Box>
        <Typography variant="body2">
          This reveals semantic relationships like "king is to man as X is to woman", helping discover how language 
          encodes gender, hierarchy, and other conceptual patterns.
        </Typography>
      </Box>
    </Box>
  );
};

export default AnalogiesPanel;
