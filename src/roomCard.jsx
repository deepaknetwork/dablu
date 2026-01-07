import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"
import url from "./api";
import { useLoading } from './loadingContext.jsx';

// Material UI imports
import {
  Box,
  Typography,
  Paper,
  Chip,
  Slide
} from '@mui/material';
import {
  People as PeopleIcon
} from '@mui/icons-material';


export default function RoomCard(y) {
    var [names, setName] = useState([])
    var nav = useNavigate();
    const { showLoading, hideLoading } = useLoading();
    
    useEffect(() => {
        if (y.x.users && y.x.users.length > 0) {
            axios.post(`${url}/users`, { userIds: y.x.users })
                .then(response => {
                    setName(response.data);
                })
                .catch(error => {
                    console.error("Error fetching user names:", error);
                });
        }
    }, [y.x.users]);

    const handleRoomClick = () => {
        showLoading();
        // Small delay to show loading before navigation
        setTimeout(() => {
            nav(`/room/${y.x.roomId}`);
        }, 200);
    };

    return (
        <Slide direction="up" in={true} timeout={600}>
            <Paper 
                onClick={handleRoomClick} 
                sx={{
                    p: 1.5,
                    cursor: 'pointer',
                    transition: 'all 0.1s ease',
                    border: '2px solid #000000',
                    boxShadow: '4px 4px 0px #000000',
                    '&:hover': {
                        transform: 'translate(-2px, -2px)',
                        boxShadow: '6px 6px 0px #000000',
                    },
                    '&:active': {
                        transform: 'translate(2px, 2px)',
                        boxShadow: '2px 2px 0px #000000',
                    },
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
                }}
            >

                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        justifyContent: 'space-between',
                        mb: 1
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip 
                            label={`#${y.x.roomId}`}
                                size="small"
                            sx={{
                                backgroundColor: '#FF6B35',
                                color: '#ffffff',
                                fontWeight: 700,
                                fontFamily: '"JetBrains Mono", monospace',
                                border: '2px solid #000000',
                                borderRadius: 0,
                                boxShadow: '2px 2px 0px #000000',
                                    fontSize: '0.7rem'
                                }}
                            />
                        </Box>
                        
                        {/* People Count + Icon - Top Right */}
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center'
                        }}>
                            <PeopleIcon sx={{ 
                                fontSize: '0.9rem', 
                                color: '#666666',
                                mr: 0.3
                            }} />
                            <Typography 
                                variant="body2" 
                                sx={{
                                    fontFamily: '"JetBrains Mono", monospace',
                                    fontWeight: 700,
                                    color: '#666666',
                                fontSize: '0.75rem'
                            }}
                            >
                                {y.x.users.length}
                            </Typography>
                        </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography 
                        variant="h6" 
                        sx={{
                            fontFamily: '"JetBrains Mono", monospace',
                            fontWeight: 900,
                                fontSize: '1rem',
                            textTransform: 'uppercase',
                            letterSpacing: '-0.01em',
                            color: '#000000',
                            lineHeight: 1.2
                        }}
                    >
                        {y.x.roomName}
                    </Typography>

                        {/* Member Names - Bottom Right */}
                    {names.length > 0 && (
                            <Box sx={{ 
                                display: 'flex', 
                                flexWrap: 'wrap', 
                                gap: 0.5,
                                justifyContent: 'flex-end',
                                maxWidth: '60%'
                            }}>
                                {names.slice(0, 3).map((member, index) => (
                                    <Chip 
                                        key={index}
                                        label={member.username}
                                        size="small"
                                        sx={{
                                            backgroundColor: '#4ECDC4',
                                            color: '#000000',
                                            fontWeight: 600,
                                            fontFamily: '"JetBrains Mono", monospace',
                                            border: '1px solid #000000',
                                            borderRadius: 0,
                                            boxShadow: '1px 1px 0px #000000',
                                            fontSize: '0.65rem'
                                        }}
                                    />
                                ))}
                                {names.length > 3 && (
                                    <Chip 
                                        label={`+${names.length - 3}`}
                                        size="small"
                                        sx={{
                                            backgroundColor: '#F39C12',
                                            color: '#000000',
                                            fontWeight: 600,
                                            fontFamily: '"JetBrains Mono", monospace',
                                            border: '1px solid #000000',
                                            borderRadius: 0,
                                            boxShadow: '1px 1px 0px #000000',
                                            fontSize: '0.65rem'
                                        }}
                                    />
                                )}
                        </Box>
                    )}
                    </Box>

            </Paper>
        </Slide>
    );
}
