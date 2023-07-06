import {View, Text} from 'react-native';
import React from 'react';
import {GlobalState} from '../store/global/global.state';
import useGeolocation from '../hook/useGeolocation';

type Props = {};

const GeoBackgroundg = (props: Props) => {
  const {enabledGeo} = React.useContext(GlobalState);

  useGeolocation(enabledGeo);

  return null;
};

export default GeoBackgroundg;
