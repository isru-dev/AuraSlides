import { useEffect, useState ,useRef} from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading");
  const hasVerified = useRef(false);

  useEffect(() => {
    if (hasVerified.current) return;

    hasVerified.current = true;
    verifyEmail();
  }, [token]);
  const verifyEmail = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/verify/${token}`
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus("success");

        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center">
      <div className="bg-[#0B1220] rounded-2xl p-8 border border-white/10 text-center w-[420px]">
        {status === "loading" && (
          <>
            <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-white text-xl font-bold">
              Verifying your email...
            </h2>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-6xl mb-4">✅</div>

            <h2 className="text-2xl font-bold text-green-400">
              Email Verified
            </h2>

            <p className="text-slate-400 mt-3">
              Your account has been verified.
            </p>

            <p className="text-slate-500 text-sm mt-2">
              Redirecting to login...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-6xl mb-4">❌</div>

            <h2 className="text-2xl font-bold text-red-400">
              Verification Failed
            </h2>

            <p className="text-slate-400 mt-3">
              This verification link is invalid or has expired.
            </p>

            <button
              onClick={() => navigate("/login")}
              className="mt-6 px-5 py-2 rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] text-white"
            >
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}