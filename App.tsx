import 'react-native-gesture-handler';
import React from 'react';

import {EvaIconsPack} from '@ui-kitten/eva-icons';
import CombinedContextProviders from './src/store/CombinedContextProviders';
import MainNavigation from './src/components/MainNavigation';
import {IconRegistry} from '@ui-kitten/components';

function App(): JSX.Element {
  return (
    <CombinedContextProviders>
      <IconRegistry icons={EvaIconsPack} />
      <MainNavigation />
    </CombinedContextProviders>
  );
}

export default App;
