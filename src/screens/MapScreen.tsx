import {Divider, Layout, List, ListItem, Text} from '@ui-kitten/components';
import React, {useEffect, useContext, useRef} from 'react';
import {StyleSheet, SafeAreaView} from 'react-native';
import useSWR from 'swr';
import {WebView} from 'react-native-webview';
import map_scripts from '../map_scripts';
import BackgroundGeolocation from 'react-native-background-geolocation';
import {GlobalState} from '../store/global/global.state';

type Props = {};

const MapScreen = (props: Props) => {
  const {location} = useContext(GlobalState);
  const Map_Ref = useRef(null);
  const lat = location?.coords.latitude;
  const lon = location?.coords.longitude;

  useEffect(() => {
    const script = `
      L.marker([${lat}, ${lon}]).addTo(map);
    `;
    if (Map_Ref.current) {
      Map_Ref.current.injectJavaScript(script);
    }
  }, [location]);

  jsInit = (lat, lon) => {
    const script = `
      init(${lat}, ${lon});
    `;

    if (Map_Ref.current) {
      Map_Ref.current.injectJavaScript(script);
    }
  };

  return (
    <SafeAreaView style={styles.Container}>
      <WebView
        ref={Map_Ref}
        source={{html: map_scripts}}
        style={styles.Webview}
        onLoad={() => this.jsInit(lat, lon)}
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
