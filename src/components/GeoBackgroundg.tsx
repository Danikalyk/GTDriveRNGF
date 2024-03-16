import React from 'react';
import useGeolocation from '../hook/useGeolocation';
import {GlobalState} from '../store/global/global.state';

type Props = {};

const GeoBackgroundg = (props: Props) => {
  const {enabledGeo} = React.useContext(GlobalState);

  useGeolocation(enabledGeo);

  return null;
};

export default GeoBackgroundg;
