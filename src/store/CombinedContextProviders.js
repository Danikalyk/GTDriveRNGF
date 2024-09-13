import ContextProviderComposer from './ContextProviderComposer';
import {GlobalStateProvider} from './global/global.provider';
import {UserProvider} from './user/UserProvider';
import {LocationProvider} from './location/LocationProvider';

const CombinedContextProviders = ({children}) => {
  return (
    <ContextProviderComposer
      contextProviders={[
        <GlobalStateProvider key={'global_state_provider'} />,
        <UserProvider key={'user_provider'} />,
        <LocationProvider key={'location_provider'} />,
      ]}>
      {children}
    </ContextProviderComposer>
  );
};

export default CombinedContextProviders;
