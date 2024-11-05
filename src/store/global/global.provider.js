import { ApplicationProvider } from '@ui-kitten/components';
import { useEffect, useMemo, useReducer, useState } from 'react';
import RNFS from 'react-native-fs';
import React from 'react';
import { Alert, PermissionsAndroid, Platform, Linking, Intent, Uri, LauncherActivity } from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';

import { globalActionTypes as actions } from './global.actions';
import { globalReducer } from './global.reducer';
import { GlobalState } from './global.state';

import * as eva from '@eva-design/eva';
import { getUpdate } from '../../api/routes';
import compareVersions from '../../utils/compareVersions';
import { appVersion } from '../../version';


const GLOBAL_STATE = {
  isLoggedIn: undefined,
  theme: 'light',
  isModalOpen: false,
  enabledGeo: false,
  location: null,
};

export const GlobalStateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(globalReducer, GLOBAL_STATE);

  const [showInstaller, setShowInstaller] = useState(false);
  const [updateData, setUpdateData] = useState(null);

  useEffect(() => {
    const init = async () => {
      getUpdate()
        .then(data => {
          setUpdateData(data);

          const compareVersion = compareVersions(appVersion, data.version);

          if (compareVersion) {
            setShowInstaller(true);
          }
        })
        .catch(error => {
          console.error(error);
        });
    };

    init();
  }, []);


  const openAppSettings = () => {
    Linking.openSettings().catch(() => {
      console.warn('Cannot open settings');
    });
  };

  async function downloadAndInstallAPK() {
    if (Platform.OS !== 'android') {
      Alert.alert('Недоступно', 'Установка APK доступна только на Android');
      return;
    }
  
    const url = "http://upd.gt-logistics.su/_GTDrive/123.apk";
    const fileName = url.split('/').pop();
    const downloadDest = `${RNFetchBlob.fs.dirs.DownloadDir}/${fileName}`;
  
    try {
      // Конфигурируем и запускаем загрузку
      const res = await RNFetchBlob.config({
        addAndroidDownloads: {
          useDownloadManager: true,
          title: fileName,
          description: "Загрузка APK для установки",
          mime: "application/vnd.android.package-archive",
          path: downloadDest,
          mediaScannable: true,
          notification: true,
        }
      }).fetch("GET", url);
  
      console.log('APK загружен в:', res.path());
  
      // Проверяем, существует ли файл, прежде чем пытаться его установить
      const exists = await RNFetchBlob.fs.exists(res.path());
      if (!exists) {
        Alert.alert('Ошибка', 'Файл не найден после загрузки');
        return;
      }
  
      // Запускаем установку APK
      RNFetchBlob.android.actionViewIntent(
        res.path(),
        "application/vnd.android.package-archive"
      );
  
    } catch (error) {
      console.error('Ошибка при загрузке или установке APK:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить или установить APK');
    }
  }

  // Мемоизация для основных действий
  const actionsValue = useMemo(
    () => ({

      login: () => dispatch({ type: actions.LOGIN }),
      logout: () => {
        dispatch({ type: actions.DISABLE_GEO });
        dispatch({ type: actions.LOGOUT });
      },
      setLightTheme: () => dispatch({ type: actions.LIGHT_THEME }),
      setDarkTheme: () => dispatch({ type: actions.DARK_THEME }),
      openModal: () => dispatch({ type: actions.OPEN_MODAL }),
      closeModal: () => dispatch({ type: actions.CLOSE_MODAL }),
      enableGeo: () => dispatch({ type: actions.ENABLE_GEO }),
      disableGeo: () => dispatch({ type: actions.DISABLE_GEO }),
      setLocation: location =>
        dispatch({ type: actions.SET_LOCATION, payload: location }),
    }),
    [dispatch],
  );

  // Мемоизация для всех частей состояния
  const themeValue = useMemo(() => state.theme, [state.theme]);
  const locationValue = useMemo(() => state.location, [state.location]);
  const isLoggedInValue = useMemo(() => state.isLoggedIn, [state.isLoggedIn]);
  const isModalOpenValue = useMemo(
    () => state.isModalOpen,
    [state.isModalOpen],
  );
  const enabledGeoValue = useMemo(() => state.enabledGeo, [state.enabledGeo]);
  
  // Wrap the context provider around our component
  return (
    <ApplicationProvider {...eva} theme={eva[themeValue]}>
      <GlobalState.Provider
        value={{
          ...actionsValue,
          showInstaller,
          updateData,
          downloadAndInstallAPK,
          location: locationValue,
          isLoggedIn: isLoggedInValue,
          isModalOpen: isModalOpenValue,
          enabledGeo: enabledGeoValue,
        }}>
        {children}
      </GlobalState.Provider>
    </ApplicationProvider>
  );
};
