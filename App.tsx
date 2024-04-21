import React from 'react';
import 'react-native-gesture-handler';

import {IconRegistry} from '@ui-kitten/components';
import {EvaIconsPack} from '@ui-kitten/eva-icons';
import GeoBackgroundg from './src/components/GeoBackgroundg';
import MainNavigation from './src/components/MainNavigation';
import CombinedContextProviders from './src/store/CombinedContextProviders';

import {AppState} from 'react-native';
import {SWRConfig} from 'swr';
import localStorageProvider from './src/store/localStorageProvider';

function App(): JSX.Element {
  return (
    <SWRConfig
      value={{
        provider: localStorageProvider,
        isVisible: () => {
          return true;
        },
        initFocus(callback) {
          let appState = AppState.currentState;

          const onAppStateChange = (nextAppState: any) => {
            /* Если оно переходит из фонового или неактивного режима в активный */
            if (
              appState.match(/inactive|background/) &&
              nextAppState === 'active'
            ) {
              callback();
            }
            appState = nextAppState;
          };

          // Подпишитесь на события изменения состояния приложения
          const subscription = AppState.addEventListener(
            'change',
            onAppStateChange,
          );

          return () => {
            subscription.remove();
          };
        },
      }}>
      <CombinedContextProviders>
        <GeoBackgroundg />
        <IconRegistry icons={EvaIconsPack} />
        <MainNavigation />
      </CombinedContextProviders>
    </SWRConfig>
  );
}

export default App;
