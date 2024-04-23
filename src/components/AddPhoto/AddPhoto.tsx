import {
  ButtonGroup,
  Icon,
  IconElement,
  Button,
  Modal,
  Card,
  Text,
  Layout
} from '@ui-kitten/components';
import React, {useCallback, useEffect, useState} from 'react';
import {ImageBackground, StyleSheet, View} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {Image} from 'react-native-svg';
import {acceptImages} from '../../api/photo';
import { styles } from '../../styles';
import { getDataPostRoute } from '../functions.js';

type Props = {};

function AddPhoto(props: Props) {
  const [images, setImages] = useState([]);
  const [pickerResponse, setPickerResponse] = useState<any>(null);
  const params = props?.route?.params;
  const uid = params?.uid;
  const uidOrder = params?.uidOrder;

  console.log('@AddPhoto params', params);

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

  useEffect(() => {
    if (pickerResponse) {
      setImages([...images, pickerResponse]);
    }
  }, [pickerResponse]);

  const onImageLibraryPress = useCallback(() => {
    const options: any = {
      selectionLimit: 1,
      mediaType: 'photo',
      includeBase64: true,
    };

    launchImageLibrary(options, setPickerResponse);
  }, []);

  const onCameraPress = useCallback(() => {
    const options = {
      saveToPhotos: true,
      mediaType: 'photo',
      includeBase64: true,
      selectionLimit: 10,
      maxWidth: 2560, // TODO: fix width
      maxHeight: 1440, // TODO: fix height
    };

    launchCamera(options, setPickerResponse);
  }, []);

  const onSubmitPhoto = async () => {
    let data = getDataPostRoute();
    data.screen = 3;
    data.uid = uid;
    data.order = uidOrder;
    data.images = images.map(image => image.assets[0].base64);
    data = JSON.stringify(data);

    const result = await acceptImages(data); // TODO: check images api

    //console.log('@onSubmitPhoto result', result);
  };

  const renderCardHeader = () => {
    return (
      <Layout style={{flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between'}}>  
        <Button 
          accessoryLeft={ImageIcon} 
          onPress={onImageLibraryPress} 
          status='primary' 
          style={{ flex: 1, margin: 4 }}
          >
          Галерея
        </Button>
        <Button 
          accessoryLeft={CameraIcon} 
          onPress={onCameraPress}  
          status='success'
          style={{ flex: 1, margin: 4 }}
          >
          Камера
        </Button>
      </Layout>  
    )
  }

  const renderCardFooter = images => {
    if(images.length > 0) {
      return (
        <Layout style={{position: 'absolute', bottom: 0}}>
          <Button accessoryLeft={SyncIcon} onPress={onSubmitPhoto}>
            Загрузить фотографии
          </Button>
        </Layout> 
      )
    }
  }

  return (   
      <Card
        style={{flex: 1, justifyContent: 'space-between'}}
        header={renderCardHeader}
        footer={renderCardFooter(images)}
      >
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            padding: 5,
          }}>
          {images.map((image, index) => {
            const uri = !!image?.assets && image.assets[0].uri;
            return (
              <View style={{margin: 2}} key={index}>
                <ImageBackground
                  style={{
                    height: 150,
                    width: 150,
                    overflow: 'hidden',
                    borderColor: 'rgba(0, 0, 0, 0)',
                    borderWidth: 1,
                  }}
                  source={uri ? {uri} : ''}
                />

                <Button
                  accessoryLeft={TrashIcon}
                  onPress={() =>
                    setImages(images.filter((_, i) => i !== index))
                  }>
                </Button>
              </View>
            );
          })}
        </View>
      </Card>
  );
};

export default AddPhoto;
