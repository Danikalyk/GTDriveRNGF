import ContextProviderComposer from './ContextProviderComposer';
import {GlobalStateProvider} from './global/global.provider';
import {UserProvider} from './user/UserProvider';

const CombinedContextProviders = ({children}) => {
  return (
    <ContextProviderComposer
      contextProviders={[
        <GlobalStateProvider key={'global_state_provider'} />,
        <UserProvider key={'user_provider'} />,
      ]}>
      {children}
    </ContextProviderComposer>
  );
};

export default CombinedContextProviders;
