import React from 'react';

import {StyleSheet, Switch, Text, View} from 'react-native';

import BackgroundGeolocation, {
  State,
  Config,
  Location,
  LocationError,
  Geofence,
  GeofenceEvent,
  GeofencesChangeEvent,
  HeartbeatEvent,
  HttpEvent,
  MotionActivityEvent,
  MotionChangeEvent,
  ProviderChangeEvent,
  ConnectivityChangeEvent,
  Subscription,
} from 'react-native-background-geolocation';

function App(): JSX.Element {
  const [enabled, setEnabled] = React.useState(false);
  const [location, setLocation] = React.useState('');

  // let Logger = BackgroundGeolocation.logger;

  React.useEffect(() => {
    /// 1.  Subscribe to events.
    const onLocation: Subscription = BackgroundGeolocation.onLocation(
      location => {
        Logger.debug('Location received in Javascript: ' + location.uuid);
        setLocation(JSON.stringify(location, null, 2));
      },
    );

    const onHttp: Subscription = BackgroundGeolocation.onHttp(httpEvent => {
      console.log('[http] ', httpEvent.success, httpEvent.status);
      console.log(httpEvent);

      // Logger.emailLog("wasik@787.com").then((success) => {
      //     console.log("[emailLog] success");
      //   }).catch((error) => {
      //     console.log("[emailLog] FAILURE: ", error);
      //   });
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
      url: 'http://yourserver.com/locations',
      batchSync: false, // <-- [Default: false] Set true to sync locations to server in a single HTTP request.
      autoSync: true, // <-- [Default: true] Set true to sync each location to server as it arrives.
      headers: {
        // <-- Optional HTTP headers
        'X-FOO': 'bar',
      },
      params: {
        // <-- Optional HTTP params
        auth_token: 'maybe_your_server_authenticates_via_token_YES?',
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
  }, []);

  /// 3. start / stop BackgroundGeolocation
  React.useEffect(() => {
    if (enabled) {
      BackgroundGeolocation.start();
    } else {
      BackgroundGeolocation.stop();
      setLocation('');
    }
  }, [enabled]);

  return (
    <View style={{alignItems: 'center'}}>
      <Text>Click to enable BackgroundGeolocation</Text>
      <Switch value={enabled} onValueChange={setEnabled} />
      <Text style={{fontFamily: 'monospace', fontSize: 12}}>{location}</Text>
    </View>
  );
}

const styles = StyleSheet.create({});

export default App;
