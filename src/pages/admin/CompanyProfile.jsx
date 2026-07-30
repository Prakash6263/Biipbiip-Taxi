import Badge from '../../components/Badge';
import FilePreview from '../../components/FilePreview';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/storage';

const CompanyProfile = () => {
  const { state, currentUser } = useApp();
  const company = state.companies.find((item) => item.id === currentUser?.companyId);

  if (!company) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
        Company profile not found. Please log in again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">Admin</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">Company Profile</h2>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h3 className="text-2xl font-bold text-slate-950">{company.companyName}</h3>
            <p className="mt-1 text-slate-500">Registered on {formatDate(company.createdAt)}</p>
          </div>
          <Badge status={company.status} />
        </div>

        {company.status === 'rejected' && company.rejectionReason ? (
          <div className="mt-5 rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">
            <b>Rejection reason:</b> {company.rejectionReason}
          </div>
        ) : null}

        {company.status === 'pending' ? (
          <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
            The Super Admin will verify your documents. Once verified, you will be able to add cars.
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Info label="Owner Name" value={company.ownerName} />
          <Info label="Email" value={company.email} />
          <Info label="Phone" value={company.phone} />
          <Info label="City" value={company.city || '—'} />
          <Info label="GST Number" value={company.gstNumber || '—'} />
          <div className="md:col-span-2">
            <Info label="Address" value={company.address} />
          </div>
        </div>

        <div className="mt-6">
          <h4 className="mb-2 font-bold text-slate-950">Company Documents</h4>
          <FilePreview files={company.documents} />
        </div>
      </section>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="rounded-2xl bg-slate-50 p-4">
    <p className="text-sm text-slate-500">{label}</p>
    <p className="mt-1 font-bold text-slate-950">{value}</p>
  </div>
);

export default CompanyProfile;
