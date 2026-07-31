import { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, ImagePlus, FileText, CheckCircle } from 'lucide-react';
import Badge from '../../components/Badge';
import { useApp, mapBackendCar } from '../../context/AppContext';
import { currency } from '../../utils/storage';
import { fetchCarByIdApi } from '../../utils/api';

const InfoCard = ({ label, value }) => (
  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100/50 hover:bg-slate-50/80 transition-colors">
    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
    <div className="mt-1 text-sm font-bold text-slate-950">{value}</div>
  </div>
);

const DocPreviewCard = ({ label, src }) => {
  const isPdf = src?.startsWith('data:application/pdf') || src?.endsWith('.pdf');
  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm hover:shadow-md transition">
      {isPdf ? (
        <a
          href={src}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-4 bg-slate-50/50 p-4 hover:bg-slate-100 transition h-full"
        >
          <FileText size={28} className="text-[#00D6CC] shrink-0" />
          <div>
            <p className="text-sm font-bold text-slate-800">{label}</p>
            <p className="text-xs text-slate-500 mt-0.5">Click to view PDF</p>
          </div>
        </a>
      ) : (
        <div className="space-y-2">
          <img src={src} alt={label} className="h-40 w-full object-cover" />
          <p className="px-4 pb-3 pt-1 text-xs font-bold text-slate-500 uppercase tracking-wide border-t border-slate-100 bg-slate-50/50">{label}</p>
        </div>
      )}
    </div>
  );
};

const CarDetail = ({ carId, setActivePage, onStartEdit }) => {
  const { currentUser, updateCarStatus, deleteCar } = useApp();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  useEffect(() => {
    const loadCarDetails = async () => {
      if (!carId || !currentUser?.token) {
        setError('No car ID or authorization token provided.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      const apiResult = await fetchCarByIdApi(carId, currentUser.token);

      if (apiResult.success) {
        const normalizedCar = mapBackendCar(apiResult.car);
        if (normalizedCar) {
          setCar(normalizedCar);
        } else {
          setError('Failed to process car details returned from server.');
        }
      } else {
        setError(apiResult.message || 'Failed to fetch car details from server.');
      }
      setLoading(false);
    };

    loadCarDetails();
  }, [carId, currentUser?.token]);

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#00D6CC]"></div>
        <p className="text-sm font-semibold text-slate-500">Loading car details...</p>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-bold text-rose-600">{error || 'Car Not Found'}</h3>
        <p className="text-sm text-slate-500 mt-2">The requested car could not be loaded or has been deleted.</p>
        <button
          onClick={() => setActivePage('cars')}
          className="mt-6 rounded-2xl bg-[#00D6CC] px-6 py-3 font-bold text-white hover:opacity-90 transition"
        >
          Back to Cars
        </button>
      </div>
    );
  }

  const handleDelete = () => {
    deleteCar(car.id);
    setActivePage('cars');
  };

  const handleStatusChange = (newStatus) => {
    updateCarStatus(car.id, newStatus);
    setCar(prev => ({ ...prev, status: newStatus }));
  };

  const hasPhotos = car.photos?.length > 0;
  const mainPhoto = hasPhotos ? car.photos[activePhotoIndex] : car.image;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => setActivePage('cars')}
        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-950 font-bold transition text-sm"
      >
        <ArrowLeft size={16} /> Back to Cars
      </button>

      {/* Main Details Panel */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5 gap-4">
          <div>
            <h3 className="text-2xl font-bold text-slate-950">{car.name}</h3>
            <p className="text-sm text-slate-500 mt-1">
              {car.brand} • {car.model} • {car.year}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={car.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold outline-none focus:border-slate-950 cursor-pointer shadow-sm hover:border-slate-300 transition"
            >
              <option value="available">Available</option>
              <option value="booked">Booked</option>
            </select>
            <button
              onClick={() => onStartEdit(car.id)}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200 transition"
            >
              Edit Car
            </button>
            <button
              onClick={() => setDeleteConfirmOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-50 px-4 py-2 text-sm font-bold text-rose-700 hover:bg-rose-100 transition"
            >
              <Trash2 size={15} /> Delete Car
            </button>
          </div>
        </div>

        {/* Media / Photo Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Photos Gallery</h4>
            {mainPhoto ? (
              <div className="space-y-3">
                {/* Main View */}
                <div className="h-96 w-full overflow-hidden rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center shadow-inner">
                  <img
                    src={mainPhoto}
                    alt={car.name}
                    className="h-full w-full object-cover transition-all duration-300"
                  />
                </div>
                {/* Thumbnail list */}
                {car.photos?.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {car.photos.map((src, i) => (
                      <button
                        key={i}
                        onClick={() => setActivePhotoIndex(i)}
                        className={`h-16 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                          activePhotoIndex === i ? 'border-[#00D6CC]' : 'border-slate-200 bg-slate-100'
                        }`}
                      >
                        <img src={src} alt={`Thumbnail ${i + 1}`} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-64 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400">
                <ImagePlus size={48} className="mx-auto" />
                <p className="mt-2 text-sm font-semibold">No Image Available</p>
              </div>
            )}
          </div>

          {/* Key Specifications Summary */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Quick Summary</h4>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-xs text-slate-500 font-semibold uppercase">Pricing</span>
                <span className="text-lg font-extrabold text-[#00B5B0]">{currency(car.pricePerDay)} <span className="text-xs font-normal text-slate-500">/ day</span></span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-xs text-slate-500 font-semibold uppercase">Status</span>
                <Badge status={car.status} />
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-xs text-slate-500 font-semibold uppercase">Transmission</span>
                <span className="text-sm font-bold text-slate-800">{car.transmission}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-xs text-slate-500 font-semibold uppercase">Fuel Type</span>
                <span className="text-sm font-bold text-slate-800">{car.fuelType}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications grid */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Specifications</h4>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <InfoCard label="Registration No." value={car.registrationNo} />
            <InfoCard label="Fuel Type" value={car.fuelType} />
            <InfoCard label="Transmission" value={car.transmission} />
            <InfoCard label="No. of Seats" value={`${car.seats} Seats`} />
            <InfoCard label="No. of Doors" value={`${car.doors || '—'} Doors`} />
            <InfoCard label="Manufacturing Year" value={car.year} />
            <InfoCard label="Mileage" value={car.mileage || '—'} />
            <InfoCard label="Color" value={car.color || '—'} />
            <InfoCard label="AC" value={car.ac === false ? 'Non-AC' : 'AC'} />
            <InfoCard label="VIN Number" value={car.vinNumber || '—'} />
          </div>
        </div>

        {/* Documents Section */}
        {(car.insuranceInvoice || car.registrationCardImage) && (
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Uploaded Documents</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {car.insuranceInvoice && (
                <DocPreviewCard label="Insurance Invoice" src={car.insuranceInvoice} />
              )}
              {car.registrationCardImage && (
                <DocPreviewCard label="Registration Card" src={car.registrationCardImage} />
              )}
            </div>
          </div>
        )}

        {/* Description card */}
        <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Description</h4>
          <p className="mt-2 text-sm text-slate-700 leading-relaxed">
            {car.description || 'No description provided for this car.'}
          </p>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => setDeleteConfirmOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 transform scale-100 transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 border border-rose-100 mx-auto">
              <Trash2 size={26} className="text-rose-600" />
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-xl font-bold text-slate-950">Delete Car?</h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                <span className="font-semibold text-slate-800">{car.name}</span> will be permanently deleted. This action cannot be undone.
              </p>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-bold text-white hover:bg-rose-700 transition"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarDetail;
