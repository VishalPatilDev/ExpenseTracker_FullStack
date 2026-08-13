import axios from "axios";

//create custom axios instance so instead of axios.get("http://localhost:8080/users"), axios.post every time 
//just api.get("api/users"), api.post
const api = axios.create({
    baseURL: "http://localhost:8080"
})
//Every request will go through interceptor before going to backend
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token")
    if (token && token.split(".").length === 3) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config;
})
export default api;

