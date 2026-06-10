export function Login() {
  return (
    <section>
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
      <div>
        <h1>Create your AuraSlides account</h1>
        <h2>Start generating AI-powered presentations in seconds.</h2>
        <button>Continue with Google</button>
        <form action="/login" action="post">
          <label>Email Address</label>
          <input type="Email" required />
          <label>Password</label>
          <input type="Password" required />
          <a href="">Forgot Password?</a>
          <button type="sub
          mit">Sign In</button>
        </form>
        <p>Don't have an account?</p>
      <a href="#">Create Account</a>
      </div>
    </section>
  );
}
