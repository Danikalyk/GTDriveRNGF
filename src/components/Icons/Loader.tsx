import React from 'react';
import {Icon, IconElement} from '@ui-kitten/components';
import {ImageProps} from 'react-native-svg';

type Props = {};

const Loader = (props): IconElement => {
  const pulseIconRef = React.useRef<Icon<Partial<ImageProps>>>();

  React.useEffect(() => {
    pulseIconRef.current.startAnimation();
  }, []);
  return (
    <Icon
      {...props}
      ref={pulseIconRef}
      name="loader-outline"
      animationConfig={{cycles: Infinity}}
      animation="pulse"
    />
  );
};

export default Loader;
