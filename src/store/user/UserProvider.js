import {createContext, useEffect, useState} from 'react';

export const UserContext = createContext();

export const UserProvider = ({children}) => {
  const [currentUser, setUser] = useState(null);
  const [currentRoute, setRoute] = useState(null);

  return (
    <UserContext.Provider value={{ currentUser, setUser, currentRoute, setRoute }}>
      {children}
    </UserContext.Provider>
  );
};