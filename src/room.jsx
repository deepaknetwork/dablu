import axios from "axios";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import url from "./api";
import './room.css';
import userIdContext from "./data";
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  Menu,
  IconButton
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Receipt as ReceiptIcon,
  AccountBalance as SettlementIcon,
  History as HistoryIcon,
  People as PeopleIcon,
  Add as AddIcon,
  AttachMoney as MoneyIcon,
  Person as PersonIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon
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
    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: '6px !important',
          border: '1px solid #000000',
          marginBottom: '8px !important',
          '&:before': {
            display: 'none',
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #000000',
          minHeight: '48px !important',
          '&.Mui-expanded': {
            minHeight: '48px !important',
          },
        },
        content: {
          margin: '12px 0 !important',
          '&.Mui-expanded': {
            margin: '12px 0 !important',
          },
        },
      },
    },
  },
});

export default function Room() {
    const [selectedUsers, setSelectedUsers] = useState([]);
    const roomId = useParams().id;
    
    // Format amount - show decimals only when needed
    const formatAmount = (amount) => {
        const rounded = parseFloat(amount).toFixed(2);
        // Remove .00 for whole numbers, keep decimals for others
        return parseFloat(rounded).toString();
    };

    // Check if current user is room admin
    const isRoomAdmin = () => {
        return room && getUserID() && parseInt(getUserID()) === parseInt(room.adminId);
    };

    // Check if there are pending settlements
    const hasPendingSettlements = () => {
        if (!room || !room.bill) return false;
        return room.bill.some(row => row.some(amount => amount > 0));
    };


    const [spender, setSpender] = useState('select');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [room, setRoom] = useState(null);
    const [userNames, setUserNames] = useState([]);
    const [payerList, setPayerList] = useState([]);
    const [receivedStatus, setReceivedStatus] = useState({});
    const [isSettling, setIsSettling] = useState(false);
    const [lastSettlementAttempt, setLastSettlementAttempt] = useState(0);
    const [expandedAccordion, setExpandedAccordion] = useState('expense');
    const [historyLoadCount, setHistoryLoadCount] = useState(0);
    const [expandedHistoryItem, setExpandedHistoryItem] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(Date.now());
    const [isPerformingAction, setIsPerformingAction] = useState(false);
    const [lastHistoryLength, setLastHistoryLength] = useState(0);
    const [lastPaymentStatus, setLastPaymentStatus] = useState('');
    const [roomMenuAnchor, setRoomMenuAnchor] = useState(null);
    
    var { getUserID, setUserID } = useContext(userIdContext);
    const { showLoading, hideLoading } = useLoading();
    const { showAlert, showConfirm } = useModal();

    const handleAccordionChange = (accordion) => (event, isExpanded) => {
        setExpandedAccordion(isExpanded ? accordion : null);
        
        // Reset history-related state when switching away from or to history
        if (accordion === 'history') {
            if (!isExpanded) {
                setHistoryLoadCount(0);
            }
            setExpandedHistoryItem(null); // Reset history item expansion
        }
    };

    const handleHistoryItemChange = (itemId) => (event, isExpanded) => {
        setExpandedHistoryItem(isExpanded ? itemId : null);
    };

    const getHistoryItemId = (historyItem) => {
        // Create unique ID from history item properties
        const baseId = `${historyItem.date}-${historyItem.time}-${historyItem.isExpense ? 'exp' : 'sett'}`;
        const uniquePart = historyItem.isExpense ? historyItem.amount : historyItem.settledByUserId || 'settle';
        return `${baseId}-${uniquePart}`;
    };

    const getVisibleHistory = () => {
        if (!room || !room.history) {
            return [];
        }

        const history = room.history.slice();
        let settlementCount = 0;
        let currentIndex = history.length - 1;

        // Find settlements from the end, including additional settlements based on load count
        const settlementsToShow = 2 + (historyLoadCount * 2); // Initial 2 + 2 per load
        
        while (currentIndex >= 0 && settlementCount < settlementsToShow) {
            if (!history[currentIndex].isExpense) { // This is a settlement
                settlementCount++;
            }
            if (settlementCount < settlementsToShow) {
                currentIndex--;
            }
        }

        // If we haven't found enough settlements, show from the beginning
        const startIndex = settlementCount === settlementsToShow ? currentIndex : 0;
        
        const visibleHistory = history.slice(startIndex);
        return visibleHistory.reverse();
    };

    const hasMoreHistory = () => {
        if (!room || !room.history) {
            return false;
        }

        const history = room.history.slice();
        let totalSettlements = 0;

        // Count total settlements in history
        for (let i = 0; i < history.length; i++) {
            if (!history[i].isExpense) {
                totalSettlements++;
            }
        }

        // Calculate how many settlements we're currently showing
        const settlementsCurrentlyShowing = 2 + (historyLoadCount * 2);

        // There are more settlements to load if we haven't shown all of them
        return totalSettlements > settlementsCurrentlyShowing;
    };

    useEffect(() => {
        fetchRoomDetails()
    }, []);

    useEffect(() => {
        // Reset history pagination when room changes
        setHistoryLoadCount(0);
        setExpandedHistoryItem(null);
    }, [room?.roomId]);

    // Real-time polling for live updates
    useEffect(() => {
        if (!room?.roomId) return;

        const pollInterval = setInterval(() => {
            // Only poll if page is visible and user is not performing actions or settling
            if (!document.hidden && !isPerformingAction && !isSettling) {
                fetchRoomDetailsQuietly();
            }
        }, 5000); // Poll every 5 seconds

        // Cleanup interval on unmount
        return () => clearInterval(pollInterval);
    }, [room?.roomId, isPerformingAction, isSettling]);

    // Listen for page visibility changes
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden && room?.roomId && !isPerformingAction && !isSettling) {
                // Page became visible, fetch latest data (only if not performing actions)
                fetchRoomDetailsQuietly();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [room?.roomId]);

    // Initialize tracking when room is first loaded
    useEffect(() => {
        if (room?.history) {
            setLastHistoryLength(room.history.length);
        }
        if (room?.payerList) {
            const paymentStatusHash = room.payerList.map(p => `${p.senderId}-${p.receiverId}-${p.isReceived}`).join(',');
            setLastPaymentStatus(paymentStatusHash);
        }
    }, [room?.roomId]); // Only run when room ID changes (initial load)

    const fetchRoomDetails = async () => {
        showLoading();
        try {
            const roomResponse = await axios.get(`${url}/room/${roomId}`);
            const usersResponse = await axios.post(`${url}/users`, { userIds: roomResponse.data.users });
            
            // Set user names (order doesn't matter for backend calculation)
            setUserNames(usersResponse.data);
            setRoom(roomResponse.data);
            setLastUpdate(Date.now());
        } catch (e) {
                console.error("Error fetching room data:", e);
                showAlert("Failed to load room details", 'error');
        } finally {
                hideLoading();
        }
    }

    const fetchRoomDetailsQuietly = async () => {
        try {
            const roomResponse = await axios.get(`${url}/room/${roomId}`);
            
            // Compare with current room data to detect changes
            if (room && hasRoomChanged(room, roomResponse.data)) {
                // Get user names only if room users changed
                const needUserUpdate = JSON.stringify(room.users) !== JSON.stringify(roomResponse.data.users);
                
                if (needUserUpdate) {
                    const usersResponse = await axios.post(`${url}/users`, { userIds: roomResponse.data.users });
                    setUserNames(usersResponse.data);
                }
                
                setRoom(roomResponse.data);
                setLastUpdate(Date.now());
                
                // Live updates work but notifications disabled to prevent spam
            }
        } catch (e) {
            // Silently handle errors in background polling
            console.error("Background polling error:", e);
        }
    }

    const hasRoomChanged = (oldRoom, newRoom) => {
        return (
            JSON.stringify(oldRoom.payerList) !== JSON.stringify(newRoom.payerList) ||
            JSON.stringify(oldRoom.history) !== JSON.stringify(newRoom.history) ||
            JSON.stringify(oldRoom.bill) !== JSON.stringify(newRoom.bill) ||
            JSON.stringify(oldRoom.users) !== JSON.stringify(newRoom.users)
        );
    }

    // Notification system disabled to prevent spam
    const checkForSimpleUpdates = (oldRoom, newRoom) => {
        // Just update tracking without notifications
        if (newRoom.history) {
            setLastHistoryLength(newRoom.history.length);
        }
        if (newRoom.payerList) {
            const currentPaymentStatus = newRoom.payerList.map(p => `${p.senderId}-${p.receiverId}-${p.isReceived}`).join(',');
            setLastPaymentStatus(currentPaymentStatus);
        }
    }

    const showToast = (message) => {
        // Prevent duplicate toasts with same message within 5 seconds
        const now = Date.now();
        const lastToastTime = window.lastToastTime || 0;
        const lastToastMessage = window.lastToastMessage || '';
        
        if (message === lastToastMessage && (now - lastToastTime) < 5000) {
            return; // Skip duplicate toast
        }
        
        window.lastToastTime = now;
        window.lastToastMessage = message;

        // Create a simple toast notification
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: #2ECC71;
            color: white;
            padding: 12px 16px;
            border-radius: 6px;
            font-size: 0.85rem;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            border: 1px solid #000;
            max-width: 300px;
            word-wrap: break-word;
            animation: slideIn 0.3s ease;
        `;
        
        // Add slide-in animation if not already added
        if (!document.getElementById('toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        toast.textContent = message;
        document.body.appendChild(toast);

        // Remove toast after 4 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'slideIn 0.3s ease reverse';
                setTimeout(() => {
                    if (toast.parentNode) {
                        document.body.removeChild(toast);
                    }
                }, 300);
            }
        }, 4000);
    }

    const fetchSettlementFromBackend = async () => {
        try {
            console.log("Fetching settlement calculation from backend...");
            const response = await axios.get(`${url}/room/${room.roomId}/calculate-settlement`);
            
            console.log("Backend settlement response:", response.data);
            
            if (response.data.success) {
                setPayerList(response.data.payerList);
                
                // Set received status from backend data
                const backendStatus = {};
                response.data.payerList.forEach((payment) => {
                    backendStatus[`${payment.senderId}-${payment.receiverId}-${payment.amount}`] = payment.isReceived;
                });
                setReceivedStatus(backendStatus);
                
                console.log("Settlement loaded from backend:");
                response.data.payerList.forEach((p, i) => {
                    console.log(`  ${i + 1}. ${p.sender} → ₹${formatAmount(p.amount)} → ${p.receiver} (Received: ${p.isReceived})`);
                });
            }
        } catch (error) {
            console.error('Error fetching settlement from backend:', error);
            // Fallback: set empty list if backend fails
            setPayerList([]);
            setReceivedStatus({});
        }
    };

    useEffect(() => {
        if (room?.roomId) {
            console.log("=== FETCHING SETTLEMENT FROM BACKEND ===");
            fetchSettlementFromBackend();
        }
    }, [room?.roomId]);

    const handleCheckboxChange = (userId, isChecked) => {
        setSelectedUsers(prev => {
            if (isChecked) {
                return [...prev, { userId, share: 0 }];
            } else {
                return prev.filter(u => u.userId !== userId);
            }
        });
    };

    const handleShareChange = (userId, value) => {
        const newShare = Number(value);
        setSelectedUsers(prev =>
            prev.map(u => u.userId === userId ? { ...u, share: newShare } : u)
        );
    };

    // Settlement calculation moved to backend - now using fetchSettlementFromBackend()

    const performSettlement = async () => {
        const now = Date.now();
        setLastSettlementAttempt(now);
        
        console.log("Starting settlement process...");
        setIsSettling(true);
        setIsPerformingAction(true);
        showLoading();
        
        try {
            const settlementData = { 
                adminId: getUserID(), 
                payerList: payerList, 
                settledBy: getUserID(),
                timestamp: Date.now() // Add timestamp for uniqueness
            };
            console.log("Sending settlement request:", settlementData);
            
            await axios.post(`${url}/room/settle/${room.roomId}`, settlementData);
            console.log("Settlement successful!");
            showAlert("Settlement successful!", 'success');
            fetchRoomDetails();
            
            // Refresh settlement calculation after successful settlement
            setTimeout(() => {
                fetchSettlementFromBackend();
            }, 500); // Small delay to ensure room data is updated
            
            // Let polling handle updates naturally
        } catch (e) {
            console.error("Error settling debts:", e);
            console.error("Settlement error details:", {
                status: e.response?.status,
                statusText: e.response?.statusText,
                data: e.response?.data,
                url: e.config?.url,
                method: e.config?.method,
                timestamp: new Date().toISOString()
            });
            
            if (e.response?.status === 409) {
                console.log("409 Conflict - Settlement conflict detected");
                
                const errorData = e.response?.data || {};
                const errorType = errorData.type;
                const errorMessage = errorData.error || "";
                const suggestion = errorData.suggestion || "";
                const lastSettlement = errorData.lastSettlement;
                const timeSince = errorData.timeSinceLastSettlement;
                
                console.log("409 Error details:", {
                    type: errorType,
                    message: errorMessage,
                    suggestion: suggestion,
                    lastSettlement: lastSettlement,
                    timeSinceLastSettlement: timeSince,
                    serverTime: errorData.serverTime,
                    lastSettlementTime: errorData.lastSettlementTime,
                    clientTime: Date.now()
                });
                
                // Handle specific error types from backend
                if (errorType === 'RECENT_SETTLEMENT') {
                    const timeAgo = timeSince ? Math.round(Math.abs(timeSince) / 1000) : 'a few';
                    const settlerName = lastSettlement?.settledByName || 'another user';
                    
                    // Check for time sync issues
                    if (timeSince < 0) {
                        console.warn("⚠️ Negative time difference detected - possible clock sync issue");
                        console.warn(`Server time: ${errorData.serverTime}, Settlement time: ${errorData.lastSettlementTime}, Client time: ${Date.now()}`);
                        showAlert(`⚠️ Settlement Timing Issue\n\nA settlement by ${settlerName} was detected, but there may be a clock synchronization issue between your device and the server.\n\nThe room data will be refreshed automatically.`, 'warning');
                    } else {
                        showAlert(`✅ Settlement Already Completed!\n\nThe settlement was completed by ${settlerName} ${timeAgo} seconds ago.\n\nThe room data has been updated automatically. No further action is needed.`, 'info');
                    }
                } else if (errorType === 'SETTLEMENT_IN_PROGRESS') {
                    showAlert(`⏳ Settlement In Progress\n\nAnother user is currently processing the settlement.\n\n${suggestion || 'Please wait 10-15 seconds and try again if needed.'}`, 'warning');
                } else {
                    // Fallback for any other 409 scenarios
                    if (errorMessage.includes("recently completed") || lastSettlement) {
                        showAlert("✅ Settlement was just completed by another user!\n\nThe room has been automatically updated. No further action needed.", 'info');
                    } else if (errorMessage.includes("already in progress")) {
                        showAlert("⏳ Another settlement is currently being processed.\n\nPlease wait 10-15 seconds and try again if needed.", 'warning');
                    } else {
                        showAlert("⚠️ Settlement conflict detected!\n\nAnother user may have just completed the settlement or one is in progress.\n\nRefreshing room data...", 'warning');
                    }
                }
                
                // Always refresh to get latest state after a short delay
                setTimeout(() => {
                    fetchRoomDetails();
                }, 1500);
            } else if (e.response?.status === 400) {
                console.error("400 Bad Request:", e.response?.data);
                showAlert("Invalid settlement request. Please check if all payments are confirmed and try again.", 'error');
                fetchRoomDetails();
            } else if (e.response?.status >= 500) {
                console.error("Server error:", e.response?.status, e.response?.data);
                showAlert("Server error occurred. Please try again in a moment.", 'error');
            } else if (e.code === 'ECONNABORTED' || e.message.includes('timeout')) {
                console.error("Request timeout:", e.message);
                showAlert("Request timed out. Please check your connection and try again.", 'error');
            } else {
                console.error("Unknown settlement error:", e.message, e.code);
                showAlert("Failed to settle debts. Please try again.", 'error');
            }
        } finally {
            console.log("Settlement process completed, resetting states");
            setIsSettling(false);
            setIsPerformingAction(false);
            hideLoading();
        }
    };

    const deleteRoom = async () => {
        if (!isRoomAdmin()) {
            showAlert("Only room admin can delete the room", 'error');
            return;
        }

        if (hasPendingSettlements()) {
            showAlert("Cannot delete room while settlements are pending. Please settle all debts first.", 'warning');
            return;
        }

                 showConfirm(
             `Are you sure you want to delete the room "${room.roomName}"?\n\nThis action cannot be undone. All room data including history will be permanently deleted.`,
             async () => {
                 try {
                     showLoading();
                     await axios.delete(`${url}/room/${room.roomId}`, {
                         data: { adminId: getUserID() }
                     });
                     
                     showAlert("Room deleted successfully!", 'success');
                     // Redirect to rooms list or home page
                     setTimeout(() => {
                         window.location.href = '/'; // or use your routing method
                     }, 2000);
                     
                 } catch (error) {
                     console.error('Error deleting room:', error);
                     showAlert('Failed to delete room: ' + (error.response?.data?.error || error.message), 'error');
                 } finally {
                     hideLoading();
                 }
             }
         );
    };

    const markAsReceived = async (senderId, receiverId, amount) => {
        const key = `${senderId}-${receiverId}-${amount}`;
        
        try {
            setIsPerformingAction(true);
            showLoading();
            
            console.log(`Marking as received: ${senderId} → ${receiverId} ₹${amount}`);
            
            // Optimistic update - show immediately for better UX
            setReceivedStatus(prev => ({
                ...prev,
                [key]: true
            }));
            
            setPayerList(prev => 
                prev.map(payer => 
                    payer.senderId === senderId && 
                    payer.receiverId === receiverId && 
                    payer.amount === amount
                        ? { ...payer, isReceived: true }
                        : payer
                )
            );

            // Save to backend
            const response = await axios.post(`${url}/room/${room.roomId}/mark-received`, {
                senderId,
                receiverId, 
                amount,
                userId: getUserID()
            });
            
            if (response.data.success) {
                console.log("✅ Payment marked as received and saved to backend");
                
                // Refresh from backend to ensure consistency
                fetchSettlementFromBackend();
            }
            
        } catch (error) {
            console.error('Error marking payment as received:', error);
            
            // Revert optimistic update on error
            setReceivedStatus(prev => ({
                ...prev,
                [key]: false
            }));
            setPayerList(prev => 
                prev.map(payer => 
                    payer.senderId === senderId && 
                    payer.receiverId === receiverId && 
                    payer.amount === amount
                        ? { ...payer, isReceived: false }
                        : payer
                )
            );
            
            showAlert('Failed to mark payment as received: ' + (error.response?.data?.error || error.message), 'error');
        } finally {
            setIsPerformingAction(false);
            hideLoading();
        }
    }



    const isExpenseFormValid = () => {
        // Check if all required fields are filled
        if (spender === "select" || !amount || amount <= 0 || selectedUsers.length === 0 || !description.trim()) {
            return false;
        }
        
        // Check if at least one user has 0 share
        const hasZeroShare = selectedUsers.some(user => user.share === 0);
        if (!hasZeroShare) {
            return false;
        }
        
        return true;
    };

    const submitExpense = () => {
        if(spender==="select"||amount==0|| selectedUsers.length === 0 || !description.trim()) {
            showAlert("Please check the inputs - all fields including description are required", 'warning');
            return;
        }
        var is0= false;
        for(let i = 0; i < selectedUsers.length; i++) {
            if(selectedUsers[i].share == 0) {
                is0 = true;
                break;
            }
        }
        if(is0===false) {
            showAlert("At least one user should have 0 share", 'warning');
            return;
        }
        
        // Get current date and time automatically
        const now = new Date();
        const currentDate = now.toISOString().split('T')[0]; // Format: YYYY-MM-DD
        const currentTime = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        }); // Format: HH:MM AM/PM
        
        const expenseData = {
            userId: spender,
            amount: amount,
            description: description,
            date: currentDate,
            time: currentTime,
            users: selectedUsers,
            createdBy: getUserID()
        };
        
        console.log("Submitting expense:", expenseData);
        
        setIsPerformingAction(true);
        showLoading();
        axios.post(`${url}/rooms/${room.roomId}/expense`, expenseData)
        .then(() => {
            showAlert("Expense submitted successfully!", 'success');
            setAmount("");
            setDescription("");
            setSpender("select");
            setSelectedUsers([]);
            fetchRoomDetails();
            
            // Refresh settlement calculation after adding expense
            setTimeout(() => {
                fetchSettlementFromBackend();
            }, 500); // Small delay to ensure room data is updated
        })
        .catch(e => {
            console.log(e);
            showAlert("Failed to submit expense", 'error');
        })
        .finally(() => {
            setIsPerformingAction(false);
            hideLoading();
        });
    };

    if (!room) return (
        <ThemeProvider theme={brutalistTheme}>
            <Container sx={{ textAlign: 'center', py: 5 }}>
                <Typography variant="h2">LOADING...</Typography>
            </Container>
        </ThemeProvider>
    );

    return (
        <ThemeProvider theme={brutalistTheme}>
            <style>{`
                @keyframes bounce {
                    0%, 20%, 60%, 100% { transform: translateY(0); }
                    40% { transform: translateY(-5px); }
                    80% { transform: translateY(-2px); }
                }
            `}</style>
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
                        opacity: 0.05,
                        fontFamily: '"JetBrains Mono", monospace',
                        userSelect: 'none',
                        transform: 'rotate(-15deg)'
                    }}>
                        $
                    </Box>
                    <Box sx={{
                        position: 'absolute',
                        bottom: { xs: '25%', sm: '30%' },
                        left: { xs: '8%', sm: '12%' },
                        fontSize: { xs: '70px', sm: '90px', md: '110px' },
                        fontWeight: 900,
                        color: '#FF6B35',
                        opacity: 0.05,
                        fontFamily: '"JetBrains Mono", monospace',
                        userSelect: 'none',
                        transform: 'rotate(10deg)'
                    }}>
                        ₹
                    </Box>
                </Box>

                <                Container maxWidth="lg" sx={{ 
                    position: 'relative', 
                    zIndex: 1,
                    py: 1
                }}>
                    {/* Room Header */}
                    <Paper sx={{ p: 1, mb: 1.5, textAlign: 'center', position: 'relative' }}>
                        {/* Room Management Menu (Admin Only) */}
                        {isRoomAdmin() && (
                            <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                                <IconButton
                                    onClick={(e) => setRoomMenuAnchor(e.currentTarget)}
                                    size="small"
                                    sx={{
                                        color: '#666666',
                                        '&:hover': {
                                            backgroundColor: '#f5f5f5'
                                        }
                                    }}
                                >
                                    <MoreVertIcon />
                                </IconButton>
                                <Menu
                                    anchorEl={roomMenuAnchor}
                                    open={Boolean(roomMenuAnchor)}
                                    onClose={() => setRoomMenuAnchor(null)}
                                    PaperProps={{
                                        sx: {
                                            border: '1px solid #000000',
                                            borderRadius: 4
                                        }
                                    }}
                                >
                                    <MenuItem
                                        onClick={() => {
                                            setRoomMenuAnchor(null);
                                            deleteRoom();
                                        }}
                                        disabled={hasPendingSettlements()}
                                        sx={{
                                            color: hasPendingSettlements() ? '#CCCCCC' : '#E74C3C',
                                            fontSize: '0.8rem',
                                            fontWeight: 600,
                                            '&:hover': {
                                                backgroundColor: hasPendingSettlements() ? 'transparent' : '#fff5f5'
                                            }
                                        }}
                                    >
                                        <DeleteIcon sx={{ mr: 1, fontSize: '1rem' }} />
                                        {hasPendingSettlements() ? 'DELETE (Settlements Pending)' : 'DELETE ROOM'}
                                    </MenuItem>
                                </Menu>
                            </Box>
                        )}

                        <Typography variant="h1" sx={{ 
                            fontSize: { xs: '1.2rem', sm: '1.5rem' },
                            mb: 0.25
                        }}>
                            {room.roomName}
                        </Typography>
                        <Chip 
                            label={`ROOM ID: ${room.roomId}`}
                            size="small"
                            sx={{
                                backgroundColor: '#FF6B35',
                                color: '#ffffff',
                                fontWeight: 600,
                                border: '1px solid #000000',
                                borderRadius: 3
                            }}
                        />
                        {isRoomAdmin() && (
                            <Chip 
                                label="ADMIN"
                                size="small"
                                sx={{
                                    backgroundColor: '#9B59B6',
                                    color: '#ffffff',
                                    fontWeight: 600,
                                    border: '1px solid #000000',
                                    borderRadius: 3,
                                    ml: 1
                                }}
                            />
                        )}
                    </Paper>

                {/* Expense Section */}
                    <Accordion 
                        expanded={expandedAccordion === 'expense'}
                        onChange={handleAccordionChange('expense')}
                    >
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <ReceiptIcon sx={{ mr: 1, color: '#FF6B35' }} />
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    ADD EXPENSE
                                </Typography>
                            </Box>
                        </AccordionSummary>
                                                <AccordionDetails sx={{ p: 0.75 }}>
<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                                <Box sx={{ display: 'flex', gap: 0.75 }}>
                                <TextField
                                        type="number"
                                    label="AMOUNT"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                        placeholder="Enter amount"
                                        size="small"
                                        sx={{ 
                                            flex: 1,
                                            '& .MuiInputLabel-root': {
                                                fontSize: '0.75rem',
                                                transform: 'translate(14px, 9px) scale(1)',
                                                '&.Mui-focused, &.MuiFormLabel-filled': {
                                                    transform: 'translate(14px, -6px) scale(0.75)'
                                                }
                                            }
                                        }}
                                    InputProps={{
                                            startAdornment: <Typography sx={{ mr: 0.25, color: '#2ECC71', fontSize: '0.8rem', fontWeight: 600 }}>₹</Typography>
                                    }}
                                />

                                    <FormControl size="small" sx={{ flex: 1 }}>
                                    <InputLabel 
                                        sx={{
                                                fontSize: '0.65rem',
                                                fontWeight: 600,
                                            color: '#3498DB',
                                            backgroundColor: '#ffffff',
                                                padding: '0 3px',
                                                transform: 'translate(12px, -8px) scale(1)',
                                            '&.MuiInputLabel-shrink': {
                                                    transform: 'translate(12px, -8px) scale(1)',
                                            },
                                            '&.Mui-focused': {
                                                color: '#E74C3C',
                                            },
                                        }}
                                    >
                                        SPENT BY
                                    </InputLabel>
                                    <Select
                                        value={spender}
                                        label="SPENT BY"
                                        onChange={(e) => setSpender(e.target.value)}
                                        sx={{
                                                borderRadius: 4,
                                            backgroundColor: '#ffffff',
                                                border: '1px solid #000000',
                                            '& fieldset': { border: 'none' },
                                            '& .MuiOutlinedInput-input': {
                                                    padding: '8px 10px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 500,
                                            },
                                        }}
                                    >
                                        <MenuItem value="select">Select</MenuItem>
                                        {userNames.map((member) => (
                                            <MenuItem key={member.userId} value={member.userId}>
                                                {member.username}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                </Box>

                                <TextField
                                    fullWidth
                                    type="text"
                                    label="DESCRIPTION"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="What was this for?"
                                    size="small"
                                    sx={{
                                        '& .MuiInputLabel-root': {
                                            fontSize: '0.75rem',
                                            transform: 'translate(14px, 9px) scale(1)',
                                            '&.Mui-focused, &.MuiFormLabel-filled': {
                                                transform: 'translate(14px, -6px) scale(0.75)'
                                            }
                                        },
                                        '& .MuiOutlinedInput-root': {
                                            minHeight: '32px'
                                        }
                                    }}
                                    InputProps={{
                                        startAdornment: <ReceiptIcon sx={{ mr: 0.25, color: '#9B59B6', fontSize: '0.8rem' }} />
                                    }}
                                />

                                <Box>
                                    <Typography variant="h6" sx={{ mb: 0.25, fontWeight: 600, fontSize: '0.7rem', color: '#666666' }}>
                                        SHARE DISTRIBUTION
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.125 }}>
                                    {userNames.map((member) => {
                                        const isSelected = selectedUsers.some(u => u.userId === member.userId);
                                        const userShare = selectedUsers.find(u => u.userId === member.userId)?.share || 0;

                                        return (
                                            <Box
                                                key={member.userId}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        py: 0.25,
                                                        px: 0.5,
                                                        borderBottom: '1px solid #f0f0f0',
                                                        '&:last-child': {
                                                            borderBottom: 'none'
                                                        }
                                                }}
                                            >
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                    checked={isSelected}
                                                    onChange={(e) => handleCheckboxChange(member.userId, e.target.checked)}
                                                                size="small"
                                                            sx={{
                                                                color: '#FF6B35',
                                                                '&.Mui-checked': {
                                                                    color: '#FF6B35',
                                                                },
                                                                    p: 0.25
                                                            }}
                                                        />
                                                    }
                                                    label={member.username}
                                                        sx={{ 
                                                            flex: 1,
                                                            '& .MuiFormControlLabel-label': {
                                                                fontSize: '0.7rem',
                                                                fontWeight: 500
                                                            }
                                                        }}
                                                />
                                                <TextField
                                                    type="number"
                                                    size="small"
                                                    disabled={!isSelected}
                                                    value={userShare}
                                                    onChange={(e) => handleShareChange(member.userId, e.target.value)}
                                                        placeholder="₹"
                                                        sx={{ 
                                                            width: 45,
                                                            '& .MuiOutlinedInput-input': {
                                                                padding: '2px 4px',
                                                                fontSize: '0.65rem',
                                                                textAlign: 'center'
                                                            },
                                                            '& .MuiOutlinedInput-root': {
                                                                '& fieldset': {
                                                                    borderColor: '#e0e0e0'
                                                                }
                                                            }
                                                        }}
                                                />
                                            </Box>
                                        );
                                    })}
                                    </Box>
                                </Box>

                                <Button 
                                    variant="contained" 
                                    size="small"
                                    onClick={submitExpense}
                                    disabled={!isExpenseFormValid()}
                                    startIcon={<AddIcon sx={{ fontSize: '0.9rem' }} />}
                                    sx={{ fontSize: '0.75rem', py: 0.75 }}
                                >
                                    SUBMIT EXPENSE
                                </Button>
                            </Box>
                        </AccordionDetails>
                    </Accordion>

                {/* Settlement Section */}
                    <Accordion
                        expanded={expandedAccordion === 'settlement'}
                        onChange={handleAccordionChange('settlement')}
                    >
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <SettlementIcon sx={{ mr: 1, color: '#2ECC71' }} />
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    SETTLEMENT
                                </Typography>
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 1.5 }}>
                            <Box>
                                {payerList.length > 0 ? (
                                    <>
                                                            {payerList.map((payer, index) => {
                                                const transactionKey = `${payer.senderId}-${payer.receiverId}-${payer.amount}`;
                                                const isReceived = receivedStatus[transactionKey] || false;
                                                const isCurrentUserReceiver = String(payer.receiverId) === String(getUserID());
                                                
                                                return (
                                            <Box
                                    key={index}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    px: { xs: 0.75, sm: 1 },
                                                    py: { xs: 0.25, sm: 0.4 },
                                                    mb: 0.5,
                                                    backgroundColor: isReceived ? 
                                                        '#F8F8F8' : 
                                                        '#FAFAFA',
                                                    borderLeft: isReceived ? 
                                                        '3px solid #4CAF50' : 
                                                        '3px solid #FF9800',
                                                    gap: { xs: 0.5, sm: 0.75 },
                                                    minHeight: { xs: '32px', sm: '36px' }
                                                }}
                                            >
                                                {/* Sender */}
                                                <Typography sx={{ 
                                                    fontWeight: 500, 
                                                    color: '#1976D2', 
                                                    fontSize: { xs: '0.8rem', sm: '0.85rem' },
                                                    flexShrink: 0
                                                }}>
                                                    {payer.sender}
                                                </Typography>

                                                {/* First Spacer */}
                                                <Box sx={{ flex: 1 }} />

                                                {/* First Arrow - Between Sender and Amount */}
                                                <Typography sx={{ 
                                                    color: '#CCCCCC', 
                                                    fontSize: { xs: '0.9rem', sm: '1rem' },
                                                    fontWeight: 400,
                                                    flexShrink: 0,
                                                    px: { xs: 0.4, sm: 0.5 }
                                                }}>
                                                    →
                                                </Typography>

                                                {/* Second Spacer */}
                                                <Box sx={{ flex: 1 }} />

                                                {/* Center Section with Amount */}
                                                <Box sx={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center',
                                                    gap: 0.5,
                                                    flexShrink: 0
                                                }}>
                                                    {/* Amount as Text */}
                                                    <Typography sx={{
                                                        fontSize: { xs: '0.85rem', sm: '0.9rem' },
                                                        fontWeight: 600,
                                                        color: '#FF9800',
                                                        fontFamily: 'monospace'
                                                    }}>
                                                        ₹{formatAmount(payer.amount)}
                                                </Typography>
                                                    
                                                    {/* Received Button - Immediate Right */}
                                                    {isCurrentUserReceiver && !isReceived && (
                                                        <Button
                                                            variant="contained"
                                                            size="small"
                                                            onClick={() => markAsReceived(payer.senderId, payer.receiverId, payer.amount)}
                                                    sx={{
                                                                backgroundColor: '#00BCD4',
                                                                color: '#FFFFFF',
                                                                fontWeight: 600,
                                                                fontSize: { xs: '0.7rem', sm: '0.6rem' },
                                                                px: { xs: 0.4, sm: 0.6 },
                                                                py: { xs: 0.15, sm: 0.2 },
                                                                minHeight: { xs: '20px', sm: '22px' },
                                                                minWidth: { xs: '20px', sm: '50px' },
                                                                borderRadius: 1,
                                                                border: 'none',
                                                                textTransform: 'none',
                                                                '&:hover': {
                                                                    backgroundColor: '#0097A7'
                                                                }
                                                            }}
                                                        >
                                                            <Box
                                                                component="span"
                                                                sx={{
                                                                    display: { xs: 'inline', sm: 'none' }
                                                                }}
                                                            >
                                                                ✓
                                            </Box>
                                                            <Box
                                                                component="span"
                                                                sx={{
                                                                    display: { xs: 'none', sm: 'inline' }
                                                                }}
                                                            >
                                                                RECEIVED
                                                            </Box>
                                                        </Button>
                                                    )}
                                                    

                                                </Box>

                                                {/* Third Spacer */}
                                                <Box sx={{ flex: 1 }} />

                                                                                                    {/* Second Arrow - Between Amount and Receiver */}
                                                    <Typography sx={{ 
                                                        color: '#CCCCCC', 
                                                        fontSize: { xs: '0.9rem', sm: '1rem' },
                                                        fontWeight: 400,
                                                        flexShrink: 0,
                                                        px: { xs: 0.4, sm: 0.5 }
                                                    }}>
                                                        →
                                                    </Typography>

                                                {/* Fourth Spacer */}
                                                <Box sx={{ flex: 1 }} />

                                                {/* Receiver - Right End */}
                                                <Typography sx={{ 
                                                    fontWeight: 500, 
                                                    color: '#388E3C', 
                                                    fontSize: { xs: '0.8rem', sm: '0.85rem' },
                                                    flexShrink: 0
                                                }}>
                                                    {payer.receiver}
                                                </Typography>
                                            </Box>
                                                );
                                            })}
                                        <Button 
                                            variant="contained"
                                            color="error"
                                            size="small"
                                            fullWidth
                                            disabled={!payerList.every(payer => payer.isReceived === true) || payerList.length === 0 || isSettling}
                                            onClick={() => {
                                if (isSettling) {
                                    console.log("Settlement already in progress, ignoring click");
                                    return; // Prevent multiple clicks
                                }
                                
                                // Add cooldown period to prevent rapid attempts
                                const now = Date.now();
                                const timeSinceLastAttempt = now - lastSettlementAttempt;
                                if (timeSinceLastAttempt < 7000) { // 7 second cooldown (reduced from 10)
                                    const remainingTime = Math.ceil((7000 - timeSinceLastAttempt) / 1000);
                                    showAlert(`⏳ Cooldown Active\n\nPlease wait ${remainingTime} more seconds before attempting settlement again.\n\nThis prevents conflicts with other users.`, 'warning');
                                    return;
                                }
                                
                                showConfirm("Are you sure you want to settle the debts?", performSettlement);
                                            }}
                                            sx={{
                                                backgroundColor: '#E74C3C',
                                                fontSize: { xs: '0.7rem', sm: '0.8rem' },
                                                py: { xs: 0.75, sm: 1 },
                                                mt: 1,
                                                '&:hover': {
                                                    backgroundColor: '#C0392B',
                                                },
                                                '&:disabled': {
                                                    backgroundColor: '#CCCCCC',
                                                    color: '#666666'
                                                }
                                            }}
                                        >
                                            {isSettling ? (
                                                'SETTLING...'
                                            ) : payerList.every(payer => payer.isReceived === true) && payerList.length > 0 ? (
                                                <>
                                                    <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                                            SETTLE ALL DEBTS
                                                    </Box>
                                                    <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                                                        SETTLE ALL
                                                    </Box>
                                                </>
                                            ) : (
                                                <>
                                                    <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                                                        WAITING FOR ALL CONFIRMATIONS
                                                    </Box>
                                                    <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                                                        WAITING...
                                                    </Box>
                                                </>
                                            )}
                                        </Button>
                                    </>
                                ) : (
                                    <Alert 
                                        severity="info" 
                                        sx={{ 
                                            border: '1px solid #000000', 
                                            borderRadius: 4,
                                            fontSize: { xs: '0.75rem', sm: '0.85rem' },
                                            py: { xs: 0.5, sm: 0.75 },
                                            '& .MuiAlert-message': {
                                                fontSize: 'inherit'
                                            }
                                        }}
                                    >
                                        <>
                                            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                                        No settlements required at the moment.
                                            </Box>
                                            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                                                No settlements needed
                                            </Box>
                                        </>
                                    </Alert>
                                )}
                            </Box>
                        </AccordionDetails>
                    </Accordion>

                {/* History Section */}
                    <Accordion
                        expanded={expandedAccordion === 'history'}
                        onChange={handleAccordionChange('history')}
                    >
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <HistoryIcon sx={{ mr: 1, color: '#9B59B6' }} />
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    HISTORY
                                </Typography>
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 1.5 }}>
                            <Box>
                                {getVisibleHistory().length === 0 ? (
                                    <Typography variant="body2" sx={{ textAlign: 'center', color: '#666', py: 2, fontSize: '0.8rem' }}>
                                        No history available
                                    </Typography>
                                ) : null}
                                
                                {getVisibleHistory().map((historyItem, index) => {
                                    const itemId = getHistoryItemId(historyItem);
                                    return (
                                    <Accordion 
                                        key={itemId} 
                                        expanded={expandedHistoryItem === itemId}
                                        onChange={handleHistoryItemChange(itemId)}
                                        sx={{ mb: 0.125 }}
                                    >
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon sx={{ fontSize: '1rem' }} />}
                                            sx={{
                                                backgroundColor: historyItem.isExpense ? '#f8faff' : '#fffafa',
                                                minHeight: '28px !important',
                                                '&.Mui-expanded': {
                                                    minHeight: '28px !important',
                                                },
                                                py: 0.25,
                                                px: 0.75,
                                                '& .MuiAccordionSummary-content': {
                                                    margin: '0 !important'
                                                }
                                            }}
                                        >
                                                                                         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                                                     <Typography sx={{ fontWeight: 600, fontSize: '0.7rem' }}>
                                                         {historyItem.isExpense ? 'EXPENSE' : 'SETTLEMENT'}
                                                     </Typography>
                                                     {historyItem.isExpense && (
                                                         <Typography sx={{
                                                                 fontWeight: 700,
                                                             fontSize: '0.7rem',
                                                             color: '#2ECC71',
                                                             backgroundColor: 'rgba(46, 204, 113, 0.1)',
                                                             px: 0.75,
                                                             py: 0.25,
                                                             borderRadius: 1,
                                                             border: '1px solid rgba(46, 204, 113, 0.3)',
                                                             fontFamily: 'monospace'
                                                         }}>
                                                             ₹{formatAmount(historyItem.amount)}
                                                         </Typography>
                                                     )}
                                                     <Typography sx={{
                                                         fontSize: '0.65rem',
                                                         color: '#4ECDC4',
                                                         fontWeight: 600
                                                     }}>
                                                         {historyItem.users.slice(0, 3).map((user, userIndex) => 
                                                             userNames.find(User => User.userId === user.userId)?.username
                                                         ).join(', ')}
                                                         {historyItem.users.length > 3 && (
                                                             <Typography component="span" sx={{
                                                                 fontSize: '0.6rem',
                                                                 color: '#F39C12',
                                                                     fontWeight: 600,
                                                                 ml: 0.5
                                                             }}>
                                                                 +{historyItem.users.length - 3} more
                                                             </Typography>
                                                         )}
                                                     </Typography>
                                                     </Box>
                                                 
                                                                                                  {/* Date on the right */}
                                                         <Typography 
                                                             sx={{ 
                                                         fontSize: '0.65rem',
                                                         color: '#666666',
                                                         fontWeight: 500
                                                     }}
                                                 >
                                                     {historyItem.date ? new Date(historyItem.date).toLocaleDateString() : 'No date'}
                                                         </Typography>
                                             </Box>
                                        </AccordionSummary>
                                                                                 <AccordionDetails sx={{ p: 0.5 }}>
                                             {historyItem.isExpense ? (
                                                 <Box>
                                                     {/* Expense Details */}
                                                     <Box sx={{ mb: 1, p: 1, backgroundColor: '#f8fafc' }}>
                                                                                                                 <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.75rem' }}>
                                                             <strong>Date:</strong> {historyItem.date ? new Date(historyItem.date).toLocaleDateString('en-US', { 
                                                                 year: 'numeric', 
                                                                 month: 'short', 
                                                                 day: 'numeric' 
                                                             }) : 'No date available'} | <strong>Time:</strong> {historyItem.time || 'No time available'}
                                                         </Typography>
                                                         <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.75rem' }}>
                                                             <strong>Amount:</strong> ₹{formatAmount(historyItem.amount)}
                                                         </Typography>
                                                         <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.75rem' }}>
                                                            <strong>Description:</strong> {historyItem.description}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.75rem' }}>
                                                            <strong>Spent by:</strong> {userNames.find(user => user.userId === historyItem.paidUserId)?.username || 'Unknown'} | <strong>Added by:</strong> {historyItem.createdByName || userNames.find(user => user.userId === historyItem.createdByUserId)?.username || 'Unknown'}
                                                         </Typography>
                                                     </Box>
                                                     
                                                     {/* User Shares */}
                                                     <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.7rem', color: '#666666' }}>
                                                         SHARE BREAKDOWN
                                                     </Typography>
                                                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                                                         {historyItem.users.map((user, userIndex) => (
                                                             <Box
                                                                 key={userIndex}
                                                                 sx={{
                                                                     display: 'flex',
                                                                     justifyContent: 'space-between',
                                                                     alignItems: 'center',
                                                                     py: 0.25,
                                                                     px: 0.5,
                                                                     borderBottom: '1px solid #f0f0f0',
                                                                     '&:last-child': {
                                                                         borderBottom: 'none'
                                                                     }
                                                                 }}
                                                             >
                                                                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
                                                                     {userNames.find(User => User.userId === user.userId)?.username}
                                                                 </Typography>
                                                                 <Typography sx={{ fontSize: '0.7rem', color: '#2ECC71', fontWeight: 600 }}>
                                                                     ₹{formatAmount(user.share)}
                                                                 </Typography>
                                                             </Box>
                                                         ))}
                                                     </Box>
                                                 </Box>
                                            ) : (
                                                <Box>
                                                    {/* Settlement Details */}
                                                    <Box sx={{ mb: 1, p: 1, backgroundColor: '#fff5f5' }}>
                                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.75rem' }}>
                                                            <strong>Date:</strong> {historyItem.date ? new Date(historyItem.date).toLocaleDateString('en-US', { 
                                                                year: 'numeric', 
                                                                month: 'short', 
                                                                day: 'numeric' 
                                                            }) : 'No date available'} | <strong>Time:</strong> {historyItem.time || 'No time available'}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.75rem' }}>
                                                            <strong>Settlement initiated by:</strong> {historyItem.settledByName || userNames.find(user => user.userId === historyItem.settledByUserId)?.username || 'Unknown'}
                                                        </Typography>
                                                    </Box>

                                                    {/* Settlement Transactions */}
                                                    <Typography variant="h6" sx={{ fontWeight: 500, mb: 0.5, fontSize: '0.7rem', color: '#666666' }}>
                                                        SETTLEMENT TRANSACTIONS
                                                    </Typography>
                                                    {historyItem.bill.map((payer, payerIndex) => (
                                                        <Box
                                                            key={payerIndex}
                                                            sx={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                py: 0.25,
                                                                px: 0.5,
                                                                mb: 0.125,
                                                                backgroundColor: '#FAFAFA',
                                                                borderLeft: '2px solid #E0E0E0'
                                                            }}
                                                        >
                                                            <Typography sx={{ fontWeight: 500, color: '#3498DB', fontSize: '0.7rem' }}>
                                                                {payer.sender}
                                                            </Typography>
                                                            <Typography sx={{ mx: 1, fontSize: '0.65rem', color: '#CCCCCC' }}>→</Typography>
                                                            <Typography sx={{ fontWeight: 500, color: '#2ECC71', fontSize: '0.7rem' }}>
                                                                {payer.receiver}
                                                            </Typography>
                                                            <Typography sx={{ fontWeight: 500, fontSize: '0.7rem', fontFamily: 'monospace' }}>
                                        ₹{formatAmount(payer.amount)}
                                                            </Typography>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            )}
                                        </AccordionDetails>
                                    </Accordion>
                                );
                                })}
                                
                                {hasMoreHistory() && (
                                    <Box sx={{ textAlign: 'center', mt: 1 }}>
                                        <Typography
                                            component="a"
                                            onClick={() => {
                                                setHistoryLoadCount(prev => prev + 1);
                                                setExpandedHistoryItem(null); // Close any open history item when loading more
                                            }}
                                            sx={{
                                                fontSize: '0.7rem',
                                                color: '#3498DB',
                                                cursor: 'pointer',
                                                textDecoration: 'underline',
                                                fontWeight: 500,
                                                '&:hover': {
                                                    color: '#2980B9',
                                                    textDecoration: 'none'
                                                }
                                            }}
                                        >
                                            load more
                                        </Typography>
                                    </Box>
                                )}

                            </Box>
                        </AccordionDetails>
                    </Accordion>

                {/* Members Section */}
                    <Accordion
                        expanded={expandedAccordion === 'members'}
                        onChange={handleAccordionChange('members')}
                    >
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <PeopleIcon sx={{ mr: 1, color: '#F39C12' }} />
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    MEMBERS ({userNames.length})
                                </Typography>
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 1.5 }}>
                            <List sx={{ py: 0 }}>
                                {userNames.map((member) => (
                                    <ListItem
                                        key={member.userId}
                                        sx={{
                                            border: '1px solid #000000',
                                            borderRadius: 4,
                                            mb: 0.25,
                                            backgroundColor: '#f8fafc',
                                            py: 0.5,
                                            px: 1
                                        }}
                                    >
                                        <PersonIcon sx={{ mr: 1, color: '#FF6B35', fontSize: '0.9rem' }} />
                                        <ListItemText
                                            primary={member.username}
                                            secondary={`User ID: ${member.userId}`}
                                            primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 600 }}
                                            secondaryTypographyProps={{ fontSize: '0.65rem' }}
                                        />
                                        <Chip
                                            label="MEMBER"
                                            size="small"
                                            sx={{
                                                backgroundColor: '#4ECDC4',
                                                color: '#000000',
                                                fontWeight: 600,
                                                fontSize: '0.65rem',
                                                border: '1px solid #000000',
                                                borderRadius: 3
                                            }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </AccordionDetails>
                    </Accordion>
                </Container>
            </Box>
        </ThemeProvider>
    );
}
