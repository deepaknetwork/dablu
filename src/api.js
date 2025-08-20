import axios from 'axios';

const url = "https://dablu-rest-api.onrender.com";
// const url = "http://localhost:5000";

// Create axios instance
const api = axios.create({
  baseURL: url,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor to handle unauthorized responses
api.interceptors.response.use(
  (response) => {
    // Return successful responses as-is
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized responses
    if (error.response && error.response.status === 401) {
      // Clear user data from localStorage
      localStorage.removeItem("Dablu.userID");
      
      // Show user a message
      alert("Your session has expired. Please login again.");
      
      // Redirect to login page
      window.location.href = '/';
      
      // Return a resolved promise to prevent further error handling
      return Promise.resolve({ data: null, status: 401 });
    }
    
    // For other errors, return the original error
    return Promise.reject(error);
  }
);

// Export both the URL and the configured axios instance
export default url;
export { api };