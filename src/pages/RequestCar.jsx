import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Car, Fuel, Milestone, Users, Calendar, MapPin, Search, LogIn, CheckCircle2 } from 'lucide-react';

const RequestCar = ({ setActivePage }) => {
  const { state, createRentalRequest } = useApp();
  const [selectedCar, setSelectedCar] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    pickupDate: '',
    returnDate: '',
    pickupLocation: '',
  });

  // Filter only available cars
  const cars = state.cars.filter(car => 
    car.status === 'available' && 
    (car.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     car.brand.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!selectedCar) return;

    const result = createRentalRequest({
      carId: selectedCar.id,
      customerName: form.customerName,
      customerEmail: form.customerEmail,
      customerPhone: form.customerPhone,
      pickupDate: form.pickupDate,
      returnDate: form.returnDate,
      pickupLocation: form.pickupLocation,
    });

    if (result.ok) {
      setBookingSuccess(true);
      setForm({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        pickupDate: '',
        returnDate: '',
        pickupLocation: '',
      });
      setTimeout(() => {
        setBookingSuccess(false);
        setSelectedCar(null);
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* Premium Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white shadow-md">
              <Car size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Viamo</h1>
              <p className="text-xs text-slate-500 font-medium">Car Rental Service</p>
            </div>
          </div>

          <button
            onClick={() => setActivePage('login')}
            className="flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-all duration-250 active:scale-95"
          >
            <LogIn size={16} />
            <span>Admin Access</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-6">
        <div className="rounded-3xl bg-slate-950 text-white p-8 md:p-12 relative overflow-hidden shadow-xl mb-10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-xs font-semibold tracking-wider text-blue-300 uppercase mb-4">
              Premium Fleet
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Rent Your Perfect Ride
            </h2>
            <p className="mt-4 text-slate-300 text-base md:text-lg">
              Choose from our premium selection of fully verified cars. Transparent pricing, hassle-free booking, and excellent service.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by brand or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:border-slate-950 focus:ring-1 focus:ring-slate-950 shadow-sm transition"
            />
          </div>
          <div className="text-sm font-semibold text-slate-500">
            Showing {cars.length} available {cars.length === 1 ? 'car' : 'cars'}
          </div>
        </div>

        {/* Cars Grid */}
        {cars.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl shadow-sm">
            <Car className="mx-auto text-slate-300 mb-4" size={48} />
            <h3 className="text-lg font-bold text-slate-800">No Cars Available</h3>
            <p className="text-slate-500 mt-2">Check back later or refine your search query.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cars.map((car) => (
              <div key={car.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">
                <div className="h-48 bg-slate-100 flex items-center justify-center relative">
                  {car.image ? (
                    <img src={car.image} alt={car.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-slate-400 flex flex-col items-center gap-2">
                      <Car size={40} />
                      <span className="text-xs font-semibold uppercase tracking-wider">No Image Available</span>
                    </div>
                  )}
                  <span className="absolute top-4 right-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Available
                  </span>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{car.brand}</span>
                    <h3 className="text-lg font-bold text-slate-950 mt-0.5">{car.name}</h3>
                  </div>

                  <p className="text-slate-500 text-sm mb-6 line-clamp-2">{car.description || 'No description provided.'}</p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2 text-slate-600 text-xs font-medium">
                      <Fuel size={16} className="text-slate-400" />
                      <span>{car.fuelType}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 text-xs font-medium">
                      <Milestone size={16} className="text-slate-400" />
                      <span>{car.mileage}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 text-xs font-medium">
                      <Users size={16} className="text-slate-400" />
                      <span>{car.seats} Seats</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 text-xs font-medium">
                      <span className="text-slate-400 font-bold uppercase text-[10px] border border-slate-200 px-1.5 py-0.5 rounded">TX</span>
                      <span>{car.transmission}</span>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-black text-slate-950">₹{car.pricePerDay}</span>
                      <span className="text-xs font-bold text-slate-400"> / day</span>
                    </div>
                    <button
                      onClick={() => setSelectedCar(car)}
                      className="rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition active:scale-95 shadow-sm"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Booking Form Modal */}
      {selectedCar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 animate-slide-up">
            <div className="bg-slate-950 p-6 text-white relative">
              <h3 className="text-xl font-bold">Request Rental</h3>
              <p className="text-slate-300 text-xs mt-1">Submit your details to request {selectedCar.name}</p>
              <button
                onClick={() => setSelectedCar(null)}
                className="absolute right-6 top-6 text-slate-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            {bookingSuccess ? (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 size={36} />
                </div>
                <h4 className="text-lg font-bold text-slate-900">Request Submitted!</h4>
                <p className="text-sm text-slate-500 mt-2">Your rental request has been sent to the admin for approval.</p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={form.customerName}
                      onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-slate-950 text-sm"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={form.customerEmail}
                      onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-slate-950 text-sm"
                      placeholder="name@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={form.customerPhone}
                      onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-slate-950 text-sm"
                      placeholder="+91 99999 99999"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pickup Date</label>
                    <input
                      type="date"
                      required
                      value={form.pickupDate}
                      onChange={(e) => setForm({ ...form, pickupDate: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-slate-950 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Return Date</label>
                    <input
                      type="date"
                      required
                      value={form.returnDate}
                      onChange={(e) => setForm({ ...form, returnDate: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-slate-950 text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pickup Location</label>
                    <input
                      type="text"
                      required
                      value={form.pickupLocation}
                      onChange={(e) => setForm({ ...form, pickupLocation: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-slate-950 text-sm"
                      placeholder="e.g. Noida Office / Delhi Airport"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-slate-600">
                    <span className="text-xs text-slate-400 block font-medium">Daily Rate</span>
                    <span className="text-lg font-extrabold text-slate-900">₹{selectedCar.pricePerDay}</span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedCar(null)}
                      className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800 transition"
                    >
                      Confirm Request
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestCar;
