import React, { useEffect, useState } from 'react';
import { AppState, PermissionsAndroid, Platform, Alert, Linking } from 'react-native';
import { OpenOptimizationSettings, RequestDisableOptimization, BatteryOptEnabled } from "react-native-battery-optimization-check";

/**
 * Запрашивает все необходимые разрешения и проверяет статус оптимизации батареи.
 * Возвращает промис, который резолвится в true, если все разрешения даны и оптимизация батареи отключена.
 */
async function requestPermissions() {
  // Выполняем проверку только на Android
  if (Platform.OS !== 'android') {
    return Promise.resolve(true);
  }

  const permissions = [
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
    PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION,
    PermissionsAndroid.PERMISSIONS.CAMERA,
    //PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
  ];

  const sdkVersion = Platform.Version;
  if (sdkVersion >= 33) {
    permissions.push(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    permissions.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
    permissions.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO);
    permissions.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO);
  }

  try {
    const granted = await PermissionsAndroid.requestMultiple(permissions);
    const deniedPermissions = [];
    const neverAskAgainPermissions = [];

    console.log({ granted });

    for (const [permission, status] of Object.entries(granted)) {
      if (status === PermissionsAndroid.RESULTS.DENIED) {
        deniedPermissions.push(permission);
      } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        neverAskAgainPermissions.push(permission);
      }
    }

    if (deniedPermissions.length > 0 || neverAskAgainPermissions.length > 0) {
      return new Promise((resolve) => {
        handleDeniedPermissions(deniedPermissions, neverAskAgainPermissions, resolve);
      });
    }

    const isBatteryOptimizationDisabled = await checkBatteryOptimizationStatus();
    if (!isBatteryOptimizationDisabled) {
      return new Promise((resolve) => {
        Alert.alert(
          'Оптимизация батареи включена',
          'Некоторые функции могут не работать должным образом. Хотите отключить оптимизацию батареи?',
          [
            { text: 'Отмена', style: 'cancel', onPress: () => resolve(false) },
            {
              text: 'Отключить', onPress: () => {
                RequestDisableOptimization();
                resolve(false);
              }
            }
          ]
        );
      });
    }

    console.log("Well done!");

    return true;
  } catch (err) {
    console.warn('Error requesting permissions:', err);
    Alert.alert('Ошибка', 'Произошла ошибка при запросе разрешений');
    return false;
  }
}

/**
 * Обрабатывает отказанные разрешения и предлагает повторно запросить или открыть настройки.
 */
//{ text: 'Отмена', style: 'cancel', onPress: () => resolve(false) },
function handleDeniedPermissions(deniedPermissions, neverAskAgainPermissions, resolve) {

  console.log({deniedPermissions});

 if (neverAskAgainPermissions.length > 0) {
    Alert.alert(
      'Разрешения отключены',
      'Некоторые разрешения были отключены с опцией "никогда не спрашивать снова". Пожалуйста, включите их в настройках приложения.',
      [
        {
          text: 'Открыть настройки', onPress: () => {
            openAppSettings();
            resolve(false);
          }
        }
      ]
    );
  } else if (deniedPermissions.length > 0) {
    Alert.alert(
      'Недостаточно разрешений',
      'Для корректной работы необходимо предоставить все разрешения. Запросите снова или откройте настройки и разрешите вручную!',
      [
        
        { text: 'Запросить снова', onPress: () => requestPermissions().then(resolve) },
        {
          text: 'Открыть настройки', onPress: () => {
            openAppSettings();
            resolve(false);
          }
        }
      ]
    );
  }  
}

/**
 * Проверяет статус оптимизации батареи на устройствах Android.
 * Возвращает true, если оптимизация батареи отключена.
 */
async function checkBatteryOptimizationStatus() {
  try {
    const isEnabled = await BatteryOptEnabled();
    return !isEnabled;
  } catch (error) {
    console.error('Ошибка проверки оптимизации батареи:', error);
    Alert.alert('Ошибка', 'Не удалось проверить статус оптимизации батареи');
    return false;
  }
}

/**
 * Открывает настройки приложения для ручного управления разрешениями.
 */
function openAppSettings() {
  Linking.openSettings().catch(() => {
    Alert.alert('Ошибка', 'Не удалось открыть настройки');
  });
}

export default requestPermissions;
