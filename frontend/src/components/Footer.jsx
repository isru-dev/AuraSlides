import React from "react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <>
      <div className="bg-[#0A0F1C] border-t border-white/[0.06] flex items-center justify-center gap-3 p-6">
  <h1 className="bg-gradient-to-r from-[#67E8F9] via-[#A78BFA] to-[#C084FC] bg-clip-text text-transparent font-bold tracking-tight text-3xl text-center">
    AuraSlides
  </h1>
  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#67E8F9]/10 text-[#67E8F9] border border-[#67E8F9]/30 uppercase tracking-widest shadow-[0_0_12px_rgba(103,232,249,0.2)]">
    Beta
  </span>
</div>
      
      <section className="bg-gradient-to-r from-[#0A0F1C] via-[#0F172A] to-[#0A0F1C]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mx-auto max-w-7xl gap-10 pt-4 px-6 pb-10 py-12 justify-items-center text-center md:text-left">
          
          {/* Product Links */}
          <div>
            <h1 className="text-slate-200 font-medium text-2xl pb-3">
              Product
            </h1>
            <ul className="text-slate-400 space-y-2">
              <li className="hover:text-slate-50 hover:scale-[1.01] text-[19px] transition-colors duration-200">
                <a href="#features">Features</a>
              </li>
              <li className="hover:text-slate-50 hover:scale-[1.01] text-[19px] transition-colors duration-200">
                <Link to="/chat">Slide Editor</Link>
              </li>
              <li className="hover:text-slate-50 hover:scale-[1.01] text-[19px] transition-colors duration-200">
                <Link to="/pricing">Pricing</Link>
              </li>
            </ul>
          </div>

          {/* Account & Quick Start */}
          <div>
            <h1 className="text-slate-400 font-medium text-2xl pb-3">
              Account
            </h1>
            <ul className="text-slate-400 space-y-2">
              <li className="hover:text-slate-50 hover:scale-[1.01] text-[19px] transition-colors duration-200">
                <Link to="/login">Sign In</Link>
              </li>
              <li className="hover:text-slate-50 hover:scale-[1.01] text-[19px] transition-colors duration-200">
                <Link to="/register">Get Started Free</Link>
              </li>
              <li className="hover:text-slate-50 hover:scale-[1.01] text-[19px] transition-colors duration-200">
                <Link to="/history">My Presentations</Link>
              </li>
            </ul>
          </div>

          {/* Legal & Terms */}
          <div>
            <h1 className="text-slate-400 font-medium text-2xl pb-3">
              Legal
            </h1>
            <ul className="text-slate-400 space-y-2">
              <li className="hover:text-slate-50 hover:scale-[1.01] text-[19px] transition-colors duration-200">
                <Link to="/privacy">Privacy Policy</Link>
              </li>
              <li className="hover:text-slate-50 hover:scale-[1.01] text-[19px] transition-colors duration-200">
                <Link to="/terms">Terms of Service</Link>
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* Copyright */}
      <div className="bg-[#0A0F1C] text-slate-300 text-center p-4 text-sm border-t border-white/[0.04]">
        © {new Date().getFullYear()} AuraSlides. All rights reserved.
      </div>
    </>
  );
}