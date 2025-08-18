import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import EmbeddingService from './EmbeddingService';
import WordAutocompleteBox from './components/WordAutocompleteBox';

interface SemanticEvolutionPanelProps {
  vocab: string[];
}

const SemanticEvolutionPanel: React.FC<SemanticEvolutionPanelProps> = ({ vocab }) => {
  const [wordGroups, setWordGroups] = useState<string[][]>([[], []]);
  const [data, setData] = useState<{year: number, similarities: {groupIndex: number, similarity: number}[]}[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePlot = async () => {
    if (!wordGroups[0].length || !wordGroups[1].length) return;
    setLoading(true);
    const result = await EmbeddingService.getCosineOverTimeMultiple(wordGroups);
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
        {wordGroups[0].length && wordGroups[1].length
          ? `Semantic Evolution: ${wordGroups[0].join(', ')} vs ${wordGroups[1].join(', ')}`
          : 'Semantic Evolution Over Time'}
      </Typography>
      <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
        Monitor evolution of cosine similarity between averaged word group vectors. Select multiple words in each group to compare their average vectors over time.
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Word A input */}
        <WordAutocompleteBox
          options={vocab}
          value={wordGroups[0]}
          onChange={v => setWordGroups(prev => [Array.isArray(v) ? v : [], prev[1]])}
          label="Word Group 1"
          helperText="Type at least 2 letters to search"
          sx={{ minWidth: 200, flex: 1 }}
          multiple={true}
        />
        {/* Word B input */}
        <WordAutocompleteBox
          options={vocab}
          value={wordGroups[1]}
          onChange={v => setWordGroups(prev => [prev[0], Array.isArray(v) ? v : []])}
          label="Word Group 2"
          helperText="Type at least 2 letters to search"
          sx={{ minWidth: 200, flex: 1 }}
          multiple={true}
        />
        <Button variant="contained" onClick={handlePlot} disabled={!wordGroups[0].length || !wordGroups[1].length} sx={{ height: '55px', alignSelf: 'flex-start', minWidth: 100, boxShadow: 'none', textTransform: 'none', fontWeight: 500 }}>
          Plot
        </Button>
      </Box>
      {loading && <Typography>Loading similarity data...</Typography>}
      {data && (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 16, right: 16, left: 60, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="year" 
                tick={{ fontSize: 12 }}
                label={{ 
                  value: "Year", 
                  position: "bottom", 
                  offset: 20,
                  fontSize: 14,
                  fill: "#666"
                }}
              />
              <YAxis 
                domain={[-1, 1]} 
                tick={{ fontSize: 12 }}
                label={{ 
                  value: "Cosine Similarity", 
                  position: "left", 
                  fontSize: 14,
                  fill: "#666",
                  angle: -90
                }}
              />
              <Tooltip formatter={(v: number) => v.toFixed(4)} />
              {wordGroups.length >= 2 && (
                <Line 
                  type="monotone" 
                  dataKey="similarities.0.similarity" 
                  stroke="#ff8f00"
                  dot 
                  name={`Group 1 vs Group 2`}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </Box>
  );
};

export default SemanticEvolutionPanel;
