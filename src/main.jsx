import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// 1. Make sure GoogleOAuthProvider is imported
import { GoogleOAuthProvider } from '@react-oauth/google'; 

// 2. Access the environment variable using Vite syntax
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
console.log("My loaded Client ID is:", clientId); // 👈 Add this line temporarily
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
);
