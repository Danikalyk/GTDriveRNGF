import React, { useState, useEffect, useCallback } from 'react';
import { Button, Card, Icon, Layout, Spinner, Text } from '@ui-kitten/components';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ImageBackground, View, Dimensions } from 'react-native';
import { acceptImages } from '../../api/photo';
import { getDataPostRoute } from '../functions.js';
import NetInfo from '@react-native-community/netinfo';
import FunctionQueue from '../../utils/FunctionQueue';
import { styles } from '../../styles';
import localStorage from '../../store/localStorage';

const queue = new FunctionQueue();

const AddPhoto = (props) => {

  

  const [images, setImages] = useState([]);
  const [pending, setPending] = useState(false);
  const [parameters, setParameters] = useState([]);
  const { route } = props;
  const params = route ? route.params : props.params;
  const windowWidth = Dimensions.get('window').width;
  const imageSize = (windowWidth / 2) - 20; // Вычисляем размер изображения для двух колонок с учетом отступов

  if (!params) return null;

  useEffect(() => {
    const fetchStorageKey = async () => {
      try {
        const storageKey = await localStorage.getItem('LoginKey');

        setParameters(storageKey.parametrs.photo);
      } catch (error) {
        console.error('Error retrieving storage key:', error);
      }
    };

    fetchStorageKey();
  }, []);


  console.log(parameters);

  const currentStatus = params?.status;
  const screen = params?.screen;
  const uid = params?.uid;

  //-- Фотография может придти с разных screen
  //-- 1 - Точка
  //-- 2 - Заказ
  //-- 3 - Задание

  const uidOrder = screen === 1 || screen === 3 ? params?.uidOrder : "00000000-0000-0000-0000-000000000000";
  const uidPoint = screen === 1 ? params?.uidPoint : "00000000-0000-0000-0000-000000000000";
  //const uidTask = screen === 3 ? params?.uidTask : "00000000-0000-0000-0000-000000000000";


  const updateDate = async (data: any, callback = () => { }) => {
    const netInfo = await NetInfo.fetch();

    const callbackFunc = async () => {
      await callback(); // Ждем завершения колбэка
    };

    if (!netInfo.isConnected) {
      data.needJSON = false;
      queue.enqueue(callbackFunc); // Добавляем в очередь, если нет сети
    } else {
      // Здесь мы вызываем callbackFunc без await, так как это не обязательно
      callbackFunc(); // Выполняем колбэк, если есть сеть
    }

    setPending(false);
  };

  useEffect(() => {
    getSavedPhotos();
  }, []);

  const getSavedPhotos = async () => {
    try {
      const savedPhotos = await AsyncStorage.getItem('savedPhotos_' + uid);

      if (savedPhotos) {
        const parsedPhotos = JSON.parse(savedPhotos);

        // Фильтруем фотографии по uidOrder, uidPoint и screen
        const filteredPhotos = parsedPhotos.filter(photo =>
          photo.uid === uid &&
          photo.uidOrder === uidOrder &&
          photo.uidPoint === uidPoint &&
          photo.screen === screen
        );

        setImages(filteredPhotos);
      }
    } catch (error) {
      console.error('Error getting saved photos:', error);
    }
  };

  const savePhotos = async (photosToSave) => {
    try {
      const photosWithMetadata = photosToSave.map(photo => ({
        ...photo,
        uid,
        uidOrder,
        uidPoint,
        screen
      }));

      await AsyncStorage.setItem(
        'savedPhotos_' + uid,
        JSON.stringify(photosWithMetadata)
      );
    } catch (error) {
      console.error('Error saving photos:', error);
    }
  };

  const onImagePress = (response) => {
    if (!response.didCancel) {
      const newImages = [...images, { ...response, uploaded: false }];

      setImages(newImages);
      savePhotos(newImages);
    }
  };

  const launchImagePicker = useCallback((options) => {
    launchImageLibrary(options, onImagePress);
  }, [images]);

  const launchCameraPicker = useCallback(() => {
    const options = {
      saveToPhotos: true,
      mediaType: 'photo',
      includeBase64: true,
      selectionLimit: parameters.selectionLimit,
      maxWidth: parameters.maxWidth,
      maxHeight: parameters.maxHeight,
      quality: parameters.quality,
      saveToPhotos: true,
      cameraType: 'back'
    };

    launchCamera(options, onImagePress);
  }, [images]);

  const removeNewImage = (index) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    setImages(updatedImages);
  };

  const onSubmitPhoto = async () => {
    setPending(true);

    let data = getDataPostRoute();
    data.screen = 3;
    data.uid = uid;
    data.uidPoint = uidPoint;
    data.uidOrder = uidOrder;
    //data.uidTask = uidTask;
    data.type = screen; //-- Используем существующий Type для передачи на сервер Screen, чтоб отпределить к какому документу привязывать фотографию

    // Отправляем только новые фотографии на сервер
    const newImages = images.filter(image => !image.uploaded);
    // Предположим, что у новых фотографий свойство "uploaded" равно false
    //data.images = newImages.map(image => image.assets[0].base64);

    data.images = newImages;

    updateDate(data, async () => {
      const dataString = JSON.stringify(data);

      await acceptImages(data);

      // Пометить отправленные фотографии как загруженные
      const updatedImages = images.map(image => {
        if (newImages.includes(image)) {
          return { ...image, uploaded: true };
        }
        return image;
      });

      savePhotos(updatedImages);

      setImages(updatedImages);

      //setPending(false);
    })
  };

  const CameraIcon = (props): IconElement => (
    <Icon {...props} name="camera-outline" />
  );

  const SyncIcon = (props): IconElement => (
    <Icon {...props} name="sync-outline" />
  );

  const ImageIcon = (props): IconElement => (
    <Icon {...props} name="image-outline" />
  );

  const TrashIcon = (props): IconElement => (
    <Icon {...props} name="trash-2-outline" />
  );

  const renderCardHeader = () => {
    canAddPhoto = currentStatus === 1 || currentStatus === 2;

    return (
      canAddPhoto && (
        <Layout style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Button
            accessoryLeft={ImageIcon}
            onPress={() => launchImagePicker({ selectionLimit: 1, mediaType: 'photo', includeBase64: true })}
            appearance="outline"
            status='basic'
            style={{ flex: 1, margin: 4 }}>
            Галерея
          </Button>
          <Button
            accessoryLeft={CameraIcon}
            onPress={launchCameraPicker}
            appearance="filled"
            status='basic'
            style={{ flex: 1, margin: 4 }}>
            Камера
          </Button>
        </Layout>
      )
    )
  };

  const renderCardFooter = () => {
    const hasUnuploadedPhotos = images.some(image => !image.uploaded);

    return hasUnuploadedPhotos ? (
      <Layout style={styles.footerLayout}>
        <Button
          accessoryLeft={SyncIcon}
          appearance="filled"
          status='basic'
          onPress={onSubmitPhoto}>
          Отправить фото
        </Button>
      </Layout>
    ) : null;
  };

  let cardPhoto = true;

  if ((params.status === 3 && images.length !== 0) || params.status === 0) {
    cardPhoto = false;
  } 

  return (
    <>
      {pending && (
        <View style={styles.spinnerContainer}>
          <Spinner size='giant' status='basic' />
        </View>
      )}

      <Layout style={{ backgroundColor: 'transparent' }}>
        {(currentStatus === 3 || currentStatus === 0) && (
          <View style={styles.currentRouteContainer}>
            <Icon
              name="camera-outline"
              width={20}
              height={20}
              style={styles.textHeaderCardIcon}
            />
            <Text category="label" style={[styles.titleList, {}]}>
              Добавить фото можно только на активном задании
            </Text>
          </View>
        )}
      </Layout>

      {cardPhoto && (
        <Card
          style={{}}
          header={renderCardHeader}
          footer={renderCardFooter}
        >
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
            {images.map((image, index) => (
              <View
                style={styles.imageContainer}
                key={index}  
              >
                <ImageBackground
                  style={[styles.imageBackground, { width: imageSize, height: imageSize }]}
                  source={{ uri: image.assets[0].uri }} />

                {!image.uploaded && (
                  <Button
                    accessoryLeft={TrashIcon}
                    appearance='outline'
                    status='basic'
                    onPress={() => removeNewImage(index)}
                    style={styles.deleteButton}
                    size='small'
                  >
                  </Button>
                )}
              </View>
            ))}
          </View>
        </Card>
      )}
    </>
  );
};

export default AddPhoto;