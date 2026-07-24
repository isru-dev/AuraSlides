import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, MoreVertical, Pencil, Trash2 } from "lucide-react";

export function Chat() {
  const [history, setHistory] = useState([]);
  const [promptInput, setPromptInput] = useState("");
  const [selectedPresentation, setSelectedPresentation] = useState(null);
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();

  function handlemenu() {
    setSidebarOpen(true);
  }
  function closeMenu() {
    setSidebarOpen(false);
  }

  const handleLogout = () => {
    setShowSettings(false);
    localStorage.removeItem("userToken");
    setUser(null);
    setHistory([]);
    setSelectedPresentation(null);
    navigate("/login");
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedPresentation) return;

    const token = localStorage.getItem("userToken");
    setIsLoading(true);

    try {
      setSelectedPresentation((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          { role: "user", content: chatInput, timestamp: new Date() },
        ],
      }));

      setChatInput("");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/presentation/${selectedPresentation._id}/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: chatInput }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setSelectedPresentation(data.presentation);
      } else {
        alert("Error: " + data.message);
      }
    } catch (err) {
      console.error("Chat error:", err);
      alert("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("userToken");
    setIsGenerating(true);

    try {
      console.log("Generating slides from prompt...");
      const aiResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/ai/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: promptInput }),
        }
      );

      const aiData = await aiResponse.json();

      if (!aiData.success) {
        alert("Failed to generate slides: " + aiData.message);
        return;
      }

      const generatedSlides = aiData.result.slides || [];
      const generatedTitle = aiData.result.title || promptInput;

      console.log("Generated slides:", generatedSlides);

      const presentationResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/presentation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: generatedTitle,
            prompt: promptInput,
            slides: generatedSlides,
            themeColor: "#06B6D4",
          }),
        }
      );

      const presentationData = await presentationResponse.json();

      if (presentationData.success) {
        setHistory((prev) => [presentationData.presentation, ...prev]);
        setSelectedPresentation(presentationData.presentation);
        setPromptInput("");
      } else {
        alert(presentationData.message);
      }
    } catch (err) {
      console.error("Error:", err);
      alert("An error occurred: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePresentationClick = async (id) => {
    const token = localStorage.getItem("userToken");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/presentation/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (data.success) {
      setSelectedPresentation(data.presentation);
    }
  };

  const handleNewPresentation = () => {
    setSelectedPresentation(null);
    setPromptInput("");
  };

  const handleDeletePresentation = async (presentationId) => {
    if (!window.confirm("Delete this presentation?")) return;

    const token = localStorage.getItem("userToken");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/presentation/${presentationId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setHistory((prev) => prev.filter((p) => p._id !== presentationId));

        if (selectedPresentation?._id === presentationId) {
          setSelectedPresentation(null);
        }
      } else {
        alert("Error deleting: " + data.message);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete presentation");
    }
  };

  const handleRenamePresentation = async (presentationId) => {
    if (!editingTitle.trim()) {
      alert("Title cannot be empty");
      return;
    }

    const token = localStorage.getItem("userToken");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/presentation/${presentationId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: editingTitle,
            prompt: selectedPresentation.prompt,
            slides: selectedPresentation.slides,
            themeColor: selectedPresentation.themeColor,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setHistory((prev) =>
          prev.map((p) =>
            p._id === presentationId ? { ...p, title: editingTitle } : p
          )
        );

        if (selectedPresentation?._id === presentationId) {
          setSelectedPresentation({
            ...selectedPresentation,
            title: editingTitle,
          });
        }

        setEditingId(null);
        setEditingTitle("");
      } else {
        alert("Error renaming: " + data.message);
      }
    } catch (err) {
      console.error("Rename error:", err);
      alert("Failed to rename presentation");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("userToken");

    fetch(`${import.meta.env.VITE_API_URL}/api/presentation`, {
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

  // Reusable component for rendering a single presentation item in the sidebar
const PresentationItem = ({ presentation, onSelect, isMobile }) => (
  <div
    className={`group relative p-3 rounded-lg cursor-pointer transition-all ${
      selectedPresentation?._id === presentation._id
        ? "bg-[#06B6D4]/10 border border-[#06B6D4]/30"
        : "hover:bg-[#111827]/60 border border-transparent"
    }`}
  >
    {editingId === presentation._id ? (
      // EDIT MODE
      <div className="flex gap-2">
        <input
          type="text"
          value={editingTitle}
          onChange={(e) => setEditingTitle(e.target.value)}
          autoFocus
          className="flex-1 bg-[#111827]/80 border border-[#06B6D4]/30 text-[#F8FAFC] rounded px-2 py-1 text-xs focus:outline-none"
        />
        <button
          onClick={() => handleRenamePresentation(presentation._id)}
          className="bg-[#06B6D4]/20 text-[#06B6D4] rounded px-2 py-1 text-xs cursor-pointer"
        >
          ✓
        </button>
        <button
          onClick={() => {
            setEditingId(null);
            setEditingTitle("");
          }}
          className="bg-red-500/20 text-red-400 rounded px-2 py-1 text-xs cursor-pointer"
        >
          ✕
        </button>
      </div>
    ) : (
      <>
        <div
          onClick={() => {
            onSelect(presentation);
            if (isMobile) closeMenu();
          }}
          className="flex items-start justify-between pr-8"
        >
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[#F8FAFC] truncate">
              {presentation.title}
            </p>
            <p className="text-[10px] text-[#94A3B8] truncate mt-1">
              {presentation.prompt}
            </p>
          </div>
        </div>

        {isMobile ? (
          // ============ MOBILE: THREE-DOT + DROPDOWN ============
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenuId(
                  openMenuId === presentation._id ? null : presentation._id
                );
              }}
              className="absolute right-2 top-2 p-1 rounded-lg hover:bg-[#1E293B] text-[#94A3B8]"
            >
              <MoreVertical size={16} />
            </button>

            {openMenuId === presentation._id && (
              <div className="absolute right-2 top-9 w-32 bg-[#111827] rounded-xl border border-white/10 shadow-xl z-50">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingId(presentation._id);
                    setEditingTitle(presentation.title);
                    setOpenMenuId(null);
                  }}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-[#1E293B] text-xs text-[#F8FAFC]"
                >
                  <Pencil size={12} /> Rename
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePresentation(presentation._id);
                    setOpenMenuId(null);
                  }}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-[#1E293B] text-xs text-red-400"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            )}
          </>
        ) : (
          // ============ DESKTOP: HOVER ICONS ============
          <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditingId(presentation._id);
                setEditingTitle(presentation.title);
              }}
              className="bg-[#111827]/80 border border-white/10 text-[#94A3B8] hover:text-[#67E8F9] rounded px-2 py-1 text-xs"
            >
              <Pencil size={12} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeletePresentation(presentation._id);
              }}
              className="bg-[#111827]/80 border border-white/10 text-[#94A3B8] hover:text-red-400 rounded px-2 py-1 text-xs"
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </>
    )}
  </div>
);

  return (
    <div className="min-h-screen bg-[#050816] text-[#F8FAFC] flex font-sans select-none overflow-hidden">
      {/* ============ DESKTOP SIDEBAR ============ */}
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

          <button
            onClick={handleNewPresentation}
            className="w-full bg-[#111827]/40 text-[#F8FAFC] border border-[rgba(255,255,255,0.06)] rounded-xl py-2.5 px-4 text-xs font-semibold hover:bg-[#111827]/80 hover:border-[#67E8F9]/30 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="text-base text-[#67E8F9]">+</span>
            New Presentation
          </button>

          <div className="space-y-2">
            {history.map((presentation) => (
              <PresentationItem
                key={presentation._id}
                presentation={presentation}
                onSelect={setSelectedPresentation}
                isMobile={false}
              />
            ))}
          </div>
        </div>

        <div className="relative border-t border-[rgba(255,255,255,0.06)] pt-4 flex items-center justify-between px-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#06B6D4] to-[#8B5CF6] flex items-center justify-center text-xs font-bold text-white">
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

          <button
            onClick={() => setShowSettings((prev) => !prev)}
            className="text-xs text-[#94A3B8] hover:text-[#F8FAFC] p-1 cursor-pointer"
          >
            ⚙️
          </button>

          {showSettings && (
            <div className="absolute right-2 bottom-12 w-40 bg-[#111827] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-xl overflow-hidden">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 text-left px-4 py-3 text-sm text-red-400 hover:bg-[#1F2937] transition-colors cursor-pointer"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ============ MOBILE SIDEBAR OVERLAY ============ */}
      {sidebarOpen && (
        <div onClick={closeMenu} className="fixed inset-0 bg-black/70 z-40" />
      )}

      {/* ============ MOBILE SIDEBAR ============ */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-64
          bg-[#0B1220]
          border-r border-[rgba(255,255,255,0.06)]
          z-50
          transform transition-transform duration-300
          md:hidden flex flex-col justify-between
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div>
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <span className="font-bold text-lg">AuraSlides</span>
            <button onClick={closeMenu} className="text-xl cursor-pointer">
              ✕
            </button>
          </div>

          <div className="p-4">
            <button
              onClick={() => {
                handleNewPresentation();
                closeMenu();
              }}
              className="w-full bg-[#111827]/40 text-[#F8FAFC] border border-[rgba(255,255,255,0.06)] rounded-xl py-2.5 px-4 text-xs font-semibold hover:bg-[#111827]/80 hover:border-[#67E8F9]/30 transition-all flex items-center justify-center gap-2"
            >
              <span className="text-base text-[#67E8F9]">+</span>
              New Presentation
            </button>
          </div>

          <div className="px-4">
            <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-widest">
              Recent Decks
            </span>

            <div className="space-y-2 mt-2">
              {history.map((presentation) => (
                <PresentationItem
                  key={presentation._id}
                  presentation={presentation}
                  onSelect={setSelectedPresentation}
                  isMobile={true}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="relative border-t border-[rgba(255,255,255,0.06)] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#06B6D4] to-[#8B5CF6] flex items-center justify-center text-sm font-bold text-white">
                {user?.name
                  ? user.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                  : "U"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {userLoading ? "Loading..." : user?.name || "Guest"}
                </p>
                <p className="text-xs text-[#94A3B8] truncate">
                  {user?.email || ""}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-[#94A3B8] hover:text-white"
            >
              ⚙️
            </button>
          </div>

          {showSettings && (
            <div className="absolute right-4 bottom-16 w-40 rounded-xl bg-[#111827] border border-[rgba(255,255,255,0.06)] shadow-xl overflow-hidden">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-[#1F2937] transition-colors"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ============ MAIN CONTENT ============ */}
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

        {/* SLIDES + CHAT VIEW */}
        {selectedPresentation && (
          <div className="w-full max-w-7xl z-10 flex flex-col lg:flex-row gap-6 h-auto lg:h-screen">
            {/* LEFT: PRESENTATION */}
            <div className="w-full lg:flex-[1.8] overflow-y-auto scrollable-none">
              <div className="bg-[#0B1220]/60 border border-[rgba(255,255,255,0.06)] backdrop-blur-xl rounded-2xl p-4 sm:p-6 lg:p-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#F8FAFC] mb-2 break-words">
                  {selectedPresentation.title}
                </h1>
                <p className="text-[#94A3B8] text-xs sm:text-sm mb-6 break-words">
                  {selectedPresentation.prompt}
                </p>

                <div className="space-y-5 scrollable-none">
                  {selectedPresentation.slides &&
                  selectedPresentation.slides.length > 0 ? (
                    selectedPresentation.slides.map((slide, index) => (
                      <div
                        key={index}
                        className="bg-[#111827]/60 border border-[rgba(255,255,255,0.06)] rounded-xl p-4 sm:p-6 hover:border-[#06B6D4]/30 transition-all"
                      >
                        <h2 className="text-lg sm:text-xl font-bold text-[#67E8F9] mb-4">
                          Slide {slide.slideNumber}: {slide.title}
                        </h2>
                        <ul className="space-y-2">
                          {slide.content?.map((point, idx) => (
                            <li
                              key={idx}
                              className="flex gap-3 text-[#CBD5E1] text-sm sm:text-base"
                            >
                              <span className="text-[#06B6D4] mt-1">•</span>
                              <span className="break-words">{point}</span>
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

            {/* RIGHT: CHAT */}
            <div className="w-full lg:flex-1 flex flex-col border border-[rgba(255,255,255,0.06)] lg:border-l lg:border-t-0 rounded-2xl overflow-hidden bg-[#0B1220]/60">
              <div className="p-4 border-b border-[rgba(255,255,255,0.06)]">
                <h2 className="text-white font-semibold">AI Assistant</h2>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[350px] lg:max-h-none">
                {selectedPresentation.messages &&
                selectedPresentation.messages.length > 0 ? (
                  selectedPresentation.messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[90%] sm:max-w-xs rounded-xl p-3 ${
                          msg.role === "user"
                            ? "bg-[#06B6D4]/20 border border-[#06B6D4]/30 text-white"
                            : "bg-[#111827]/60 border border-[rgba(255,255,255,0.06)] text-[#CBD5E1]"
                        }`}
                      >
                        <p className="text-xs font-semibold mb-1">
                          {msg.role === "user" ? "You" : "AI"}
                        </p>
                        <p className="text-sm break-words">{msg.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[#94A3B8] text-center text-sm">
                    No chat history yet
                  </p>
                )}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-[#111827]/60 border border-[rgba(255,255,255,0.06)] rounded-lg p-3">
                      <p className="text-[#94A3B8] text-sm animate-pulse">
                        AI is thinking...
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-[rgba(255,255,255,0.06)] p-4">
                <form onSubmit={handleChatSubmit} className="flex flex-col gap-3">
                  <textarea
                    rows={3}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    disabled={isLoading}
                    placeholder="Ask AI to improve your slides..."
                    className="w-full bg-[#111827]/80 border border-[rgba(255,255,255,0.06)] rounded-xl px-4 py-3 text-sm text-white placeholder-[#94A3B8] resize-none focus:outline-none focus:border-[#06B6D4]"
                  />

                  <button
                    type="submit"
                    disabled={!chatInput.trim() || isLoading}
                    className={`w-full py-3 rounded-xl font-medium transition cursor-pointer ${
                      chatInput.trim() && !isLoading
                        ? "bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] text-white hover:opacity-90"
                        : "bg-gray-700 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {isLoading ? "Sending..." : "Send"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* WELCOME MESSAGE */}
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
              Input a concept, text snippet, or architecture topic, and let
              Aura generate structured, export-ready slides in seconds.
            </p>
          </div>
        )}

        {isGenerating && (
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-5 h-5 border-2 border-[#06B6D4] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-[#94A3B8]">
              AuraSlides is generating your presentation...
            </span>
          </div>
        )}

        {/* PROMPT INPUT FORM */}
        {!selectedPresentation && (
          <div className="w-full max-w-2xl pb-8 sm:pb-12 z-10 mt-[40px]">
            <form
              onSubmit={handlePromptSubmit}
              className="w-full bg-[#0B1220]/60 border border-[rgba(255,255,255,0.06)] backdrop-blur-2xl rounded-2xl p-2.5 shadow-[0_30px_60px_rgba(0,0,0,0.5)] flex flex-col gap-2.5 focus-within:border-[#06B6D4]/40 focus-within:ring-1 focus-within:ring-[#06B6D4]/10 transition-all duration-300"
            >
              <textarea
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                rows={3}
                disabled={isGenerating}
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
                  {isGenerating ? "Generating..." : "Generate Slides ➔"}
                </button>
              </div>
            </form>

            <div className="text-center text-[10px] text-[#94A3B8]/40 mt-3 tracking-wide">
              AuraSlides uses deep learning layers. Review generated files for
              precise structural metrics.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}