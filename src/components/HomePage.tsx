import React from 'react';
import { Box, Typography, Paper, Card, CardContent, Link, Chip } from '@mui/material';
import { GitHub } from '@mui/icons-material';

const HomePage: React.FC = () => {
  return (
    <Box sx={{ maxWidth: '100%' }}>
      {/* Hero Section */}
      <Paper elevation={2} sx={{ 
        p: 4, 
        mb: 4, 
        textAlign: 'center', 
        background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 30% 20%, rgba(255,143,0,0.1) 0%, transparent 50%)',
          pointerEvents: 'none'
        }
      }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, position: 'relative', zIndex: 1 }}>
          Embeddings Over Time Explorer
        </Typography>
        <Typography variant="h6" sx={{ mb: 3, opacity: 0.9, position: 'relative', zIndex: 1 }}>
          Explore how language has evolved over time through word embeddings
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          <Link href="https://github.com/adameubanks/embeddings-over-time" target="_blank" sx={{ textDecoration: 'none' }}>
            <Chip 
              icon={<GitHub />} 
              label="View on GitHub" 
              sx={{ 
                bgcolor: '#ff8f00', 
                color: '#1b5e20',
                fontWeight: 600,
                fontSize: '0.9rem',
                px: 2,
                py: 1,
                border: '2px solid #ff8f00',
                '&:hover': { 
                  bgcolor: '#ff9800',
                  borderColor: '#f57c00',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 8px rgba(255,143,0,0.3)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
              clickable
            />
          </Link>
        </Box>
      </Paper>

      {/* Research Context */}
      <Paper elevation={1} sx={{ p: 4, mb: 4, borderLeft: '4px solid #ff8f00' }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3, color: '#1b5e20' }}>
          Research Context
        </Typography>
        <Typography variant="body1" paragraph>
          This project is part of a larger research initiative exploring how embedding spaces can quantify language evolution over time. 
          By analyzing semantic shifts in word vectors across different years, we can gain insights into how language, culture, 
          and technology have influenced our vocabulary and communication patterns.
        </Typography>
        <Typography variant="body1" paragraph>
          Our embeddings are based on the FineWeb dataset, specifically from the first 3 and last 3 web crawls of 
          this comprehensive web corpus. To create yearly snapshots of language evolution, we filtered articles by identifying 
          those containing years in their URLs (2020, 2019, etc.) and grouped them accordingly. This process allowed us to 
          create distinct yearly subsets spanning 2005-2025.
        </Typography>
        <Typography variant="body1">
          For each year's article group, we trained word2vec embeddings using the word2vec library, capturing the semantic 
          relationships present in that time period's web content. The resulting embeddings were then compressed for efficient 
          storage and loading, providing a comprehensive view of language evolution across nearly two decades.
        </Typography>
      </Paper>

      {/* Features Grid */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
          <Card elevation={2} sx={{ 
            border: '1px solid #e8f5e8',
            '&:hover': { 
              borderColor: '#1b5e20',
              boxShadow: '0 4px 12px rgba(27, 94, 32, 0.15)'
            }
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1b5e20' }}>
                Nearest Neighbors
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Find the most semantically similar words for any term in a given year. Discover how word relationships 
                change over time and explore the vocabulary available in each time period.
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
          <Card elevation={2} sx={{ 
            border: '1px solid #e8f5e8',
            '&:hover': { 
              borderColor: '#1b5e20',
              boxShadow: '0 4px 12px rgba(27, 94, 32, 0.15)'
            }
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1b5e20' }}>
                Semantic Evolution
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Track how the relationship between word groups changes across years. Analyze semantic shifts and 
                quantify language evolution patterns.
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
          <Card elevation={2} sx={{ 
            border: '1px solid #e8f5e8',
            '&:hover': { 
              borderColor: '#1b5e20',
              boxShadow: '0 4px 12px rgba(27, 94, 32, 0.15)'
            }
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1b5e20' }}>
                Embedding Projection
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Interactive 1D and 2D projections with customizable semantic axes. Toggle between modes to 
                explore words along single dimensions or in 2D semantic spaces.
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
          <Card elevation={2} sx={{ 
            border: '1px solid #e8f5e8',
            '&:hover': { 
              borderColor: '#1b5e20',
              boxShadow: '0 4px 12px rgba(27, 94, 32, 0.15)'
            }
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1b5e20' }}>
                Word Analogies
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Explore semantic relationships through vector arithmetic. Enter expressions like "king - man + woman" 
                to discover how language encodes conceptual patterns and relationships.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default HomePage;
