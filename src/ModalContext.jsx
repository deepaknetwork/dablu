import React, { createContext, useContext, useState } from 'react';
import {
    Modal,
    Box,
    Typography,
    Button,
    Backdrop
} from '@mui/material';

const ModalContext = createContext();

// Global references for use outside React components
let globalShowAlert = null;
let globalShowConfirm = null;

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};

// Global functions that can be used outside React components
export const showGlobalAlert = (message, type = 'info') => {
    if (globalShowAlert) {
        globalShowAlert(message, type);
    } else {
        // Fallback to browser alert if modal system isn't ready
        alert(message);
    }
};

export const showGlobalConfirm = (message, onConfirm, onCancel = null) => {
    if (globalShowConfirm) {
        globalShowConfirm(message, onConfirm, onCancel);
    } else {
        // Fallback to browser confirm if modal system isn't ready
        const result = confirm(message);
        if (result && onConfirm) onConfirm();
        else if (!result && onCancel) onCancel();
    }
};

export const ModalProvider = ({ children }) => {
    const [alertModal, setAlertModal] = useState({ open: false, message: '', type: 'info' });
    const [confirmModal, setConfirmModal] = useState({ open: false, message: '', onConfirm: null, onCancel: null });

    // Custom Alert Helper
    const showAlert = (message, type = 'info') => {
        setAlertModal({ open: true, message, type });
    };

    // Custom Confirm Helper
    const showConfirm = (message, onConfirm, onCancel = null) => {
        setConfirmModal({ open: true, message, onConfirm, onCancel });
    };

    // Close modals
    const closeAlert = () => setAlertModal({ open: false, message: '', type: 'info' });
    const closeConfirm = () => setConfirmModal({ open: false, message: '', onConfirm: null, onCancel: null });

    // Set global references for use outside React components
    globalShowAlert = showAlert;
    globalShowConfirm = showConfirm;

    return (
        <ModalContext.Provider value={{ showAlert, showConfirm }}>
            {children}

            {/* Custom Alert Modal */}
            <Modal
                open={alertModal.open}
                onClose={closeAlert}
                BackdropComponent={Backdrop}
                BackdropProps={{
                    sx: {
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        backdropFilter: 'blur(2px)'
                    }
                }}
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    minWidth: { xs: 280, sm: 400 },
                    maxWidth: { xs: '90vw', sm: 500 },
                    bgcolor: 'white',
                    border: '2px solid #000000',
                    borderRadius: 2,
                    p: 3,
                    outline: 'none'
                }}>
                    <Typography variant="h6" sx={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontWeight: 700,
                        fontSize: '1rem',
                        color: alertModal.type === 'error' ? '#E74C3C' : 
                               alertModal.type === 'warning' ? '#F39C12' : 
                               alertModal.type === 'success' ? '#2ECC71' : '#3498DB',
                        mb: 2,
                        textTransform: 'uppercase'
                    }}>
                        {alertModal.type === 'error' ? '❌ Error' : 
                         alertModal.type === 'warning' ? '⚠️ Warning' : 
                         alertModal.type === 'success' ? '✅ Success' : 'ℹ️ Info'}
                    </Typography>
                    <Typography sx={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: '0.9rem',
                        lineHeight: 1.5,
                        whiteSpace: 'pre-line',
                        mb: 3
                    }}>
                        {alertModal.message}
                    </Typography>
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={closeAlert}
                        sx={{
                            backgroundColor: '#FF6B35',
                            color: 'white',
                            fontFamily: '"JetBrains Mono", monospace',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            border: '1px solid #000000',
                            borderRadius: 1,
                            '&:hover': {
                                backgroundColor: '#E55A2B'
                            }
                        }}
                    >
                        OK
                    </Button>
                </Box>
            </Modal>

            {/* Custom Confirm Modal */}
            <Modal
                open={confirmModal.open}
                onClose={closeConfirm}
                BackdropComponent={Backdrop}
                BackdropProps={{
                    sx: {
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        backdropFilter: 'blur(2px)'
                    }
                }}
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    minWidth: { xs: 280, sm: 400 },
                    maxWidth: { xs: '90vw', sm: 500 },
                    bgcolor: 'white',
                    border: '2px solid #000000',
                    borderRadius: 2,
                    p: 3,
                    outline: 'none'
                }}>
                    <Typography variant="h6" sx={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontWeight: 700,
                        fontSize: '1rem',
                        color: '#FF6B35',
                        mb: 2,
                        textTransform: 'uppercase'
                    }}>
                        🤔 Confirm Action
                    </Typography>
                    <Typography sx={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: '0.9rem',
                        lineHeight: 1.5,
                        whiteSpace: 'pre-line',
                        mb: 3
                    }}>
                        {confirmModal.message}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => {
                                closeConfirm();
                                if (confirmModal.onCancel) confirmModal.onCancel();
                            }}
                            sx={{
                                backgroundColor: '#4ECDC4',
                                color: '#000000',
                                fontFamily: '"JetBrains Mono", monospace',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                border: '1px solid #000000',
                                borderRadius: 1,
                                '&:hover': {
                                    backgroundColor: '#42B8B0'
                                }
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={() => {
                                closeConfirm();
                                if (confirmModal.onConfirm) confirmModal.onConfirm();
                            }}
                            sx={{
                                backgroundColor: '#E74C3C',
                                color: 'white',
                                fontFamily: '"JetBrains Mono", monospace',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                border: '1px solid #000000',
                                borderRadius: 1,
                                '&:hover': {
                                    backgroundColor: '#C0392B'
                                }
                            }}
                        >
                            Confirm
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </ModalContext.Provider>
    );
}; 