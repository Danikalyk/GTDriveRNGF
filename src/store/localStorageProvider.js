import {AppState} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const localStorageProvider = () => {
  const map = new Map(JSON.parse(AsyncStorage.getItem('app-cache') || '[]'));

  function handleAppStateChange(state) {
    if (state === 'background') {
      const appCache = JSON.stringify(Array.from(map.entries()));
      AsyncStorage.setItem('app-cache', appCache);
    }
  }

  AppState.addEventListener('change', handleAppStateChange);

  return map;
};

