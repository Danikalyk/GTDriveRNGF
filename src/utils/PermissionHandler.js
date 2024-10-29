import { PermissionsAndroid, Platform, Alert, Linking } from 'react-native';

async function requestPermissions() { 

  if (Platform.OS !== 'android') {
    console.log('Not an Android platform, skipping permissions request');
    return;
  }

  const permissions = [
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
    PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION,
  ];

  const sdkVersion = Platform.Version;
  if (sdkVersion >= 33) {
    permissions.push(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    permissions.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
    permissions.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO);
    permissions.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO);
  }

  try {
    console.log('Requesting permissions:', permissions);
    const granted = await PermissionsAndroid.requestMultiple(permissions);
    console.log('Permissions granted:', granted);

    const deniedPermissions = [];
    const neverAskAgainPermissions = [];

    for (const [permission, status] of Object.entries(granted)) {
      if (status === PermissionsAndroid.RESULTS.DENIED) {
        deniedPermissions.push(permission);
      } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        neverAskAgainPermissions.push(permission);
      }
    }

    if (deniedPermissions.length > 0) {
      Alert.alert(
        'Недостаточно разрешений',
        'Некоторые функции могут не работать должным образом без необходимых разрешений. Хотите попробовать снова?',
        [
          { text: 'Отмена', style: 'cancel' },
          { text: 'Запросить снова', onPress: () => requestDeniedPermissions(deniedPermissions) }
        ]
      );
    }

    if (neverAskAgainPermissions.length > 0) {
      // Используем setTimeout, чтобы убедиться, что диалоговое окно открывается последовательно
      setTimeout(() => {
        Alert.alert(
          'Разрешения отключены',
          'Некоторые разрешения были отключены с опцией "никогда не спрашивать снова". Пожалуйста, включите их в настройках приложения.',
          [
            { text: 'Отмена', style: 'cancel' },
            { text: 'Открыть настройки', onPress: () => openAppSettings() }
          ]
        );
      }, 500); // Задержка в 500мс, чтобы гарантировать последовательное отображение
    } else {
      console.log('All permissions granted');
    }
  } catch (err) {
    console.warn('Error requesting permissions:', err);
    Alert.alert('Ошибка', 'Произошла ошибка при запросе разрешений');
  }
}

async function requestDeniedPermissions(permissions) {
  try {
    const granted = await PermissionsAndroid.requestMultiple(permissions);
    console.log('Re-requested permissions granted:', granted);

    const allPermissionsGranted = Object.values(granted).every(
      (status) => status === PermissionsAndroid.RESULTS.GRANTED
    );

    if (!allPermissionsGranted) {
      console.log('Some permissions were still not granted');
      Alert.alert(
        'Недостаточно разрешений',
        'Некоторые функции могут не работать должным образом без необходимых разрешений.'
      );
    }
  } catch (err) {
    console.warn('Error re-requesting permissions:', err);
    Alert.alert('Ошибка', 'Произошла ошибка при повторном запросе разрешений');
  }
}

function openAppSettings() {
  Linking.openSettings().catch(() => {
    Alert.alert('Ошибка', 'Не удалось открыть настройки');
  });
}

export default requestPermissions;
