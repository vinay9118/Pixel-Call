import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { IconButton, Box, Snackbar, Divider, Paper, Button } from '@mui/material';
import "../App.css"; 

export default function History() {
    const { getHistoryOfUser } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState("");

    const routeTo = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser();
                setMeetings(history.reverse());
            } catch (err) {
                setSnackbarMsg("Failed to load history.");
                setSnackbarOpen(true);
            }
        }
        fetchHistory();
    }, [getHistoryOfUser]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    };

    const handleCopy = (code) => {
        navigator.clipboard.writeText(code);
        setSnackbarMsg(`Code ${code} copied!`);
        setSnackbarOpen(true);
    };

    return (
        <div style={{ 
            minHeight: "100vh", 
            backgroundColor: "#202124", 
            display: 'flex', 
            justifyContent: 'center',
            paddingTop: '40px', 
            paddingBottom: '40px'
        }}>
            
            {/* --- MAIN GLASS CONTAINER --- */}
            <Paper elevation={0} sx={{ 
                width: '100%', 
                maxWidth: '800px', 
                backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: 'white',
                minHeight: '500px',

                // --- RESPONSIVE FIXES START ---
                // 1. Always keep rounded corners (looks better)
                borderRadius: '24px', 
                
                // 2. Add margin on mobile so it doesn't touch edges
                margin: { xs: '0 16px', sm: '0 20px' }, 
                
                // 3. Adjust padding inside the card
                padding: { xs: '20px', sm: '30px' },
                // --- RESPONSIVE FIXES END ---
            }}>
                
                {/* HEADER */}
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 4,
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 2, sm: 0 },
                    textAlign: { xs: 'center', sm: 'left' }
                }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', letterSpacing: '1px', fontSize: { xs: '1.8rem', sm: '2.125rem'} }}>
                            Your Activity
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#aaa', mt: 0.5 }}>
                            Look back at your recent connections.
                        </Typography>
                    </Box>
                    <Button 
                        startIcon={<HomeIcon />} 
                        onClick={() => routeTo("/home")}
                        sx={{ 
                            width: { xs: '100%', sm: 'auto' },
                            color: 'white', 
                            borderColor: 'rgba(255,255,255,0.2)', 
                            borderRadius: '12px',
                            padding: '8px 16px',
                            '&:hover': { borderColor: '#1976d2', backgroundColor: 'rgba(25, 118, 210, 0.1)' }
                        }}
                        variant="outlined"
                    >
                        Back Home
                    </Button>
                </Box>

                <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.1)', mb: 2 }} />

                {/* --- HISTORY LIST --- */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    
                    {meetings.length !== 0 ? (
                        meetings.map((e, i) => (
                            <Box 
                                key={i}
                                sx={{
                                    display: 'flex',
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    alignItems: { xs: 'flex-start', sm: 'center' },
                                    justifyContent: 'space-between',
                                    padding: '20px',
                                    gap: { xs: 2, sm: 0 },
                                    borderRadius: '16px',
                                    backgroundColor: 'rgba(0,0,0,0.2)',
                                    border: '1px solid transparent',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                        border: '1px solid rgba(25, 118, 210, 0.3)',
                                        transform: { sm: 'translateX(5px)' }
                                    }
                                }}
                            >
                                {/* LEFT: Date & Icon */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                    <Box sx={{ 
                                        minWidth: '50px', 
                                        height: '50px', 
                                        borderRadius: '12px', 
                                        backgroundColor: '#333', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        color: '#888'
                                    }}>
                                        <CalendarTodayIcon />
                                    </Box>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: '600', fontSize: '1.1rem' }}>
                                            {formatDate(e.date)}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#888' }}>
                                            Joined Video Call
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* RIGHT: Code & Copy Button */}
                                <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 2, 
                                    width: { xs: '100%', sm: 'auto' }, 
                                    justifyContent: { xs: 'space-between', sm: 'flex-end' } 
                                }}>
                                    <Box sx={{ 
                                        backgroundColor: '#111', 
                                        padding: '8px 16px', 
                                        borderRadius: '8px', 
                                        border: '1px solid #333',
                                        fontFamily: 'monospace',
                                        color: '#FF9839',
                                        flexGrow: { xs: 1, sm: 0 }, 
                                        textAlign: 'center'
                                    }}>
                                        {e.meetingCode}
                                    </Box>
                                    <IconButton 
                                        onClick={() => handleCopy(e.meetingCode)}
                                        sx={{ color: '#aaa', '&:hover': { color: 'white' } }}
                                    >
                                        <ContentCopyIcon />
                                    </IconButton>
                                </Box>
                            </Box>
                        ))
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 8, color: '#666' }}>
                            <Typography variant="h6">No history yet</Typography>
                            <Typography variant="body2">Your past meetings will appear here.</Typography>
                        </Box>
                    )}
                </Box>
            </Paper>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={2000}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMsg}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            />
        </div>
    )
}