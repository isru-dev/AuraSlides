import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Home } from "./pages/Home";
import { Register } from "./pages/Register";
import { Login } from "./pages/Login";
import { Chat } from "./pages/Chat";
import { ProtectedRoute } from "./components/ProtectedRoute"; 


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route path="/chat" element={
          <ProtectedRoute>
              <Chat />
            </ProtectedRoute> }
          />
      </Routes>
    </BrowserRouter>
  );
}