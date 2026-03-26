import React, { useState } from "react";
import axios from "axios";
import {
  Button,
  TextField,
  Dialog,
  DialogContent,
  IconButton,
  Box,
  Avatar,
  Snackbar,
  ThemeProvider,
  createTheme,
  CircularProgress // IMPORT SPINNER
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom"; // IMPORT NAVIGATE
import server from "../environment"; 
import "../App.css"; 

const defaultTheme = createTheme();

export default function Authentication({ open, handleClose }) {
  const navigate = useNavigate(); // HOOK FOR FAST NAVIGATION

  const [formState, setFormState] = useState(0);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  
  // NEW: LOADING STATE
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const API_URL = `${server}/api/v1/users`; 

  const handleAuth = async () => {
    try {
      setLoading(true); // START LOADING
      setError("");

      if (formState === 0) {
        // --- LOGIN ---
        const response = await axios.post(`${API_URL}/login`, {
          username,
          password
        });
        localStorage.setItem("token", response.data.token);
        
        handleClose();
        
        // SPEED FIX: Use navigate instead of window.location
        navigate("/home"); 
      } else {
        // --- REGISTER ---
        const response = await axios.post(`${API_URL}/register`, {
          name,
          username,
          password
        });
        setMessage(response.data.message || "Registration Successful!");
        setSnackbarOpen(true);
        setFormState(0);
        setError("");
        setPassword("");
      }
    } catch (err) {
      console.error("Auth Error:", err);
      const errMsg = err.response?.data?.message || "Something went wrong. Check network.";
      setError(errMsg);
    } finally {
      setLoading(false); // STOP LOADING
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        slotProps={{
            backdrop: {
                sx: {
                    backdropFilter: "blur(5px)", 
                    backgroundColor: "rgba(0, 0, 0, 0.4)", 
                },
            },
        }}
        PaperProps={{
          sx: {
            backgroundColor: "rgba(255, 255, 255, 0.15)", 
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "16px",
            boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
            color: "white", 
          },
        }}
      >
        <IconButton
          onClick={handleClose}
          sx={{ position: "absolute", right: 8, top: 8, color: "white" }}
        >
          <CloseIcon />
        </IconButton>

        <DialogContent sx={{ pt: 4, pb: 4 }}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            
            <Avatar sx={{ m: 1, bgcolor: "#1976d2" }}>
              <LockOutlinedIcon />
            </Avatar>

            <Box sx={{ mb: 2 }}>
              <Button
                onClick={() => { setFormState(0); setError(""); }}
                sx={{ color: formState === 0 ? "white" : "#b0bec5", fontWeight: "bold" }}
              >
                Sign In
              </Button>
              <Button
                onClick={() => { setFormState(1); setError(""); }}
                sx={{ color: formState === 1 ? "white" : "#b0bec5", fontWeight: "bold" }}
              >
                Sign Up
              </Button>
            </Box>

            <Box component="form" noValidate sx={{ width: "100%" }}>
              {formState === 1 && (
                <TextField
                  className="authInput"
                  margin="normal"
                  required
                  fullWidth
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              )}

              <TextField
                className="authInput"
                margin="normal"
                required
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <TextField
                className="authInput"
                margin="normal"
                required
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <p style={{ color: "#ff4d4d", textAlign: "center", marginTop: "10px" }}>
                {error}
              </p>

              <Button
                className="authButton"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, height: '50px', fontSize: '1rem' }}
                onClick={handleAuth}
                disabled={loading} // Disable button while loading
              >
                {/* SHOW SPINNER OR TEXT */}
                {loading ? (
                  <CircularProgress size={24} sx={{ color: "white" }} />
                ) : (
                  formState === 0 ? "LOGIN" : "REGISTER"
                )}
              </Button>

            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        message={message}
        onClose={() => setSnackbarOpen(false)}
      />
    </ThemeProvider>
  );
}