export function Header(){
    return (
      <header className="bg-[#0B1220]/60 backdrop-blur-2xl border-b border-white/5 text-white py-4 sticky top-0 z-50" >
         <nav className="flex justify-between items-center mx-auto max-w-7xl px-6 lg:px-8">
          <div className="w-39"> 
          <a href="" className="bg-gradient-to-r from-cyan-300 via-violet-300 to-purple-300 bg-clip-text text-transparent font-bold tracking-tight text-xl">AuraSlides</a>
          </div>
          <div>
           <ul className="flex  items-center gap-8 md:space-x-10 xl:space-x-24 text-sm text-slate-300 font-medium justify-between ">
            <li className=" hover:text-slate-50 transition-all duration-200"><a href="/register">Get Started</a></li>
             <li className=" hover:text-slate-50 transition-all duration-200"><a href="">GITHUB</a></li>
            <li className=" bg-gradient-to-r from-[#06B6D4]  to-[#8B5CF6] text-white rounded-lg px-5 py-2 shadow-[0_0_25px_rgba(139,92,246,0.2)] hover:shadow-[0_0_35px_rgba(139,92,246,0.35)] transition-all duration-300 font-medium hover:scale-[1.02] active:scale-[0.98]"><a href="">LOGIN</a></li>
           
           </ul>
           </div>
         </nav>
      </header>
    )
}