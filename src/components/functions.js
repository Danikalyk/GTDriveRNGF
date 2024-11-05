import AsyncStorage from '@react-native-async-storage/async-storage';
import BackgroundGeolocation from 'react-native-background-geolocation';
import localStorage from '../store/localStorage';

// status - Статусы
//
// Параметры:
//  	0	- не обработано	
//		1	- текущий
// 		2	- на точке
//  	3 	- завершен
//  	-1	- отказ 
//  	-2  - недоступен

export const getCardStatus = status => {
  if (status === 1) {
    return 'basic'; //-- Синий цвет
  } else if (status === 2) {
    return 'basic'; //-- Текущее задание
  } else if (status === 3) {
    return 'success'; //-- Зеленый цвет
  } else {
    return 'control'; //-- Серый цвет
  }
};

export const getToggleCardStatus = item => {
  let date1c = new Date(item.date).getTime();
  let dateEmpty = new Date("0001-01-01T00:00:00+00:00").getTime();

  return date1c !== dateEmpty;
};

export const getDataPostRoute = () => {
  let currentDate = new Date();
  let images = [];

  const data = {
    screen: -1,                                         // Экран
    point: -1,                                          // ???
    uidOrder: "00000000-0000-0000-0000-000000000000",   // Это обрабатываемый заказ
    uid: "00000000-0000-0000-0000-000000000000",        // Это текущий МаршрутДоставки
    uidTask: "00000000-0000-0000-0000-000000000000",    // Задача
    uidPoint: "00000000-0000-0000-0000-000000000000",   // ТочкаДоставки
    type: -1,                                           // Тип 
    date: currentDate.toJSON(),                         // Дата
    images: images,                                     // Изображения
    accident: "",                                       // Происшествие
    accidentText: "",                                   // Описание происшествия
    finish: false,                                      // Завершено 
    needJSON: true,                                     // Требуется вернуть JSON 
    user: "00000000-0000-0000-0000-000000000000"        // Юзер. Заполнять только при автоматическом оповещении
  };

  return data;
}

export const getDateFromJSON = dateString => {
  const date = new Date(dateString);
  const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

  // Используем getUTCHours() и getUTCMinutes() для получения значений в UTC
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  const day = date.getUTCDate();
  const month = monthNames[date.getUTCMonth()]; // Месяцы в JavaScript начинаются с 0

  const formattedDate = `${day} ${month} ${hours}:${minutes}`;

  return formattedDate;
}

//-- Если нет активных маршрутов, то удаляем все фото
export async function deleteAllSavedPhotos() {
  try {
    //await AsyncStorage.clear();

    const keys = await AsyncStorage.getAllKeys();
    const savedPhotosKeys = keys.filter(key => key.startsWith('savedPhotos_'));

    await AsyncStorage.multiRemove(savedPhotosKeys);

    console.log('Все фотографии успешно удалены.');
  } catch (error) {
    console.log('Ошибка при удалении фотографий:', error);
  }
}

//-- Установим подъезд на точку 
export const addGeofenceToNextPoint = async (point) => {

  if (point.uidPoint === "00000000-0000-0000-0000-000000000000") {
    return;
  }
  // Получаем список геозон асинхронно
  const geofences = await BackgroundGeolocation.getGeofences();

  // Проверяем, существует ли задача с идентификатором point.uidPoint
  const existingGeofence = geofences.find(geofence => geofence.identifier === point.uidPoint);

  if (!existingGeofence) {

    const LoginKey = await localStorage.getItem('LoginKey');
    const parametrs = LoginKey.parametrs.bgGeo;

    //console.log({point});
    
    await BackgroundGeolocation.addGeofence({
      identifier: point.uidPoint,
      radius: parametrs.entranceRadius, // радиус геозоны в метрах
      latitude: point.lat,
      longitude: point.lon,
      dwellDelay: parametrs.dwellDelay, //время для нахождения в геозоне в секундах 
      notifyOnEntry: false,
      notifyOnExit: true,
      notifyOnDwell: true
    }).then(() => {
      console.log('[addGeofence] success');
    }).catch((error) => {
      console.log('[addGeofence] FAILURE: ', error);
    });
  } else {
    // Если задача не существует, выводим сообщение в консоль
    console.log(`Задача с идентификатором ${point.uidPoint} в BackgroundGeolocation`);
  }
}


export const deleteAllGeofences = async () => {
  // Получаем список геозон асинхронно
  const geofences = await BackgroundGeolocation.getGeofences();

  // Удаляем каждую геозону
  for (const geofence of geofences) {
    await BackgroundGeolocation.removeGeofence(geofence.identifier);

    console.log(`Задача с идентификатором ${geofence.identifier} в BackgroundGeolocation`);
  }
}



