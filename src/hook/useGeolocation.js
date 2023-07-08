import React, {useContext, useEffect} from 'react';
import BackgroundGeolocation from 'react-native-background-geolocation';
import {GlobalState} from '../store/global/global.state';
import {getBaseUrl} from '../api/axios';
import {getTokens, tokenDev} from '../api/auth';
import {UserContext} from '../store/user/UserProvider';
import {putRequest} from '../api/request';
import {uploadLocation} from '../api/routes';

function useGeolocation(enabledGeo) {
  const [location, setLocation] = React.useState('');
  const [enabled, setEnabled] = React.useState(enabledGeo);

  const {currentUser} = useContext(UserContext);

  console.log({currentUser});

  useEffect(() => {
    setEnabled(enabledGeo);
  }, [enabledGeo]);

  let Logger = BackgroundGeolocation.logger;

  React.useEffect(() => {
    if (!currentUser?.uid) {
      return;
    }
    /// 1.  Subscribe to events.
    const onLocation: Subscription = BackgroundGeolocation.onLocation(
      location => {
        Logger.debug('Location received in Javascript: ' + location.uuid);

        console.log({location});
        // setLocation(JSON.stringify(location, null, 2));
        // const init = async () => {
        //   await uploadLocation({
        //     location: location,
        //     user: {
        //       uid: currentUser?.uid,
        //     },
        //   });
        // };
        // init();
      },
    );

    const onHttp: Subscription = BackgroundGeolocation.onHttp(httpEvent => {
      console.log('[http] ', httpEvent.success, httpEvent.status);
    });

    const onMotionChange: Subscription = BackgroundGeolocation.onMotionChange(
      event => {
        console.log('[onMotionChange]', event);
      },
    );

    const onActivityChange: Subscription =
      BackgroundGeolocation.onActivityChange(event => {
        console.log('[onActivityChange]', event);
      });

    const onProviderChange: Subscription =
      BackgroundGeolocation.onProviderChange(event => {
        console.log('[onProviderChange]', event);
      });

    const init = async () => {
      const baseUrl = await getBaseUrl();
      const {token} = await getTokens();

      console.log({token});

      /// 2. ready the plugin.
      BackgroundGeolocation.ready({
        // Geolocation Config
        enabled: true,
        desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
        distanceFilter: 1,
        // Activity Recognition
        stopTimeout: 5,
        // Application config
        debug: true, // <-- enable this hear sounds for background-geolocation life-cycle.
        logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
        stopOnTerminate: false, // <-- Allow the background-service to continue tracking when user closes the app.
        startOnBoot: true, // <-- Auto start tracking when device is powered-up.
        // HTTP / SQLite config
        url: `${baseUrl}/geo_info_users`,
        // url: `http://localhost:3000/geo_info_users`,
        method: 'PUT',
        batchSync: false, // <-- [Default: false] Set true to sync locations to server in a single HTTP request.
        autoSync: true, // <-- [Default: true] Set true to sync each location to server as it arrives.
        headers: {
          // <-- Optional HTTP headers
          authorization: `Basic ${tokenDev}`,
          AUTHENTICATION_TOKEN: tokenDev,
        },
        params: {
          // <-- Optional HTTP params
          user: {
            uid: currentUser?.uid,
          },
        },
      })
        .then(state => {
          setEnabled(state.enabled);
          console.log(
            '- BackgroundGeolocation is configured and ready: ',
            state.enabled,
          );
        })
        .catch(err => {
          console.error(err);
        });
    };

    init();

    return () => {
      // Remove BackgroundGeolocation event-subscribers when the View is removed or refreshed
      // during development live-reload.  Without this, event-listeners will accumulate with
      // each refresh during live-reload.
      onLocation.remove();
      onHttp.remove();
      onMotionChange.remove();
      onActivityChange.remove();
      onProviderChange.remove();
    };
  }, [currentUser?.uid]);

  /// 3. start / stop BackgroundGeolocation
  React.useEffect(() => {
    if (enabled) {
      BackgroundGeolocation.start();
    } else {
      BackgroundGeolocation.stop();
      setLocation('');
    }
  }, [enabled]);

  return {};
}

export default useGeolocation;
