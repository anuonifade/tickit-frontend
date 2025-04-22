import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Container, 
  Button,
  Fade,
  Grow,
  Zoom,
  CircularProgress
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Confetti animation
import Confetti from 'react-confetti';
import useWindowSize from 'react-use/lib/useWindowSize';

const ThankYouPage: React.FC = () => {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(true);
  const [progress, setProgress] = useState(0);
  const { width, height } = useWindowSize();

  // No auto-redirect, just initialize progress for the progress bar animation
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prevProgress + 1;
      });
    }, 100);

    // Cleanup
    return () => {
      clearInterval(timer);
    };
  }, []);

  // Stop confetti after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Container maxWidth="md" sx={{ mt: 8, position: 'relative' }}>
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={200} />}
      
      <Fade in={true} timeout={1000}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 6, 
            textAlign: 'center',
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)'
          }}
        >
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 8 }}>
            <Box 
              sx={{ 
                height: '100%', 
                backgroundColor: 'primary.main',
                width: `${progress}%`,
                transition: 'width 0.1s linear'
              }} 
            />
          </Box>

          <Zoom in={true} style={{ transitionDelay: '300ms' }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              >
                <CheckCircleOutlineIcon 
                  color="primary" 
                  sx={{ fontSize: 100 }} 
                />
              </motion.div>
            </Box>
          </Zoom>

          <Grow in={true} timeout={1000}>
            <Typography variant="h3" component="h1" gutterBottom color="primary" fontWeight="bold">
              Thank You!
            </Typography>
          </Grow>

          <Fade in={true} timeout={1500}>
            <Typography variant="h6" gutterBottom sx={{ mb: 4 }}>
              Your survey has been submitted successfully.
            </Typography>
          </Fade>

          <Fade in={true} timeout={2000}>
            <Box>
              <Typography variant="body1" paragraph>
                Your responses help us provide better mental health support.
              </Typography>
              <Typography variant="body1" paragraph>
                All your information is encrypted and stored securely in compliance with HIPAA regulations.
              </Typography>
            </Box>
          </Fade>

          <Fade in={true} timeout={2500}>
            <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                onClick={() => navigate('/')}
                sx={{ 
                  px: 4, 
                  py: 1.5, 
                  borderRadius: 2,
                  boxShadow: 3,
                  mb: 3,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 5,
                    transition: 'all 0.3s'
                  }
                }}
              >
                Return Home
              </Button>
              
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                  Powered by
                </Typography>
                <Box 
                  component="a" 
                  href="/"
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    textDecoration: 'none',
                    color: 'primary.main',
                    fontWeight: 'bold',
                    fontSize: '1.2rem',
                    '&:hover': { opacity: 0.8 }
                  }}
                >
                  <Typography 
                    variant="h6" 
                    color="primary" 
                    sx={{ 
                      fontWeight: 'bold', 
                      display: 'flex', 
                      alignItems: 'center'
                    }}
                  >
                    Tickit Health
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Fade>
        </Paper>
      </Fade>
    </Container>
  );
};

export default ThankYouPage;
