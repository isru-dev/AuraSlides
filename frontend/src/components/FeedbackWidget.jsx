import { useState } from "react";
import { MessageSquarePlus, X, Send, CheckCircle2, Bug, Lightbulb, Heart } from "lucide-react";

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState("feature");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // ⚠️ Place your Bot Token & Chat ID here (or in your .env file)
  const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);

    // Format the message with clean Telegram Markdown formatting
    const categoryEmoji = category === "bug" ? "🐛 Bug" : category === "feature" ? "💡 Idea" : "❤️ General";
    
    const telegramText = `
🚀 *New Feedback on AuraSlides!*

*Type:* ${categoryEmoji}
*Message:*
${message}

*User Email:* ${email || "Not provided"}
    `.trim();

    try {
      const response = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: telegramText,
            parse_mode: "Markdown",
          }),
        }
      );

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setIsOpen(false);
          setMessage("");
          setEmail("");
        }, 2000);
      } else {
        console.error("Telegram API Error");
      }
    } catch (error) {
      console.error("Feedback submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-[#0B1220] hover:bg-[#111827] text-white border border-white/10 px-4 py-2.5 rounded-full shadow-lg shadow-black/40 hover:scale-105 active:scale-95 transition cursor-pointer text-sm font-medium"
      >
        <MessageSquarePlus size={18} className="text-[#06B6D4]" />
        <span>Feedback</span>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0B1220] border border-white/10 w-full max-w-md rounded-3xl p-6 shadow-2xl relative text-white">
            
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X size={20} />
            </button>

            {submitted ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 size={48} className="text-emerald-400 mx-auto animate-bounce" />
                <h3 className="text-xl font-bold">Feedback Sent!</h3>
                <p className="text-xs text-slate-400">
                  Thanks for helping improve AuraSlides.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <h3 className="text-lg font-bold">Send us Feedback</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Have an idea or spotted a bug? Let us know!
                  </p>
                </div>

                {/* Category Selection Tabs */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCategory("feature")}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition cursor-pointer gap-1.5 ${
                      category === "feature"
                        ? "bg-[#06B6D4]/10 border-[#06B6D4] text-[#06B6D4]"
                        : "bg-[#111827]/60 border-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Lightbulb size={18} /> Idea
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategory("bug")}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition cursor-pointer gap-1.5 ${
                      category === "bug"
                        ? "bg-red-500/10 border-red-500 text-red-400"
                        : "bg-[#111827]/60 border-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Bug size={18} /> Bug
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategory("general")}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition cursor-pointer gap-1.5 ${
                      category === "general"
                        ? "bg-purple-500/10 border-purple-500 text-purple-400"
                        : "bg-[#111827]/60 border-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Heart size={18} /> Other
                  </button>
                </div>

                {/* Message Input */}
                <div>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what's on your mind..."
                    required
                    className="w-full bg-[#111827]/80 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#06B6D4] transition resize-none"
                  />
                </div>

                {/* Optional Email */}
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email (optional, for follow-ups)"
                    className="w-full bg-[#111827]/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#06B6D4] transition"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !message.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] text-white font-medium py-2.5 rounded-xl text-sm hover:opacity-90 active:scale-95 transition disabled:opacity-50 cursor-pointer"
                >
                  <Send size={16} />
                  {isSubmitting ? "Sending..." : "Submit Feedback"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}