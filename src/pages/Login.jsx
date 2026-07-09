import { Building2, ShieldCheck } from 'lucide-react';
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
      {/* Background Decorative Glow Blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#00D6CC] opacity-20 blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#00D6CC] opacity-15 blur-[150px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-80 h-80 rounded-full bg-[#00D6CC] opacity-5 blur-[100px] pointer-events-none"></div>

      <section className="relative z-10 flex w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-100 bg-white/98 backdrop-blur-sm shadow-2xl">
        {/* Left Side: Image */}
        <div className="hidden md:flex md:w-1/2 items-center justify-center bg-slate-50 border-r border-slate-100 p-8">
          <img
            src="/login-banner.png"
            alt="Book Fast Taxi Login Banner"
            className="max-h-[480px] object-contain rounded-2xl transition-transform hover:scale-102 duration-300"
          />
        </div>

        {/* Right Side: Form Inputs */}
        <div className="w-full md:w-1/2 p-6 sm:p-10 flex flex-col justify-center">
          <div className="mb-6 text-center">
            <h1 className="text-4xl font-black tracking-wider text-[#031E3C]">
              BIIP<span className="text-[#00D6CC]">BIIP</span>
            </h1>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">Car Rental & Taxi Admin Panel</p>
          </div>

          <div className="mb-6 flex rounded-2xl bg-slate-100 p-1">
            <button onClick={() => setMode('login')} className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold transition-all ${mode === 'login' ? 'bg-[#00D6CC] text-white shadow-sm' : 'text-slate-500'}`}>
              Login
            </button>
            <button onClick={() => setMode('register')} className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold transition-all ${mode === 'register' ? 'bg-[#00D6CC] text-white shadow-sm' : 'text-slate-500'}`}>
              Register Company
            </button>
          </div>

          {message ? <div className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{message}</div> : null}

          {mode === 'login' ? (
            <form onSubmit={submitLogin} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-white">Role</label>
                <select
                  value={role}
                  onChange={(event) => {
                    const nextRole = event.target.value;
                    setRole(nextRole);
                    setLoginForm({ email: nextRole === 'super_admin' ? 'super@rental.com' : 'admin@demo.com', password: '123456' });
                  }}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#00D6CC] transition"
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-white">Email</label>
                <input value={loginForm.email} onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#00D6CC] transition" required />
              </div>
              <div>
                <label className="text-sm font-semibold text-white">Password</label>
                <input type="password" value={loginForm.password} onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#00D6CC] transition" required />
              </div>
              <button className="w-full rounded-2xl bg-[#00D6CC] px-5 py-3 font-bold text-white hover:opacity-90 transition">Login</button>
            </form>
          ) : (
            <form onSubmit={submitRegister} className="space-y-4">

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-white">Admin Name</label>
                  <input value={registerForm.adminName} onChange={(event) => setRegisterForm({ ...registerForm, adminName: event.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#00D6CC] transition" required />
                </div>
                <div>
                  <label className="text-sm font-semibold text-white">Company Name</label>
                  <input value={registerForm.companyName} onChange={(event) => setRegisterForm({ ...registerForm, companyName: event.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#00D6CC] transition" required />
                </div>
                <div>
                  <label className="text-sm font-semibold text-white">Email</label>
                  <input type="email" value={registerForm.email} onChange={(event) => setRegisterForm({ ...registerForm, email: event.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#00D6CC] transition" required />
                </div>
                <div>
                  <label className="text-sm font-semibold text-white">Password</label>
                  <input type="password" value={registerForm.password} onChange={(event) => setRegisterForm({ ...registerForm, password: event.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#00D6CC] transition" required minLength={6} />
                </div>
                <div>
                  <label className="text-sm font-semibold text-white">Owner Name</label>
                  <input value={registerForm.ownerName} onChange={(event) => setRegisterForm({ ...registerForm, ownerName: event.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#00D6CC] transition" required />
                </div>
                <div>
                  <label className="text-sm font-semibold text-white">Phone</label>
                  <input value={registerForm.phone} onChange={(event) => setRegisterForm({ ...registerForm, phone: event.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#00D6CC] transition" required />
                </div>
                <div>
                  <label className="text-sm font-semibold text-white">GST Number</label>
                  <input value={registerForm.gstNumber} onChange={(event) => setRegisterForm({ ...registerForm, gstNumber: event.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#00D6CC] transition" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-white">Documents</label>
                  <input type="file" multiple onChange={(event) => setDocuments(event.target.files)} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#00D6CC] transition" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-white">Address</label>
                <textarea value={registerForm.address} onChange={(event) => setRegisterForm({ ...registerForm, address: event.target.value })} className="mt-2 min-h-24 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#00D6CC] transition" required />
              </div>
              <button disabled={loading} className="w-full rounded-2xl bg-[#00D6CC] px-5 py-3 font-bold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 transition">
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
