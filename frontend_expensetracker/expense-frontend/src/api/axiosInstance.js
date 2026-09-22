import axios from "axios";

//create custom axios instance so instead of axios.get("http://localhost:8080/users"), axios.post every time 
//just api.get("api/users"), api.post
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: { "Content-Type": "application/json", },
})
//Every request will go through interceptor before going to backend
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token")
    if (token && token.split(".").length === 3) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config;
},
    (error) => Promise.reject(error)
)

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear authentication data 
            localStorage.removeItem("token");
            // Optional: clear other user-related data // 
            localStorage.removeItem("user");
            // // Show popup 
            alert("Your session has expired. Please log in again.");
            //  // Redirect to login page 
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);
export default api;

