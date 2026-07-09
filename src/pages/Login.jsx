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
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <section className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-5 shadow-soft sm:p-8">
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
              <label className="text-sm font-semibold text-slate-700">Role</label>
              <select
                value={role}
                onChange={(event) => {
                  const nextRole = event.target.value;
                  setRole(nextRole);
                  setLoginForm({ email: nextRole === 'super_admin' ? 'super@rental.com' : 'admin@demo.com', password: '123456' });
                }}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950"
              >
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Email</label>
              <input value={loginForm.email} onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950" required />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Password</label>
              <input type="password" value={loginForm.password} onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950" required />
            </div>
            <button className="w-full rounded-2xl bg-[#00D6CC] px-5 py-3 font-bold text-white hover:opacity-90 transition">Login</button>
          </form>
        ) : (
          <form onSubmit={submitRegister} className="space-y-4">

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-700">Admin Name</label>
                <input value={registerForm.adminName} onChange={(event) => setRegisterForm({ ...registerForm, adminName: event.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950" required />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Company Name</label>
                <input value={registerForm.companyName} onChange={(event) => setRegisterForm({ ...registerForm, companyName: event.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950" required />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Email</label>
                <input type="email" value={registerForm.email} onChange={(event) => setRegisterForm({ ...registerForm, email: event.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950" required />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Password</label>
                <input type="password" value={registerForm.password} onChange={(event) => setRegisterForm({ ...registerForm, password: event.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950" required minLength={6} />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Owner Name</label>
                <input value={registerForm.ownerName} onChange={(event) => setRegisterForm({ ...registerForm, ownerName: event.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950" required />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Phone</label>
                <input value={registerForm.phone} onChange={(event) => setRegisterForm({ ...registerForm, phone: event.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950" required />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">GST Number</label>
                <input value={registerForm.gstNumber} onChange={(event) => setRegisterForm({ ...registerForm, gstNumber: event.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Documents</label>
                <input type="file" multiple onChange={(event) => setDocuments(event.target.files)} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-950" />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Address</label>
              <textarea value={registerForm.address} onChange={(event) => setRegisterForm({ ...registerForm, address: event.target.value })} className="mt-2 min-h-24 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950" required />
            </div>
            <button disabled={loading} className="w-full rounded-2xl bg-[#00D6CC] px-5 py-3 font-bold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 transition">
              {loading ? 'Registering...' : 'Register Company'}
            </button>
          </form>
        )}
      </section>
    </div>
  );
};

export default Login;
