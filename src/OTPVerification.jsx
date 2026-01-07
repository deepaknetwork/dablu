import React, { useState, useEffect } from 'react';
import axios from 'axios';
import url from './api';
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Alert,
    Fade,
    LinearProgress
} from '@mui/material';
import {
    Security as SecurityIcon,
    ArrowBack as ArrowBackIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';

const OTPVerification = ({ email, username, password, onSuccess, onBack }) => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [timer, setTimer] = useState(600); // 10 minutes
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post(`${url}/auth/verify-otp`, {
                email,
                otp,
                username,
                password
            });

            onSuccess(response.data.userId);
        } catch (error) {
            setError(error.response?.data?.error?.toUpperCase() || 'OTP VERIFICATION FAILED');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setLoading(true);
        setError('');

        try {
            await axios.post(`${url}/auth/send-otp`, {
                email,
                username
            });

            setTimer(600);
            setCanResend(false);
        } catch (error) {
            setError(error.response?.data?.error?.toUpperCase() || 'FAILED TO RESEND OTP');
        } finally {
            setLoading(false);
        }
    };

    const progress = ((600 - timer) / 600) * 100;

    return (
        <Paper sx={{ 
            p: 4, 
            width: '100%',
            maxWidth: '400px',
            backgroundColor: '#ffffff',
            position: 'relative',
            borderRadius: 0,
            boxShadow: '8px 8px 0px #000000',
            border: '3px solid #000000',
        }}>
            {/* Header */}
            <Box sx={{ mb: 4, textAlign: 'center' }}>
                <SecurityIcon sx={{ fontSize: '3rem', color: '#000000', mb: 2 }} />
                <Typography variant="h4" sx={{ 
                    fontFamily: '"JetBrains Mono", "Courier New", monospace',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '-0.02em',
                    mb: 1
                }}>
                    VERIFY EMAIL
                </Typography>
                <Typography variant="body1" sx={{ 
                    fontWeight: 600,
                    color: '#666666',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontSize: '0.9rem'
                }}>
                    CODE SENT TO
                </Typography>
                <Typography variant="h6" sx={{ 
                    fontFamily: '"JetBrains Mono", "Courier New", monospace',
                    fontWeight: 700,
                    color: '#000000',
                    wordBreak: 'break-all'
                }}>
                    {email}
                </Typography>
            </Box>

            {/* Timer Progress */}
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ 
                        fontWeight: 700,
                        color: timer > 60 ? '#000000' : '#ff0000',
                        textTransform: 'uppercase',
                        fontFamily: '"JetBrains Mono", "Courier New", monospace'
                    }}>
                        {timer > 0 ? `EXPIRES IN: ${formatTime(timer)}` : 'CODE EXPIRED'}
                    </Typography>
                </Box>
                <LinearProgress 
                    variant="determinate" 
                    value={progress}
                    sx={{
                        height: 8,
                        borderRadius: 0,
                        backgroundColor: '#f0f0f0',
                        border: '2px solid #000000',
                        '& .MuiLinearProgress-bar': {
                            backgroundColor: timer > 60 ? '#000000' : '#ff0000',
                        }
                    }}
                />
            </Box>

            {/* Error Alert */}
            {error && (
                <Fade in={true}>
                    <Alert 
                        severity="error" 
                        sx={{ 
                            mb: 3,
                            borderRadius: 0,
                            border: '2px solid #000000',
                            boxShadow: '3px 3px 0px #000000',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            fontFamily: '"JetBrains Mono", "Courier New", monospace',
                            '& .MuiAlert-icon': {
                                color: '#000000'
                            }
                        }}
                    >
                        {error}
                    </Alert>
                </Fade>
            )}

            {/* OTP Form */}
            <Box component="form" onSubmit={handleVerifyOTP}>
                <TextField
                    fullWidth
                    label="VERIFICATION CODE"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    inputProps={{ 
                        maxLength: 6,
                        style: { 
                            textAlign: 'center',
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            letterSpacing: '0.3em',
                            fontFamily: '"JetBrains Mono", "Courier New", monospace'
                        }
                    }}
                    sx={{ 
                        mb: 3,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 0,
                            backgroundColor: '#ffffff',
                            border: '2px solid #000000',
                            boxShadow: '3px 3px 0px #000000',
                            '&:hover': {
                                transform: 'translate(-1px, -1px)',
                                boxShadow: '4px 4px 0px #000000',
                            },
                            '&.Mui-focused': {
                                transform: 'translate(-2px, -2px)',
                                boxShadow: '5px 5px 0px #000000',
                            },
                        },
                        '& .MuiInputLabel-root': {
                            fontFamily: '"JetBrains Mono", "Courier New", monospace',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em'
                        }
                    }}
                    required
                />

                {/* Verify Button */}
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading || otp.length !== 6}
                    sx={{ 
                        mb: 2,
                        py: 2,
                        fontSize: '1.1rem',
                        fontFamily: '"JetBrains Mono", "Courier New", monospace',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        backgroundColor: '#000000',
                        color: '#ffffff',
                        borderRadius: 0,
                        boxShadow: '4px 4px 0px #000000',
                        border: '2px solid #000000',
                        '&:hover': {
                            backgroundColor: '#000000',
                            transform: 'translate(-2px, -2px)',
                            boxShadow: '6px 6px 0px #000000',
                        },
                        '&:active': {
                            transform: 'translate(2px, 2px)',
                            boxShadow: '2px 2px 0px #000000',
                        },
                        '&:disabled': {
                            backgroundColor: '#cccccc',
                            color: '#666666',
                            transform: 'none',
                            boxShadow: '4px 4px 0px #000000',
                        }
                    }}
                >
                    {loading ? 'VERIFYING...' : 'VERIFY CODE'}
                </Button>

                {/* Resend Button */}
                <Button
                    fullWidth
                    variant="outlined"
                    size="large"
                    onClick={handleResendOTP}
                    disabled={loading || !canResend}
                    startIcon={<RefreshIcon />}
                    sx={{ 
                        mb: 2,
                        py: 1.5,
                        fontFamily: '"JetBrains Mono", "Courier New", monospace',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        backgroundColor: '#ffffff',
                        color: '#000000',
                        borderColor: '#000000',
                        borderWidth: '2px',
                        borderRadius: 0,
                        boxShadow: '3px 3px 0px #000000',
                        '&:hover': {
                            backgroundColor: '#ffffff',
                            borderColor: '#000000',
                            borderWidth: '2px',
                            transform: 'translate(-1px, -1px)',
                            boxShadow: '4px 4px 0px #000000',
                        },
                        '&:disabled': {
                            backgroundColor: '#f5f5f5',
                            color: '#cccccc',
                            borderColor: '#cccccc',
                            transform: 'none',
                        }
                    }}
                >
                    {loading ? 'SENDING...' : 'RESEND CODE'}
                </Button>

                {/* Back Button */}
                <Button
                    fullWidth
                    variant="text"
                    onClick={onBack}
                    startIcon={<ArrowBackIcon />}
                    sx={{ 
                        color: '#000000',
                        fontFamily: '"JetBrains Mono", "Courier New", monospace',
                        fontWeight: 700,
                        textDecoration: 'underline',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        '&:hover': {
                            backgroundColor: 'transparent',
                            textDecoration: 'underline',
                        }
                    }}
                >
                    BACK TO SIGNUP
                </Button>
            </Box>
        </Paper>
    );
};

export default OTPVerification; 