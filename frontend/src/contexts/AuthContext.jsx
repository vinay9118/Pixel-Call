import axios from "axios";
import httpStatus from "http-status";
import { createContext, useContext, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import server from "../environment";


export const AuthContext = createContext({});

const client = axios.create({
    baseURL: `${server}/api/v1/users`
})


export const AuthProvider = ({ children }) => {

    // const authContext = useContext(AuthContext);
    // const [userData, setUserData] = useState(authContext); 
    const [userData, setUserData] = useState(null);


    const router = useNavigate();

    const handleRegister = async (name, username, password) => {
        try {
            let request = await client.post("/register", {
                name: name,
                username: username,
                password: password
            })


            if (request.status === httpStatus.CREATED) {
                return request.data.message;
            }
        } catch (err) {
            throw err;
        }
    }

    const handleLogin = async (username, password) => {
        try {
            let request = await client.post("/login", {
                username: username,
                password: password
            });

            // console.log(username, password)
            // console.log(request.data)

            if (request.status === httpStatus.OK) {
                localStorage.setItem("token", request.data.token);
                // setUserData(request.data.user);
                router("/home")
            }
        } catch (err) {
            throw err;
        }
    }

    const getHistoryOfUser = async () => {
        try {
            let request = await client.get("/get_all_activity", {
                params: {
                    token: localStorage.getItem("token")
                }
            });
            return request.data
        } catch
         (err) {
            throw err;
        }
    }


    // const addToUserHistory = async (meetingCode) => {
    //     try {
    //         let request = await client.post("/add_to_activity", {
    //             token: localStorage.getItem("token"),
    //             meeting_code: meetingCode
    //         });
    //         return request
    //     } catch (e) {
    //         throw e;
    //     }
    // }

    const addToUserHistory = async (meetingCode) => {
        try {
            // 2. Optimization: Fire and Forget (Optional)
            // We return the promise so the UI *can* wait if it wants to,
            // but usually, for analytics/history, you don't want to block the user.
            const token = localStorage.getItem("token");
            
            // Only make the call if we have a token
            if(token) {
                return await client.post("/add_to_activity", {
                    token: token,
                    meeting_code: meetingCode
                });
            }
        } catch (e) {
            // Silently fail for history logs so it doesn't crash the app
            console.error("Failed to log history", e);
        }
    };


    // const data = {
    //     userData, setUserData, addToUserHistory, getHistoryOfUser, handleRegister, handleLogin
    // }
    // 3. PERFORMANCE FIX: useMemo
    // This ensures 'data' reference only changes when 'userData' changes.
    // This prevents unnecessary re-renders of the entire app tree.
    const data = useMemo(() => ({
        userData,
        setUserData,
        addToUserHistory,
        getHistoryOfUser,
        handleRegister,
        handleLogin
    }), [userData]); // Dependencies

    return (
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    )

}
