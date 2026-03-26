import React, { useContext, useState } from 'react';
import withAuth from '../utils/withAuth';
import { useNavigate } from 'react-router-dom';
import "../App.css";
import { Button, IconButton, TextField, Snackbar, Alert } from '@mui/material'; // Import Snackbar & Alert
import RestoreIcon from '@mui/icons-material/Restore';
import LogoutIcon from '@mui/icons-material/Logout';
import { AuthContext } from '../contexts/AuthContext';

function HomeComponent() {
    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");
    
    // --- 1. NEW STATE FOR SNACKBAR (POPUP) ---
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const { addToUserHistory } = useContext(AuthContext);

    let handleJoinVideoCall = async () => {
        // --- 2. VALIDATION LOGIC ---
        if (meetingCode.length < 6) {
            // Instead of alert(), we show the Snackbar
            setErrorMsg("Meeting code must be at least 6 characters long.");
            setOpenSnackbar(true);
            return;
        }
        await addToUserHistory(meetingCode);
        navigate(`/${meetingCode}`);
    }

    return (
        <>
            <div className="navBar">
                <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => navigate("/")}>
                    <h2>Pixel Call</h2>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                    <div 
                        onClick={() => navigate("/history")}
                        style={{ display: "flex", alignItems: "center", cursor: "pointer", gap: "5px", color: "white" }}
                    >
                        <IconButton onClick={() => navigate("/history")} sx={{ color: "white", padding: 0 }}>
                            <RestoreIcon />
                        </IconButton>
                        <p style={{ margin: 0, fontWeight: 500 }}>History</p>
                    </div>

                    <Button 
                        onClick={() => {
                            localStorage.removeItem("token");
                            navigate("/");
                        }}
                        sx={{ 
                            color: "#FF9839", 
                            fontWeight: "bold", 
                            textTransform: "none",
                            display: "flex",
                            gap: "5px"
                        }}
                    >
                        Logout
                        <LogoutIcon fontSize="small" />
                    </Button>
                </div>
            </div>

            <div className="meetContainer">
                <div className="leftPanel">
                    <div>
                        <h2>Providing Quality Video Call Just Like Quality Education</h2>

                        <div style={{ display: 'flex', gap: "10px" }} className='inputSection'>
                            <TextField 
                                onChange={e => setMeetingCode(e.target.value)} 
                                id="outlined-basic" 
                                label="Meeting Code" 
                                variant="outlined" 
                                placeholder="Enter meeting code"
                                sx={{ backgroundColor: "white", borderRadius: "5px" }}
                            />
                            <Button onClick={handleJoinVideoCall} variant='contained'>Create/Join</Button>
                        </div>
                    </div>
                </div>
                <div className='rightPanel'>
                    <img src='/logo3.png' alt="Logo" />
                </div>
            </div>

            {/* --- 3. SNACKBAR COMPONENT (The better "Alert") --- */}
            <Snackbar 
                open={openSnackbar} 
                autoHideDuration={4000} 
                onClose={() => setOpenSnackbar(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} // Shows at bottom-center
            >
                <Alert 
                    onClose={() => setOpenSnackbar(false)} 
                    severity="error" // Makes it Red
                    sx={{ width: '100%', fontWeight: 'bold' }}
                    variant="filled"
                >
                    {errorMsg}
                </Alert>
            </Snackbar>
        </>
    )
}

export default withAuth(HomeComponent);