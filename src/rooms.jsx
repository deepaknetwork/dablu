import axios from "axios";
import React, { useContext, useEffect, useRef, useState } from "react";
import url from "./api";
import userIdContext from "./data";
import { useNavigate } from "react-router-dom";
import './App.css';
import RoomCard from "./roomCard";
import { useLoading } from './loadingContext.jsx';

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
  Slide,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Login as LoginIcon,
  Room as RoomIcon,
  Create as CreateIcon
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Brutalist theme (same as login)
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

export default function Rooms() {
    const { getUserID, setUserID } = useContext(userIdContext);
    const { showLoading, hideLoading } = useLoading();
    var [rooms, setRooms] = useState([]);
    var [roomIdInput, setRoomIdInput] = useState('');
    var [roomNameInput, setRoomNameInput] = useState('');
    var [showJoinModal, setShowJoinModal] = useState(false);
    var [showCreateModal, setShowCreateModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const userId = getUserID();
        if (!userId) {
            console.log('No user ID found');
            return;
        }
        
        showLoading();
        axios.get(`${url}/rooms/${userId}`)
            .then(x => {
                console.log("data" + x)
                setRooms(x.data);
            })
            .catch(err => {
                console.log(err);
                alert('Failed to load rooms');
            })
            .finally(() => {
                hideLoading();
            });
    }, []);

    const handleJoinRoom = () => {
        if (!roomIdInput) {
                                            alert("Please enter a room ID");
                                            return;
                                        }
                                        
                                        showLoading();
        axios.post(`${url}/rooms/${roomIdInput}/join`, { userId: getUserID() })
                                            .then(x => {
                                                alert("Successfully joined room!")
                setShowJoinModal(false);
                setRoomIdInput('');
                                                window.location.reload();
                                            })
                                            .catch(x => {
                                                alert("Error joining room")
                                                console.log(x);
                                            })
                                            .finally(() => {
                                                hideLoading();
                                            });
    };

    const handleCreateRoom = () => {
        if (!roomNameInput.trim()) {
                                                alert("Please enter a room name");
                                                return;
                                            }
                                            
                                            showLoading();
        axios.post(`${url}/rooms`, { adminId: getUserID(), roomName: roomNameInput })
                                                .then(x => {
                                                    alert("Room created successfully!")
                setShowCreateModal(false);
                setRoomNameInput('');
                                                    window.location.reload();
                                                })
                                                .catch(x => {
                                                    alert("Error creating room")
                                                    console.log(x);
                                                })
                                                .finally(() => {
                                                    hideLoading();
                                                });
    };

    return (
        <ThemeProvider theme={brutalistTheme}>
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

                    {/* Additional background elements */}
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
                </Box>

                <Container maxWidth="lg" sx={{ 
                    position: 'relative', 
                    zIndex: 1,
                    minHeight: '100vh',
                    py: 4
                }}>
                    <Slide direction="down" in={true} timeout={600}>
                        <Paper sx={{ 
                            p: { xs: 3, sm: 4 }, 
                            mb: 4,
                            textAlign: 'center'
                        }}>
                            {/* Header */}
                            <Box sx={{ mb: 3 }}>
                                <RoomIcon sx={{ fontSize: '3rem', color: '#FF6B35', mb: 2 }} />
                                <Typography variant="h1" sx={{ 
                                    mb: 1,
                                    fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
                                    fontWeight: 900
                                }}>
                                    YOUR ROOMS
                                </Typography>
                                <Typography variant="h2" sx={{ 
                                    fontSize: { xs: '0.9rem', sm: '1rem' },
                                    fontWeight: 600,
                                    color: '#666666',
                                    textTransform: 'none',
                                    letterSpacing: 'normal'
                                }}>
                                    CREATE A NEW ROOM OR JOIN AN EXISTING ONE!
                                </Typography>
                            </Box>

                            {/* Action Buttons */}
                            <Box sx={{ 
                                display: 'flex', 
                                flexDirection: { xs: 'column', sm: 'row' },
                                gap: 2, 
                                justifyContent: 'center',
                                mb: 2
                            }}>
                                <Button 
                                    variant="contained"
                                    size="large"
                                    startIcon={<LoginIcon />}
                                    onClick={() => setShowJoinModal(true)}
                                    sx={{ minWidth: '150px' }}
                                >
                                    JOIN ROOM
                                </Button>
                                <Button 
                                    variant="outlined"
                                    size="large"
                                    startIcon={<CreateIcon />}
                                    onClick={() => setShowCreateModal(true)}
                                    sx={{ minWidth: '150px' }}
                                >
                                    CREATE ROOM
                                </Button>
                            </Box>
                        </Paper>
                    </Slide>

                    {/* Rooms Grid */}
                    <Grid container spacing={1}>
                        {rooms.map((room) => (
                            <Grid item xs={12} sm={6} md={4} key={room.roomId}>
                                <RoomCard x={room} />
                            </Grid>
                        ))}
                    </Grid>
                </Container>

                {/* Join Room Modal */}
                <Modal
                    open={showJoinModal}
                    onClose={() => setShowJoinModal(false)}
                    closeAfterTransition
                >
                    <Fade in={showJoinModal}>
                        <Box sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: { xs: '90%', sm: '400px' },
                            bgcolor: 'background.paper',
                            border: '3px solid #000000',
                            boxShadow: '8px 8px 0px #000000',
                            p: 0,
                            outline: 'none'
                        }}>
                            {/* Modal Header */}
                            <Box sx={{
                                p: 3,
                                borderBottom: '2px solid #000000',
                                background: 'linear-gradient(90deg, #FF6B35 0%, #E55A2B 100%)'
                            }}>
                                <Typography variant="h2" sx={{
                                    fontSize: '1.5rem',
                                    color: '#ffffff',
                                    textShadow: '2px 2px 0px #000000',
                                    textAlign: 'center'
                                }}>
                                    JOIN ROOM
                                </Typography>
                            </Box>

                            {/* Modal Content */}
                            <Box sx={{ p: 3 }}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="ROOM ID"
                                    value={roomIdInput}
                                    onChange={(e) => setRoomIdInput(e.target.value)}
                                    sx={{ mb: 3 }}
                                    InputProps={{
                                        startAdornment: <RoomIcon sx={{ mr: 0.8, color: '#2ECC71', fontSize: '1rem' }} />
                                    }}
                                />

                                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => {
                                            setShowJoinModal(false);
                                            setRoomIdInput('');
                                        }}
                                        sx={{
                                            backgroundColor: '#ffffff',
                                            color: '#000000',
                                            borderColor: '#000000'
                                        }}
                                    >
                                        CANCEL
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={handleJoinRoom}
                                    >
                                        JOIN
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    </Fade>
                </Modal>

                {/* Create Room Modal */}
                <Modal
                    open={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    closeAfterTransition
                >
                    <Fade in={showCreateModal}>
                        <Box sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: { xs: '90%', sm: '400px' },
                            bgcolor: 'background.paper',
                            border: '3px solid #000000',
                            boxShadow: '8px 8px 0px #000000',
                            p: 0,
                            outline: 'none'
                        }}>
                            {/* Modal Header */}
                            <Box sx={{
                                p: 3,
                                borderBottom: '2px solid #000000',
                                background: 'linear-gradient(90deg, #4ECDC4 0%, #42B8B0 100%)'
                            }}>
                                <Typography variant="h2" sx={{
                                    fontSize: '1.5rem',
                                    color: '#000000',
                                    textShadow: '1px 1px 0px #ffffff',
                                    textAlign: 'center'
                                }}>
                                    CREATE ROOM
                                </Typography>
                            </Box>

                            {/* Modal Content */}
                            <Box sx={{ p: 3 }}>
                                <TextField
                                    fullWidth
                                    type="text"
                                    label="ROOM NAME"
                                    value={roomNameInput}
                                    onChange={(e) => setRoomNameInput(e.target.value)}
                                    sx={{ mb: 3 }}
                                    InputProps={{
                                        startAdornment: <CreateIcon sx={{ mr: 0.8, color: '#9B59B6', fontSize: '1rem' }} />
                                    }}
                                />

                                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            setRoomNameInput('');
                                        }}
                                        sx={{
                                            backgroundColor: '#ffffff',
                                            color: '#000000',
                                            borderColor: '#000000'
                                        }}
                                    >
                                        CANCEL
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={handleCreateRoom}
                                    >
                                        CREATE
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