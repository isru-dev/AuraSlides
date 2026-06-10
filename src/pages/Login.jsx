export function Login() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 max-w-7xl mx-auto align-items-center min-h-screen">
      <div className="bg-gradient-to-br from-[#94a5f0] via-[#0B1220] to-[#111827]  ">
        <h1
          className="bg-gradient-to-r
from-[#67E8F9]
via-[#A78BFA]
to-[#C084FC]
bg-clip-text
text-transparent font-bold tracking-tight text-3xl  p-6 pb-5"
        >
          AuraSlides
        </h1>
      <p className="text-slate-50 font-bold text-4xl lg:text-5xl leading-tight">
  Turn ideas into
  <br />
  professional presentations
  <br />
  <span
    className="bg-gradient-to-r from-[#67E8F9] via-[#A78BFA] to-[#C084FC]
    bg-clip-text text-transparent"
  >
    with AI
  </span>
</p>
        <p className="pb-4 text-slate-300">
          Generate beautiful slide decks, automatically structured and ready to
          present.
        </p>
        <ul className="space-y-4 text-slate-100">
  <li>
    <span className="text-cyan-400 mr-2">✓</span>
    AI-generated slide structures
  </li>

  <li>
    <span className="text-cyan-400 mr-2">✓</span>
    Multiple layout styles
  </li>

  <li>
    <span className="text-cyan-400 mr-2">✓</span>
    Export-ready presentations
  </li>
</ul>
      </div>
      <div className="bg-white/[0.03]
border border-white/[0.06]
backdrop-blur-xl
rounded-3xl
shadow-[0_0_40px_rgba(139,92,246,0.12)]">
        <h1 className="text-3xl
font-bold
text-slate-50">Create your AuraSlides account</h1>
        <h2 className="text-slate-400
text-sm">Start generating AI-powered presentations in seconds.</h2>
        <button className="bg-white
text-slate-900
border border-slate-200
rounded-xl
font-medium hover:bg-slate-100">Continue with Google</button>
<p className="-text-slate-500">──────── OR ────────</p>
        <form  action="post">
          <label className="text-slate-700
text-sm
font-medium">Email</label>
          <input type="Email" required  className="bg-[#111827] border-white[0.08]  text-slate-500 rounded-xl py-3 px-4"/>
          <label className="text-slate-700
text-sm
font-medium">Password</label>
          <input type="Password" required />
          <a href="">Forgot Password?</a>
          <button type="submit"> Sign In</button>
        </form>
        <p>Don't have an account?</p>
        <a href="#">Create Account</a>
      </div>
    </section>
  );
}
