import React from 'react';
import { Box, Typography, Paper, Card, CardContent, Link, Chip } from '@mui/material';
import { GitHub } from '@mui/icons-material';
import MathText from './MathText';

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
          <Link href="https://huggingface.co/adameubanks/YearlyWord2Vec" target="_blank" sx={{ textDecoration: 'none' }}>
            <Chip 
              icon={<Box component="span" sx={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#1b5e20'
              }}>🤗</Box>} 
              label="View on Hugging Face" 
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
          Our embeddings are based on the <Link href="https://huggingface.co/datasets/HuggingFaceFW/fineweb" target="_blank" sx={{ color: '#ff8f00', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>FineWeb dataset</Link>, specifically from the first 3 and last 3 web crawls of 
          this comprehensive web corpus. To create yearly snapshots of language evolution, we filtered articles by identifying 
          those containing years in their URLs (2020, 2019, etc.) and grouped them accordingly. This process allowed us to 
          create distinct yearly subsets spanning 2005-2025 (2025 data through June).
        </Typography>
        <Typography variant="body1" paragraph>
          For each year's article group, we trained word2vec embeddings using the word2vec library, capturing the semantic 
          relationships present in that time period's web content. The resulting embeddings were then compressed for efficient 
          storage and loading, providing a comprehensive view of language evolution across nearly two decades.
        </Typography>
        <Typography variant="body1">
          All models and metrics used in this project are available on <Link href="https://huggingface.co/adameubanks/YearlyWord2Vec" target="_blank" sx={{ color: '#ff8f00', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Hugging Face</Link>. This repository contains the complete collection of word2vec embeddings, vocabulary files, and model metadata for researchers and developers interested in exploring language evolution over time.
        </Typography>
      </Paper>

      {/* How Embeddings Work */}
      <Paper elevation={1} sx={{ p: 4, mb: 4, borderLeft: '4px solid #ff8f00' }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3, color: '#1b5e20' }}>
          How Embeddings Work
        </Typography>
        
        {/* Word to Vector Explanation */}
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1b5e20', mt: 3 }}>
          From Words to Vectors
        </Typography>
        <Typography variant="body1" paragraph>
          Word2vec transforms words into high-dimensional vectors (typically 100-300 dimensions) by analyzing their co-occurrence patterns in text. 
          Words that appear in similar contexts get similar vector representations. Each word w becomes a vector <MathText>{`v_w \\in \\mathbb{R}^d`}</MathText> where d is the embedding dimension.
        </Typography>
        
        {/* Cosine Similarity Explanation */}
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1b5e20', mt: 3 }}>
          Measuring Similarity: Cosine Similarity
        </Typography>
        <Typography variant="body1" paragraph>
          The similarity between two word vectors is measured using cosine similarity: <MathText>{`\\cos(\\theta) = \\frac{v_1 \\cdot v_2}{||v_1|| \\cdot ||v_2||}`}</MathText>, 
          where <MathText>{`\\cdot`}</MathText> denotes the dot product and <MathText>{`||v||`}</MathText> is the L2 norm. This measures the cosine of the angle between vectors, 
          ranging from -1 (opposite directions) to 1 (same direction). A value of 0 indicates orthogonal vectors.
        </Typography>
        
        {/* Vector Operations Explanation */}
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1b5e20', mt: 3 }}>
          Vector Operations
        </Typography>
        <Typography variant="body1" paragraph>
          Vector addition and subtraction work component-wise: <MathText>{`(v_1 \\pm v_2)_i = v_{1,i} \\pm v_{2,i}`}</MathText>. Averaging multiple word vectors 
          computes their centroid: <MathText>{`v_{\\text{avg}} = \\frac{v_1 + v_2 + \\cdots + v_n}{n}`}</MathText>. These operations preserve semantic relationships 
          and enable analogical reasoning and group comparisons.
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
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
                Compute argmax cosine similarity to find nearest neighbors in embedding space
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Find the most semantically similar words using cosine similarity. For a target word vector <MathText>{`v_{\\text{target}}`}</MathText>, 
                we compute <MathText>{`\\arg\\max_{w \\in \\text{vocab}} \\cos(v_{\\text{target}}, v_w)`}</MathText> to find the N words with highest similarity scores. 
                This reveals which words have the most similar semantic contexts in the embedding space.
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
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
                Monitor temporal evolution of cosine similarity between averaged word group vectors
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Track semantic shifts by computing cosine similarity between word group average vectors over time. 
                For groups A and B, we compute <MathText>{`v_A = \\frac{v_{a_1} + v_{a_2} + \\cdots + v_{a_n}}{n}`}</MathText> and <MathText>{`v_B = \\frac{v_{b_1} + v_{b_2} + \\cdots + v_{b_m}}{m}`}</MathText>, 
                then plot <MathText>{`\\cos(v_A, v_B)`}</MathText> across years to quantify how group relationships evolve.
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
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
                Project high-dimensional vectors onto 1D/2D semantic axes using dot product operations
              </Typography>
              <Typography variant="body2" color="text.secondary">
                1D projection: Project word vectors onto a semantic axis using <MathText>{`\\text{proj}(v, \\text{axis}) = \\frac{v \\cdot \\text{axis}}{||\\text{axis}||^2} \\cdot \\text{axis}`}</MathText>. 
                2D projection: Use two orthogonal semantic axes to create a 2D semantic space. Words are positioned based on 
                their projections onto these custom semantic dimensions, revealing underlying semantic structure.
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
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
                Perform vector arithmetic operations and find closest matches via cosine similarity
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Solve analogies through vector arithmetic: <MathText>{`v_{\\text{result}} = v_{\\text{king}} - v_{\\text{man}} + v_{\\text{woman}}`}</MathText>. The resulting vector <MathText>{`v_{\\text{result}}`}</MathText> 
                represents the target concept. We then find words w with highest cosine similarity to this target: 
                <MathText>{`\\arg\\max_{w \\in \\text{vocab}} \\cos(v_{\\text{result}}, v_w)`}</MathText>, revealing how language encodes conceptual relationships.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default HomePage;
