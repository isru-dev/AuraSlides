export function Body() {
  return (
    <section className=" bg-gradient-to-br from-[#050816] via-[#0B1220] to-[#111827] py-24 gap-8 px-6">
      <div
        className="max-w-7xl
mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-center gap-8"
      >
        <div
          className=" bg-white/[0.03]
backdrop-blur-xl
border
border-white/[0.06]
rounded-2xl hover:bg-white/[0.05]
hover:border-white/[0.12]
transition-all
duration-300 h-[250px] flex items-center flex-col justify-center p-3"
        >
          <h1
            className="
font-semibold
text-2xl text-cyan-400"
          >
AI Presentation Generation          </h1>
          <p
            className="text-slate-300
leading-relaxed py-7 px-14"
          >
            Turn any prompt or rough topic into a complete, context-aware slide deck in seconds
          </p>
        </div>
        <div
          className="bg-white/[0.03]
backdrop-blur-xl
border
border-white/[0.06]
rounded-2xl h-[250px] hover:border-white/[0.12]
transition-all
duration-300 flex items-center flex-col justify-center p-3"
        >
          <h1
            className="font-semibold
text-2xl text-cyan-400"
          >
           Built-In Image Search & Swaps
          </h1>
          <p
            className="text-slate-300
leading-relaxed py-7"
          >
            Easily search, swap, or delete slide images with custom keywords directly inside the editor so every slide fits your vibe.
          </p>
        </div>
        <div
          className="bg-white/[0.03]
backdrop-blur-xl
border
border-white/[0.06]
rounded-2xl hover:border-white/[0.12]
transition-all
duration-300 h-[250px]   flex items-center flex-col justify-center p-3"
        >
          <h1
            className="font-semibold
text-2xl text-cyan-400"
          >
           Auto-Sync & PPTX Export
          </h1>
          <p
            className="text-slate-300
leading-relaxed py-7"
          >
           Your changes save automatically to your workspace, and you can export your deck as an editable .pptx file anytime with a single click.
          </p>
        </div>
      </div>
    </section>
  );
}
