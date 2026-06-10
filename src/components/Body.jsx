export function Body() {
  return (
    <section
      className=" bg-gradient-to-br from-[#050816] via-[#0B1220] to-[#111827] py-24 gap-8 px-6"
    >
      <div className="max-w-7xl
mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-center gap-8">
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
          AI-Driven Layout Mapping
        </h1>
        <p
          className="text-slate-300
leading-relaxed py-7 px-14"
        >
          Processes open-ended text via intelligent data pipelines to build
          cohesive slide narrative structures instantly.
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
          Flexible Layout Switcher
        </h1>
        <p
          className="text-slate-300
leading-relaxed py-7"
        >
          Instantly remodel individual slides from horizontal data grids into
          centered hero layouts at the click of a single toggle.
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
          Premium Minimalist Aesthetic
        </h1>
        <p
          className="text-slate-300
leading-relaxed py-7"
        >
          Built with a fluid, dark-mode workspace layout that features high-end
          typography and crisp component transitions out of the box.
        </p>
      </div>
      </div>
    </section>
  );
}
