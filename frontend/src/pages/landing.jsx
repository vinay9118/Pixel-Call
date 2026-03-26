import React, { useState } from 'react';
import "../App.css";
import { useNavigate } from 'react-router-dom';
import Authentication from './authentication'; 
import { TextField, Button, Box, Snackbar, Alert } from '@mui/material'; 

export default function LandingPage() {
    const router = useNavigate();

    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [meetingCode, setMeetingCode] = useState("");
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleCreateRandomRoom = () => {
        const randomID = Math.random().toString(36).substring(2, 8);
        router(`/${randomID}`);
    };

    const handleJoinWithCode = () => {
        if (meetingCode.length < 6) {
            setErrorMsg("Meeting code must be at least 6 characters long.");
            setOpenSnackbar(true);
            return;
        }
        router(`/${meetingCode}`);
    };

    return (
        <div className='landingPageContainer'>
            <nav>
                <div className='navHeader' onClick={() => router("/")}>
                    <h2>Pixel Call</h2>
                </div>
                <div className='navlist'>
                    <p onClick={handleCreateRandomRoom}>Join as Guest</p>
                    <p onClick={() => setIsAuthOpen(true)}>Register</p>
                    <div onClick={() => setIsAuthOpen(true)} role='button'>
                        <p>Login</p>
                    </div>
                </div>
            </nav>

            <div className="landingMainContainer">
                <div>
                    <h1><span style={{ color: "#FF9839" }}>Connect</span> with your loved Ones</h1>
                    <p>Cover a distance by Pixel Call</p>
                    
                    {/* --- FIX: Added Margin Bottom (mb) for Mobile --- */}
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 2, 
                        mt: 3, 
                        maxWidth: '400px',
                        // Adds 64px space at the bottom ONLY on mobile devices
                        mb: { xs: 8, md: 0 } 
                    }}>
                        
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <TextField 
                                placeholder="Enter meeting Code"
                                variant="outlined"
                                value={meetingCode}
                                onChange={(e) => setMeetingCode(e.target.value)}
                                sx={{ 
                                    backgroundColor: 'white', 
                                    borderRadius: '5px',
                                    input: { color: 'black' }
                                }}
                                size="small"
                            />
                            
                            <Button 
                                variant="contained" 
                                onClick={handleJoinWithCode}
                                sx={{ 
                                    backgroundColor: '#FF9839', 
                                    color: 'white',
                                    fontWeight: 'bold',
                                    '&:hover': { backgroundColor: '#e08630' }
                                }}
                            >
                                Join
                            </Button>
                        </Box>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white' }}>
                            <hr style={{ flex: 1, borderColor: '#555' }} /> 
                            <span>OR</span> 
                            <hr style={{ flex: 1, borderColor: '#555' }} />
                        </div>

                        <Button 
                            variant="outlined" 
                            onClick={handleCreateRandomRoom}
                            sx={{ 
                                color: '#FF9839', 
                                borderColor: '#FF9839',
                                fontWeight: 'bold',
                                '&:hover': { borderColor: '#e08630', backgroundColor: 'rgba(255, 152, 57, 0.1)' }
                            }}
                        >
                            Create New Room
                        </Button>
                    </Box>

                </div>
                <div>
                    <img src="/mobile.png" alt="Mobile View" />
                </div>
            </div>

            <Authentication 
                open={isAuthOpen} 
                handleClose={() => setIsAuthOpen(false)} 
            />

            <Snackbar 
                open={openSnackbar} 
                autoHideDuration={4000} 
                onClose={() => setOpenSnackbar(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={() => setOpenSnackbar(false)} 
                    severity="error" 
                    sx={{ width: '100%', fontWeight: 'bold' }}
                    variant="filled"
                >
                    {errorMsg}
                </Alert>
            </Snackbar>
        </div>
    );
}