import { ApplicationProvider } from '@ui-kitten/components';
import { useEffect, useMemo, useReducer, useState } from 'react';
import RNFS from 'react-native-fs';
//import IntentLauncher, { IntentConstant } from 'react-native-intent-launcher';

import React from 'react';
import { Alert, PermissionsAndroid, Platform, Linking, Intent , Uri, LauncherActivity } from 'react-native';
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
    const url = "http://upd.gt-logistics.su/_GTDrive/123.apk";

    console.log('Downloading APK...', url);

    const fileName = url.split('/').pop();
    const destPath = `${RNFS.DownloadDirectoryPath}/${fileName}`; // Используем ExternalDirectoryPath

    // Проверяем, существует ли директория, если нет - создаем
    const dirExists = await RNFS.exists(RNFS.ExternalDirectoryPath);
    if (!dirExists) {
      await RNFS.mkdir(RNFS.ExternalDirectoryPath);
    }

    try {
      const res = await RNFS.downloadFile({
        fromUrl: url,
        toFile: destPath,
      }).promise;

      console.log('Download response:', res); // Отладочная информация

      if (res.statusCode === 200) {
        Alert.alert(
          'Загрузка завершена',
          'Установить обновление?',
          [
            { text: 'Отмена', style: 'cancel' },
            { text: 'Установить', onPress: () => installAPK(destPath) },
          ],
          { cancelable: false },
        );
      } else {
        Alert.alert('Download Failed', `Failed to download the APK. Status code: ${res.statusCode}`);
      }
    } catch (err) {
      console.error('Download error:', err); // Отладочная информация
      Alert.alert(
        'Download Error',
        'An error occurred while downloading the APK.',
      );
    }
  }

  function installAPK(filePath) {
    const uri = "file:///storage/emulated/0/Download/123.apk";

    /*try {
      // Проверьте, существует ли файл
      const exists = await RNFS.exists(uri.replace('file://', ''));
      if (!exists) {
        Alert.alert('Ошибка', 'Файл APK не найден');
        return;
      }
  
      IntentLauncher.startActivity({
        action: IntentConstant.ACTION_VIEW,
        data: uri,
        type: 'application/vnd.android.package-archive',
        flags: IntentConstant.FLAG_ACTIVITY_NEW_TASK,
      });
    } catch (error) {
      console.error('Ошибка при установке APK:', error);
      Alert.alert('Ошибка', 'Не удалось установить APK');
    }*/
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
