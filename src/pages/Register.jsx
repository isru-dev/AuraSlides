export function Register() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 ">
      <div>
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
        <p>Turn ideas into professional presentations with AI.</p>
        <ul>
          <li>AI-generated slide structures</li>
          <li> Multiple layout styles</li>
          <li>Export-ready presentations</li>
        </ul>
      </div>
      <div
        className="bg-white/[0.03]
border-white/[0.06]
backdrop-blur-xl"
      >
        <h1>Create your AuraSlides account</h1>
        <h2>Start generating AI-powered presentations in seconds.</h2>
        <button>Continue with Google</button>
        <form  method="post">
          <label>Email Address</label>
          <input type="Email" required className="" />
          <label>Password</label>
          <input type="Password" required />
          <label>Confirm Password</label>
          <input type="Password" required />
          <button type="submit">Create Account</button>
        </form>
        <p>Already have an account?</p>
        <a href="/login">Sign In</a>
      </div>
    </section>
  );
}
