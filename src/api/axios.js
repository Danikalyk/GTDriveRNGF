import axios from 'axios';
import {getTokens} from './auth';
import localStorage from '../store/localStorage';

const axiosInstance = axios.create();

const getBaseUrl = async () => {
  try {
    const serverInfo = await localStorage.getItem('serverInfo');
    const {server, port, database} = serverInfo;
    return `${server}:${port}/${database}/hs/MobileExchange`;
  } catch (error) {
    return '/';
  }
};

axiosInstance.interceptors.request.use(
  async config => {
    const {token} = getTokens();
    config.baseURL = await getBaseUrl();
    const auth = token ? `Bearer ${token}` : '';
    if (auth) {
      config.headers['Authorization'] = auth;
    }

    return config;
  },
  error => Promise.reject(error),
);

export default axiosInstance;
