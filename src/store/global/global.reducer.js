import {globalActionTypes as actions} from './global.actions';

export const globalReducer = (state, action) => {
  switch (action.type) {
    case actions.LOGIN:
      return {
        ...state,
        isLoggedIn: true,
      };
    case actions.LOGOUT:
      return {
        ...state,
        isLoggedIn: false,
      };
    case actions.LIGHT_THEME:
      return {
        ...state,
        theme: 'light',
      };
    case actions.DARK_THEME:
      return {
        ...state,
        theme: 'dark',
      };
    case actions.OPEN_MODAL:
      return {
        ...state,
        isModalOpen: true,
      };
    case actions.CLOSE_MODAL:
      return {
        ...state,
        isModalOpen: false,
      };
    case actions.ENABLE_GEO:
      return {
        ...state,
        enabledGeo: true,
      };

    case actions.DISABLE_GEO:
      return {
        ...state,
        enabledGeo: false,
      };

    case actions.SET_LOCATION:
      return {
        ...state,
        location: action.payload,
      };
    default:
      return state;
  }
};
