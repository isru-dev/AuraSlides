import { useNavigate } from "react-router-dom";
export function Hero() {
  const navigate = useNavigate();

  return (
    <section className="min-h-[85vh] flex items-center bg-gradient-to-br from-[#050816] via-[#0B1220] to-[#111827] ">
      <div className="max-w-8xl mx-auto px-6">
        <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-[#67E8F9] via-[#A78BFA] to-[#C084FC] bg-clip-text  text-transparent ">
          From Raw Prompts to Premium Slide Instantly.
        </h1>
        <p className="text-slate-300 text-lg sm:text-xl text-slate-400 mt-4 max-w-2xl">
          No more spending hours tweaking PowerPoint layouts. AuraSlides takes your raw ideas and turns them into clean, perfectly designed slides in a flash.
        </p>
        <div className=" flex flex-wrap gap-4 mt-8">
          <button  onClick={() => navigate("/register")}
            className="bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6]
hover:from-[#22D3EE]
hover:to-[#A78BFA]
text-white
font-medium
px-6
py-3
rounded-xl
shadow-[0_0_40px_rgba(139,92,246,0.25)]
hover:scale-[1.02]
transition-all
duration-300 cursor-pointer"
          >
            Generate Your First Presentaion Free
          </button>
          <button
            className="bg-gradient-to-r
from-[#06B6D4]
to-[#8B5CF6]
hover:from-[#22D3EE]
hover:to-[#A78BFA]
text-white
font-medium
px-6
py-3
rounded-xl
shadow-[0_0_40px_rgba(139,92,246,0.25)]
hover:scale-[1.02]
transition-all
duration-300 cursor-pointer"
          >
            Watch 1-Min Demo
          </button>
        </div>
      </div>

      
    </section>
   
  );
}
