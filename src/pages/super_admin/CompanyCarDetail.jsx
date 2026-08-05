import { useState } from 'react';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/storage';
import { ArrowLeft, Car as CarIcon, MapPin, Calendar, Fuel, Settings, Users, ShieldCheck, X } from 'lucide-react';

const CompanyCarDetail = ({ carId, setActivePage }) => {
  const { state, verifyCompanyCar, rejectCompanyCar } = useApp();
  const [rejectModal, setRejectModal] = useState({ open: false, reason: '' });

  const car = state.allCompanyCars.find((c) => c.id === carId);

  const handleVerify = async () => {
    await verifyCompanyCar(carId);
  };

  const handleReject = async () => {
    if (rejectModal.reason.trim()) {
      await rejectCompanyCar(carId, rejectModal.reason);
      setRejectModal({ open: false, reason: '' });
    }
  };

  if (!car) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setActivePage('company-car-verification')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-950 transition"
        >
          <ArrowLeft size={20} />
          <span className="font-semibold">Back to Car Verification</span>
        </button>
        <EmptyState title="Car not found" message="The requested car could not be found." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => setActivePage('company-car-verification')}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-950 transition"
      >
        <ArrowLeft size={20} />
        <span className="font-semibold">Back to Car Verification</span>
      </button>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="text-2xl font-bold text-slate-950 mb-4">Car Details</h2>
            
            {car.image ? (
              <div className="mb-6">
                <img
                  src={car.image}
                  alt={car.name}
                  className="w-full h-64 object-cover rounded-2xl"
                />
              </div>
            ) : (
              <div className="mb-6 flex h-64 items-center justify-center rounded-2xl bg-slate-100">
                <CarIcon size={48} className="text-slate-400" />
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Car Name</label>
                <p className="mt-1 font-bold text-slate-950">{car.name}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registration No</label>
                <p className="mt-1 font-bold text-slate-950">{car.registrationNo}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Brand</label>
                <p className="mt-1 font-semibold text-slate-800">{car.brand}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Model</label>
                <p className="mt-1 font-semibold text-slate-800">{car.model}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Year</label>
                <p className="mt-1 font-semibold text-slate-800">{car.year}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Color</label>
                <p className="mt-1 font-semibold text-slate-800">{car.color || '—'}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">VIN Number</label>
                <p className="mt-1 font-semibold text-slate-800">{car.vinNumber || '—'}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Price / Day</label>
                <p className="mt-1 font-bold text-slate-950">₹{car.pricePerDay}</p>
              </div>
            </div>

            {car.description && (
              <div className="mt-4">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</label>
                <p className="mt-1 text-sm text-slate-600">{car.description}</p>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <h3 className="text-xl font-bold text-slate-950 mb-4">Specifications</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <Fuel size={20} className="text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Fuel Type</p>
                  <p className="font-semibold text-slate-950">{car.fuelType}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <Settings size={20} className="text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Transmission</p>
                  <p className="font-semibold text-slate-950">{car.transmission}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <Users size={20} className="text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Seats</p>
                  <p className="font-semibold text-slate-950">{car.seats}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <Calendar size={20} className="text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Doors</p>
                  <p className="font-semibold text-slate-950">{car.doors}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <MapPin size={20} className="text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Mileage</p>
                  <p className="font-semibold text-slate-950">{car.mileage || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <ShieldCheck size={20} className="text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">AC</p>
                  <p className="font-semibold text-slate-950">{car.ac ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          </div>

          {car.photos && car.photos.length > 1 && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
              <h3 className="text-xl font-bold text-slate-950 mb-4">All Photos</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {car.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Car photo ${index + 1}`}
                    className="h-40 w-full object-cover rounded-xl"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <h3 className="text-xl font-bold text-slate-950 mb-4">Verification Status</h3>
            <div className="mb-4">
              <Badge status={car.status} size="large" />
            </div>
            {car.status === 'rejected' && car.rejectionReason && (
              <div className="mt-4 rounded-xl bg-rose-50 p-4 border border-rose-100">
                <p className="text-sm font-medium text-rose-700">
                  <b>Rejection Reason:</b> {car.rejectionReason}
                </p>
              </div>
            )}
            {car.status === 'pending' && (
              <div className="mt-4 space-y-3">
                <button
                  onClick={handleVerify}
                  className="w-full rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 px-4 py-3 text-sm font-bold transition shadow-sm"
                >
                  Verify Car
                </button>
                <button
                  onClick={() => setRejectModal({ open: true, reason: '' })}
                  className="w-full rounded-xl bg-rose-500 text-white hover:bg-rose-600 px-4 py-3 text-sm font-bold transition shadow-sm"
                >
                  Reject Car
                </button>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <h3 className="text-xl font-bold text-slate-950 mb-4">Company Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Company Name</label>
                <p className="mt-1 font-bold text-slate-950">{car.companyName}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Added On</label>
                <p className="mt-1 font-semibold text-slate-800">{formatDate(car.createdAt)}</p>
              </div>
            </div>
          </div>

          {(car.insuranceInvoice || car.registrationCardImage) && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
              <h3 className="text-xl font-bold text-slate-950 mb-4">Documents</h3>
              <div className="space-y-3">
                {car.insuranceInvoice && (
                  <a
                    href={car.insuranceInvoice}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
                  >
                    📄 Insurance Invoice
                  </a>
                )}
                {car.registrationCardImage && (
                  <a
                    href={car.registrationCardImage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
                  >
                    📄 Registration Card
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-950">Reject Car</h3>
              <button
                onClick={() => setRejectModal({ open: false, reason: '' })}
                className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 transition"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-4">Please provide a reason for rejecting this car.</p>
            <textarea
              value={rejectModal.reason}
              onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
              placeholder="Enter rejection reason..."
              className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-[#00D6CC] focus:ring-1 focus:ring-[#00D6CC] transition min-h-[100px]"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setRejectModal({ open: false, reason: '' })}
                className="rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 px-4 py-2 text-sm font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectModal.reason.trim()}
                className="rounded-xl bg-rose-500 text-white hover:bg-rose-600 disabled:bg-rose-300 disabled:cursor-not-allowed px-4 py-2 text-sm font-bold transition"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyCarDetail;
