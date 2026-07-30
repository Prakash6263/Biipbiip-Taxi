import { ImagePlus, Trash2, Plus, ArrowLeft, Eye, X, FileText, CheckCircle } from 'lucide-react';
import { useState, useRef } from 'react';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import { useApp } from '../../context/AppContext';
import { currency, readFileAsDataUrl } from '../../utils/storage';
import { addCarApi, updateCarApi } from '../../utils/api';
import vehicleData from '../../data/vehicleData.json';

/* ── Vehicle data (from vehicleData.json) ───────────────────────── */
const BRAND_MODELS = vehicleData.brandModels;
const VEHICLE_BRANDS = Object.keys(BRAND_MODELS);
const CAR_COLORS = vehicleData.carColors;

const defaultForm = {
  name: '',
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  registrationNo: '',
  fuelType: 'Petrol',
  transmission: 'Manual',
  seats: 5,
  doors: 4,
  pricePerDay: '',
  mileage: '',
  color: '',
  vinNumber: '',
  ac: true,
  description: '',
};

const CarManagement = () => {
  const { state, currentUser, addCar, updateCar, updateCarStatus, deleteCar } = useApp();
  const company = state.companies.find((item) => item.id === currentUser?.companyId);
  const cars = state.cars.filter((car) => car.companyId === company?.id);

  const [form, setForm] = useState(defaultForm);
  // Multiple vehicle photos (up to 6)
  const [photoFiles, setPhotoFiles] = useState([]); // array of File
  const [photoPreviews, setPhotoPreviews] = useState([]); // array of data URLs
  // Document uploads
  const [insuranceFile, setInsuranceFile] = useState(null);
  const [regCardFile, setRegCardFile] = useState(null);
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewingCarId, setViewingCarId] = useState(null);
  const [editingCarId, setEditingCarId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const photoInputRef = useRef(null);

  const selectedCar = cars.find((car) => car.id === viewingCarId);
  const carToDelete = cars.find((car) => car.id === deleteConfirmId);

  /* ── Photo helpers ───────────────────────────────────────────────── */
  const handlePhotoAdd = async (files) => {
    const remaining = 6 - photoFiles.length;
    const toAdd = Array.from(files).slice(0, remaining);
    if (!toAdd.length) return;

    const previews = await Promise.all(
      toAdd.map(
        (f) =>
          new Promise((res) => {
            const reader = new FileReader();
            reader.onload = (e) => res(e.target.result);
            reader.readAsDataURL(f);
          }),
      ),
    );

    setPhotoFiles((prev) => [...prev, ...toAdd]);
    setPhotoPreviews((prev) => [...prev, ...previews]);
  };

  const removePhoto = (index) => {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStartEdit = (car) => {
    setForm({
      name: car.name,
      brand: car.brand,
      model: car.model,
      year: car.year,
      registrationNo: car.registrationNo,
      fuelType: car.fuelType,
      transmission: car.transmission,
      seats: car.seats,
      doors: car.doors,
      pricePerDay: car.pricePerDay,
      mileage: car.mileage || '',
      color: car.color || '',
      vinNumber: car.vinNumber || '',
      ac: car.ac !== false,
      description: car.description || '',
    });
    setEditingCarId(car.id);
    setPhotoPreviews(car.photos || []);
    setShowAddForm(true);
    setViewingCarId(null);
  };

  /* ── Submit ──────────────────────────────────────────────────────── */
  const submitCar = async (event) => {
    event.preventDefault();
    if (company?.status !== 'verified') return;
    setLoading(true);
    setMessage('');

    if (editingCarId) {
      const apiResult = await updateCarApi({
        carId: editingCarId,
        carName: form.name,
        vehicleBrand: form.brand,
        vehicleModel: form.model,
        manufacturingYear: Number(form.year),
        color: form.color,
        vinNumber: form.vinNumber,
        registrationNo: form.registrationNo,
        perDayCharge: Number(form.pricePerDay),
        fuelType: form.fuelType,
        transmission: form.transmission,
        noOfSeats: Number(form.seats),
        noOfDoors: Number(form.doors),
        mileage: form.mileage,
        airConditioning: form.ac,
        description: form.description,
        vehiclePhotos: photoFiles,
        insuranceInvoice: insuranceFile,
        registrationCardImage: regCardFile,
      }, currentUser.token);

      if (!apiResult.success) {
        setMessage(apiResult.message || 'Failed to update car. Please try again.');
        setLoading(false);
        return;
      }

      updateCar(apiResult.car);
    } else {
      const apiResult = await addCarApi({
        carName: form.name,
        vehicleBrand: form.brand,
        vehicleModel: form.model,
        manufacturingYear: Number(form.year),
        color: form.color,
        vinNumber: form.vinNumber,
        registrationNo: form.registrationNo,
        perDayCharge: Number(form.pricePerDay),
        fuelType: form.fuelType,
        transmission: form.transmission,
        noOfSeats: Number(form.seats),
        noOfDoors: Number(form.doors),
        mileage: form.mileage,
        airConditioning: form.ac,
        description: form.description,
        vehiclePhotos: photoFiles,
        insuranceInvoice: insuranceFile,
        registrationCardImage: regCardFile,
      }, currentUser.token);

      if (!apiResult.success) {
        setMessage(apiResult.message || 'Failed to add car. Please try again.');
        setLoading(false);
        return;
      }

      addCar(apiResult.car);
    }

    setForm(defaultForm);
    setPhotoFiles([]);
    setPhotoPreviews([]);
    setInsuranceFile(null);
    setRegCardFile(null);
    event.target.reset();
    setLoading(false);
    setShowAddForm(false);
    setEditingCarId(null);
  };

  /* ── Delete ──────────────────────────────────────────────────────── */
  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      deleteCar(deleteConfirmId);
      if (viewingCarId === deleteConfirmId) handleBackToCars();
      setDeleteConfirmId(null);
    }
  };

  const handleBackToCars = () => {
    setShowAddForm(false);
    setViewingCarId(null);
    setEditingCarId(null);
    setForm(defaultForm);
    setPhotoFiles([]);
    setPhotoPreviews([]);
    setInsuranceFile(null);
    setRegCardFile(null);
    setMessage('');
  };

  /* ── Render ──────────────────────────────────────────────────────── */
  return (
    <div className="space-y-8">
      {/* Header */}
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

      {/* ── Not verified ─────────────────────────────────────────────── */}
      {company?.status !== 'verified' ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
          <h3 className="font-bold">Company is not verified</h3>
          <p className="mt-1 text-sm">Adding cars is allowed only after Super Admin verification.</p>
        </div>

      /* ── Add New Car Form ──────────────────────────────────────────── */
      ) : showAddForm ? (
        <form onSubmit={submitCar} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft space-y-8">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-xl font-bold text-slate-950">{editingCarId ? 'Edit Car Details' : 'Add New Car Details'}</h3>
            <p className="text-sm text-slate-500 mt-1">{editingCarId ? 'Update car details and specifications.' : 'Enter car details and specifications.'}</p>
          </div>

          {message && (
            <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {message}
            </div>
          )}

          {/* ── Vehicle Photos (up to 6) ─────────────────────────────── */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-700">
                Vehicle Photos <span className="text-slate-400 font-normal">(up to 6)</span>
              </label>
              {photoFiles.length < 6 && (
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
                >
                  <ImagePlus size={13} /> Add Photo
                </button>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handlePhotoAdd(e.target.files)}
            />

            {/* Photo grid */}
            {photoPreviews.length > 0 ? (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                {photoPreviews.map((src, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                    <img src={src} alt={`Photo ${idx + 1}`} className="h-full w-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 rounded-md bg-[#00D6CC] px-1.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wide">
                        Main
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition"
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))}
                {photoFiles.length < 6 && (
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-1 text-slate-400 hover:border-[#00D6CC] hover:text-[#00D6CC] transition"
                  >
                    <ImagePlus size={20} />
                    <span className="text-[10px] font-semibold">Add</span>
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 py-10 text-slate-400 hover:border-[#00D6CC] hover:text-[#00D6CC] transition"
              >
                <ImagePlus size={32} />
                <p className="text-sm font-semibold">Click to add vehicle photos</p>
                <p className="text-xs">PNG, JPG, WEBP • Max 6 photos</p>
              </button>
            )}
          </section>

          {/* ── Basic Info ──────────────────────────────────────────── */}
          <section className="space-y-4">
            <SectionHeading>Basic Information</SectionHeading>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <FormField label="Car Name">
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputCls}
                  placeholder="e.g. Honda City ZX"
                  required
                />
              </FormField>
              <FormField label="Vehicle Brand">
                <select
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value, model: '' })}
                  className={inputCls}
                  required
                >
                  <option value="">— Select Brand —</option>
                  {VEHICLE_BRANDS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Vehicle Model">
                <select
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                  className={inputCls}
                  required
                  disabled={!form.brand}
                >
                  <option value="">{form.brand ? '— Select Model —' : '— Select Brand first —'}</option>
                  {(BRAND_MODELS[form.brand] || []).map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Manufacturing Year">
                <input
                  type="number"
                  min="1990"
                  max={new Date().getFullYear() + 1}
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                  className={inputCls}
                  required
                />
              </FormField>
              <FormField label="Color">
                <select
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className={inputCls}
                  required
                >
                  <option value="">— Select Color —</option>
                  {CAR_COLORS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="VIN Number">
                <input
                  value={form.vinNumber}
                  onChange={(e) => setForm({ ...form, vinNumber: e.target.value.toUpperCase() })}
                  className={inputCls}
                  placeholder="17-char VIN"
                  maxLength={17}
                />
              </FormField>
              <FormField label="Registration No.">
                <input
                  value={form.registrationNo}
                  onChange={(e) => setForm({ ...form, registrationNo: e.target.value.toUpperCase() })}
                  className={inputCls}
                  placeholder="e.g. MH01AB1234"
                  required
                />
              </FormField>
              <FormField label="Per Day Charge (₹)">
                <input
                  type="number"
                  min="1"
                  value={form.pricePerDay}
                  onChange={(e) => setForm({ ...form, pricePerDay: e.target.value })}
                  className={inputCls}
                  placeholder="e.g. 2000"
                  required
                />
              </FormField>
            </div>
          </section>

          {/* ── Specifications ──────────────────────────────────────── */}
          <section className="space-y-4">
            <SectionHeading>Specifications</SectionHeading>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <FormField label="Fuel Type">
                <select
                  value={form.fuelType}
                  onChange={(e) => setForm({ ...form, fuelType: e.target.value })}
                  className={inputCls}
                >
                  <option>Petrol</option>
                  <option>Diesel</option>
                  <option>CNG</option>
                  <option>Electric</option>
                  <option>Hybrid</option>
                </select>
              </FormField>
              <FormField label="Transmission">
                <select
                  value={form.transmission}
                  onChange={(e) => setForm({ ...form, transmission: e.target.value })}
                  className={inputCls}
                >
                  <option>Manual</option>
                  <option>Automatic</option>
                </select>
              </FormField>
              <FormField label="No. of Seats">
                <input
                  type="number"
                  min="2"
                  max="14"
                  value={form.seats}
                  onChange={(e) => setForm({ ...form, seats: e.target.value })}
                  className={inputCls}
                  required
                />
              </FormField>
              <FormField label="No. of Doors">
                <input
                  type="number"
                  min="2"
                  max="6"
                  value={form.doors}
                  onChange={(e) => setForm({ ...form, doors: e.target.value })}
                  className={inputCls}
                  required
                />
              </FormField>
              <FormField label="Mileage">
                <input
                  value={form.mileage}
                  onChange={(e) => setForm({ ...form, mileage: e.target.value })}
                  className={inputCls}
                  placeholder="e.g. 18 km/l"
                />
              </FormField>

              {/* AC Toggle */}
              <FormField label="Air Conditioning">
                <div className="mt-2 flex gap-3">
                  <ToggleChip
                    active={form.ac === true}
                    onClick={() => setForm({ ...form, ac: true })}
                    label="AC"
                  />
                  <ToggleChip
                    active={form.ac === false}
                    onClick={() => setForm({ ...form, ac: false })}
                    label="Non-AC"
                  />
                </div>
              </FormField>
            </div>
          </section>

          {/* ── Documents ───────────────────────────────────────────── */}
          <section className="space-y-4">
            <SectionHeading>Documents</SectionHeading>
            <div className="grid gap-4 sm:grid-cols-2">
              <FileUploadField
                label="Insurance Invoice"
                file={insuranceFile}
                accept="image/*,.pdf"
                onChange={(f) => setInsuranceFile(f)}
                hint="PDF or Image"
              />
              <FileUploadField
                label="Registration Card Image"
                file={regCardFile}
                accept="image/*,.pdf"
                onChange={(f) => setRegCardFile(f)}
                hint="PDF or Image"
              />
            </div>
          </section>

          {/* ── Description ─────────────────────────────────────────── */}
          <section className="space-y-3">
            <SectionHeading>Description</SectionHeading>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={`${inputCls} min-h-24 resize-none`}
              placeholder="Enter a brief description about this vehicle..."
            />
          </section>

          <div className="flex gap-3 pt-2">
            <button
              disabled={loading}
              className="rounded-2xl bg-[#00D6CC] px-6 py-3 font-bold text-white hover:opacity-90 disabled:opacity-60 disabled:bg-slate-300 disabled:text-slate-500 transition"
            >
              {loading ? (editingCarId ? 'Updating...' : 'Adding...') : (editingCarId ? 'Save Changes' : 'Add Car')}
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

      /* ── Single Car Detail View ─────────────────────────────────────── */
      ) : viewingCarId && selectedCar ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 gap-4">
            <div>
              <h3 className="text-2xl font-bold text-slate-950">{selectedCar.name}</h3>
              <p className="text-sm text-slate-500 mt-1">
                {selectedCar.brand} • {selectedCar.model} • {selectedCar.year}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={selectedCar.status}
                onChange={(e) => updateCarStatus(selectedCar.id, e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold outline-none focus:border-slate-950 cursor-pointer"
              >
                <option value="available">Available</option>
                <option value="booked">Booked</option>
              </select>
              <button
                onClick={() => handleStartEdit(selectedCar)}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200 transition"
              >
                Edit Car
              </button>
              <button
                onClick={() => setDeleteConfirmId(selectedCar.id)}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-50 px-4 py-2 text-sm font-bold text-rose-700 hover:bg-rose-100 transition"
              >
                <Trash2 size={15} /> Delete Car
              </button>
            </div>
          </div>

          {/* Photos gallery */}
          {(selectedCar.photos?.length > 0 || selectedCar.image) && (
            <div className="space-y-3">
              {/* Main photo */}
              <div className="h-64 w-full overflow-hidden rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                <img
                  src={selectedCar.photos?.[0] || selectedCar.image}
                  alt={selectedCar.name}
                  className="h-full w-full object-cover"
                />
              </div>
              {/* Thumbnail strip */}
              {selectedCar.photos?.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {selectedCar.photos.map((src, i) => (
                    <div
                      key={i}
                      className="h-16 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
                    >
                      <img src={src} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {!selectedCar.photos?.length && !selectedCar.image && (
            <div className="h-48 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400">
              <ImagePlus size={40} className="mx-auto" />
              <p className="mt-2 text-sm font-semibold">No Image Available</p>
            </div>
          )}

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <InfoCard label="Registration No." value={selectedCar.registrationNo} />
            <InfoCard label="Fuel Type" value={selectedCar.fuelType} />
            <InfoCard label="Transmission" value={selectedCar.transmission} />
            <InfoCard label="No. of Seats" value={`${selectedCar.seats} Seats`} />
            <InfoCard label="No. of Doors" value={`${selectedCar.doors || '—'} Doors`} />
            <InfoCard label="Manufacturing Year" value={selectedCar.year} />
            <InfoCard label="Mileage" value={selectedCar.mileage || '—'} />
            <InfoCard label="Color" value={selectedCar.color || '—'} />
            <InfoCard label="Per Day Charge" value={currency(selectedCar.pricePerDay)} />
            <InfoCard label="AC" value={selectedCar.ac === false ? 'Non-AC' : 'AC'} />
            <InfoCard label="VIN Number" value={selectedCar.vinNumber || '—'} />
            <div className="col-span-2">
              <InfoCard label="Current Status" value={<Badge status={selectedCar.status} />} />
            </div>
          </div>

          {/* Documents */}
          {(selectedCar.insuranceInvoice || selectedCar.registrationCardImage) && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Documents</h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {selectedCar.insuranceInvoice && (
                  <DocPreviewCard label="Insurance Invoice" src={selectedCar.insuranceInvoice} />
                )}
                {selectedCar.registrationCardImage && (
                  <DocPreviewCard label="Registration Card" src={selectedCar.registrationCardImage} />
                )}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Description</h4>
            <p className="mt-2 text-sm text-slate-700 leading-relaxed">
              {selectedCar.description || 'No description provided for this car.'}
            </p>
          </div>
        </div>

      /* ── Cars Table View ────────────────────────────────────────────── */
      ) : (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-950">Uploaded Cars</h3>
            <span className="text-xs text-slate-500 font-semibold">
              {cars.length} active {cars.length === 1 ? 'car' : 'cars'}
            </span>
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
                              {car.image || car.photos?.[0] ? (
                                <img
                                  src={car.photos?.[0] || car.image}
                                  alt={car.name}
                                  className="h-full w-full object-cover"
                                />
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
                        <td className="px-6 py-4 font-semibold text-slate-700">{car.registrationNo}</td>
                        <td className="px-6 py-4">
                          <div className="text-slate-800 font-medium">
                            {car.fuelType} • {car.transmission}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {car.seats} Seats • {car.doors || '—'} Doors
                            {car.ac === false ? ' • Non-AC' : ' • AC'}
                            {car.mileage ? ` • ${car.mileage}` : ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-950">
                          {currency(car.pricePerDay)}
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={car.status}
                            onChange={(e) => updateCarStatus(car.id, e.target.value)}
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
                              onClick={() => setDeleteConfirmId(car.id)}
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
            <EmptyState title="No cars uploaded" message="Cars can be uploaded after the company is verified." />
          )}
        </section>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => setDeleteConfirmId(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 border border-rose-100 mx-auto">
              <Trash2 size={26} className="text-rose-600" />
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-xl font-bold text-slate-950">Delete Car?</h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                <span className="font-semibold text-slate-800">{carToDelete?.name}</span> will be permanently deleted.
                This action cannot be undone.
              </p>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
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

/* ── Helper sub-components ──────────────────────────────────────────── */

const inputCls =
  'mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950 bg-slate-50 focus:bg-white transition text-sm';

const SectionHeading = ({ children }) => (
  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">
    {children}
  </h4>
);

const FormField = ({ label, children }) => (
  <div>
    <label className="text-sm font-semibold text-slate-700">{label}</label>
    {children}
  </div>
);

const ToggleChip = ({ active, onClick, label }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-bold transition ${
      active
        ? 'border-[#00D6CC] bg-[#00D6CC]/10 text-[#00B5B0]'
        : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
    }`}
  >
    {active && <CheckCircle size={14} />}
    {label}
  </button>
);

const FileUploadField = ({ label, file, accept, onChange, hint }) => (
  <div>
    <label className="text-sm font-semibold text-slate-700">{label}</label>
    <label className="mt-2 flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 hover:border-[#00D6CC] hover:bg-[#00D6CC]/5 transition">
      <FileText size={18} className={file ? 'text-[#00D6CC]' : ''} />
      <div className="flex-1 overflow-hidden">
        <p className="truncate font-medium">{file ? file.name : `Upload ${label}`}</p>
        {!file && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
      </div>
      {file && <CheckCircle size={16} className="shrink-0 text-[#00D6CC]" />}
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
    </label>
  </div>
);

const InfoCard = ({ label, value }) => (
  <div className="rounded-2xl bg-slate-50 p-3 border border-slate-100/50">
    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
    <div className="mt-1 text-sm font-bold text-slate-950">{value}</div>
  </div>
);

const DocPreviewCard = ({ label, src }) => {
  const isPdf = src?.startsWith('data:application/pdf') || src?.endsWith('.pdf');
  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden">
      {isPdf ? (
        <a
          href={src}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 bg-slate-50 p-4 hover:bg-slate-100 transition"
        >
          <FileText size={24} className="text-[#00D6CC]" />
          <div>
            <p className="text-sm font-bold text-slate-800">{label}</p>
            <p className="text-xs text-slate-500">Click to view PDF</p>
          </div>
        </a>
      ) : (
        <div className="space-y-2">
          <img src={src} alt={label} className="h-40 w-full object-cover" />
          <p className="px-3 pb-3 text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</p>
        </div>
      )}
    </div>
  );
};

export default CarManagement;
