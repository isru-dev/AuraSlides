import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  MoreVertical,
  Pencil,
  Trash2,
  Download,
  ImageIcon,
  X,
  Search,
  Plus,
} from "lucide-react";
import { toast } from "react-hot-toast";

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
  const [selectedFile, setSelectedFile] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchingImages, setIsSearchingImages] = useState(false);
  const [isDownloading, setisDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  const handleRemoveImage = (slideIndex) => {
    if (!selectedPresentation) return;

    setSelectedPresentation((prev) => {
      if (!prev) return prev;

      const updatedSlides = prev.slides.map((slide, i) => {
        if (i === slideIndex) {
          return {
            ...slide,
            imageUrl: "", // Clear image URL
            imageKeyword: "", // Clear image keyword
          };
        }
        return slide;
      });

      return {
        ...prev,
        slides: updatedSlides,
      };
    });

    setHasUnsavedChanges(true);
  };
  const handleOpenImageModal = (slideIndex, currentKeyword, currentTitle) => {
    setActiveSlideIndex(slideIndex);
    const initialQuery = currentKeyword || currentTitle || "technology";
    setSearchQuery(initialQuery);
    setIsImageModalOpen(true);

    // Fetch initial results immediately when opening
    fetchBackendImages(initialQuery);
  };

  // 2. Fetch images from your BACKEND endpoint
  const fetchBackendImages = async (query) => {
    if (!query.trim()) return;
    setIsSearchingImages(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/presentation/images/search?query=${encodeURIComponent(query)}`,
      );
      const data = await response.json();

      if (data.success) {
        setSearchResults(data.results);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Failed to fetch images from server:", error);
      setSearchResults([]);
    } finally {
      setIsSearchingImages(false);
    }
  };

  // 3. Update Presentation Slide with the chosen image
  const handleSelectImage = (newImageUrl) => {
    if (activeSlideIndex === null) return;

    setSelectedPresentation((prev) => {
      if (!prev) return prev;

      const updatedSlides = [...prev.slides];
      updatedSlides[activeSlideIndex] = {
        ...updatedSlides[activeSlideIndex],
        imageUrl: newImageUrl,
      };

      return {
        ...prev,
        slides: updatedSlides,
      };
    });

    setHasUnsavedChanges(true);
    setIsImageModalOpen(false); // Close modal
  };

  function handleSetting() {
    setShowSettings(false);
  }
  function handleProfile() {
    navigate("/profile");
  }
  const handleDocumentUpload = async () => {
    if (!selectedFile) return;

    const token = localStorage.getItem("userToken");

    setIsGenerating(true);

    try {
      // Upload document to AI
      const formData = new FormData();
      formData.append("document", selectedFile);

      const aiResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/presentation/document`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const aiData = await aiResponse.json();

      if (!aiData.success) {
        alert(aiData.message);
        return;
      }

      const generatedSlides = aiData.result.slides;
      const generatedTitle = aiData.result.title;

      // Save presentation to MongoDB
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
            prompt: selectedFile.name, // or "Uploaded Document"
            slides: generatedSlides,
            themeColor: "#06B6D4",
          }),
        },
      );

      const presentationData = await presentationResponse.json();

      if (presentationData.success) {
        setHistory((prev) => [presentationData.presentation, ...prev]);

        setSelectedPresentation(presentationData.presentation);

        setSelectedFile(null);
        setPromptInput("");
      } else {
        alert(presentationData.message);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to generate presentation.");
    } finally {
      setIsGenerating(false);
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();

    if (selectedFile) {
      handleDocumentUpload();
    } else {
      handlePromptSubmit(e);
    }
  };
  const handleExport = async () => {
    const token = localStorage.getItem("userToken");

    try {
      // 1. Save latest changes to MongoDB FIRST so backend export route has new images!
      if (hasUnsavedChanges) {
        toast.info("Saving changes before exporting...");
        await handleSavePresentation();
      }
      setisDownloading(true);

      // 2. Fetch the exported PPTX file from backend
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/presentation/${selectedPresentation._id}/export`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${selectedPresentation.title}.pptx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);

      toast.success("Presentation downloaded successfully!");
      setisDownloading(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to download presentation.");
    }
  };
  function handleProfile() {
    navigate("/profile");
  }
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
        ...prev, //the curren t object
        messages: [
          ...prev.messages,
          { role: "user", content: chatInput, timestamp: new Date() },
        ], // in the curent object change only the message part
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
        },
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
        },
      );

      const aiData = await aiResponse.json(); //chages it to js obj

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
        },
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
      },
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
        },
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
        },
      );

      const data = await response.json();

      if (data.success) {
        setHistory((prev) =>
          prev.map((p) =>
            p._id === presentationId ? { ...p, title: editingTitle } : p,
          ),
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
  const updatePresentationTitle = (value) => {
    setSelectedPresentation((prev) => ({
      ...prev,
      title: value,
    }));

    setHasUnsavedChanges(true);
  };

  const updateSlideTitle = (slideIndex, value) => {
    setSelectedPresentation((prev) => ({
      ...prev,
      slides: prev.slides.map((slide, index) =>
        index === slideIndex ? { ...slide, title: value } : slide,
      ),
    }));

    setHasUnsavedChanges(true);
  };

  const updateBullet = (slideIndex, bulletIndex, value) => {
    setSelectedPresentation((prev) => ({
      ...prev,
      slides: prev.slides.map((slide, index) =>
        index === slideIndex
          ? {
              ...slide,
              content: slide.content.map((bullet, i) =>
                i === bulletIndex ? value : bullet,
              ),
            }
          : slide,
      ),
    }));

    setHasUnsavedChanges(true);
  };
  const handleSavePresentation = async () => {
    if (!selectedPresentation?._id) return false;

    const token = localStorage.getItem("userToken");
    if (!token) {
      toast.error("Authentication session expired. Please log in again.");
      return false;
    }
    setIsSaving(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/presentation/${selectedPresentation._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: selectedPresentation.title,
            prompt: selectedPresentation.prompt,
            slides: selectedPresentation.slides, // Includes updated imageUrls
            themeColor: selectedPresentation.themeColor,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        // Use updated document returned from DB or fallback to current state
        const updatedPresentation = data.presentation || selectedPresentation;

        setSelectedPresentation(updatedPresentation);
        setHasUnsavedChanges(false);
        toast.success("Successfully saved!");

        // Update sidebar history state
        setHistory((prev) =>
          prev.map((p) =>
            p._id === updatedPresentation._id ? updatedPresentation : p,
          ),
        );

        return true; // Indicates success for callers like handleExport
      } else {
        toast.error(data.message || "Failed to save presentation.");
        return false;
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error("An error occurred while saving.");
      return false;
    } finally {
      setIsSaving(false);
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

  const PresentationItem = ({ presentation, onSelect, isMobile }) => (
    <div
      className={`group relative p-3 rounded-lg cursor-pointer transition-all 
        ${
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
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRenamePresentation(presentation._id);
              if (e.key === "Escape") {
                setEditingId(null);
                setEditingTitle("");
              }
            }}
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
            </div>
          </div>

          {isMobile ? (
            // ============ MOBILE: THREE-DOT + DROPDOWN ============
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuId(
                    openMenuId === presentation._id ? null : presentation._id,
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
  const handleFocusAtEnd = (e) => {
    const textElement = e.currentTarget.previousElementSibling;
    if (!textElement) return;

    textElement.focus();

    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(textElement);
    range.collapse(false); // Collapses cursor to the end

    selection.removeAllRanges();
    selection.addRange(range);
  };
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
              v1.5
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
          <div
            className="flex items-center gap-2.5 min-w-0 cursor-pointer"
            onClick={handleProfile}
          >
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
      {showSettings && (
        <div
          onClick={handleSetting}
          className="fixed inset-0 bg-black/10 z-40"
        />
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
          <div
            className="flex items-center justify-between cursor-pointer "
            onClick={handleProfile}
          >
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
            <>
              <div
                onClick={handleSetting}
                className="fixed inset-0 bg-black/10 z-40"
              />
              <div className="absolute right-4 bottom-16 w-40 rounded-xl bg-[#111827] border border-[rgba(255,255,255,0.06)] shadow-xl overflow-hidden">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-[#1F2937] transition-colors"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* ============ MAIN CONTENT ============ */}
      <main className="flex-1 flex flex-col justify-between items-center px-6 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[30%] w-[500px] h-[500px] bg-[#8B5CF6]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[20%] w-[400px] h-[400px] bg-[#06B6D4]/5 rounded-full blur-[100px] pointer-events-none" />

        {/* MOBILE HEADER */}
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
              {/* PRESENTATION CONTAINER CARD */}
              <div className="bg-[#0B1220]/60 border border-[rgba(255,255,255,0.06)] backdrop-blur-xl rounded-2xl p-4 sm:p-6 lg:p-8">
                {/* Top Actions Bar */}
                <div className="flex items-center justify-end gap-2 text-[#67E8F9] mb-4">
                  <button
                    onClick={handleExport}
                    className="cursor-pointer flex items-center gap-2 hover:text-white transition-colors text-sm font-medium"
                  >
                    <Download size={18} /> Download
                  </button>
                </div>

                {/* PRESENTATION TITLE */}
                <div className="flex items-center justify-between gap-4 mb-2">
                  <div className="group flex-1 flex items-center gap-2">
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) =>
                        updatePresentationTitle(e.currentTarget.innerText)
                      }
                      className="inline-block bg-transparent text-3xl font-bold text-slate-200 transition-colors cursor-text group-hover:text-white focus:text-white focus:bg-[#1E293B] rounded px-2 py-0.5 outline-none break-words"
                    >
                      {selectedPresentation.title}
                    </span>

                    <Pencil
                      size={20}
                      onClick={handleFocusAtEnd}
                      onMouseEnter={handleFocusAtEnd}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 group-hover:text-white transition-all cursor-pointer shrink-0"
                    />
                  </div>

                  {hasUnsavedChanges && (
                    <button
                      onClick={handleSavePresentation}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] text-white text-sm font-medium hover:opacity-90 transition cursor-pointer shrink-0"
                    >
                      Save Changes
                    </button>
                  )}
                </div>

                <p className="text-[rgb(148,163,184)] text-xs sm:text-sm mb-6 break-words">
                  {selectedPresentation.prompt}
                </p>

                {/* SLIDES LIST */}
                <div className="space-y-5 scrollable-none">
                  {selectedPresentation.slides &&
                  selectedPresentation.slides.length > 0 ? (
                    selectedPresentation.slides.map((slide, index) => (
                      <div
                        key={index}
                        className="bg-[#111827]/60 border border-[rgba(255,255,255,0.06)] rounded-xl p-4 sm:p-6 hover:border-[#06B6D4]/30 transition-all"
                      >
                        {/* SLIDE TITLE */}
                        <div className="group flex items-center  gap-2 mb-4">
                          <span className="text-[#67E8F9] font-bold shrink-0">
                            Slide {slide.slideNumber}:
                          </span>
                          <div className="group flex items-center justify-between gap-2">
                            <span
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) =>
                                updateSlideTitle(
                                  index,
                                  e.currentTarget.innerText,
                                )
                              }
                              className=" bg-transparent text-[#67E8F9] font-bold transition-colors cursor-text group-hover:text-white focus:text-white focus:bg-[#1E293B] rounded px-1.5 py-0.5 outline-none break-words"
                            >
                              {slide.title}
                            </span>

                            <Pencil
                              size={20}
                              onClick={handleFocusAtEnd}
                              onMouseEnter={handleFocusAtEnd}
                              className="opacity-0 group-hover:opacity-100 text-slate-400 group-hover:text-white transition-all cursor-pointer shrink-0"
                            />
                          </div>
                        </div>

                        {/* SLIDE CONTENT & IMAGE */}
                        <div
                          className={`grid grid-cols-1 ${
                            slide.imageUrl ? "md:grid-cols-2" : "grid-cols-1"
                          } gap-6 items-center`}
                        >
                          {/* Bullet Points */}
                          <ul className="space-y-2">
                            {slide.content?.map((point, idx) => (
                              <li
                                key={idx}
                                className="group flex gap-3 text-[#CBD5E1] text-sm sm:text-base items-start"
                              >
                                <span className="text-[#06B6D4] mt-1 shrink-0">
                                  •
                                </span>

                                <div className="flex justify-between items-center">
                                  <span
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={(e) =>
                                      updateBullet(
                                        index,
                                        idx,
                                        e.currentTarget.innerText,
                                      )
                                    }
                                    className="inline rounded px-1 py-0.5 outline-none transition-colors cursor-text group-hover:text-white focus:text-white focus:bg-[#1E293B] break-words whitespace-pre-wrap"
                                  >
                                    {point}
                                  </span>

                                  <Pencil
                                    size={27}
                                    onClick={handleFocusAtEnd}
                                    onMouseEnter={handleFocusAtEnd}
                                    className=" ml-1.5 align-middle opacity-0 group-hover:opacity-100 text-slate-400 group-hover:text-white transition-all cursor-pointer"
                                  />
                                </div>
                              </li>
                            ))}
                          </ul>

                          {/* Slide Image Container */}
                          {slide.imageUrl ? (
                            <div className="w-full rounded-xl overflow-hidden border border-white/10 bg-[#0B1220] shadow-lg group flex flex-col">
                              {/* Image Container with Desktop Hover Overlay */}
                              <div className="relative h-48 sm:h-56 w-full">
                                <img
                                  src={slide.imageUrl}
                                  alt={slide.imageKeyword || slide.title}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  loading="lazy"
                                />

                                {/* 🖥️ DESKTOP ONLY: Hover Action Overlay (Hidden on Mobile) */}
                                <div className="hidden sm:flex absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center gap-2 p-3">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleOpenImageModal(
                                        index,
                                        slide.imageKeyword,
                                        slide.title,
                                      )
                                    }
                                    className="px-3.5 py-2 rounded-lg bg-[#06B6D4] text-white text-xs font-semibold hover:bg-[#0891B2] transition flex items-center gap-1.5 cursor-pointer shadow-lg"
                                  >
                                    <ImageIcon size={15} /> Change
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleRemoveImage(index)}
                                    className="px-3.5 py-2 rounded-lg bg-red-500/80 hover:bg-red-600 text-white text-xs font-semibold backdrop-blur-md transition flex items-center gap-1.5 cursor-pointer shadow-lg"
                                  >
                                    <Trash2 size={15} /> Delete
                                  </button>
                                </div>
                              </div>

                              {/* 📱 MOBILE ONLY: Always-Visible Action Bar (Hidden on Desktop) */}
                              <div className="flex sm:hidden items-center justify-between p-2.5 bg-[#111827] border-t border-white/10 gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleOpenImageModal(
                                      index,
                                      slide.imageKeyword,
                                      slide.title,
                                    )
                                  }
                                  className="flex-1 px-3 py-2 rounded-lg bg-[#06B6D4] text-white text-xs font-semibold active:scale-95 transition flex items-center justify-center gap-1.5 cursor-pointer shadow"
                                >
                                  <ImageIcon size={14} /> Change
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(index)}
                                  className="px-3 py-2 rounded-lg bg-red-500/20 text-red-400 active:scale-95 transition flex items-center justify-center gap-1.5 text-xs font-semibold border border-red-500/30 cursor-pointer"
                                >
                                  <Trash2 size={14} /> Remove
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* Empty Placeholder when Slide has no image */
                            <button
                              type="button"
                              onClick={() =>
                                handleOpenImageModal(
                                  index,
                                  slide.imageKeyword,
                                  slide.title,
                                )
                              }
                              className="w-full h-32 rounded-xl border border-dashed border-white/15 bg-[#0B1220]/40 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-white hover:border-[#06B6D4] transition cursor-pointer group"
                            >
                              <Plus
                                size={20}
                                className="text-slate-500 group-hover:text-[#06B6D4] transition"
                              />
                              <span className="text-xs font-medium">
                                Add Image to Slide
                              </span>
                            </button>
                          )}
                        </div>
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
                <form
                  onSubmit={handleChatSubmit}
                  className="flex flex-col gap-3"
                >
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
              Input a concept, text snippet, or architecture topic, and let Aura
              generate structured, export-ready slides in seconds.
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
        {isDownloading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="flex flex-col items-center justify-center gap-3 bg-[#0B1220] border border-white/10 p-6 rounded-2xl shadow-2xl">
              <div className="w-8 h-8 border-3 border-[#06B6D4] border-t-transparent rounded-full animate-spin" />
              <h1 className="text-white text-base font-semibold tracking-wide">
                Downloading presentation...
              </h1>
              <p className="text-xs text-slate-400">
                Generating your file, please wait.
              </p>
            </div>
          </div>
        )}
        {/* Saving Overlay */}
        {isSaving && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="flex flex-col items-center justify-center gap-3 bg-[#0B1220] border border-white/10 p-6 rounded-2xl shadow-2xl">
              <div className="w-8 h-8 border-3 border-[#06B6D4] border-t-transparent rounded-full animate-spin" />
              <h1 className="text-white text-base font-semibold tracking-wide">
                Saving presentation...
              </h1>
              <p className="text-xs text-slate-400">
                Updating your changes, please wait.
              </p>
            </div>
          </div>
        )}
        {/* PROMPT INPUT FORM */}
        {!selectedPresentation && (
          <div className="w-full max-w-2xl pb-8 sm:pb-12 z-10 mt-[40px]">
            <form
              onSubmit={handleSubmit}
              className="w-full bg-[#0B1220]/60 border border-[rgba(255,255,255,0.06)] backdrop-blur-2xl rounded-2xl p-2.5 shadow-[0_30px_60px_rgba(0,0,0,0.5)] flex flex-col gap-2.5 focus-within:border-[#06B6D4]/40 focus-within:ring-1 focus-within:ring-[#06B6D4]/10 transition-all duration-300"
            >
              {/* Prompt Input */}
              <textarea
                value={promptInput}
                onChange={(e) => {
                  setPromptInput(e.target.value);
                  if (selectedFile) setSelectedFile(null);
                }}
                rows={3}
                disabled={isGenerating || selectedFile}
                placeholder="Structure a 5-slide presentation on Computer Architecture layers and processing targets..."
                className="w-full bg-transparent border-none text-sm text-[#F8FAFC] placeholder-[#94A3B8]/30 px-3 pt-2 resize-none focus:outline-none leading-relaxed"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />

              {/* File Upload */}
              <div className="px-3">
                <label
                  htmlFor="document-upload"
                  className="flex flex-col items-center justify-center gap-2 py-5 border border-dashed border-[#06B6D4]/40 rounded-xl cursor-pointer hover:border-[#06B6D4] hover:bg-[#111827]/40 transition-all"
                >
                  <span className="text-3xl">📄</span>

                  <p className="text-sm text-[#CBD5E1] font-medium">
                    {selectedFile
                      ? selectedFile.name
                      : "Upload PDF, DOCX or TXT"}
                  </p>

                  <p className="text-xs text-[#94A3B8]">
                    Click to browse your document
                  </p>
                </label>

                <input
                  id="document-upload"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  onChange={(e) => {
                    setSelectedFile(e.target.files[0]);
                    setPromptInput("");
                  }}
                />
              </div>

              {/* Bottom Bar */}
              <div className="flex items-center justify-between border-t border-[rgba(255,255,255,0.04)] pt-2.5 px-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-[#94A3B8] font-medium bg-[#111827]/80 border border-[rgba(255,255,255,0.04)] rounded-lg px-2.5 py-1">
                    {selectedFile
                      ? "📄 Document Ready"
                      : "💡 Tip: Be descriptive"}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={
                    (!promptInput.trim() && !selectedFile) || isGenerating
                  }
                  className={`py-2 px-4 rounded-xl font-medium text-xs text-white shadow-md flex items-center gap-1.5 transition-all duration-300 cursor-pointer ${
                    promptInput.trim() || selectedFile
                      ? "bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] hover:opacity-90 shadow-[0_0_15px_rgba(6,182,212,0.25)] hover:scale-[1.02]"
                      : "bg-white/[0.04] text-[#94A3B8]/40 border border-white/[0.02] cursor-not-allowed"
                  }`}
                >
                  {isGenerating
                    ? "Generating..."
                    : selectedFile
                      ? "Generate from Document ➜"
                      : "Generate Slides ➜"}
                </button>
              </div>
            </form>

            <div className="text-center text-[10px] text-[#94A3B8]/40 mt-3 tracking-wide">
              AuraSlides uses deep learning layers. Review generated files for
              precise structural metrics.
            </div>
          </div>
        )}
        {/* IMAGE SEARCH MODAL */}
        {isImageModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="w-full max-w-2xl bg-[#0B1220] border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col gap-5">
              {/* Modal Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ImageIcon className="text-[#06B6D4]" size={20} /> Change
                  Slide Image
                </h3>
                <button
                  onClick={() => setIsImageModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Search Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  fetchBackendImages(searchQuery);
                }}
                className="flex gap-2"
              >
                <div className="relative flex-1">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search keywords..."
                    className="w-full bg-[#111827] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#06B6D4]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] text-white text-sm font-medium hover:opacity-90 transition cursor-pointer shrink-0"
                >
                  Search
                </button>
              </form>

              {/* Search Results Display */}
              <div className="min-h-[260px] max-h-[360px] overflow-y-auto">
                {isSearchingImages ? (
                  <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-400">
                    <div className="w-6 h-6 border-2 border-[#06B6D4] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs">
                      Fetching images from server...
                    </span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {searchResults.map((img) => (
                      <div
                        key={img.id}
                        onClick={() => handleSelectImage(img.full)}
                        className="group relative h-28 rounded-xl overflow-hidden border border-white/10 cursor-pointer hover:border-[#06B6D4] transition-all"
                      >
                        <img
                          src={img.thumb}
                          alt={img.alt}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-[#06B6D4]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-[10px] uppercase tracking-wider font-bold text-white bg-black/70 px-2 py-1 rounded">
                            Select
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-slate-500 text-sm">
                    No images found. Try another search term.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
