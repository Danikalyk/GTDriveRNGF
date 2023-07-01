import {createContext, useEffect, useState} from 'react';
import {fetchUsers} from '../../api/auth';

// Playing with this component around
// Using context with useState or useReducer

const USER_STATE = {currentUser: {}, usersList: []};

export const UserContext = createContext();

export const UserProvider = ({children}) => {
  const [currentUser, setUser] = useState(USER_STATE.currentUser);
  const [usersList, setUsersList] = useState(USER_STATE.usersList);

  const value = {currentUser, setUser, usersList};

  useEffect(() => {
    const init = async () => {
      const {users} = await fetchUsers();
      
      if (users?.[0]) {
        setUsersList(users);
      }
    };

    init();
  }, []);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
