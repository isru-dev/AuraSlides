import { useState } from "react";
import { Link } from "react-router-dom";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-[#081325]/80 backdrop-blur-2xl border-b border-white/5 text-white py-4 sticky top-0 z-50">
      <nav className="flex justify-between items-center mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* Logo & Beta Tag */}
        <div className="flex items-center gap-2.5">
          <Link
            to="/"
            className="bg-gradient-to-r from-cyan-300 via-violet-300 to-purple-300 bg-clip-text text-transparent font-bold tracking-tight text-xl"
          >
            AuraSlides
          </Link>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#67E8F9]/10 text-[#67E8F9] border border-[#67E8F9]/30 uppercase tracking-widest shadow-[0_0_12px_rgba(103,232,249,0.2)]">
            Beta
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:block">
          <ul className="flex items-center gap-8 md:space-x-10 xl:space-x-16 text-sm text-slate-300 font-medium">
            <li className="hover:text-slate-50 transition-all duration-200">
              <Link to="/register">Get Started</Link>
            </li>
            <li className="hover:text-slate-50 transition-all duration-200">
              <a
                href="https://github.com/isru-dev/AuraSlides"
                target="_blank"
                rel="noreferrer"
              >
                GITHUB
              </a>
            </li>
            <li className="bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] text-white rounded-lg px-5 py-2 shadow-[0_0_25px_rgba(139,92,246,0.2)] hover:shadow-[0_0_35px_rgba(139,92,246,0.35)] transition-all duration-300 font-medium hover:scale-[1.02] active:scale-[0.98]">
              <Link to="/login">LOGIN</Link>
            </li>
          </ul>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            type="button"
            className="text-slate-300 hover:text-white focus:outline-none p-1 transition-colors duration-200 cursor-pointer"
            aria-label="Toggle Menu"
          >
            <svg
              className="h-6 w-6 fill-none stroke-current stroke-2"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown Menu */}
      <div
        className={`md:hidden absolute top-full left-0 w-full bg-[#0B1220]/95 backdrop-blur-2xl border-b border-white/5 transition-all duration-300 ease-in-out ${
          isOpen
            ? "opacity-100 visible translate-y-0"
            : "opacity-0 invisible -translate-y-2"
        }`}
      >
        <ul className="flex flex-col px-6 py-6 gap-5 text-base text-slate-300 font-medium">
          <li className="hover:text-slate-50 transition-all duration-200">
            <Link to="/register" onClick={() => setIsOpen(false)}>
              Get Started
            </Link>
          </li>
          <li className="hover:text-slate-50 transition-all duration-200">
            <a
              href="https://github.com/isru-dev/AuraSlides"
              target="_blank"
              rel="noreferrer"
              onClick={() => setIsOpen(false)}
            >
              GITHUB
            </a>
          </li>
          <li className="bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] text-white text-center rounded-xl py-3 mt-2 shadow-[0_0_25px_rgba(139,92,246,0.15)] font-semibold tracking-wide">
            <Link
              to="/login"
              className="block w-full"
              onClick={() => setIsOpen(false)}
            >
              LOGIN
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}