import { ApplicationProvider } from '@ui-kitten/components';
import { useEffect, useMemo, useReducer, useState } from 'react';
import RNFS from 'react-native-fs';

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

  async function requestStoragePermission() {
    try {
      if (Number(Platform.Version) >= 33) {
        return true;
      }

      const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

      const hasPermission = await PermissionsAndroid.check(permission);
      if (hasPermission) {
        return true;
      }

      const granted = await PermissionsAndroid.request(permission, {
        title: 'Storage Permission Required',
        message:
          'App needs access to your storage to download and install the update.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      });

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the camera');
      } else if (granted === PermissionsAndroid.RESULTS.DENIED) {
        console.log('Camera permission denied');
      } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        console.log("Camera permission denied and don't ask again selected");
        // openAppSettings();
        Alert.alert(
          'Permission needed',
          'To use this feature, you need to grant camera permission from settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => openAppSettings() },
          ],
        );
      }
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }

  const openAppSettings = () => {
    Linking.openSettings().catch(() => {
      console.warn('Cannot open settings');
    });
  };

  async function downloadAndInstallAPK() {
    const url = "http://upd.gt-logistics.su/_GTDrive/123.apk";

    console.log('Downloading APK...', url);

    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Denied',
        'You need to give storage permission to download the update.',
      );
      return;
    }

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

    /*RNFS.openFile(filePath, "application/vnd.android.package-archive")
      .then(success => {
        console.log("File opened:", success);
      })
      .catch(err => {
        console.error("Error opening file:", err);
        // Покажите сообщение об ошибке пользователю
        Alert.alert('Ошибка установки', 'Не удалось открыть APK-файл для установки.');
      });*/

      /*const intent = new Intent();
      intent.setAction(android.content.Intent.ACTION_VIEW);
      intent.setDataAndType(Uri.parse(filePath), "application/vnd.android.package-archive");
      intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION); // Дать разрешение на чтение
    
      // Запустить Intent
      // Вызывает приложение для установки APK
      // Это может привести к использованию менеджера файлов или
      // другому приложению для обработки установки APK-файла
      LauncherActivity.startActivityForResult(intent, 0); // Запустите Activity для открытия */
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
