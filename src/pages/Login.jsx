import { Building2, ShieldCheck, Car } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { readFileAsDataUrl } from '../utils/storage';

const Login = ({ setActivePage }) => {
  const { login, registerCompany } = useApp();
  const [mode, setMode] = useState('login');
  const [role, setRole] = useState('admin');
  const [message, setMessage] = useState('');
  const [loginForm, setLoginForm] = useState({ email: 'admin@demo.com', password: '123456' });
  const [registerForm, setRegisterForm] = useState({
    adminName: '',
    email: '',
    password: '',
    companyName: '',
    ownerName: '',
    phone: '',
    address: '',
    gstNumber: '',
  });
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  const submitLogin = (event) => {
    event.preventDefault();
    const result = login({ ...loginForm, role });
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setActivePage(role === 'super_admin' ? 'super-dashboard' : 'admin-dashboard');
  };

  const submitRegister = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    const docs = await Promise.all(Array.from(documents).map(readFileAsDataUrl));
    const result = registerCompany({
      adminName: registerForm.adminName,
      email: registerForm.email,
      password: registerForm.password,
      company: {
        companyName: registerForm.companyName,
        ownerName: registerForm.ownerName,
        email: registerForm.email,
        phone: registerForm.phone,
        address: registerForm.address,
        gstNumber: registerForm.gstNumber,
        documents: docs.filter(Boolean),
      },
    });
    setLoading(false);

    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setActivePage('company-profile');
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 sm:p-6 md:p-10 bg-[#031E3C] overflow-hidden">
      <style>{`
        @keyframes driveLeftToRight {
          0% {
            transform: translateX(-420px);
          }
          100% {
            transform: translateX(100vw);
          }
        }
        .animate-drive-car {
          animation: driveLeftToRight 16s linear infinite;
        }
        @keyframes spinWheel {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .animate-spin-wheel {
          animation: spinWheel 0.6s linear infinite;
        }
        @keyframes carSuspension {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-1.5px);
          }
        }
        .animate-car-suspension {
          animation: carSuspension 0.35s ease-in-out infinite;
        }
      `}</style>
      {/* Background Decorative Glow Blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#00D6CC] opacity-20 blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#00D6CC] opacity-15 blur-[150px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-80 h-80 rounded-full bg-[#00D6CC] opacity-5 blur-[100px] pointer-events-none"></div>

      {/* Road line for the car */}
      <div className="absolute bottom-16 left-0 right-0 h-[2px] bg-slate-700/20 w-full pointer-events-none"></div>

      {/* Moving Car */}
      <div className="absolute bottom-[26px] left-0 pointer-events-none z-0 w-[300px] sm:w-[380px] opacity-40 animate-drive-car filter drop-shadow-[0_4px_20px_rgba(0,214,204,0.45)]">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 100" className="w-full h-auto">
          <defs>
            <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00A8A0" />
              <stop offset="50%" stopColor="#00D6CC" />
              <stop offset="100%" stopColor="#00F3E8" />
            </linearGradient>
            <linearGradient id="windowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
            <linearGradient id="wheelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
          </defs>

          {/* Shadow under the car */}
          <ellipse cx="120" cy="85" rx="98" ry="5" fill="rgba(0,0,0,0.5)" />

          {/* Car chassis with suspension bounce */}
          <g className="animate-car-suspension">
            {/* Main chassis and cabin */}
            <path d="M15,65 L18,50 Q22,38 45,35 L75,35 Q90,15 135,15 L180,15 Q210,30 220,48 L228,52 Q235,55 235,65 L230,78 C228,82 220,82 215,82 L195,82 A18,18 0 0,0 161,82 L80,82 A18,18 0 0,0 46,82 L25,82 C20,82 15,80 15,65 Z" fill="url(#bodyGrad)" />

            {/* Taxi Sign on top */}
            <path d="M120,15 L140,15 L135,5 L125,5 Z" fill="#FFC107" />
            <rect x="126" y="8" width="8" height="4" fill="#000" />
            <text x="128" y="13" fontSize="5" fontWeight="bold" fill="#000" fontFamily="sans-serif">TAXI</text>

            {/* Windows */}
            <path d="M80,38 L130,38 L130,20 L95,20 Z" fill="url(#windowGrad)" opacity="0.9" />
            <path d="M136,38 L175,38 Q188,38 194,30 L176,20 L136,20 Z" fill="url(#windowGrad)" opacity="0.9" />

            {/* Window divider lines */}
            <line x1="133" y1="20" x2="133" y2="38" stroke="#00D6CC" strokeWidth="1.5" opacity="0.7" />

            {/* Door handles */}
            <rect x="100" y="48" width="10" height="2" rx="1" fill="#1E293B" />
            <rect x="150" y="48" width="10" height="2" rx="1" fill="#1E293B" />

            {/* Front Headlight */}
            <path d="M228,52 Q234,55 228,62 Z" fill="#FFF" />
            {/* Glowing Light Beam */}
            <polygon points="231,54 280,45 280,75 231,61" fill="rgba(0, 243, 232, 0.15)" filter="blur(2px)" />

            {/* Taillight on the left (back) */}
            <path d="M15,54 Q12,56 15,60 Z" fill="#FF3B30" />
          </g>

          {/* Wheels - Front Wheel (centered at 178, 80) */}
          <g className="animate-spin-wheel" style={{ transformOrigin: '178px 80px' }}>
            <circle cx="178" cy="80" r="16" fill="url(#wheelGrad)" stroke="#00D6CC" strokeWidth="2.5" />
            <circle cx="178" cy="80" r="6" fill="#E2E8F0" />
            {/* Rims / Spokes */}
            <line x1="178" y1="64" x2="178" y2="96" stroke="#00D6CC" strokeWidth="2" />
            <line x1="162" y1="80" x2="194" y2="80" stroke="#00D6CC" strokeWidth="2" />
            <line x1="167" y1="69" x2="189" y2="91" stroke="#E2E8F0" strokeWidth="1.5" opacity="0.8" />
            <line x1="167" y1="91" x2="189" y2="69" stroke="#E2E8F0" strokeWidth="1.5" opacity="0.8" />
          </g>

          {/* Wheels - Back Wheel (centered at 63, 80) */}
          <g className="animate-spin-wheel" style={{ transformOrigin: '63px 80px' }}>
            <circle cx="63" cy="80" r="16" fill="url(#wheelGrad)" stroke="#00D6CC" strokeWidth="2.5" />
            <circle cx="63" cy="80" r="6" fill="#E2E8F0" />
            {/* Rims / Spokes */}
            <line x1="63" y1="64" x2="63" y2="96" stroke="#00D6CC" strokeWidth="2" />
            <line x1="47" y1="80" x2="79" y2="80" stroke="#00D6CC" strokeWidth="2" />
            <line x1="52" y1="69" x2="74" y2="91" stroke="#E2E8F0" strokeWidth="1.5" opacity="0.8" />
            <line x1="52" y1="91" x2="74" y2="69" stroke="#E2E8F0" strokeWidth="1.5" opacity="0.8" />
          </g>
        </svg>
      </div>

      <section className="relative z-10 flex w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-100 bg-white/98 backdrop-blur-sm shadow-2xl">
        {/* Left Side: Image */}
        <div className="hidden md:flex md:w-1/2 items-center justify-center bg-slate-50 border-r border-slate-100 p-3">
          <img
            src="/login-banner.png"
            alt="Book Fast Taxi Login Banner"
            className="max-h-[240px] object-contain rounded-2xl transition-transform hover:scale-102 duration-300"
          />
        </div>

        {/* Right Side: Form Inputs */}
        <div className="w-full md:w-1/2 p-4 sm:p-5 flex flex-col justify-center">
          <div className="mb-2 flex flex-col items-center text-center">
            <img src="/logo.png" alt="BIIPBIIP Logo" className="h-10 w-10 mb-1.5 rounded-2xl object-cover shadow-lg" />
          </div>

          <div className="mb-3 flex rounded-2xl bg-slate-100 p-1">
            <button onClick={() => setMode('login')} className={`flex-1 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${mode === 'login' ? 'bg-[#00D6CC] text-white shadow-sm' : 'text-slate-500'}`}>
              Login
            </button>
            <button onClick={() => setMode('register')} className={`flex-1 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${mode === 'register' ? 'bg-[#00D6CC] text-white shadow-sm' : 'text-slate-500'}`}>
              Register Company
            </button>
          </div>

          {message ? <div className="mb-2 rounded-2xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">{message}</div> : null}

          {mode === 'login' ? (
            <form onSubmit={submitLogin} className="space-y-2.5">
              <div>
                <label className="text-xs font-semibold text-white">Role</label>
                <select
                  value={role}
                  onChange={(event) => {
                    const nextRole = event.target.value;
                    setRole(nextRole);
                    setLoginForm({ email: nextRole === 'super_admin' ? 'super@rental.com' : 'admin@demo.com', password: '123456' });
                  }}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-[#00D6CC] transition"
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-white">Email</label>
                <input value={loginForm.email} onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-[#00D6CC] transition" required />
              </div>
              <div>
                <label className="text-xs font-semibold text-white">Password</label>
                <input type="password" value={loginForm.password} onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-[#00D6CC] transition" required />
              </div>
              <button className="w-full rounded-2xl bg-[#00D6CC] px-4 py-2 text-sm font-bold text-white hover:opacity-90 transition">Login</button>
            </form>
          ) : (
            <form onSubmit={submitRegister} className="space-y-2.5">

              <div className="grid gap-2.5 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-white">Admin Name</label>
                  <input value={registerForm.adminName} onChange={(event) => setRegisterForm({ ...registerForm, adminName: event.target.value })} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-[#00D6CC] transition" required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white">Company Name</label>
                  <input value={registerForm.companyName} onChange={(event) => setRegisterForm({ ...registerForm, companyName: event.target.value })} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-[#00D6CC] transition" required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white">Email</label>
                  <input type="email" value={registerForm.email} onChange={(event) => setRegisterForm({ ...registerForm, email: event.target.value })} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-[#00D6CC] transition" required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white">Password</label>
                  <input type="password" value={registerForm.password} onChange={(event) => setRegisterForm({ ...registerForm, password: event.target.value })} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-[#00D6CC] transition" required minLength={6} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white">Owner Name</label>
                  <input value={registerForm.ownerName} onChange={(event) => setRegisterForm({ ...registerForm, ownerName: event.target.value })} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-[#00D6CC] transition" required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white">Phone</label>
                  <input value={registerForm.phone} onChange={(event) => setRegisterForm({ ...registerForm, phone: event.target.value })} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-[#00D6CC] transition" required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white">GST Number</label>
                  <input value={registerForm.gstNumber} onChange={(event) => setRegisterForm({ ...registerForm, gstNumber: event.target.value })} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-[#00D6CC] transition" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white">Documents</label>
                  <input type="file" multiple onChange={(event) => setDocuments(event.target.files)} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-[#00D6CC] transition" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-white">Address</label>
                <textarea value={registerForm.address} onChange={(event) => setRegisterForm({ ...registerForm, address: event.target.value })} className="mt-1 min-h-16 w-full rounded-2xl border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-[#00D6CC] transition" required />
              </div>
              <button disabled={loading} className="w-full rounded-2xl bg-[#00D6CC] px-4 py-2 text-sm font-bold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 transition">
                {loading ? 'Registering...' : 'Register Company'}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

export default Login;
