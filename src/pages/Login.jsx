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
    city: '',
  });
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  const submitLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    const result = await login({ ...loginForm, role });
    setLoading(false);
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
    const result = await registerCompany({
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
        city: registerForm.city,
      },
      rawDocuments: documents,
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
        @keyframes driveRightToLeft {
          0% {
            transform: translateX(100vw);
          }
          100% {
            transform: translateX(-420px);
          }
        }
        .animate-drive-car {
          animation: driveRightToLeft 16s linear infinite;
        }
        @keyframes spinWheel {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(-360deg);
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
      <div className="absolute bottom-[60px] left-0 pointer-events-none z-0 w-[300px] sm:w-[380px] opacity-40 animate-drive-car filter drop-shadow-[0_4px_20px_rgba(0,214,204,0.45)]">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 100" className="w-full h-auto">
          <defs>
            <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00D6CC" />
              <stop offset="100%" stopColor="#00D6CC" />
            </linearGradient>
            <linearGradient id="windowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#E0F2FE" />
              <stop offset="100%" stopColor="#7DD3FC" />
            </linearGradient>
            <linearGradient id="beamGrad" x1="100%" y1="50%" x2="0%" y2="50%">
              <stop offset="0%" stopColor="#FFF275" stopOpacity="0.85" />
              <stop offset="30%" stopColor="#FFF275" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#FFF275" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Shadow under the car */}
          <ellipse cx="120" cy="85" rx="98" ry="4" fill="rgba(0,0,0,0.4)" />

          {/* Car chassis with suspension bounce */}
          <g className="animate-car-suspension">
            {/* Main red body chassis */}
            <path d="M 24,78 C 12,78 10,64 16,56 L 28,48 C 32,45 42,43 74,42 L 105,16 L 195,16 Q 206,16 216,36 L 225,62 C 228,68 228,78 214,78 L 198,78 A 21,21 0 0,0 156,78 L 84,78 A 21,21 0 0,0 42,78 Z" fill="url(#bodyGrad)" stroke="#1A1A1A" strokeWidth="2.5" strokeLinejoin="round" />

            {/* Wheel Arch Fenders */}
            <path d="M 38,78 A 25,25 0 0,1 88,78" fill="none" stroke="#1A1A1A" strokeWidth="1.5" />
            <path d="M 152,78 A 25,25 0 0,1 202,78" fill="none" stroke="#1A1A1A" strokeWidth="1.5" />

            {/* Taxi Sign */}
            <g transform="translate(132, 5)">
              <path d="M5,11 L25,11 L21,3 L9,3 Z" fill="#FFB300" stroke="#1A1A1A" strokeWidth="1.8" strokeLinejoin="round" />
              <text x="15" y="9.5" fontSize="6" fontWeight="900" fill="#000" fontFamily="system-ui, sans-serif" textAnchor="middle">TAXI</text>
            </g>

            {/* Windows */}
            <path d="M 83,40 L 107,20 L 148,20 L 148,40 Z" fill="url(#windowGrad)" stroke="#1A1A1A" strokeWidth="2" strokeLinejoin="round" />
            <path d="M 153,40 L 153,20 L 192,20 Q 200,20 205,32 L 208,40 Z" fill="url(#windowGrad)" stroke="#1A1A1A" strokeWidth="2" strokeLinejoin="round" />

            {/* Window Glass Gloss Highlights */}
            <path d="M 88,38 L 108,22 L 125,22 C 110,30 95,36 88,38 Z" fill="#FFFFFF" opacity="0.6" />
            <path d="M 156,22 L 180,22 C 170,30 162,35 156,38 Z" fill="#FFFFFF" opacity="0.6" />

            {/* Door Handle */}
            <rect x="130" y="47" width="12" height="4" rx="2" fill="#E2E8F0" stroke="#1A1A1A" strokeWidth="1.5" />

            {/* Side Mirror */}
            <path d="M 75,41 Q 72,36 68,36 Q 64,36 67,42 Z" fill="#FF3B30" stroke="#1A1A1A" strokeWidth="1.5" />

            {/* Front Headlight (Oval) */}
            <ellipse cx="20" cy="54" rx="4" ry="7" transform="rotate(-15, 20, 54)" fill="#E0F2FE" stroke="#1A1A1A" strokeWidth="2" />
            <ellipse cx="19" cy="52" rx="1.5" ry="3" transform="rotate(-15, 19, 52)" fill="#FFF" />

            {/* Glowing Headlight Beam */}
            <polygon points="18,54 -120,25 -120,95 18,58" fill="url(#beamGrad)" opacity="0.35" style={{ mixBlendMode: 'screen' }} />

            {/* Taillight */}
            <path d="M 221,48 C 224,48 225,52 223,55 C 221,58 218,58 218,55 Z" fill="#FF8A80" stroke="#1A1A1A" strokeWidth="1.5" />
            <path d="M 221,49 C 222,49 223,51 222,53 Z" fill="#FFF" />

            {/* Side Indicator */}
            <rect x="35" y="52" width="6" height="3" rx="1.5" fill="#FF9100" stroke="#1A1A1A" strokeWidth="1.2" />
          </g>

          {/* Wheels - Front Wheel (centered at 177, 78) */}
          <g className="animate-spin-wheel" style={{ transformOrigin: '177px 78px' }}>
            <circle cx="177" cy="78" r="18" fill="#1A1A1A" />
            <circle cx="177" cy="78" r="12.5" fill="#E2E8F0" stroke="#1A1A1A" strokeWidth="2" />
            {/* Spokes */}
            <path d="M 177,60 L 177,96 M 159,78 L 195,78 M 164,65 L 190,91 M 164,91 L 190,65" stroke="#1A1A1A" strokeWidth="2.5" />
            <circle cx="177" cy="78" r="5" fill="#94A3B8" stroke="#1A1A1A" strokeWidth="1.5" />
            <circle cx="177" cy="78" r="2" fill="#FFF" />
          </g>

          {/* Wheels - Back Wheel (centered at 63, 78) */}
          <g className="animate-spin-wheel" style={{ transformOrigin: '63px 78px' }}>
            <circle cx="63" cy="78" r="18" fill="#1A1A1A" />
            <circle cx="63" cy="78" r="12.5" fill="#E2E8F0" stroke="#1A1A1A" strokeWidth="2" />
            {/* Spokes */}
            <path d="M 63,60 L 63,96 M 45,78 L 81,78 M 50,65 L 76,91 M 50,91 L 76,65" stroke="#1A1A1A" strokeWidth="2.5" />
            <circle cx="63" cy="78" r="5" fill="#94A3B8" stroke="#1A1A1A" strokeWidth="1.5" />
            <circle cx="63" cy="78" r="2" fill="#FFF" />
          </g>
        </svg>
      </div>

      <section className="relative z-10 flex w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-100 bg-white/98 backdrop-blur-sm shadow-2xl">
        {/* Left Side: Image */}
        <div className="hidden md:flex md:w-1/2 bg-slate-50 border-r border-slate-100 overflow-hidden items-center justify-center p-4">
          <img
            src="/login-banner.png"
            alt="Book Fast Taxi Login Banner"
            className="w-full h-auto max-h-full object-contain transition-transform hover:scale-102 duration-300"
          />
        </div>

        {/* Right Side: Form Inputs */}
        <div className="w-full md:w-1/2 p-4 sm:p-5 flex flex-col justify-center">
          <div className="mb-2 flex flex-col items-center text-center">
            <img src="/logo.png" alt="BIIPBIIP Logo" className="h-10 w-25 mb-1.5 rounded-2xl object-cover shadow-lg" />
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
                  <label className="text-xs font-semibold text-white">City</label>
                  <input value={registerForm.city} onChange={(event) => setRegisterForm({ ...registerForm, city: event.target.value })} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-[#00D6CC] transition" required />
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
