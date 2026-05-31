import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, CircularProgress, AppBar, Toolbar, Tabs, Tab, Paper, IconButton, Tooltip } from '@mui/material';
import { GitHub } from '@mui/icons-material';
import EmbeddingService from './EmbeddingService';
import './App.css'
import HomePage from './components/HomePage';
import NeighborsPanel from './NeighborsPanel';
import SemanticEvolutionPanel from './SemanticEvolutionPanel';
import ProjectionPanel from './ProjectionPanel';
import AnalogiesPanel from './AnalogiesPanel';

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
      <AppBar position="static" elevation={0} sx={{ 
        borderBottom: 1, 
        borderColor: 'divider', 
        bgcolor: '#1b5e20', // Forest green
        background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)', // Subtle gradient
        '& .MuiTabs-indicator': {
          backgroundColor: '#ff8f00', // Gold/amber underline
          height: '3px',
          borderRadius: '2px 2px 0 0'
        },
        '& .MuiTab-root': {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.95rem',
          '&.Mui-selected': {
            color: '#fff',
            fontWeight: 600
          }
        }
      }}>
        <Toolbar sx={{ px: { xs: 1, sm: 2 }, minHeight: 56 }}>
          {/* Brand Logo */}
          <Box sx={{ 
            mr: 3, 
            display: 'flex', 
            alignItems: 'center',
            p: 1,
            borderRadius: 1,
            bgcolor: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <svg width="32" height="32" viewBox="0 0 32 32" style={{ filter: 'brightness(0) invert(1)' }}>
              {/* Background circle for academic feel */}
              <circle cx="16" cy="16" r="15" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
              {/* Data points with enhanced styling */}
              <circle cx="4" cy="28" r="2.5" fill="currentColor"/>
              <circle cx="12" cy="20" r="2.5" fill="currentColor"/>
              <circle cx="20" cy="12" r="2.5" fill="currentColor"/>
              <circle cx="28" cy="8" r="2.5" fill="currentColor"/>
              {/* Connecting lines with better weight */}
              <polyline points="4,28 12,20 20,12 28,8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              {/* Small accent dots for personality */}
              <circle cx="8" cy="24" r="0.8" fill="currentColor" opacity="0.7"/>
              <circle cx="16" cy="16" r="0.8" fill="currentColor" opacity="0.7"/>
              <circle cx="24" cy="10" r="0.8" fill="currentColor" opacity="0.7"/>
            </svg>
          </Box>
          
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600, letterSpacing: 0.5 }}>
            Embeddings Over Time Explorer
          </Typography>

          <Box
            component="a"
            href={`${import.meta.env.BASE_URL}about/`}
            sx={{
              color: 'inherit',
              textDecoration: 'none',
              mr: 2,
              fontWeight: 500,
              fontSize: '0.95rem',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            About
          </Box>
          
          {/* GitHub Link */}
          <Box sx={{ mr: 2 }}>
            <Tooltip title="View on GitHub">
              <IconButton 
                component="a" 
                href="https://github.com/adameubanks/embeddings-over-time" 
                target="_blank"
                sx={{ color: 'inherit' }}
              >
                <GitHub />
              </IconButton>
            </Tooltip>
          </Box>
          
          {/* Hugging Face Link */}
          <Box sx={{ mr: 2 }}>
            <Tooltip title="Open interactive demo on Hugging Face Space">
              <IconButton 
                component="a" 
                href="https://huggingface.co/spaces/adameubanks/embeddings-over-time" 
                target="_blank"
                sx={{ color: 'inherit' }}
              >
                <Box sx={{ 
                  width: 24, 
                  height: 24, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '20px'
                }}>
                  🤗
                </Box>
              </IconButton>
            </Tooltip>
          </Box>
          
          <Tabs
            value={selectedTab}
            onChange={(_, v) => setSelectedTab(v)}
            textColor="inherit"
            sx={{ minHeight: 40 }}
          >
            <Tab label="Home" sx={{ minWidth: 100 }} />
            <Tab label="Nearest Neighbors" sx={{ minWidth: 150 }} />
            <Tab label="Semantic Evolution" sx={{ minWidth: 150 }} />
            <Tab label="Projection" sx={{ minWidth: 150 }} />
            <Tab label="Analogies" sx={{ minWidth: 120 }} />
          </Tabs>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="md" sx={{ flex: 1, py: 4, display: 'flex', flexDirection: 'column' }}>
        {selectedTab === 0 && (
          <Box>
            <HomePage />
          </Box>
        )}
        {selectedTab === 1 && (
          <Box>
            <NeighborsPanel intersectionVocab={intersectionVocab} />
          </Box>
        )}
        {selectedTab === 2 && (
          <Box>
            <SemanticEvolutionPanel vocab={intersectionVocab} />
          </Box>
        )}
        {selectedTab === 3 && (
          <Box>
            <ProjectionPanel />
          </Box>
        )}
        {selectedTab === 4 && (
          <Box>
            <AnalogiesPanel />
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
      </Paper>
    </Box>
  );
};

export default App;
