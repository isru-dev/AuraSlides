import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BarChart3, Zap, ArrowLeft, LogOut } from "lucide-react";

export function Profile() {
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [presentationCount, setPresentationCount] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("userToken");

    if (!token) {
      setUserLoading(false);
      navigate("/login");
      return;
    }

    // 1. Fetch User Data
    fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUser(data.user);
        }
      })
      .catch((err) => console.error("User fetch error:", err));

    // 2. Fetch Presentation Count
    fetch(`${import.meta.env.VITE_API_URL}/api/presentation`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPresentationCount(data.length);
        } else if (data?.success && Array.isArray(data?.presentations)) {
          setPresentationCount(data.presentations.length);
        } else if (Array.isArray(data?.presentations)) {
          setPresentationCount(data.presentations.length);
        }
      })
      .catch((err) => {
        console.error("Presentation fetch error:", err);
        setPresentationCount(0);
      })
      .finally(() => setUserLoading(false));
  }, [navigate]); // 👈 Correctly closing the useEffect hook

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    setUser(null);
    navigate("/login");
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-[#050816] text-[#F8FAFC] px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            to="/chat"
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition cursor-pointer"
          >
            <ArrowLeft size={16} /> Back to Editor
          </Link>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/20">
            Account Workspace
          </span>
        </div>

        {/* User Card */}
        <div className="bg-[#0B1220]/60 border border-white/10 backdrop-blur-xl rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#06B6D4] to-[#8B5CF6] flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-[#06B6D4]/20 border-2 border-white/10">
              {getInitials(user?.name)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {userLoading ? "Loading..." : user?.name || "User"}
              </h1>
              <p className="text-sm text-slate-400">{user?.email || "—"}</p>
              <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-slate-400 font-medium">Free Tier</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-sm font-semibold hover:bg-red-500/20 active:scale-95 transition cursor-pointer"
          >
            <LogOut size={16} /> Log Out
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#0B1220]/40 border border-white/5 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Decks Created
              </p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {userLoading ? "..." : presentationCount}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#06B6D4]/10 border border-[#06B6D4]/20 text-[#06B6D4] flex items-center justify-center">
              <BarChart3 size={22} />
            </div>
          </div>

          <div className="bg-[#0B1220]/40 border border-white/5 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Export Format
              </p>
              <h3 className="text-2xl font-bold text-white mt-1">
                PowerPoint (.pptx)
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 text-[#8B5CF6] flex items-center justify-center">
              <Zap size={22} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}