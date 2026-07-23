export function Fotter() {
  return (
    <>
      <div
        className="bg-[#0A0F1C]  
 border-t border-white/[0.06]"
      >
        <h1
          className="bg-gradient-to-r
from-[#67E8F9]
via-[#A78BFA]
to-[#C084FC]
bg-clip-text
text-transparent font-bold tracking-tight text-3xl text-center p-6"
        >
          AuraSlides
        </h1>
      </div>
      <section
        className="bg-gradient-to-r
from-[#0A0F1C]
via-[#0F172A]
to-[#0A0F1C] "
      >
        <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mx-auto max-w-7xl gap-10 pt-4 px-6 pb-10 py-12 justify-items-center text-center md:text-left">
          <div>
            <h1 className="text-slate-200 font-medium text-2xl pb-3">
              Product
            </h1>
            <ul className="text-slate-400 ">
              <li
                className="hover:text-slate-50 hover:scale-[1.01] text-[19px]
transition-colors duration-200"
              >
                <a href="">Features</a>
              </li>
              <li
                className="hover:text-slate-50 hover:scale-[1.01] text-[19px]
transition-colors duration-200"
              >
                <a href="">Changelog</a>
              </li>
              <li
                className="hover:text-slate-50 hover:scale-[1.01] text-[19px]
transition-colors duration-200"
              >
                <a href="">Roadmap</a>
              </li>
            </ul>
          </div>
          <div>
            <h1 className="text-slate-400 font-medium text-2xl pb-3">
              Developers
            </h1>
            <ul className="text-slate-400">
              <li
                className="hover:text-slate-50 hover:scale-[1.01] text-[19px]
transition-colors duration-200"
              >
                <a href="">GitHub Repository</a>
              </li>
              <li
                className="hover:text-slate-50 hover:scale-[1.01] text-[19px]
transition-colors duration-200"
              >
                <a href="">Documentation</a>
              </li>
              <li
                className="hover:text-slate-50 hover:scale-[1.01] text-[19px]
transition-colors duration-200"
              >
                <a href="">API Status</a>
              </li>
            </ul>
          </div>
          <div>
            <h1 className="text-slate-400 font-medium text-2xl pb-3">
              Company
            </h1>
            <ul className="text-slate-400">
              <li
                className="hover:text-slate-50 hover:scale-[1.01] text-[19px]
transition-colors duration-200"
              >
                <a href="">Privacy Policy</a>
              </li>
              <li
                className="hover:text-slate-50 hover:scale-[1.01] text-[19px]
transition-colors duration-200"
              >
                <a href="">Terms of Service</a>
              </li>
            </ul>
          </div>
        </div>
      </section>
      <div className="bg-[#0A0F1C] text-slate-300 text-center p-4">
        © 2026 AuraSlides. All rights reserved.
      </div>
    </>
  );
}
