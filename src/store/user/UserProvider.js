import { createContext, useContext, useEffect, useState } from 'react';
import { deleteAllGeofences } from '../../components/functions';
import { NavigationContext } from '@react-navigation/native';
import { GlobalState } from '../global/global.state';

export const UserContext = createContext();

export const UserProvider = ({children}) => {
  const [currentUser, setUser] = useState(null);
  const [currentRoute, setRoute] = useState(null);

  const context = useContext(GlobalState);

  const logoutUser = () => {
    deleteAllGeofences();
    context.logout();
    setUser(null);
  };

  return (
    <UserContext.Provider
      value={{currentUser, setUser, currentRoute, setRoute, logoutUser}}>
      {children}
    </UserContext.Provider>
  );
};
