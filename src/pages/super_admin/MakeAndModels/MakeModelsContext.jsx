import { createContext, useContext, useState } from 'react';

const initialMakers = [
  { id: 'm1',  name: 'Acura',         status: 'active' },
  { id: 'm2',  name: 'Alfa Romeo',    status: 'active' },
  { id: 'm3',  name: 'AMC',           status: 'active' },
  { id: 'm4',  name: 'Aston Martin',  status: 'active' },
  { id: 'm5',  name: 'Audi',          status: 'active' },
  { id: 'm6',  name: 'Avanti',        status: 'active' },
  { id: 'm7',  name: 'Bentley',       status: 'active' },
  { id: 'm8',  name: 'BMW',           status: 'active' },
  { id: 'm9',  name: 'Buick',         status: 'active' },
  { id: 'm10', name: 'Cadillac',      status: 'active' },
  { id: 'm11', name: 'Chevrolet',     status: 'active' },
  { id: 'm12', name: 'Chrysler',      status: 'active' },
  { id: 'm13', name: 'Dodge',         status: 'active' },
  { id: 'm14', name: 'Ferrari',       status: 'active' },
  { id: 'm15', name: 'Ford',          status: 'active' },
  { id: 'm16', name: 'GMC',           status: 'active' },
  { id: 'm17', name: 'Honda',         status: 'active' },
  { id: 'm18', name: 'Hyundai',       status: 'active' },
  { id: 'm19', name: 'Infiniti',      status: 'active' },
  { id: 'm20', name: 'Jaguar',        status: 'active' },
  { id: 'm21', name: 'Jeep',         status: 'active' },
  { id: 'm22', name: 'Kia',          status: 'active' },
  { id: 'm23', name: 'Lamborghini',  status: 'active' },
  { id: 'm24', name: 'Land Rover',   status: 'active' },
  { id: 'm25', name: 'Lexus',        status: 'active' },
  { id: 'm26', name: 'Lincoln',      status: 'active' },
  { id: 'm27', name: 'Maserati',     status: 'active' },
  { id: 'm28', name: 'Mazda',        status: 'active' },
  { id: 'm29', name: 'Mercedes-Benz',status: 'active' },
  { id: 'm30', name: 'MINI',         status: 'active' },
  { id: 'm31', name: 'Mitsubishi',   status: 'active' },
  { id: 'm32', name: 'Nissan',       status: 'active' },
  { id: 'm33', name: 'Porsche',      status: 'active' },
  { id: 'm34', name: 'Rolls-Royce',  status: 'active' },
  { id: 'm35', name: 'Subaru',       status: 'active' },
  { id: 'm36', name: 'Tesla',        status: 'active' },
  { id: 'm37', name: 'Toyota',       status: 'active' },
  { id: 'm38', name: 'Volkswagen',   status: 'active' },
  { id: 'm39', name: 'Volvo',        status: 'active' },
];

const initialModels = [
  // Acura
  { id: 'mod1',  makerId: 'm1',  makerName: 'Acura',         name: 'ILX',        status: 'active' },
  { id: 'mod2',  makerId: 'm1',  makerName: 'Acura',         name: 'MDX',        status: 'active' },
  { id: 'mod3',  makerId: 'm1',  makerName: 'Acura',         name: 'NSX',        status: 'active' },
  { id: 'mod4',  makerId: 'm1',  makerName: 'Acura',         name: 'RDX',        status: 'active' },
  { id: 'mod5',  makerId: 'm1',  makerName: 'Acura',         name: 'RLX',        status: 'active' },
  { id: 'mod6',  makerId: 'm1',  makerName: 'Acura',         name: 'TLX',        status: 'active' },
  // BMW
  { id: 'mod7',  makerId: 'm8',  makerName: 'BMW',           name: '3 Series',   status: 'active' },
  { id: 'mod8',  makerId: 'm8',  makerName: 'BMW',           name: '5 Series',   status: 'active' },
  { id: 'mod9',  makerId: 'm8',  makerName: 'BMW',           name: '7 Series',   status: 'active' },
  { id: 'mod10', makerId: 'm8',  makerName: 'BMW',           name: 'X3',         status: 'active' },
  { id: 'mod11', makerId: 'm8',  makerName: 'BMW',           name: 'X5',         status: 'active' },
  { id: 'mod12', makerId: 'm8',  makerName: 'BMW',           name: 'X7',         status: 'active' },
  // Honda
  { id: 'mod13', makerId: 'm17', makerName: 'Honda',         name: 'Accord',     status: 'active' },
  { id: 'mod14', makerId: 'm17', makerName: 'Honda',         name: 'Civic',      status: 'active' },
  { id: 'mod15', makerId: 'm17', makerName: 'Honda',         name: 'CR-V',       status: 'active' },
  { id: 'mod16', makerId: 'm17', makerName: 'Honda',         name: 'HR-V',       status: 'active' },
  { id: 'mod17', makerId: 'm17', makerName: 'Honda',         name: 'Pilot',      status: 'active' },
  // Toyota
  { id: 'mod18', makerId: 'm37', makerName: 'Toyota',        name: 'Camry',      status: 'active' },
  { id: 'mod19', makerId: 'm37', makerName: 'Toyota',        name: 'Corolla',    status: 'active' },
  { id: 'mod20', makerId: 'm37', makerName: 'Toyota',        name: 'Highlander', status: 'active' },
  { id: 'mod21', makerId: 'm37', makerName: 'Toyota',        name: 'Prius',      status: 'active' },
  { id: 'mod22', makerId: 'm37', makerName: 'Toyota',        name: 'RAV4',       status: 'active' },
  // Ford
  { id: 'mod23', makerId: 'm15', makerName: 'Ford',          name: 'Explorer',   status: 'active' },
  { id: 'mod24', makerId: 'm15', makerName: 'Ford',          name: 'F-150',      status: 'active' },
  { id: 'mod25', makerId: 'm15', makerName: 'Ford',          name: 'Mustang',    status: 'active' },
  { id: 'mod26', makerId: 'm15', makerName: 'Ford',          name: 'Ranger',     status: 'active' },
  // Mercedes-Benz
  { id: 'mod27', makerId: 'm29', makerName: 'Mercedes-Benz', name: 'C-Class',    status: 'active' },
  { id: 'mod28', makerId: 'm29', makerName: 'Mercedes-Benz', name: 'E-Class',    status: 'active' },
  { id: 'mod29', makerId: 'm29', makerName: 'Mercedes-Benz', name: 'GLE',        status: 'active' },
  { id: 'mod30', makerId: 'm29', makerName: 'Mercedes-Benz', name: 'S-Class',    status: 'active' },
  // Hyundai
  { id: 'mod31', makerId: 'm18', makerName: 'Hyundai',       name: 'Creta',      status: 'active' },
  { id: 'mod32', makerId: 'm18', makerName: 'Hyundai',       name: 'i20',        status: 'active' },
  { id: 'mod33', makerId: 'm18', makerName: 'Hyundai',       name: 'Tucson',     status: 'active' },
  { id: 'mod34', makerId: 'm18', makerName: 'Hyundai',       name: 'Venue',      status: 'active' },
  // Kia
  { id: 'mod35', makerId: 'm22', makerName: 'Kia',           name: 'Seltos',     status: 'active' },
  { id: 'mod36', makerId: 'm22', makerName: 'Kia',           name: 'Sonet',      status: 'active' },
  { id: 'mod37', makerId: 'm22', makerName: 'Kia',           name: 'Sportage',   status: 'active' },
  // Nissan
  { id: 'mod38', makerId: 'm32', makerName: 'Nissan',        name: 'Altima',     status: 'active' },
  { id: 'mod39', makerId: 'm32', makerName: 'Nissan',        name: 'Kicks',      status: 'active' },
  { id: 'mod40', makerId: 'm32', makerName: 'Nissan',        name: 'Rogue',      status: 'active' },
  // Tesla
  { id: 'mod41', makerId: 'm36', makerName: 'Tesla',         name: 'Model 3',    status: 'active' },
  { id: 'mod42', makerId: 'm36', makerName: 'Tesla',         name: 'Model S',    status: 'active' },
  { id: 'mod43', makerId: 'm36', makerName: 'Tesla',         name: 'Model X',    status: 'active' },
  { id: 'mod44', makerId: 'm36', makerName: 'Tesla',         name: 'Model Y',    status: 'active' },
];

const MakeModelsContext = createContext(null);

export const MakeModelsProvider = ({ children }) => {
  const [makers, setMakers] = useState(initialMakers);
  const [models, setModels] = useState(initialModels);

  const addMaker = (name) => {
    const newMaker = { id: 'm' + Date.now(), name, status: 'active' };
    setMakers(prev => [...prev, newMaker]);
    return newMaker;
  };

  const updateMaker = (id, data) =>
    setMakers(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));

  const deleteMaker = (id) => {
    setMakers(prev => prev.filter(m => m.id !== id));
    setModels(prev => prev.filter(m => m.makerId !== id));
  };

  const addModel = (makerId, makerName, name) => {
    const newModel = { id: 'mod' + Date.now(), makerId, makerName, name, status: 'active' };
    setModels(prev => [...prev, newModel]);
    return newModel;
  };

  const updateModel = (id, data) =>
    setModels(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));

  const deleteModel = (id) =>
    setModels(prev => prev.filter(m => m.id !== id));

  return (
    <MakeModelsContext.Provider value={{
      makers, models,
      addMaker, updateMaker, deleteMaker,
      addModel, updateModel, deleteModel,
    }}>
      {children}
    </MakeModelsContext.Provider>
  );
};

export const useMakeModels = () => useContext(MakeModelsContext);
