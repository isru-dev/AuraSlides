import { Navigate } from "react-router-dom";

export function ProtectedRoute({ children }) {
  // Phase 6 & 7: Check the browser's hard drive for the passport string
  const token = localStorage.getItem("userToken");

  // If NO token exists, instantly redirect them to the login track
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If the token EXISTS, render the private page (children) smoothly
  return children;
}
