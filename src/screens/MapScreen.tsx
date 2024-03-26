import {
  Divider,
  Layout,
  List,
  ListItem,
  Text
} from '@ui-kitten/components';
import React, {useEffect} from 'react';
import {StyleSheet, SafeAreaView} from 'react-native';
import useSWR from 'swr';
import {WebView} from 'react-native-webview';
import map_scripts from '../map_scripts';
import BackgroundGeolocation from 'react-native-background-geolocation';

type Props = {};

const MapScreen = (props: Props) => {

  //React.useEffect(() => {
  //}, []);



    _goToMyPosition = (lat, lon) => {
    this.refs.Map_Ref.injectJavaScript(`
          map.setView([${lat}, ${lon}], 10)
          
          L.marker([${lat}, ${lon}]).addTo(mymap)
        `);
  };

  return (
    <SafeAreaView style={styles.Container}>
      <WebView
        useRef={'Map_Ref'}
        source={{html: map_scripts}}
        style={styles.Webview}
      />
    </SafeAreaView>

  );
};

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    padding: 10,
    backgroundColor: 'grey',

    },
  Webview: {
    flex: 2,

    },
  });

export default MapScreen;
