import React from 'react';
import { Box, Typography, Paper, Card, CardContent, Link, Chip } from '@mui/material';
import { GitHub } from '@mui/icons-material';

const HomePage: React.FC = () => {
  return (
    <Box sx={{ maxWidth: '100%' }}>
      {/* Hero Section */}
      <Paper elevation={2} sx={{ p: 4, mb: 4, textAlign: 'center', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Embeddings Over Time Explorer
        </Typography>
        <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
          Explore how language has evolved over time through word embeddings
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Link href="https://github.com/adameubanks/embeddings-over-time" target="_blank" sx={{ textDecoration: 'none' }}>
            <Chip 
              icon={<GitHub />} 
              label="View on GitHub" 
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'inherit', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
              clickable
            />
          </Link>
        </Box>
      </Paper>

      {/* Research Context */}
      <Paper elevation={1} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
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
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
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
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Cosine Similarity Over Time
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Track how the relationship between word groups changes across years. Analyze semantic shifts and 
                quantify language evolution patterns.
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                2D Projection
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Visualize words in a customizable 2D semantic space. Explore word clusters and relationships 
                in an interactive visualization.
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                1D Projection
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Project words onto a single semantic dimension for focused analysis. Compare words along 
                specific semantic axes.
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
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
