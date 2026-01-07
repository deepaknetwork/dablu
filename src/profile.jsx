import React, { useContext, useEffect, useState } from "react";
import userIdContext from "./data";
import './App.css';
import axios from "axios";
import url, { api } from "./api";
import { useLoading } from './loadingContext.jsx';
import { useModal } from './ModalContext.jsx';

// Material UI imports
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Modal,
  Fade,
  Slide
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Close as CloseIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Minimalist theme (same as room.jsx)
const minimalistTheme = createTheme({
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
          borderRadius: 4,
          border: '1px solid #000000',
          transition: 'all 0.1s ease',
          fontWeight: 600,
        },
        contained: {
          backgroundColor: '#FF6B35',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#E55A2B',
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
            borderRadius: 4,
            backgroundColor: '#ffffff',
            border: '1px solid #000000',
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
          borderRadius: 6,
          border: '1px solid #000000',
        },
      },
    },
  },
});

export default function Profile() {
    const { getUserID, setUserID } = useContext(userIdContext);
    const { showLoading, hideLoading } = useLoading();
    const { showAlert } = useModal();
    var [profile, setProfile] = useState(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [externalWallet, setExternalWallet] = useState({
        endpoint: '',
        apiKey: ''
    });
    const [externalWalletSaved, setExternalWalletSaved] = useState(false);
    const [isSyncEnabled, setIsSyncEnabled] = useState(true);
    
    // Username editing state
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    
    useEffect(() => {
        const userId = getUserID();
        if (!userId) {
            console.log('No user ID found');
            return;
        }
        
        showLoading();
        api.get(`/user/${userId}`)
            .then(x => {
                setProfile(x.data);
                // Load external wallet settings if they exist
                if (x.data.externalWallet) {
                    setExternalWallet({
                        endpoint: x.data.externalWallet.endpoint || '',
                        apiKey: x.data.externalWallet.apiKey || ''
                    });
                    // Load sync status
                    setIsSyncEnabled(x.data.externalWallet.syncEnabled !== false); // Default to true if not specified
                }
            })
            .catch(err => {
                console.log(err);
                showAlert('Failed to load profile data', 'error');
            })
            .finally(() => {
                hideLoading();
            });
    }, []);

    const handleOpenPasswordModal = () => {
        setShowPasswordModal(true);
    };

    const handleClosePasswordModal = () => {
        setShowPasswordModal(false);
        setPasswordForm({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
    };

    const handlePasswordFormChange = (field, value) => {
        setPasswordForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        
        if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            showAlert("All fields are required", 'warning');
            return;
        }
        
        if (passwordForm.newPassword.length < 6) {
            showAlert("New password must be at least 6 characters long", 'warning');
            return;
        }
        
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            showAlert("New passwords do not match", 'warning');
            return;
        }
        
        showLoading();
        try {
            const response = await axios.post(`${url}/auth/change-password`, {
                userId: profile.userId,
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });
            
            showAlert(response.data.message, 'success');
            handleClosePasswordModal();
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Failed to change password';
            showAlert('Error: ' + errorMessage, 'error');
        } finally {
            hideLoading();
        }
    };

    const handleExternalWalletChange = (field, value) => {
        setExternalWallet(prev => ({
            ...prev,
            [field]: value
        }));
        setExternalWalletSaved(false);
    };

    const handleSaveExternalWallet = async () => {
        showLoading();
        try {
            const response = await axios.post(`${url}/user/external-wallet`, {
                userId: profile.userId,
                endpoint: externalWallet.endpoint,
                apiKey: externalWallet.apiKey
            });
            
            setExternalWalletSaved(true);
            setIsSyncEnabled(true);
            showAlert('External wallet settings saved successfully!', 'success');
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Failed to save external wallet settings';
            showAlert('Error: ' + errorMessage, 'error');
        } finally {
            hideLoading();
        }
    };

    const handleToggleSync = async () => {
        showLoading();
        try {
            const newSyncStatus = !isSyncEnabled;
            await axios.post(`${url}/user/toggle-sync`, {
                userId: profile.userId,
                syncEnabled: newSyncStatus
            });
            
            setIsSyncEnabled(newSyncStatus);
            showAlert(`Auto-sync ${newSyncStatus ? 'resumed' : 'stopped'} successfully!`, 'success');
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Failed to toggle sync status';
            showAlert('Error: ' + errorMessage, 'error');
        } finally {
            hideLoading();
        }
    };

    // Start editing username
    const startEditingUsername = () => {
        setNewUsername(profile?.username || '');
        setIsEditingUsername(true);
    };

    // Cancel editing username
    const cancelEditingUsername = () => {
        setNewUsername('');
        setIsEditingUsername(false);
    };

    // Save username changes
    const saveUsername = async () => {
        if (!newUsername.trim()) {
            showAlert("Username cannot be empty", 'warning');
            return;
        }

        if (newUsername.trim().length < 2) {
            showAlert("Username must be at least 2 characters long", 'warning');
            return;
        }

        if (newUsername.trim().length > 50) {
            showAlert("Username must be less than 50 characters", 'warning');
            return;
        }

        if (newUsername.trim() === profile?.username) {
            cancelEditingUsername();
            return;
        }

        try {
            showLoading();
            const response = await api.put(`/user/${getUserID()}/profile`, {
                username: newUsername.trim()
            });

            // Update the profile state with new username
            setProfile(prev => ({
                ...prev,
                username: response.data.username
            }));

            showAlert("Username updated successfully!", 'success');
            setIsEditingUsername(false);
            setNewUsername('');
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Failed to update username';
            showAlert('Error: ' + errorMessage, 'error');
        } finally {
            hideLoading();
        }
    };

    const handleLogout = async () => {
        showLoading();
        try {
            // Call logout endpoint to clear session
            await axios.post(`${url}/auth/logout`);
        } catch (error) {
            console.log('Logout error:', error);
        } finally {
            setUserID(null);
            localStorage.removeItem("Dablu.userId");
            // Small delay to show loading before reload
            setTimeout(() => {
                window.location.reload();
            }, 500);
        }
    };

    return (
        <ThemeProvider theme={minimalistTheme}>
            <Box sx={{ 
                minHeight: '100vh', 
                backgroundColor: '#ffffff',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Same Money-Related Background Elements as Login */}
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
                    {/* Currency Symbols */}
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

                    {/* Other background elements */}
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
                    }} />
                    
                    <Box sx={{
                        position: 'absolute',
                        top: { xs: '3%', sm: '5%' },
                        left: { xs: '25%', sm: '30%' },
                        width: { xs: '50px', sm: '65px', md: '80px' },
                        height: { xs: '50px', sm: '65px', md: '80px' },
                        background: 'linear-gradient(45deg, #34495E 0%, #2C3E50 100%)',
                        opacity: 0.1,
                        borderRadius: '4px',
                    }} />
                </Box>

                <Container maxWidth="sm" sx={{ 
                    position: 'relative', 
                    zIndex: 1,
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 1
                }}>
                    <Slide direction="up" in={true} timeout={600}>
                        <Paper sx={{ 
                            p: { xs: 1.5, sm: 2 }, 
                            width: '100%',
                            maxWidth: '500px',
                            backgroundColor: '#ffffff',
                            position: 'relative'
                        }}>
                            {/* Header */}
                            <Box sx={{ mb: 1.5, textAlign: 'center' }}>
                                <SettingsIcon sx={{ fontSize: '2rem', color: '#FF6B35', mb: 0.5 }} />
                                <Typography variant="h2" sx={{ 
                                    mb: 0.25,
                                    fontSize: { xs: '1.1rem', sm: '1.3rem' },
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '-0.02em'
                                }}>
                                    PROFILE SETTINGS
                                </Typography>
                            </Box>

                            {/* Avatar Section */}
            {profile && (
                                <Box sx={{ textAlign: 'center', mb: 1.5 }}>
                                    {profile.avatar ? (
                                        <Box sx={{
                                            width: '60px',
                                            height: '60px',
                                            borderRadius: '50%',
                                            border: '2px solid #000000',
                                            overflow: 'hidden',
                                            margin: '0 auto',
                                            mb: 1
                                        }}>
                            <img 
                                src={profile.avatar} 
                                alt="Profile Avatar" 
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                        </Box>
                                    ) : (
                                        <Box sx={{
                                            width: '60px',
                                            height: '60px',
                                            borderRadius: '50%',
                                            border: '2px solid #000000',
                                            backgroundColor: '#f0f0f0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 auto',
                                            mb: 1
                                        }}>
                                            <PersonIcon sx={{ fontSize: '2rem', color: '#666' }} />
                                        </Box>
                                    )}
                                </Box>
                            )}

                            {/* Profile Form */}
                            {profile && (
                                <Box sx={{ mb: 1.5 }}>
                                    <TextField
                                        fullWidth
                                        label="USER ID"
                            value={profile.userId} 
                            disabled 
                                        size="small"
                                        sx={{ mb: 1 }}
                                        InputProps={{
                                            startAdornment: <PersonIcon sx={{ mr: 0.5, color: '#F39C12', fontSize: '0.9rem' }} />
                                        }}
                                    />
                                    
                                    {/* Username field with edit functionality */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <TextField
                                            fullWidth
                                            label="USERNAME"
                                            value={isEditingUsername ? newUsername : profile.username} 
                                            disabled={!isEditingUsername}
                                            size="small"
                                            onChange={(e) => setNewUsername(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter' && isEditingUsername) {
                                                    saveUsername();
                                                }
                                                if (e.key === 'Escape' && isEditingUsername) {
                                                    cancelEditingUsername();
                                                }
                                            }}
                                            InputProps={{
                                                startAdornment: <PersonIcon sx={{ mr: 0.5, color: '#9B59B6', fontSize: '0.9rem' }} />
                                            }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    backgroundColor: isEditingUsername ? '#fff' : 'transparent'
                                                }
                                            }}
                                        />
                                        
                                        {!isEditingUsername ? (
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={startEditingUsername}
                                                sx={{
                                                    minWidth: 'auto',
                                                    p: 0.5,
                                                    border: '1px solid #9B59B6',
                                                    color: '#9B59B6',
                                                    '&:hover': {
                                                        backgroundColor: '#9B59B6',
                                                        color: 'white'
                                                    }
                                                }}
                                            >
                                                <EditIcon sx={{ fontSize: '0.9rem' }} />
                                            </Button>
                                        ) : (
                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    onClick={saveUsername}
                                                    sx={{
                                                        minWidth: 'auto',
                                                        p: 0.5,
                                                        backgroundColor: '#2ECC71',
                                                        '&:hover': {
                                                            backgroundColor: '#27AE60'
                                                        }
                                                    }}
                                                >
                                                    <SaveIcon sx={{ fontSize: '0.9rem' }} />
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    onClick={cancelEditingUsername}
                                                    sx={{
                                                        minWidth: 'auto',
                                                        p: 0.5,
                                                        border: '1px solid #E74C3C',
                                                        color: '#E74C3C',
                                                        '&:hover': {
                                                            backgroundColor: '#E74C3C',
                                                            color: 'white'
                                                        }
                                                    }}
                                                >
                                                    <CancelIcon sx={{ fontSize: '0.9rem' }} />
                                                </Button>
                                            </Box>
                                        )}
                                    </Box>
                                    
                                    <TextField
                                        fullWidth
                                        label="EMAIL"
                            value={profile.email} 
                            disabled 
                                        size="small"
                                        sx={{ mb: 1 }}
                                        InputProps={{
                                            startAdornment: <EmailIcon sx={{ mr: 0.5, color: '#2ECC71', fontSize: '0.9rem' }} />
                                        }}
                                    />
                                </Box>
                            )}

                            {/* External Wallet Section */}
                            {profile && (
                                <Box sx={{ mb: 1.5, p: 1.25, backgroundColor: '#f8f9fa' }}>
                                    <Typography variant="h6" sx={{ 
                                        mb: 1, 
                                        fontWeight: 600,
                                        textTransform: 'uppercase',
                                        fontSize: '0.8rem',
                                        color: '#FF6B35'
                                    }}>
                                        🔗 EXTERNAL WALLET LINKING
                                    </Typography>
                                    
                                    <Typography variant="body2" sx={{ 
                                        mb: 1, 
                                        fontSize: '0.65rem',
                                        color: '#666',
                                        fontWeight: 500
                                    }}>
                                        Connect your external wallet API to automatically sync expense data after settlement
                                    </Typography>

                                    <TextField
                                        fullWidth
                                        label="WALLET API ENDPOINT"
                                        placeholder="https://your-wallet-api.com/expenses"
                                        value={externalWallet.endpoint}
                                        onChange={(e) => handleExternalWalletChange('endpoint', e.target.value)}
                                        sx={{ 
                                            mb: 1,
                                            '& .MuiFormHelperText-root': {
                                                fontSize: '0.6rem',
                                                color: '#666666',
                                                fontWeight: 500,
                                                mt: 0.25
                                            }
                                        }}
                                        size="small"
                                        helperText="Enter your external wallet API endpoint URL"
                                    />
                                    
                                    <TextField
                                        fullWidth
                                        label="AUTHENTICATION KEY"
                                        placeholder="Enter your wallet API authentication key"
                                        type="password"
                                        value={externalWallet.apiKey}
                                        onChange={(e) => handleExternalWalletChange('apiKey', e.target.value)}
                                        sx={{ 
                                            mb: 1,
                                            '& .MuiFormHelperText-root': {
                                                fontSize: '0.6rem',
                                                color: '#666666',
                                                fontWeight: 500,
                                                mt: 0.25
                                            }
                                        }}
                                        size="small"
                                        helperText="Your secure API key for authentication"
                                    />

                                    <Button
                                        variant="contained"
                                        onClick={handleSaveExternalWallet}
                                        disabled={!externalWallet.endpoint || !externalWallet.apiKey}
                                        size="small"
                                        sx={{
                                            backgroundColor: externalWalletSaved ? '#2ECC71' : '#3498DB',
                                            '&:hover': {
                                                backgroundColor: externalWalletSaved ? '#27AE60' : '#2980B9',
                                            },
                                            fontSize: '0.65rem',
                                            fontWeight: 600,
                                            py: 0.5
                                        }}
                                    >
                                        {externalWalletSaved ? '✅ SAVED' : '💾 SAVE SETTINGS'}
                                    </Button>

                                    {externalWallet.endpoint && externalWallet.apiKey && (
                                        <Box sx={{ 
                                            mt: 1, 
                                            p: 0.75, 
                                            backgroundColor: isSyncEnabled ? '#e8f5e8' : '#fff5f5', 
                                            border: `1px solid ${isSyncEnabled ? '#2ECC71' : '#E74C3C'}`, 
                                            borderRadius: 3 
                                        }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Typography variant="caption" sx={{ 
                                                        fontSize: '0.55rem',
                                                        color: isSyncEnabled ? '#2ECC71' : '#E74C3C',
                                                        fontWeight: 600,
                                                        display: 'block',
                                                        mb: 0.25,
                                                        lineHeight: 1.2
                                                    }}>
                                                        {isSyncEnabled ? '🔄 AUTO-SYNC ENABLED' : '⏸️ AUTO-SYNC PAUSED'}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ 
                                                        fontSize: '0.5rem',
                                                        color: isSyncEnabled ? '#27AE60' : '#C0392B',
                                                        fontWeight: 500,
                                                        lineHeight: 1.2,
                                                        wordBreak: 'break-all',
                                                        display: 'block'
                                                    }}>
                                                        {isSyncEnabled ? `Connected to ${externalWallet.endpoint}` : 'Sync temporarily paused'}
                                                    </Typography>
                                                </Box>
                                                <Button
                                                    variant="outlined"
                                                    onClick={handleToggleSync}
                                                    size="small"
                                                    sx={{
                                                        fontSize: '0.5rem',
                                                        fontWeight: 600,
                                                        px: 0.75,
                                                        py: 0.25,
                                                        minHeight: '22px',
                                                        minWidth: '45px',
                                                        flexShrink: 0,
                                                        borderColor: isSyncEnabled ? '#2ECC71' : '#3498DB',
                                                        color: isSyncEnabled ? '#2ECC71' : '#3498DB',
                                                        backgroundColor: '#ffffff',
                                                        '&:hover': {
                                                            backgroundColor: isSyncEnabled ? '#f0f8f0' : '#f0f9ff',
                                                            borderColor: isSyncEnabled ? '#27AE60' : '#2980B9'
                                                        }
                                                    }}
                                                >
                                                    {isSyncEnabled ? 'STOP' : 'RESUME'}
                                                </Button>
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                            )}

                            {/* Action Buttons */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {profile && profile.hasPassword ? (
                                    <Button 
                                        variant="contained"
                                        onClick={handleOpenPasswordModal}
                                        startIcon={<LockIcon sx={{ fontSize: '0.9rem' }} />}
                                        size="small"
                                        fullWidth
                                        sx={{ fontSize: '0.7rem', py: 0.75 }}
                                    >
                                        CHANGE PASSWORD
                                    </Button>
                                ) : (
                                    <Button 
                                        variant="contained"
                                        disabled
                                        startIcon={<LockIcon sx={{ fontSize: '0.9rem' }} />}
                                        size="small"
                                        fullWidth
                                        sx={{ fontSize: '0.7rem', py: 0.75 }}
                                    >
                                        CHANGE PASSWORD
                                    </Button>
                                )}
                                
                                <Button 
                                    variant="outlined"
                                    disabled
                                    startIcon={<EmailIcon sx={{ fontSize: '0.9rem' }} />}
                                    size="small"
                                    fullWidth
                                    sx={{ fontSize: '0.7rem', py: 0.75 }}
                                >
                                    UPDATE EMAIL
                                </Button>
                                
                                <Button 
                                    variant="outlined"
                                    onClick={handleLogout}
                                    startIcon={<LogoutIcon sx={{ fontSize: '0.9rem' }} />}
                                    size="small"
                                    fullWidth
                                    sx={{
                                        backgroundColor: '#E74C3C',
                                        color: '#ffffff',
                                        borderColor: '#000000',
                                        fontSize: '0.7rem',
                                        py: 0.75,
                                        '&:hover': {
                                            backgroundColor: '#C0392B',
                                            borderColor: '#000000',
                                        },
                                    }}
                                >
                                    LOGOUT
                                </Button>
                            </Box>
                        </Paper>
                    </Slide>
                </Container>

                {/* Material UI Password Change Modal */}
                <Modal
                    open={showPasswordModal}
                    onClose={handleClosePasswordModal}
                    closeAfterTransition
                >
                    <Fade in={showPasswordModal}>
                        <Box sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: { xs: '90%', sm: '450px' },
                            bgcolor: 'background.paper',
                            border: '1px solid #000000',
                            borderRadius: 6,
                            p: 0,
                            outline: 'none'
                        }}>
                            {/* Modal Header */}
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                p: 1.5,
                                borderBottom: '1px solid #000000',
                                background: 'linear-gradient(90deg, #FF6B35 0%, #E55A2B 100%)',
                                borderTopLeftRadius: 6,
                                borderTopRightRadius: 6
                            }}>
                                <Typography variant="h2" sx={{
                                    fontSize: '1rem',
                                    fontWeight: 700,
                                    color: '#ffffff'
                                }}>
                                    CHANGE PASSWORD
                                </Typography>
                                <Button
                                    onClick={handleClosePasswordModal}
                                    sx={{
                                        minWidth: 'auto',
                                        p: 0.5,
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        boxShadow: 'none',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255,255,255,0.1)',
                                            boxShadow: 'none'
                                        }
                                    }}
                                >
                                    <CloseIcon sx={{ color: '#ffffff', fontSize: '1.2rem' }} />
                                </Button>
                            </Box>

                            {/* Modal Content */}
                            <Box component="form" onSubmit={handleChangePassword} sx={{ p: 2 }}>
                                <TextField
                                    fullWidth
                                    type="password"
                                    label="CURRENT PASSWORD"
                                    value={passwordForm.currentPassword}
                                    onChange={(e) => handlePasswordFormChange('currentPassword', e.target.value)}
                                    required
                                    size="small"
                                    sx={{ mb: 1 }}
                                    InputProps={{
                                        startAdornment: <LockIcon sx={{ mr: 0.5, color: '#E74C3C', fontSize: '0.9rem' }} />
                                    }}
                                />
                                
                                <TextField
                                    fullWidth
                                    type="password"
                                    label="NEW PASSWORD"
                                    value={passwordForm.newPassword}
                                    onChange={(e) => handlePasswordFormChange('newPassword', e.target.value)}
                                    required
                                    inputProps={{ minLength: 6 }}
                                    size="small"
                                    sx={{ mb: 1 }}
                                    InputProps={{
                                        startAdornment: <LockIcon sx={{ mr: 0.5, color: '#2ECC71', fontSize: '0.9rem' }} />
                                    }}
                                />
                                
                                <TextField
                                    fullWidth
                                    type="password"
                                    label="CONFIRM NEW PASSWORD"
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => handlePasswordFormChange('confirmPassword', e.target.value)}
                                    required
                                    inputProps={{ minLength: 6 }}
                                    size="small"
                                    sx={{ mb: 2 }}
                                    InputProps={{
                                        startAdornment: <LockIcon sx={{ mr: 0.5, color: '#3498DB', fontSize: '0.9rem' }} />
                                    }}
                                />

                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                    <Button
                                        type="button"
                                        variant="outlined"
                                        onClick={handleClosePasswordModal}
                                        size="small"
                                        sx={{
                                            backgroundColor: '#ffffff',
                                            color: '#000000',
                                            borderColor: '#000000',
                                            fontSize: '0.7rem',
                                            py: 0.5
                                        }}
                                    >
                                        CANCEL
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="small"
                                        sx={{
                                            fontSize: '0.7rem',
                                            py: 0.5
                                        }}
                                    >
                                        SAVE PASSWORD
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    </Fade>
                </Modal>
            </Box>
        </ThemeProvider>
    );
}