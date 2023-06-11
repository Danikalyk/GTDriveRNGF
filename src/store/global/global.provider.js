import {useMemo, useReducer} from 'react';
import {globalReducer} from './global.reducer';
import {globalActionTypes as actions} from './global.actions';
import {GlobalState} from './global.state';

const GLOBAL_STATE = {
  isLoggedIn: undefined,
  theme: 'light',
  isModalOpen: false,
};

export const GlobalStateProvider = ({children}) => {
  const [state, dispatch] = useReducer(globalReducer, GLOBAL_STATE);

  const value = useMemo(
    () => ({
      ...state,
      login: () => {
        dispatch({type: actions.LOGIN});
      },
      logout: () => {
        dispatch({type: actions.LOGOUT});
      },
      setLightTheme: () => {
        dispatch({type: actions.LIGHT_THEME});
      },
      setDarkTheme: () => {
        dispatch({type: actions.DARK_THEME});
      },
      openModal: () => {
        dispatch({type: actions.OPEN_MODAL});
      },
      closeModal: () => {
        dispatch({type: actions.CLOSE_MODAL});
      },
    }),
    [state, dispatch],
  );

  

  // Wrap the context provider around our component
  return <GlobalState.Provider value={value}>{children}</GlobalState.Provider>;
};
