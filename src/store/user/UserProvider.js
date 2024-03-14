import {createContext, useEffect, useState} from 'react';
import useSWR from 'swr';
import {fetchUsers, getDevTokens} from '../../api/auth';

// Playing with this component around
// Using context with useState or useReducer

const USER_STATE = {currentUser: {}, usersList: []};

export const UserContext = createContext();

export const UserProvider = ({children}) => {
  const [currentUser, setUser] = useState(USER_STATE.currentUser);
  const [usersList, setUsersList] = useState(USER_STATE.usersList);

  const {data, isLoading, error} = useSWR(`/users`, fetchUsers);

  useEffect(() => {
    const init = async () => {
      await getDevTokens({isRefresh: true});
    };

    init();
  }, []);
  useEffect(() => {
    if (data?.users?.[0]) {
      setUsersList(data.users);
    }
  }, [data]);

  const value = {currentUser, setUser, usersList};

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
