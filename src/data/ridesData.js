const PICKUPS = [
  'Indore Airport (IDR)',
  'Vijay Nagar, Indore',
  'Rajwada Palace, Indore',
  'Sector 62, Noida',
  'IGI Airport T3, Delhi',
  'Bandra West, Mumbai',
  'Noida Electronic City',
  'Palasia, Indore',
  'Cyber City, Gurugram',
  'Chhatrapati Shivaji Airport, Mumbai'
];

const DROPS = [
  'Bhawarkua, Indore',
  'Palasia, Indore',
  'Connaught Place, Delhi',
  'Cyber City, Gurugram',
  'Chhatrapati Shivaji Airport, Mumbai',
  'Akshardham Temple, Delhi',
  'Juhu Beach, Mumbai',
  'Noida Sector 18',
  'Rajwada Palace, Indore',
  'Vijay Nagar, Indore'
];

const CUSTOMERS = [
  { name: 'Aarav Sharma', phone: '+91 98765 43211' },
  { name: 'Ananya Iyer', phone: '+91 99887 76655' },
  { name: 'Kabir Verma', phone: '+91 91234 56780' },
  { name: 'Diya Patel', phone: '+91 95555 44444' },
  { name: 'Rohan Gupta', phone: '+91 94444 33333' },
  { name: 'Pooja Reddy', phone: '+91 93333 22222' }
];

const STATUSES = ['Completed', 'Completed', 'Completed', 'Ongoing', 'Cancelled'];

const hashCode = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

export const getDriverRides = (driverId) => {
  if (!driverId) return [];
  const seed = hashCode(String(driverId));
  const numRides = 3 + (seed % 4); // 3 to 6 rides per driver
  const rides = [];

  for (let i = 0; i < numRides; i++) {
    const pickupIdx = (seed + i * 7) % PICKUPS.length;
    let dropIdx = (seed + i * 13) % DROPS.length;
    if (PICKUPS[pickupIdx] === DROPS[dropIdx]) {
      dropIdx = (dropIdx + 1) % DROPS.length;
    }
    
    const customer = CUSTOMERS[(seed + i * 17) % CUSTOMERS.length];
    const km = 5 + ((seed + i * 23) % 45); // 5 to 49 KM
    const price = km * 12 + ((seed + i * 9) % 50); // ₹12/KM base plus variance
    const tip = (seed + i * 11) % 4 === 0 ? 0 : (20 + ((seed + i * 13) % 9) * 10); // ₹20 to ₹100 tips, occasionally ₹0
    const status = STATUSES[(seed + i * 3) % STATUSES.length];
    
    // Distribute ride dates in the past week
    const dateOffset = i * 24 * 60 * 60 * 1000 + (seed % 5) * 60 * 60 * 1000;
    const date = new Date(Date.now() - dateOffset);

    rides.push({
      id: `ride_${String(driverId).slice(-4)}_${i}`,
      pickup: PICKUPS[pickupIdx],
      drop: DROPS[dropIdx],
      customerName: customer.name,
      customerPhone: customer.phone,
      km,
      price: Math.round(price),
      tip: Math.round(tip),
      status: i === 0 && status === 'Ongoing' ? 'Ongoing' : (status === 'Ongoing' ? 'Completed' : status),
      date: date.toISOString(),
    });
  }

  return rides.sort((a, b) => new Date(b.date) - new Date(a.date));
};
