import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function Profile() {
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("userToken");

    if (!token) {
      setUserLoading(false);
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUser(data.user);
        } else {
          console.error("Failed to fetch user:", data.message);
        }
      })
      .catch((err) => {
        console.error("User fetch error:", err);
      })
      .finally(() => {
        setUserLoading(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userToken");
     setUser(null);
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050816] text-[#F8FAFC] px-6">
      <div className="w-full max-w-md bg-[#0B1220]/60 border border-[rgba(255,255,255,0.06)] backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex flex-col items-center p-8 sm:p-10 gap-4">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#06B6D4] to-[#8B5CF6] flex items-center justify-center text-2xl font-bold text-white shadow-md shadow-[#06B6D4]/10">
          {user?.name
            ? user.name
                .split(" ")
                .map((word) => word[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)
            : "U"}
        </div>

        <h2 className="text-xl font-bold text-[#F8FAFC]">
          {userLoading ? "Loading..." : user?.name || "Guest"}
        </h2>

        <p className="text-sm text-[#94A3B8]">{user?.email || ""}</p>

        <div className="w-full flex flex-col gap-3 mt-4">
          <button
            onClick={() => navigate("/chat")}
            className="w-full bg-[#111827]/60 text-[#F8FAFC] border border-[rgba(255,255,255,0.06)] rounded-xl py-2.5 px-4 text-sm font-semibold hover:bg-[#111827] hover:border-[#67E8F9]/30 transition-all cursor-pointer"
          >
            ← Back to Chat
          </button>

          <button
            onClick={handleLogout}
            className="w-full bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl py-2.5 px-4 text-sm font-semibold hover:bg-red-500/20 transition-all cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}