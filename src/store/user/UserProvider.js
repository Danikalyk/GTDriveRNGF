import {createContext, useEffect, useState} from 'react';
import {fetchUser} from '../../api/auth';

// Playing with this component around
// Using context with useState or useReducer

const USER_STATE = {currentUser: {}};

export const UserContext = createContext();

export const UserProvider = ({children}) => {
  const [currentUser, setUser] = useState(USER_STATE.currentUser);

  const value = {currentUser, setUser};

  useEffect(() => {
    const init = async () => {
      await fetchUser();
    };

    init();
  }, []);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
