import {useReducer, createContext} from 'react';

// Define the initial state
const GLOBAL_STATE = {
  isLoggedIn: undefined,
  theme: 'light',
  isModalOpen: false,
};

// Define the reducer
const globalReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        isLoggedIn: true,
      };
    case 'LOGOUT':
      return {
        ...state,
        isLoggedIn: false,
      };
    case 'LIGHT_THEME':
      return {
        ...state,
        theme: 'light',
      };
    case 'DARK_THEME':
      return {
        ...state,
        theme: 'dark',
      };
    case 'OPEN_MODAL':
      return {
        ...state,
        isModalOpen: true,
      };
    case 'CLOSE_MODAL':
      return {
        ...state,
        isModalOpen: false,
      };
    default:
      return state;
  }
};

// Create the context
export const GlobalState = createContext();
GlobalState.displayName = 'GlobalState';

export const GlobalStateProvider = ({children}) => {
  // Create the reducer
  const [state, dispatch] = useReducer(globalReducer, GLOBAL_STATE);

  const value = {
    ...state,
    login: () => {
      dispatch({type: 'LOGIN'});
    },
    logout: () => {
      dispatch({type: 'LOGOUT'});
    },
    setLightTheme: () => {
      dispatch({type: 'LIGHT_THEME'});
    },
    setDarkTheme: () => {
      dispatch({type: 'DARK_THEME'});
    },
    openModal: () => {
      dispatch({type: 'OPEN_MODAL'});
    },
    closeModal: () => {
      dispatch({type: 'CLOSE_MODAL'});
    },
  };

  // Wrap the context provider around our component
  return <GlobalState.Provider value={value}>{children}</GlobalState.Provider>;
};
