import { useState } from 'react';
import Badge from '../../../../components/Badge';
import EmptyState from '../../../../components/EmptyState';
import { useApp } from '../../../../context/AppContext';
import { formatDate } from '../../../../utils/storage';
import { ArrowLeft, Car as CarIcon, MapPin, Calendar, Fuel, Settings, Users, Eye } from 'lucide-react';

const CompanyCars = ({ companyId, setActivePage, onShowDetail }) => {
  const { state } = useApp();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const company = state.companies.find((c) => c.id === companyId);
  const companyCars = state.allCompanyCars.filter((car) => car.companyId === companyId);

  const filteredCars = companyCars.filter((car) => {
    const matchesSearch =
      car.name.toLowerCase().includes(search.toLowerCase()) ||
      car.brand.toLowerCase().includes(search.toLowerCase()) ||
      car.model.toLowerCase().includes(search.toLowerCase()) ||
      car.registrationNo.toLowerCase().includes(search.toLowerCase());

    const matchesFilter = filter === 'all' ? true : car.status === filter;

    return matchesSearch && matchesFilter;
  });

  if (!company) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setActivePage('companies-list')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-950 transition"
        >
          <ArrowLeft size={20} />
          <span className="font-semibold">Back to Companies</span>
        </button>
        <EmptyState title="Company not found" message="The requested company could not be found." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => setActivePage('companies-list')}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-950 transition"
      >
        <ArrowLeft size={20} />
        <span className="font-semibold">Back to Companies</span>
      </button>

      <div>
        <h2 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">{company.companyName} - Cars</h2>
        <p className="mt-2 text-slate-500">View all cars registered by this company</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'verified', 'rejected'].map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                filter === item
                  ? 'text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
              style={filter === item ? { backgroundColor: '#00D6CC', boxShadow: '0 4px 12px rgba(0, 214, 204, 0.2)' } : {}}
            >
              {item.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="relative w-full max-w-xs">
          <CarIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search cars..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#00D6CC] focus:ring-1 focus:ring-[#00D6CC] transition"
          />
        </div>
      </div>

      {filteredCars.length ? (
        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-soft">
          <table className="w-full min-w-[1000px] border-collapse text-left text-sm text-slate-500">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-700">
              <tr>
                <th scope="col" className="px-6 py-4 font-bold">Car Details</th>
                <th scope="col" className="px-6 py-4 font-bold">Specifications</th>
                <th scope="col" className="px-6 py-4 font-bold">Price / Day</th>
                <th scope="col" className="px-6 py-4 font-bold">Status</th>
                <th scope="col" className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCars.map((car) => (
                <tr key={car.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 align-middle">
                    <div className="flex items-center gap-3">
                      {car.image ? (
                        <img
                          src={car.image}
                          alt={car.name}
                          className="h-12 w-12 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                          <CarIcon size={20} className="text-slate-400" />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-slate-950">{car.name}</div>
                        <div className="text-xs text-slate-400">{car.brand} {car.model}</div>
                        <div className="text-xs text-slate-500 mt-1">Reg: {car.registrationNo}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <div className="text-xs text-slate-600 space-y-1">
                      <div><span className="font-medium">Year:</span> {car.year}</div>
                      <div><span className="font-medium">Fuel:</span> {car.fuelType}</div>
                      <div><span className="font-medium">Transmission:</span> {car.transmission}</div>
                      <div><span className="font-medium">Seats:</span> {car.seats}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <div className="font-bold text-slate-950">₹{car.pricePerDay}</div>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <div className="flex flex-col gap-1 items-start">
                      <Badge status={car.status} />
                      {car.status === 'rejected' && car.rejectionReason && (
                        <div className="mt-2 text-xs font-medium text-rose-700 bg-rose-50 rounded-xl p-2 border border-rose-100 max-w-[200px] break-words">
                          <b>Reason:</b> {car.rejectionReason}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle text-right">
                    <button
                      onClick={() => onShowDetail?.(car.id, 'company-cars')}
                      className="rounded-xl bg-slate-500 text-white hover:bg-slate-600 px-3 py-2 text-xs font-bold transition shadow-sm flex items-center gap-1"
                      title="View Details"
                    >
                      <Eye size={14} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="No cars found" message="This company hasn't registered any cars yet." />
      )}
    </div>
  );
};

export default CompanyCars;
