const StatCard = ({ title, value, icon: Icon, hint }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
      </div>
      {Icon ? (
        <div className="rounded-2xl bg-[#00D6CC] p-3 text-white">
          <Icon size={22} />
        </div>
      ) : null}
    </div>
    {hint ? <p className="mt-3 text-sm text-slate-500">{hint}</p> : null}
  </div>
);

export default StatCard;
