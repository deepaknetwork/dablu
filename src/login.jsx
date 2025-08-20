// Login page with loading functionality
import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios'; 
import userIdContext from './data';
import { useNavigate, useLocation } from 'react-router-dom';
import url from './api';
import { useLoading } from './loadingContext.jsx';
import OTPVerification from './OTPVerification.jsx';

// Material UI imports
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  IconButton,
  Divider,
  Alert,
  Fade,
  Slide
} from '@mui/material';
import {
  Google as GoogleIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Brutalist theme with colors
const brutalistTheme = createTheme({
  palette: {
    primary: {
      main: '#FF6B35', // Orange
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#4ECDC4', // Teal
      contrastText: '#000000',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#000000',
      secondary: '#333333',
    },
    error: {
      main: '#E74C3C', // Red
    },
    success: {
      main: '#2ECC71', // Green
    },
    info: {
      main: '#3498DB', // Blue
    },
    warning: {
      main: '#F39C12', // Yellow
    },
  },
  typography: {
    fontFamily: '"JetBrains Mono", "Courier New", monospace',
    h1: {
      fontWeight: 900,
      fontSize: '3rem',
      letterSpacing: '-0.02em',
      textTransform: 'uppercase',
    },
    h2: {
      fontWeight: 800,
      fontSize: '2rem',
      letterSpacing: '-0.01em',
      textTransform: 'uppercase',
    },
    button: {
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: '4px 4px 0px #000000',
          border: '2px solid #000000',
          transition: 'all 0.1s ease',
          fontWeight: 700,
          '&:hover': {
            transform: 'translate(-2px, -2px)',
            boxShadow: '6px 6px 0px #000000',
          },
          '&:active': {
            transform: 'translate(2px, 2px)',
            boxShadow: '2px 2px 0px #000000',
          },
        },
        contained: {
          backgroundColor: '#FF6B35',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#E55A2B',
          },
          '&:disabled': {
            backgroundColor: '#CCCCCC',
            color: '#666666',
          },
        },
        outlined: {
          backgroundColor: '#4ECDC4',
          color: '#000000',
          borderColor: '#000000',
          '&:hover': {
            backgroundColor: '#42B8B0',
            borderColor: '#000000',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 0,
            backgroundColor: '#ffffff',
            border: '2px solid #000000',
            boxShadow: '2px 2px 0px #000000',
            transition: 'all 0.1s ease',
            '&:hover': {
              transform: 'translate(-1px, -1px)',
              boxShadow: '3px 3px 0px #000000',
            },
            '&.Mui-focused': {
              transform: 'translate(-1px, -1px)',
              boxShadow: '4px 4px 0px #000000',
            },
            '& fieldset': {
              border: 'none',
            },
          },
          '& .MuiInputLabel-root': {
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#3498DB',
            backgroundColor: '#ffffff',
            padding: '0 4px',
            transform: 'translate(14px, -9px) scale(1)',
            '&.MuiInputLabel-shrink': {
              transform: 'translate(14px, -9px) scale(1)',
            },
            '&.Mui-focused': {
              color: '#E74C3C',
            },
          },
          '& .MuiOutlinedInput-input': {
            padding: '12px 14px',
            fontSize: '0.9rem',
            fontWeight: 600,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: '6px 6px 0px #000000',
          border: '2px solid #000000',
        },
      },
    },
  },
});

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { getUserID, setUserID } = useContext(userIdContext);
    const [showSignup, setShowSignup] = useState(false);
    const [showOTPVerification, setShowOTPVerification] = useState(false);
    const [signupData, setSignupData] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { showLoading, hideLoading } = useLoading();

    // Check for Google OAuth redirect with userId
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const userId = urlParams.get('userId');
        if (userId) {
            setUserID(userId);
            navigate('/');
        }
    }, [location, setUserID, navigate]);

    const toggleSignup = () => {
        setShowSignup(!showSignup);
        setShowOTPVerification(false);
        setSignupData(null);
        setError('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');

        if (!email || !password) {
            setError("ENTER EMAIL AND PASSWORD");
            return;
        }

        setLoading(true);
        setError('');
        showLoading();

        try {
            const response = await axios.post(`${url}/auth/login`, { email, password });
            setUserID(response.data.userId);
            navigate('/');
        } catch (error) {
            setError(error.response?.data?.error?.toUpperCase() || 'LOGIN FAILED. TRY AGAIN.');
        } finally {
            setLoading(false);
            hideLoading();
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const username = formData.get('username');
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        // Validation
        if (username.length < 3) {
            setError("USERNAME TOO SHORT (MIN 3 CHARS)");
            return;
        }

        if (!email.includes('@') || !email.includes('.')) {
            setError("INVALID EMAIL FORMAT");
            return;
        }

        if (password.length < 6) {
            setError("PASSWORD TOO SHORT (MIN 6 CHARS)");
            return;
        }

        if (password !== confirmPassword) {
            setError("PASSWORDS DO NOT MATCH");
            return;
        }

        setLoading(true);
        setError('');
        showLoading();

        try {
            await axios.post(`${url}/auth/send-otp`, { email, username });
            setSignupData({ username, email, password });
            setShowOTPVerification(true);
        } catch (error) {
            setError(error.response?.data?.error?.toUpperCase() || 'SIGNUP FAILED. TRY AGAIN.');
        } finally {
            setLoading(false);
            hideLoading();
        }
    };

    const handleOTPSuccess = (userId) => {
        setUserID(userId);
        navigate('/');
    };

    const handleOTPBack = () => {
        setShowOTPVerification(false);
        setSignupData(null);
        setError('');
    };

    const handleGoogleLogin = () => {
        window.location.href = `${url}/auth/google`;
    };

    if (showOTPVerification && signupData) {
        return (
            <ThemeProvider theme={brutalistTheme}>
                <Box sx={{ 
                    minHeight: '100vh', 
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 2
                }}>
                <OTPVerification
                    email={signupData.email}
                    username={signupData.username}
                    password={signupData.password}
                    onSuccess={handleOTPSuccess}
                    onBack={handleOTPBack}
                />
                </Box>
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider theme={brutalistTheme}>
            <Box sx={{ 
                minHeight: '100vh', 
                backgroundColor: '#ffffff',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Modern Money-Related Background Elements */}
                <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 0,
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 30%, #fff5f5 70%, #ffffff 100%)'
                }}>
                    {/* Multiple Currency Symbols */}
                    <Box sx={{
                        position: 'absolute',
                        top: { xs: '8%', sm: '12%' },
                        right: { xs: '5%', sm: '8%' },
                        fontSize: { xs: '80px', sm: '110px', md: '140px' },
                        fontWeight: 900,
                        color: '#2ECC71',
                        opacity: 0.15,
                        fontFamily: '"JetBrains Mono", monospace',
                        userSelect: 'none',
                        transform: 'rotate(-15deg)'
                    }}>
                        $
                    </Box>
                    <Box sx={{
                        position: 'absolute',
                        top: { xs: '15%', sm: '20%' },
                        left: { xs: '8%', sm: '12%' },
                        fontSize: { xs: '60px', sm: '80px', md: '100px' },
                        fontWeight: 900,
                        color: '#3498DB',
                        opacity: 0.12,
                        fontFamily: '"JetBrains Mono", monospace',
                        userSelect: 'none',
                        transform: 'rotate(25deg)'
                    }}>
                        €
                    </Box>
                    <Box sx={{
                        position: 'absolute',
                        bottom: { xs: '25%', sm: '30%' },
                        right: { xs: '15%', sm: '20%' },
                        fontSize: { xs: '70px', sm: '90px', md: '110px' },
                        fontWeight: 900,
                        color: '#FF6B35',
                        opacity: 0.11,
                        fontFamily: '"JetBrains Mono", monospace',
                        userSelect: 'none',
                        transform: 'rotate(10deg)'
                    }}>
                        £
                    </Box>

                    {/* Multiple Small Credit Cards */}
                    <Box sx={{
                        position: 'absolute',
                        top: { xs: '35%', sm: '40%' },
                        left: { xs: '-8%', sm: '-5%' },
                        width: { xs: '140px', sm: '180px', md: '220px' },
                        height: { xs: '85px', sm: '110px', md: '135px' },
                        background: 'linear-gradient(45deg, #FF6B35 0%, #F39C12 100%)',
                        borderRadius: '8px',
                        transform: 'rotate(-20deg)',
                        opacity: 0.15,
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: '12px',
                            left: '12px',
                            right: '12px',
                            height: '20px',
                            backgroundColor: '#ffffff',
                            borderRadius: '2px'
                        }
                    }} />
                    <Box sx={{
                        position: 'absolute',
                        bottom: { xs: '15%', sm: '18%' },
                        right: { xs: '-5%', sm: '-2%' },
                        width: { xs: '110px', sm: '140px', md: '170px' },
                        height: { xs: '70px', sm: '90px', md: '110px' },
                        background: 'linear-gradient(45deg, #4ECDC4 0%, #2ECC71 100%)',
                        borderRadius: '6px',
                        transform: 'rotate(30deg)',
                        opacity: 0.12,
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: '8px',
                            left: '8px',
                            right: '8px',
                            height: '15px',
                            backgroundColor: '#ffffff',
                            borderRadius: '2px'
                        }
                    }} />

                    {/* Multiple Small Charts */}
                    <Box sx={{
                        position: 'absolute',
                        bottom: { xs: '8%', sm: '12%' },
                        right: { xs: '2%', sm: '5%' },
                        width: { xs: '110px', sm: '140px', md: '170px' },
                        height: { xs: '70px', sm: '90px', md: '110px' },
                        opacity: 0.12
                    }}>
                        {/* Small chart bars */}
                        <Box sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: '15%',
                            width: '8px',
                            height: '60%',
                            backgroundColor: '#E74C3C'
                        }} />
                        <Box sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: '35%',
                            width: '8px',
                            height: '40%',
                            backgroundColor: '#F39C12'
                        }} />
                        <Box sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: '55%',
                            width: '8px',
                            height: '80%',
                            backgroundColor: '#2ECC71'
                        }} />
                        <Box sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: '75%',
                            width: '8px',
                            height: '35%',
                            backgroundColor: '#3498DB'
                        }} />
                    </Box>
                    <Box sx={{
                        position: 'absolute',
                        top: { xs: '25%', sm: '30%' },
                        right: { xs: '25%', sm: '30%' },
                        width: { xs: '85px', sm: '105px', md: '125px' },
                        height: { xs: '55px', sm: '70px', md: '85px' },
                        opacity: 0.1
                    }}>
                        {/* Tiny chart bars */}
                        <Box sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: '10%',
                            width: '6px',
                            height: '70%',
                            backgroundColor: '#9B59B6'
                        }} />
                        <Box sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: '40%',
                            width: '6px',
                            height: '50%',
                            backgroundColor: '#E67E22'
                        }} />
                        <Box sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: '70%',
                            width: '6px',
                            height: '90%',
                            backgroundColor: '#1ABC9C'
                        }} />
                    </Box>

                    {/* Multiple Small Financial Numbers */}
                    <Box sx={{
                        position: 'absolute',
                        top: { xs: '45%', sm: '50%' },
                        left: { xs: '3%', sm: '5%' },
                        fontSize: { xs: '16px', sm: '20px' },
                        fontWeight: 700,
                        color: '#2ECC71',
                        opacity: 0.12,
                        fontFamily: '"JetBrains Mono", monospace',
                        transform: 'rotate(8deg)',
                        lineHeight: 1.3
                    }}>
                        $1,234.56
                    </Box>
                    <Box sx={{
                        position: 'absolute',
                        bottom: { xs: '35%', sm: '40%' },
                        right: { xs: '8%', sm: '12%' },
                        fontSize: { xs: '14px', sm: '18px' },
                        fontWeight: 700,
                        color: '#E74C3C',
                        opacity: 0.1,
                        fontFamily: '"JetBrains Mono", monospace',
                        transform: 'rotate(-12deg)',
                        lineHeight: 1.3
                    }}>
                        €789.00<br/>
                        ¥9,876
                    </Box>
                    <Box sx={{
                        position: 'absolute',
                        top: { xs: '65%', sm: '70%' },
                        left: { xs: '25%', sm: '30%' },
                        fontSize: { xs: '15px', sm: '19px' },
                        fontWeight: 700,
                        color: '#3498DB',
                        opacity: 0.11,
                        fontFamily: '"JetBrains Mono", monospace',
                        transform: 'rotate(15deg)'
                    }}>
                        ₹45,670
                    </Box>

                    {/* Multiple Small Coin Circles */}
                    <Box sx={{
                        position: 'absolute',
                        bottom: { xs: '3%', sm: '5%' },
                        left: { xs: '3%', sm: '5%' },
                        width: { xs: '55px', sm: '70px', md: '85px' },
                        height: { xs: '55px', sm: '70px', md: '85px' },
                        border: { xs: '5px solid #E74C3C', sm: '6px solid #E74C3C' },
                        borderRadius: '50%',
                        opacity: 0.12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: { xs: '14px', sm: '18px', md: '22px' },
                        fontWeight: 900,
                        color: '#E74C3C'
                    }}>
                        ¢
                    </Box>
                    <Box sx={{
                        position: 'absolute',
                        top: { xs: '55%', sm: '60%' },
                        right: { xs: '3%', sm: '5%' },
                        width: { xs: '50px', sm: '65px', md: '80px' },
                        height: { xs: '50px', sm: '65px', md: '80px' },
                        border: { xs: '4px solid #2ECC71', sm: '5px solid #2ECC71' },
                        borderRadius: '50%',
                        opacity: 0.1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: { xs: '12px', sm: '16px', md: '20px' },
                        fontWeight: 900,
                        color: '#2ECC71'
                    }}>
                        $
                    </Box>
                    <Box sx={{
                        position: 'absolute',
                        top: { xs: '75%', sm: '80%' },
                        left: { xs: '70%', sm: '75%' },
                        width: { xs: '45px', sm: '60px', md: '75px' },
                        height: { xs: '45px', sm: '60px', md: '75px' },
                        border: { xs: '4px solid #3498DB', sm: '5px solid #3498DB' },
                        borderRadius: '50%',
                        opacity: 0.09,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: { xs: '10px', sm: '14px', md: '18px' },
                        fontWeight: 900,
                        color: '#3498DB'
                    }}>
                        €
                    </Box>

                    {/* Multiple Small Bank/Safe Icons */}
                    <Box sx={{
                        position: 'absolute',
                        top: { xs: '3%', sm: '5%' },
                        left: { xs: '25%', sm: '30%' },
                        width: { xs: '50px', sm: '65px', md: '80px' },
                        height: { xs: '50px', sm: '65px', md: '80px' },
                        background: 'linear-gradient(45deg, #34495E 0%, #2C3E50 100%)',
                        opacity: 0.1,
                        borderRadius: '4px',
                        position: 'relative',
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '25%',
                            height: '25%',
                            border: '2px solid #ffffff',
                            borderRadius: '50%'
                        }
                    }} />
                    <Box sx={{
                        position: 'absolute',
                        bottom: { xs: '20%', sm: '25%' },
                        left: { xs: '10%', sm: '15%' },
                        width: { xs: '45px', sm: '60px', md: '75px' },
                        height: { xs: '45px', sm: '60px', md: '75px' },
                        background: 'linear-gradient(45deg, #8E44AD 0%, #9B59B6 100%)',
                        opacity: 0.08,
                        borderRadius: '3px',
                        position: 'relative',
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '20%',
                            height: '20%',
                            border: '2px solid #ffffff',
                            borderRadius: '50%'
                        }
                    }} />

                    {/* Additional Small Elements */}
                    <Box sx={{
                        position: 'absolute',
                        top: { xs: '40%', sm: '45%' },
                        right: { xs: '40%', sm: '45%' },
                        width: { xs: '30px', sm: '40px', md: '50px' },
                        height: { xs: '30px', sm: '40px', md: '50px' },
                        background: 'linear-gradient(45deg, #E67E22 0%, #F39C12 100%)',
                        opacity: 0.08,
                        transform: 'rotate(45deg)'
                    }} />
                    <Box sx={{
                        position: 'absolute',
                        bottom: { xs: '50%', sm: '55%' },
                        left: { xs: '50%', sm: '55%' },
                        width: { xs: '25px', sm: '35px', md: '45px' },
                        height: { xs: '25px', sm: '35px', md: '45px' },
                        background: 'linear-gradient(45deg, #1ABC9C 0%, #16A085 100%)',
                        opacity: 0.07,
                        borderRadius: '50%'
                    }} />

                    {/* Subtle Grid Pattern */}
                    <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: 'radial-gradient(circle at 1px 1px, #000000 0.5px, transparent 0)',
                        backgroundSize: '25px 25px',
                        opacity: 0.015
                    }} />
                </Box>

                <Container maxWidth="xs" sx={{ 
                    position: 'relative', 
                    zIndex: 1,
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 1,
                    px: { xs: 1, sm: 1.5 }
                }}>
                    <Slide direction="up" in={true} timeout={600}>
                        <Paper sx={{ 
                            p: { xs: 1.5, sm: 2.5 }, 
                            width: '100%',
                            maxWidth: '320px',
                            backgroundColor: '#ffffff',
                            position: 'relative'
                        }}>
                            {/* Header */}
                            <Box sx={{ mb: { xs: 1.5, sm: 2 }, textAlign: 'center' }}>
                                <Typography variant="h2" sx={{ 
                                    mb: 0.3,
                                    fontSize: { xs: '1.5rem', sm: '1.8rem' },
                                    fontWeight: 900,
                                    textTransform: 'uppercase',
                                    letterSpacing: '-0.02em'
                                }}>
                                    {showSignup ? 'REGISTER' : 'LOGIN'}
                                </Typography>
                                <Typography variant="body2" sx={{ 
                                    fontWeight: 600,
                                    color: '#666666',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.15em',
                                    fontSize: { xs: '0.65rem', sm: '0.75rem' }
                                }}>
                                    {showSignup ? 'JOIN THE SYSTEM' : 'ACCESS GRANTED'}
                                </Typography>
                            </Box>

                            {/* Error Alert */}
                            {error && (
                                <Fade in={true}>
                                    <Alert 
                                        severity="error" 
                                        sx={{ 
                                            mb: 1.5,
                                            borderRadius: 0,
                                            border: '2px solid #000000',
                                            boxShadow: '2px 2px 0px #000000',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            fontSize: { xs: '0.65rem', sm: '0.75rem' },
                                            py: { xs: 0.3, sm: 0.5 },
                                            '& .MuiAlert-icon': {
                                                color: '#000000',
                                                fontSize: { xs: '0.9rem', sm: '1rem' }
                                            },
                                            '& .MuiAlert-message': {
                                                padding: 0
                                            }
                                        }}
                                    >
                                        {error}
                                    </Alert>
                                </Fade>
                            )}

                            {/* Form */}
                            <Box component="form" onSubmit={showSignup ? handleSignup : handleLogin}>
                                {/* Google OAuth Button - Official Style */}
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    size="large"
                                    onClick={handleGoogleLogin}
                                    startIcon={
                                        <Box sx={{ 
                                            width: '18px', 
                                            height: '18px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <svg width="18" height="18" viewBox="0 0 24 24">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                            </svg>
                                        </Box>
                                    }
                                    sx={{ 
                                        mb: 1.5,
                                        py: { xs: 1.2, sm: 1.4 },
                                        px: 3,
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #dadce0',
                                        borderRadius: '8px',
                                        color: '#3c4043',
                                        fontSize: '14px',
                                        fontWeight: 500,
                                        fontFamily: 'Roboto, arial, sans-serif',
                                        textTransform: 'none',
                                        letterSpacing: '0.25px',
                                        boxShadow: '0 1px 2px 0 rgba(60,64,67,.30), 0 1px 3px 1px rgba(60,64,67,.15)',
                                        '&:hover': {
                                            backgroundColor: '#f8f9fa',
                                            border: '1px solid #dadce0',
                                            boxShadow: '0 1px 3px 0 rgba(60,64,67,.30), 0 4px 8px 3px rgba(60,64,67,.15)',
                                            transform: 'none'
                                        },
                                        '&:active': {
                                            backgroundColor: '#f1f3f4',
                                            transform: 'none',
                                            boxShadow: '0 1px 2px 0 rgba(60,64,67,.30), 0 1px 3px 1px rgba(60,64,67,.15)'
                                        },
                                        '&:focus': {
                                            backgroundColor: '#f8f9fa',
                                            border: '1px solid #4285f4',
                                            outline: 'none',
                                            boxShadow: '0 1px 2px 0 rgba(60,64,67,.30), 0 1px 3px 1px rgba(60,64,67,.15)'
                                        }
                                    }}
                                >
                                    Continue with Google
                                </Button>

                                {/* Divider */}
                                <Divider sx={{ 
                                    my: { xs: 1, sm: 1.5 }, 
                                    '&::before, &::after': {
                                        borderColor: '#000000',
                                        borderWidth: '1px'
                                    }
                                }}>
                                    <Typography sx={{ 
                                        fontWeight: 700,
                                        px: 1,
                                        color: '#000000',
                                        fontSize: { xs: '0.65rem', sm: '0.75rem' },
                                        letterSpacing: '0.15em'
                                    }}>
                                        OR
                                    </Typography>
                                </Divider>

                                {/* Email Login Form - Now Second */}
                                                                {showSignup && (
                                    <TextField
                                        fullWidth
                                        name="username"
                                        label="USERNAME"
                                        placeholder="ENTER USERNAME"
                                required
                                        sx={{ 
                                            mb: 1.8,
                                            '& .MuiOutlinedInput-root': {
                                                height: '48px',
                                                position: 'relative'
                                            }
                                        }}
                                                                InputProps={{
                            startAdornment: <PersonIcon sx={{ mr: 0.8, color: '#F39C12', fontSize: '1rem' }} />
                        }}
                                    />
                                )}

                                                                <TextField
                                    fullWidth
                                    name="email"
                                type="email" 
                                    label="EMAIL"
                                    placeholder="ENTER EMAIL"
                                required
                                    sx={{ 
                                        mb: 1.8,
                                        '& .MuiOutlinedInput-root': {
                                            height: '48px',
                                            position: 'relative'
                                        }
                                    }}
                                    InputProps={{
                                        startAdornment: <EmailIcon sx={{ mr: 0.8, color: '#2ECC71', fontSize: '1rem' }} />
                                    }}
                                />

                                                                <TextField
                                    fullWidth
                                    name="password"
                                type="password" 
                                    label="PASSWORD"
                                    placeholder="ENTER PASSWORD"
                                required
                                    sx={{ 
                                        mb: 1.8,
                                        '& .MuiOutlinedInput-root': {
                                            height: '48px',
                                            position: 'relative'
                                        }
                                    }}
                                    InputProps={{
                                        startAdornment: <LockIcon sx={{ mr: 0.8, color: '#E74C3C', fontSize: '1rem' }} />
                                    }}
                                />

                                                                {showSignup && (
                                    <TextField
                                        fullWidth
                                        name="confirmPassword"
                                type="password" 
                                        label="CONFIRM PASSWORD"
                                        placeholder="CONFIRM PASSWORD"
                                required
                                        sx={{ 
                                            mb: 1.8,
                                            '& .MuiOutlinedInput-root': {
                                                height: '48px',
                                                position: 'relative'
                                            }
                                        }}
                                        InputProps={{
                                            startAdornment: <SecurityIcon sx={{ mr: 0.8, color: '#9B59B6', fontSize: '1rem' }} />
                                        }}
                                    />
                                )}

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    size="small"
                                    disabled={loading}
                                    sx={{ 
                                        mb: 1.5,
                                        py: { xs: 1, sm: 1.2 },
                                        fontSize: { xs: '0.85rem', sm: '0.9rem' }
                                    }}
                                >
                                    {loading ? 'PROCESSING...' : (showSignup ? 'SEND VERIFICATION' : 'LOGIN NOW')}
                                </Button>

                                {/* Toggle Login/Signup */}
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="body2" sx={{ 
                                        fontWeight: 600, 
                                        mb: 0.3,
                                        fontSize: { xs: '0.7rem', sm: '0.8rem' }
                                    }}>
                                        {showSignup ? 'ALREADY HAVE ACCOUNT?' : 'NO ACCOUNT YET?'}
                                    </Typography>
                                    <Button
                                        variant="text"
                                        onClick={toggleSignup}
                                        sx={{ 
                                            color: '#000000',
                                            fontWeight: 700,
                                            textDecoration: 'underline',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.1em',
                                            fontSize: { xs: '0.7rem', sm: '0.8rem' },
                                            minHeight: 'auto',
                                            py: 0.3,
                                            '&:hover': {
                                                backgroundColor: 'transparent',
                                                textDecoration: 'underline',
                                            }
                                        }}
                                    >
                                        {showSignup ? 'LOGIN HERE' : 'REGISTER HERE'}
                                    </Button>
                                </Box>
                            </Box>
                        </Paper>
                    </Slide>
                </Container>
            </Box>
        </ThemeProvider>
    );
};

export default Login;