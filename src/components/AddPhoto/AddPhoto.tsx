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

type Props = {};

const CameraIcon = (props): IconElement => (
  <Icon {...props} name="camera-outline" />
);
const ImageIcon = (props): IconElement => (
  <Icon {...props} name="image-outline" />
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
    };
    launchCamera(options, setPickerResponse);
  }, []);

  return (
    <View style={styles.container}>
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
            );
          })}
        </View>
      </Card>

      <ButtonGroup style={styles.buttonGroup}>
        <Button accessoryLeft={CameraIcon} onPress={onCameraPress}>
          Камера
        </Button>
        <Button accessoryLeft={ImageIcon} onPress={onImageLibraryPress}>
          Галерея
        </Button>
      </ButtonGroup>
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
