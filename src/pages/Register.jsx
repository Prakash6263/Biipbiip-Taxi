import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

const Register = ({ setActivePage }) => {
  const { registerCompany } = useApp();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
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
    <div className="relative flex min-h-screen flex-col justify-between p-4 sm:p-6 md:p-10 bg-[#031E3C] text-white overflow-x-hidden">
      {/* Background Decorative Glow Blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#00D6CC] opacity-10 blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#00D6CC] opacity-10 blur-[150px] pointer-events-none"></div>

      {/* Top Header */}
      <header className="relative z-10 mx-auto w-full max-w-5xl flex items-center justify-between pb-6 border-b border-white/10">
        <img src="/logo.png" alt="BIIPBIIP Logo" className="h-10 w-25 rounded-2xl object-cover shadow-lg" />
        <button
          onClick={() => setActivePage('login')}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-2 text-xs font-bold hover:bg-white/10 hover:text-white transition"
        >
          <ArrowLeft size={14} /> Back to Login
        </button>
      </header>

      {/* Main Spacious Content */}
      <main className="relative z-10 mx-auto w-full max-w-5xl flex-1 flex flex-col justify-center py-10">
        <div className="grid gap-10 lg:grid-cols-3 items-start">

          {/* Left Column: Branding Text and Features */}
          <div className="lg:col-span-1 space-y-6">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Register Your Company
              </h2>
              <p className="text-sm text-slate-300 mt-3 leading-relaxed">
                Join our premium network of car rental partners. List your fleet, track booking requests in real-time, and scale your business effortlessly.
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/10">
              {[
                'Real-time vehicle status tracking',
                'Corporate dashboard for rental managers',
                'Dynamic billing & pricing control',
                'Verified customers & booking requests',
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-xs text-slate-200">
                  <CheckCircle2 size={16} className="text-[#00D6CC] shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Glassmorphic Form Card */}
          <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-md shadow-2xl">
            {message && (
              <div className="mb-6 rounded-2xl bg-rose-950/50 border border-rose-800 px-4 py-3 text-xs font-semibold text-rose-300">
                {message}
              </div>
            )}

            <form onSubmit={submitRegister} className="space-y-5">
              <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-200 block mb-1.5">Admin Name</label>
                  <input
                    type="text"
                    placeholder="Enter admin name"
                    value={registerForm.adminName}
                    onChange={(event) => setRegisterForm({ ...registerForm, adminName: event.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 px-4 py-2.5 text-sm outline-none focus:border-[#00D6CC] focus:ring-1 focus:ring-[#00D6CC] transition"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-200 block mb-1.5">Company Name</label>
                  <input
                    type="text"
                    placeholder="Enter company name"
                    value={registerForm.companyName}
                    onChange={(event) => setRegisterForm({ ...registerForm, companyName: event.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 px-4 py-2.5 text-sm outline-none focus:border-[#00D6CC] focus:ring-1 focus:ring-[#00D6CC] transition"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-200 block mb-1.5">Email Address</label>
                  <input
                    type="email"
                    placeholder="admin@company.com"
                    value={registerForm.email}
                    onChange={(event) => setRegisterForm({ ...registerForm, email: event.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 px-4 py-2.5 text-sm outline-none focus:border-[#00D6CC] focus:ring-1 focus:ring-[#00D6CC] transition"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-200 block mb-1.5">Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={registerForm.password}
                    onChange={(event) => setRegisterForm({ ...registerForm, password: event.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 px-4 py-2.5 text-sm outline-none focus:border-[#00D6CC] focus:ring-1 focus:ring-[#00D6CC] transition"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-200 block mb-1.5">Owner Name</label>
                  <input
                    type="text"
                    placeholder="Enter owner name"
                    value={registerForm.ownerName}
                    onChange={(event) => setRegisterForm({ ...registerForm, ownerName: event.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 px-4 py-2.5 text-sm outline-none focus:border-[#00D6CC] focus:ring-1 focus:ring-[#00D6CC] transition"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-200 block mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+1 555-0199"
                    value={registerForm.phone}
                    onChange={(event) => setRegisterForm({ ...registerForm, phone: event.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 px-4 py-2.5 text-sm outline-none focus:border-[#00D6CC] focus:ring-1 focus:ring-[#00D6CC] transition"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-200 block mb-1.5">City</label>
                  <input
                    type="text"
                    placeholder="e.g. New York"
                    value={registerForm.city}
                    onChange={(event) => setRegisterForm({ ...registerForm, city: event.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 px-4 py-2.5 text-sm outline-none focus:border-[#00D6CC] focus:ring-1 focus:ring-[#00D6CC] transition"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-200 block mb-1.5">GST Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="Enter GST number"
                    value={registerForm.gstNumber}
                    onChange={(event) => setRegisterForm({ ...registerForm, gstNumber: event.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 px-4 py-2.5 text-sm outline-none focus:border-[#00D6CC] focus:ring-1 focus:ring-[#00D6CC] transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-200 block mb-1.5">Upload Corporate Documents</label>
                <input
                  type="file"
                  multiple
                  onChange={(event) => setDocuments(event.target.files)}
                  className="w-full rounded-2xl border border-white/10 bg-white/10 text-slate-300 px-4 py-2.5 text-xs outline-none focus:border-[#00D6CC] focus:ring-1 focus:ring-[#00D6CC] transition file:mr-4 file:py-1.5 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-200 block mb-1.5">Company Address</label>
                <textarea
                  placeholder="Enter full physical address of the company office"
                  value={registerForm.address}
                  onChange={(event) => setRegisterForm({ ...registerForm, address: event.target.value })}
                  className="w-full min-h-[80px] rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 px-4 py-2.5 text-sm outline-none focus:border-[#00D6CC] focus:ring-1 focus:ring-[#00D6CC] transition"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-[#00D6CC] py-3 text-sm font-bold text-white hover:opacity-95 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#00D6CC]/20"
              >
                {loading ? 'Creating Account...' : 'Register Company'}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center text-xs text-slate-500 pt-6 border-t border-white/5">
        &copy; {new Date().getFullYear()} BIIPBIIP. All rights reserved. Partner Terms apply.
      </footer>
    </div>
  );
};

export default Register;
