import { ImagePlus, Trash2, Plus, ArrowLeft, Eye } from 'lucide-react';
import { useState } from 'react';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import { useApp } from '../../context/AppContext';
import { currency, readFileAsDataUrl } from '../../utils/storage';

const defaultForm = {
  name: '',
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  registrationNo: '',
  fuelType: 'Petrol',
  transmission: 'Manual',
  seats: 5,
  pricePerDay: '',
  mileage: '',
  description: '',
};

const CarManagement = () => {
  const { state, currentUser, addCar, updateCarStatus, deleteCar } = useApp();
  const company = state.companies.find((item) => item.id === currentUser?.companyId);
  const cars = state.cars.filter((car) => car.companyId === company?.id);
  const [form, setForm] = useState(defaultForm);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewingCarId, setViewingCarId] = useState(null);

  const selectedCar = cars.find((car) => car.id === viewingCarId);

  const submitCar = async (event) => {
    event.preventDefault();
    if (company?.status !== 'verified') return;
    setLoading(true);
    const uploadedImage = imageFile ? await readFileAsDataUrl(imageFile) : null;
    addCar({
      ...form,
      companyId: company.id,
      year: Number(form.year),
      seats: Number(form.seats),
      pricePerDay: Number(form.pricePerDay),
      image: uploadedImage?.url || '',
    });
    setForm(defaultForm);
    setImageFile(null);
    event.target.reset();
    setLoading(false);
    setShowAddForm(false); // Go back to table view after adding
  };

  const handleBackToCars = () => {
    setShowAddForm(false);
    setViewingCarId(null);
  };

  return (
    <div className="space-y-8">
      {/* Header section with Dynamic Action Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">Admin</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">Car Management</h2>
        </div>
        {company?.status === 'verified' && (showAddForm || viewingCarId) && (
          <button
            onClick={handleBackToCars}
            className="flex items-center gap-2 self-start rounded-2xl bg-[#00D6CC] px-5 py-3 text-sm font-bold text-white hover:opacity-90 transition"
          >
            <ArrowLeft size={16} />
            <span>Back to Cars</span>
          </button>
        )}
        {company?.status === 'verified' && !showAddForm && !viewingCarId && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 self-start rounded-2xl bg-[#00D6CC] px-5 py-3 text-sm font-bold text-white hover:opacity-90 transition"
          >
            <Plus size={16} />
            <span>Add New Car</span>
          </button>
        )}
      </div>

      {company?.status !== 'verified' ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
          <h3 className="font-bold">Company verified nahi hai</h3>
          <p className="mt-1 text-sm">Super Admin verification ke baad hi cars add karna allowed hai.</p>
        </div>
      ) : showAddForm ? (
        /* ADD NEW CAR FORM VIEW */
        <form onSubmit={submitCar} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-xl font-bold text-slate-950">Add New Car Details</h3>
            <p className="text-sm text-slate-500 mt-1">Car details aur specification enter karein.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="text-sm font-semibold text-slate-700">Car Name</label>
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950 bg-slate-50 focus:bg-white transition" required />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Brand</label>
              <input value={form.brand} onChange={(event) => setForm({ ...form, brand: event.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950 bg-slate-50 focus:bg-white transition" required />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Model</label>
              <input value={form.model} onChange={(event) => setForm({ ...form, model: event.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950 bg-slate-50 focus:bg-white transition" required />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Year</label>
              <input type="number" value={form.year} onChange={(event) => setForm({ ...form, year: event.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950 bg-slate-50 focus:bg-white transition" required />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Registration No.</label>
              <input value={form.registrationNo} onChange={(event) => setForm({ ...form, registrationNo: event.target.value.toUpperCase() })} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950 bg-slate-50 focus:bg-white transition" required />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Fuel Type</label>
              <select value={form.fuelType} onChange={(event) => setForm({ ...form, fuelType: event.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950 bg-slate-50 focus:bg-white transition">
                <option>Petrol</option>
                <option>Diesel</option>
                <option>CNG</option>
                <option>Electric</option>
                <option>Hybrid</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Transmission</label>
              <select value={form.transmission} onChange={(event) => setForm({ ...form, transmission: event.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950 bg-slate-50 focus:bg-white transition">
                <option>Manual</option>
                <option>Automatic</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Seats</label>
              <input type="number" min="2" value={form.seats} onChange={(event) => setForm({ ...form, seats: event.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950 bg-slate-50 focus:bg-white transition" required />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Price / Day</label>
              <input type="number" min="1" value={form.pricePerDay} onChange={(event) => setForm({ ...form, pricePerDay: event.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950 bg-slate-50 focus:bg-white transition" required />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Mileage</label>
              <input value={form.mileage} onChange={(event) => setForm({ ...form, mileage: event.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950 bg-slate-50 focus:bg-white transition" placeholder="18 km/l" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Car Image</label>
              <label className="mt-2 flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 hover:border-slate-950 hover:bg-slate-50 transition">
                <ImagePlus size={18} />
                <span className="truncate">{imageFile?.name || 'Upload image'}</span>
                <input type="file" accept="image/*" onChange={(event) => setImageFile(event.target.files?.[0])} className="hidden" />
              </label>
            </div>
            <div className="sm:col-span-2 lg:col-span-4">
              <label className="text-sm font-semibold text-slate-700">Description</label>
              <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-2 min-h-24 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950 bg-slate-50 focus:bg-white transition" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button disabled={loading} className="rounded-2xl bg-[#00D6CC] px-6 py-3 font-bold text-white hover:opacity-90 disabled:opacity-60 disabled:bg-slate-300 disabled:text-slate-500 transition">
              {loading ? 'Adding...' : 'Add Car'}
            </button>
            <button
              type="button"
              onClick={handleBackToCars}
              className="rounded-2xl border border-slate-200 px-6 py-3 font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : viewingCarId && selectedCar ? (
        /* SINGLE CAR DETAIL VIEW (NEW PAGE VIEW) */
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 gap-4">
            <div>
              <h3 className="text-2xl font-bold text-slate-950">{selectedCar.name}</h3>
              <p className="text-sm text-slate-500 mt-1">{selectedCar.brand} • {selectedCar.model} • {selectedCar.year}</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={selectedCar.status}
                onChange={(event) => updateCarStatus(selectedCar.id, event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold outline-none focus:border-slate-950 cursor-pointer"
              >
                <option value="available">Available</option>
                <option value="booked">Booked</option>
              </select>
              <button
                onClick={() => {
                  deleteCar(selectedCar.id);
                  handleBackToCars();
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-50 px-4 py-2 text-sm font-bold text-rose-700 hover:bg-rose-100 transition"
              >
                <Trash2 size={15} /> Delete Car
              </button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-[1.5fr_2fr]">
            {/* Left: Car Image */}
            <div className="h-72 w-full overflow-hidden rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center">
              {selectedCar.image ? (
                <img src={selectedCar.image} alt={selectedCar.name} className="h-full w-full object-cover" />
              ) : (
                <div className="text-center text-slate-400">
                  <ImagePlus size={48} className="mx-auto" />
                  <p className="mt-2 text-sm font-semibold">No Image Available</p>
                </div>
              )}
            </div>

            {/* Right: Detailed Info */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <InfoCard label="Registration No." value={selectedCar.registrationNo} />
                <InfoCard label="Fuel Type" value={selectedCar.fuelType} />
                <InfoCard label="Transmission" value={selectedCar.transmission} />
                <InfoCard label="Seats" value={`${selectedCar.seats} Seats`} />
                <InfoCard label="Price / Day" value={currency(selectedCar.pricePerDay)} />
                <InfoCard label="Mileage" value={selectedCar.mileage || '—'} />
                <div className="col-span-2">
                  <InfoCard label="Current Status" value={<Badge status={selectedCar.status} />} />
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Description</h4>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                  {selectedCar.description || 'No description provided for this car.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* UPLOADED CARS TABLE VIEW */
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-950">Uploaded Cars</h3>
            <span className="text-xs text-slate-500 font-semibold">{cars.length} active {cars.length === 1 ? 'car' : 'cars'}</span>
          </div>

          {cars.length ? (
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-slate-600 font-semibold">
                      <th className="px-6 py-4">Car Details</th>
                      <th className="px-6 py-4">Reg. No</th>
                      <th className="px-6 py-4">Specifications</th>
                      <th className="px-6 py-4">Price / Day</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cars.map((car) => (
                      <tr key={car.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                              {car.image ? (
                                <img src={car.image} alt={car.name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="text-slate-400">
                                  <ImagePlus size={16} />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-slate-950">{car.name}</div>
                              <div className="text-xs text-slate-500">
                                {car.brand} • {car.model} • {car.year}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-700">
                          {car.registrationNo}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-slate-800 font-medium">
                            {car.fuelType} • {car.transmission}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {car.seats} Seats {car.mileage ? `• ${car.mileage}` : ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-950">
                          {currency(car.pricePerDay)}
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={car.status}
                            onChange={(event) => updateCarStatus(car.id, event.target.value)}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold outline-none focus:border-slate-950 cursor-pointer"
                          >
                            <option value="available">Available</option>
                            <option value="booked">Booked</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setViewingCarId(car.id)}
                              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
                            >
                              <Eye size={13} /> View
                            </button>
                            <button
                              onClick={() => deleteCar(car.id)}
                              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <EmptyState title="No cars uploaded" message="Verified company ke baad admin cars upload kar sakta hai." />
          )}
        </section>
      )}
    </div>
  );
};

const InfoCard = ({ label, value }) => (
  <div className="rounded-2xl bg-slate-50 p-3 border border-slate-100/50">
    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
    <div className="mt-1 text-sm font-bold text-slate-950">{value}</div>
  </div>
);

export default CarManagement;
