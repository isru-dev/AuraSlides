import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Home } from "./pages/Home";
import { Register } from "./pages/Register";
import { Login } from "./pages/Login";
import { Chat } from "./pages/Chat";
import { ProtectedRoute } from "./components/ProtectedRoute"; 
import { Profile } from "./pages/Profile";
import {Toaster} from 'react-hot-toast'
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path='/profile'
            element={
              <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
           }
         />
        <Route path="/chat" element={
          <ProtectedRoute>
              <Chat />
            </ProtectedRoute> }
          />
      </Routes>
      <Toaster position="top-center" reverseOrder={false} />

    </BrowserRouter>

  );
}