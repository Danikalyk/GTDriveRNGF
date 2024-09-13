import {createContext, useMemo, useState} from 'react';

export const LocationContext = createContext();

export const LocationProvider = ({children}) => {
  const [location, setLocation] = useState(null);

  const value = useMemo(() => ({location, setLocation}), [location]);
  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};
