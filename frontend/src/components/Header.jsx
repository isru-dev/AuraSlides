import { useState } from "react";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-[#0B1220]/60 backdrop-blur-2xl border-b border-white/5 text-white py-4 sticky top-0 z-50">
      <nav className="flex justify-between items-center mx-auto max-w-7xl px-6 lg:px-8">
        {/* Logo */}
        <div className="w-39">
          <a
            href="/"
            className="bg-gradient-to-r from-cyan-300 via-violet-300 to-purple-300 bg-clip-text text-transparent font-bold tracking-tight text-xl"
          >
            AuraSlides
          </a>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:block">
          <ul className="flex items-center gap-8 md:space-x-10 xl:space-x-24 text-sm text-slate-300 font-medium justify-between">
            <li className="hover:text-slate-50 transition-all duration-200">
              <a href="/register">Get Started</a>
            </li>
            <li className="hover:text-slate-50 transition-all duration-200">
              <a href="https://github.com" target="_blank" rel="noreferrer">GITHUB</a>
            </li>
            <li className="bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] text-white rounded-lg px-5 py-2 shadow-[0_0_25px_rgba(139,92,246,0.2)] hover:shadow-[0_0_35px_rgba(139,92,246,0.35)] transition-all duration-300 font-medium hover:scale-[1.02] active:scale-[0.98]">
              <a href="/login">LOGIN</a>
            </li>
          </ul>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            type="button"
            className="text-slate-300 hover:text-white focus:outline-none p-1 transition-colors duration-200"
            aria-label="Toggle Menu"
          >
            <svg className="h-6 w-6 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
              {isOpen ? (
                // "X" Close Icon
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                // Hamburger Menu Icon
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown Overlay Menu */}
      <div
        className={`md:hidden absolute top-full left-0 w-full bg-[#0B1220]/95 backdrop-blur-2xl border-b border-white/5 transition-all duration-300 ease-in-out ${
          isOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"
        }`}
      >
        <ul className="flex flex-col px-6 py-6 gap-5 text-base text-slate-300 font-medium">
          <li className="hover:text-slate-50 transition-all duration-200">
            <a href="/register" onClick={() => setIsOpen(false)}>
              Get Started
            </a>
          </li>
          <li className="hover:text-slate-50 transition-all duration-200">
            <a href="https://github.com" target="_blank" rel="noreferrer" onClick={() => setIsOpen(false)}>
              GITHUB
            </a>
          </li>
          <li className="bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] text-white text-center rounded-xl py-3 mt-2 shadow-[0_0_25px_rgba(139,92,246,0.15)] font-semibold tracking-wide">
            <a href="/login" className="block w-full" onClick={() => setIsOpen(false)}>
              LOGIN
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}