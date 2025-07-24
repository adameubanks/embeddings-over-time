import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, CircularProgress, AppBar, Toolbar, Tabs, Tab, Paper } from '@mui/material';
import EmbeddingService from './EmbeddingService';
import './App.css'
import NeighborsPanel from './NeighborsPanel';
import CosineSimilarityPanel from './CosineSimilarityPanel';
import Projection2DPanel from './Projection2DPanel';

const App: React.FC = () => {
  const [intersectionVocab, setIntersectionVocab] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<number>(0);

  useEffect(() => {
    async function init() {
      setLoading(true);
      const vocab = await EmbeddingService.fetchVocab();
      setIntersectionVocab(vocab.sort());
      setLoading(false);
    }
    init();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading embeddings...</Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {/* Navbar */}
      <AppBar position="static" color="primary" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'primary.main' }}>
        <Toolbar sx={{ px: { xs: 1, sm: 2 }, minHeight: 56 }}>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600, letterSpacing: 0.5 }}>
            Embeddings Over Time Explorer
          </Typography>
          <Tabs
            value={selectedTab}
            onChange={(_, v) => setSelectedTab(v)}
            textColor="inherit"
            indicatorColor="secondary"
            aria-label="panel tabs"
            sx={{ minHeight: 40 }}
          >
            <Tab label="Neighbors" sx={{ minWidth: 120 }} />
            <Tab label="Cosine Similarity Over Time" sx={{ minWidth: 220 }} />
            <Tab label="2D Projection" sx={{ minWidth: 150 }} />
          </Tabs>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="md" sx={{ flex: 1, py: 4, display: 'flex', flexDirection: 'column' }}>
        {selectedTab === 0 && (
          <Box>
            <NeighborsPanel intersectionVocab={intersectionVocab} />
          </Box>
        )}
        {selectedTab === 1 && (
          <Box>
            <CosineSimilarityPanel vocab={intersectionVocab} />
          </Box>
        )}
        {selectedTab === 2 && (
          <Box>
            <Projection2DPanel />
          </Box>
        )}
      </Container>

      {/* Footer */}
      <Paper
        component="footer"
        square
        elevation={0}
        sx={{ py: 2, px: 2, mt: 'auto', bgcolor: 'grey.100', borderTop: 1, borderColor: 'divider', textAlign: 'center', width: '100%' }}
      >
        <Typography variant="body2" color="text.secondary">
          A project by BYU IDeA Labs
        </Typography>
      </Paper>
    </Box>
  );
};

export default App;
