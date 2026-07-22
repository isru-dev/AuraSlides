import { useState, useEffect } from "react";

export function Chat() {
  const [history, setHistory] = useState([]);
  const [promptInput, setPromptInput] = useState("");
  const [selectedPresentation, setSelectedPresentation] = useState(null);
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true); // ← Add loading state

  const handlePromptSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("userToken");

    try {
      // Step 1: Call AI to generate slides
      console.log("Generating slides from prompt...");
      const aiResponse = await fetch("http://localhost:5000/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptInput }),
      });

      const aiData = await aiResponse.json();

      if (!aiData.success) {
        alert("Failed to generate slides: " + aiData.message);
        return;
      }

      // Step 2: Parse AI response (it returns JSON as string)
      let generatedSlides = [];
      try {
        const parsedAI = JSON.parse(aiData.result);
        generatedSlides = parsedAI.slides || [];
        console.log("Generated slides:", generatedSlides);
      } catch (parseErr) {
        console.error("Failed to parse AI response:", parseErr);
        alert("Failed to parse AI response");
        return;
      }

      // Step 3: Create presentation with generated slides
      const presentationResponse = await fetch(
        "http://localhost:5000/api/presentation",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: promptInput,
            prompt: promptInput,
            slides: generatedSlides, // ✅ Now with real slides!
            themeColor: "#06B6D4",
          }),
        },
      );

      const presentationData = await presentationResponse.json();

      if (presentationData.success) {
        // Add the new presentation to the top of the sidebar
        setHistory((prev) => [presentationData.presentation, ...prev]);

        // Auto-select the new presentation to display it
        setSelectedPresentation(presentationData.presentation);

        // Clear the textarea
        setPromptInput("");
      } else {
        alert(presentationData.message);
      }
    } catch (err) {
      console.error("Error:", err);
      alert("An error occurred: " + err.message);
    }
  };
  const handlePresentationClick = async (id) => {
    const token = localStorage.getItem("userToken");

    const response = await fetch(
      `http://localhost:5000/api/presentation/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await response.json();

    if (data.success) {
      setSelectedPresentation(data.presentation);
    }
  };
  const [sidebarOpen, setSidebarOpen] = useState(false);
  function handlemenu() {
    setSidebarOpen(true);
  }
  function closeMenu() {
    setSidebarOpen(false);
  }
  useEffect(() => {
    const token = localStorage.getItem("userToken");

    fetch("http://localhost:5000/api/presentation", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setHistory(data.presentations);
        } else {
          console.log(data.message);
        }
      })
      .catch((err) => console.log(err));
  }, []);
  useEffect(() => {
    const token = localStorage.getItem("userToken");

    // Check if token exists
    if (!token) {
      setUserLoading(false);
      return; // Don't fetch if no token
    }

    fetch("http://localhost:5000/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          console.log("User data received:", data); // ← Add this line

          setUser(data.user); // ← Only set if successful
        } else {
          console.error("Failed to fetch user:", data.message);
          // Optionally redirect to login if unauthorized
        }
      })
      .catch((err) => {
        console.error("User fetch error:", err);
      })
      .finally(() => {
        setUserLoading(false); // ← Stop loading regardless
      });
  }, []);
  return (
    <div className="min-h-screen bg-[#050816] text-[#F8FAFC] flex font-sans select-none overflow-hidden">
      <aside className="w-64 border-r border-[rgba(255,255,255,0.06)] bg-[#0B1220]/30 backdrop-blur-xl hidden md:flex flex-col p-4 justify-between">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2 px-2">
            <span className="bg-gradient-to-r from-[#67E8F9] via-[#A78BFA] to-[#C084FC] bg-clip-text text-transparent font-bold tracking-tight text-lg">
              AuraSlides
            </span>
            <span className="text-[10px] bg-[#67E8F9]/10 text-[#67E8F9] font-medium px-1.5 py-0.5 rounded-md uppercase tracking-wider">
              v1.0
            </span>
          </div>

          <button className="w-full bg-[#111827]/40 text-[#F8FAFC] border border-[rgba(255,255,255,0.06)] rounded-xl py-2.5 px-4 text-xs font-semibold hover:bg-[#111827]/80 hover:border-[#67E8F9]/30 transition-all cursor-pointer flex items-center justify-center gap-2">
            <span className="text-base text-[#67E8F9]">+</span> New Presentation
          </button>

          <div className="flex flex-col gap-2">
            <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-widest px-2 mb-1">
              Recent Decks
            </span>
            <div className="flex flex-col gap-1 overflow-y-auto max-h-[50vh] pr-1 custom-scrollbar">
              {history.map((item) => (
                <button
                  key={item._id}
                  onClick={() => {
                    handlePresentationClick(item._id);
                    closeMenu();
                  }}
                  className="w-full text-left py-2.5 px-3 rounded-xl text-xs text-[#CBD5E1] hover:bg-[#111827]/60 hover:text-[#F8FAFC] transition-all cursor-pointer truncate flex items-center gap-2.5 group"
                >
                  <span className="text-[#F8FAFC] group-hover:text-[#A78BFA] transition-colors">
                    💬
                  </span>
                  <span className="truncate">{item.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-[rgba(255,255,255,0.06)] pt-4 flex items-center justify-between px-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#06B6D4] to-[#8B5CF6] flex items-center justify-center text-xs font-bold text-white shadow-md shadow-[#06B6D4]/10 flex-shrink-0">
              {/* Generate initials from user's name */}
              {user?.name
                ? user.name
                    .split(" ")
                    .map((word) => word[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)
                : "U"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-[#F8FAFC] truncate">
                {userLoading ? "Loading..." : user?.name || "Guest"}
              </span>
              <span className="text-[10px] text-[#94A3B8] truncate">
                {user?.email || ""}
              </span>
            </div>
          </div>
          <button className="text-xs text-[#94A3B8] hover:text-[#F8FAFC] transition-colors p-1 cursor-pointer">
            ⚙️
          </button>
        </div>
      </aside>
      {sidebarOpen && <div className="fixed inset-0 bg-black/70 z-40"></div>}
      <aside
        className={`
    fixed top-0 left-0 h-screen w-64
    bg-[#0B1220]
    border-r border-[rgba(255,255,255,0.06)]
    z-50
    transform transition-transform duration-300
    md:hidden flex flex-col gap-4 justify-between
    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
  `}
      >
        <div>
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <span className="font-bold">AuraSlides</span>

            <button onClick={closeMenu} className="text-xl cursor-pointer">
              ✕
            </button>
          </div>
          <button className="w-full bg-[#111827]/40 text-[#F8FAFC] border border-[rgba(255,255,255,0.06)] rounded-xl py-2.5 px-4 text-xs font-semibold hover:bg-[#111827]/80 hover:border-[#67E8F9]/30 transition-all cursor-pointer flex items-center justify-center gap-2">
            <span className="text-base text-[#67E8F9]">+</span> New Presentation
          </button>
          <div className="flex flex-col gap-2">
            <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-widest px-2 mb-1">
              Recent Decks
            </span>
            <div className="flex flex-col gap-1 overflow-y-auto max-h-[50vh] pr-1 custom-scrollbar">
              {history.map((item) => (
                <button
                  key={item._id}
                  onClick={closeMenu}
                  className="w-full text-left py-2.5 px-3 rounded-xl text-xs text-[#CBD5E1] hover:bg-[#111827]/60 hover:text-[#F8FAFC] transition-all cursor-pointer truncate flex items-center gap-2.5 group"
                >
                  <span className="text-[#F8FAFC] group-hover:text-[#A78BFA] transition-colors">
                    💬
                  </span>
                  <span className="truncate">{item.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="pb-4">
          <div className="border-t border-[rgba(255,255,255,0.06)] pt-4 flex items-center justify-between px-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#06B6D4] to-[#8B5CF6] flex items-center justify-center text-xs font-bold text-white shadow-md shadow-[#06B6D4]/10 flex-shrink-0">
                IG
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium text-[#F8FAFC] truncate">
                  Israel Gezahegn
                </span>
                <span className="text-[10px] text-[#94A3B8] truncate">
                  Premium Member
                </span>
              </div>
            </div>
            <button className="text-xs text-[#94A3B8] hover:text-[#F8FAFC] transition-colors p-1 cursor-pointer">
              ⚙️
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 flex flex-col justify-between items-center px-6 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[30%] w-[500px] h-[500px] bg-[#8B5CF6]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[20%] w-[400px] h-[400px] bg-[#06B6D4]/5 rounded-full blur-[100px] pointer-events-none" />

        <header className="w-full h-16 flex items-center justify-between md:hidden border-b border-[rgba(255,255,255,0.04)] px-2 z-10">
          <span className="bg-gradient-to-r from-[#67E8F9] via-[#A78BFA] to-[#C084FC] bg-clip-text text-transparent font-bold tracking-tight text-lg">
            AuraSlides
          </span>
          <button
            className="text-xl text-[#CBD5E1] p-1 cursor-pointer"
            onClick={handlemenu}
          >
            ☰
          </button>
        </header>

        <div className="hidden md:block h-16" />
        {selectedPresentation && (
          <div className="w-full max-w-4xl z-10">
            <div className="bg-[#0B1220]/60 border border-[rgba(255,255,255,0.06)] backdrop-blur-xl rounded-2xl p-8">
              {/* Presentation Title */}
              <h1 className="text-3xl font-bold text-[#F8FAFC] mb-2">
                {selectedPresentation.title}
              </h1>

              {/* Display Slides */}
              <div className="space-y-6">
                {selectedPresentation.slides &&
                selectedPresentation.slides.length > 0 ? (
                  selectedPresentation.slides.map((slide, index) => (
                    <div
                      key={index}
                      className="bg-[#111827]/60 border border-[rgba(255,255,255,0.06)] rounded-xl p-6 hover:border-[#06B6D4]/30 transition-all"
                    >
                      {/* Slide Title */}
                      <h2 className="text-xl font-bold text-[#67E8F9] mb-4">
                        Slide {slide.slideNumber}: {slide.title}
                      </h2>
                      {/* Slide Content */}
                      <ul className="space-y-2">
                        {slide.content &&
                          slide.content.map((point, idx) => (
                            <li
                              key={idx}
                              className="text-[#CBD5E1] flex items-start gap-3"
                            >
                              <span className="text-[#06B6D4] mt-1">•</span>
                              <span>{point}</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  ))
                ) : (
                  <p className="text-[#94A3B8]">No slides generated yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Hide this when slides are displayed */}
        {!selectedPresentation && (
          <div className="w-full max-w-2xl flex flex-col items-center text-center gap-4 my-auto z-10">
            <div className="mb-2 px-3 py-1 rounded-full bg-[#111827]/60 border border-[rgba(255,255,255,0.06)] text-[11px] text-[#67E8F9] font-medium tracking-wide shadow-sm animate-pulse">
              ✨ Engine Status: Operational
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F8FAFC] tracking-tight leading-tight">
              What are we presenting
              <br />
              <span className="bg-gradient-to-r from-[#67E8F9] via-[#A78BFA] to-[#C084FC] bg-clip-text text-transparent">
                today?
              </span>
            </h2>
            <p className="text-[#94A3B8] text-sm max-w-md leading-relaxed mt-1">
              Input a concept, text snippet, or architecture topic, and let Aura
              generate structured, export-ready slides in seconds.
            </p>
          </div>
        )}

        <div className="w-full max-w-2xl pb-8 sm:pb-12 z-10  mt-[40px]">
          <form
            onSubmit={handlePromptSubmit}
            className="w-full bg-[#0B1220]/60 border border-[rgba(255,255,255,0.06)] backdrop-blur-2xl rounded-2xl p-2.5 shadow-[0_30px_60px_rgba(0,0,0,0.5)] flex flex-col gap-2.5 focus-within:border-[#06B6D4]/40 focus-within:ring-1 focus-within:ring-[#06B6D4]/10 transition-all duration-300"
          >
            <textarea
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              rows={3}
              placeholder="Structure a 5-slide presentation on Computer Architecture layers and processing targets..."
              className="w-full bg-transparent border-none text-sm text-[#F8FAFC] placeholder-[#94A3B8]/30 px-3 pt-2 resize-none focus:outline-none leading-relaxed"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handlePromptSubmit(e);
                }
              }}
            />

            <div className="flex items-center justify-between border-t border-[rgba(255,255,255,0.04)] pt-2.5 px-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-[#94A3B8] font-medium bg-[#111827]/80 border border-[rgba(255,255,255,0.04)] rounded-lg px-2.5 py-1">
                  💡 Tip: Be descriptive
                </span>
              </div>

              <button
                type="submit"
                className={`py-2 px-4 rounded-xl font-medium text-xs text-white shadow-md flex items-center gap-1.5 transition-all duration-300 cursor-pointer ${
                  promptInput.trim()
                    ? "bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] hover:opacity-90 shadow-[0_0_15px_rgba(6,182,212,0.25)] hover:scale-[1.02]"
                    : "bg-white/[0.04] text-[#94A3B8]/40 border border-white/[0.02] cursor-not-allowed"
                }`}
                disabled={!promptInput.trim()}
              >
                Generate Slides ➔
              </button>
            </div>
          </form>

          <div className="text-center text-[10px] text-[#94A3B8]/40 mt-3 tracking-wide">
            AuraSlides uses deep learning layers. Review generated files for
            precise structural metrics.
          </div>
        </div>
      </main>
    </div>
  );
}
