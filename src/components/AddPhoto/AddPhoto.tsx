import {
  ButtonGroup,
  Icon,
  IconElement,
  Button,
  Modal,
  Card,
} from '@ui-kitten/components';
import React, {useCallback, useEffect, useState} from 'react';
import {ImageBackground, StyleSheet, Text, View} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {Image} from 'react-native-svg';
import { acceptImages } from '../../api/photo';

type Props = {};

const CameraIcon = (props): IconElement => (
  <Icon {...props} name="camera-outline" />
);
const ImageIcon = (props): IconElement => (
  <Icon {...props} name="image-outline" />
);

const TrashIcon = (props): IconElement => (
  <Icon {...props} name="trash-2-outline" />
);

function AddPhoto({}: Props) {
  const [images, setImages] = useState([]);
  const [pickerResponse, setPickerResponse] = useState<any>(null);

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
      maxWidth: 1000, // TODO: fix width
      maxHeight: 1000, // TODO: fix height
    };
    launchCamera(options, setPickerResponse);
  }, []);

  const onSubmitPhoto = async () => {
    const result = await acceptImages({images}); // TODO: check images api

    console.log('@onSubmitPhoto result', result);
  };

  return (
    <View style={styles.container}>
      <ButtonGroup style={styles.buttonGroup}>
        <Button accessoryLeft={CameraIcon} onPress={onCameraPress}>
          Камера
        </Button>
        <Button accessoryLeft={ImageIcon} onPress={onImageLibraryPress}>
          Галерея
        </Button>
      </ButtonGroup>
      <Card>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'flex-start',
            padding: 5,
          }}>
          {images.map((image, index) => {
            const uri = !!image?.assets && image.assets[0].uri;
            return (
              <View style={{margin: 2}} key={index}>
                <ImageBackground
                  style={{
                    height: 100,
                    width: 100,
                    overflow: 'hidden',
                    borderColor: '#000',
                    borderWidth: 1,
                  }}
                  source={uri ? {uri} : ''}
                />

                <Button
                  accessoryLeft={TrashIcon}
                  onPress={() =>
                    setImages(images.filter((_, i) => i !== index))
                  }></Button>
              </View>
            );
          })}
        </View>
      </Card>
      {images.length > 0 && (
        <ButtonGroup style={styles.buttonGroup}>
          <Button accessoryLeft={CameraIcon} onPress={onSubmitPhoto}>
            Загрузить фотографии
          </Button>
        </ButtonGroup>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonGroup: {
    margin: 2,
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
export default AddPhoto;
