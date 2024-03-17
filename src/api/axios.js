import axios from 'axios';
import localStorage from '../store/localStorage';
import {getTokens} from './auth';

const axiosInstance = axios.create();

const axiosInstanceDev = axios.create();
const axiosInstanceDevToken = axios.create();

export const getBaseUrl = async (type = 'PhoneExchange') => {
  try {
    const serverInfo = await localStorage.getItem('serverInfo');
    const {server, port, database} = serverInfo;
    if (server && port && database) {
      return `${server}${port ? `:${port}` : ''}/${database}/hs/${type}`;
    } else {
      return '/';
    }
  } catch (error) {}
};

axiosInstance.interceptors.request.use(
  async config => {
    const {jwtToken, login, password} = await getTokens();

    config.baseURL = await getBaseUrl();

    const auth = !!jwtToken
      ? `Bearer ${jwtToken}`
      : {
          username: login || '',
          password: password || '',
        };

    if (auth) {
      config.headers['Authorization'] = auth;
      config.headers['Content-Type'] = 'application/json';
      config.withCredentials = true;
      //config.auth = auth;
    }

    return config;
  },
  error => Promise.reject(error),
);

axiosInstanceDev.interceptors.request.use(
  async config => {
    config.baseURL = await getBaseUrl();

    // const token = `${Base64.encode(`Authorization:Jaguar94`)}`;
    const auth = {
      username: 'Authorization',
      password: 'Jaguar94',
    };
    if (auth) {
      config.headers['Authorization'] = auth;
      config.headers['Content-Type'] = 'application/json';
      config.withCredentials = true;
      config.auth = auth;
    }

    return config;
  },
  error => Promise.reject(error),
);

axiosInstanceDevToken.interceptors.request.use(
  async config => {
    config.baseURL = await getBaseUrl('JWTChange');
    const auth = {
      username: 'Authorization',
      password: 'Jaguar94',
    };
    if (auth) {
      config.headers['Authorization'] = auth;
      config.headers['Content-Type'] = 'application/json';
      config.withCredentials = true;
      config.auth = auth;
    }

    return config;
  },
  error => Promise.reject(error),
);

export {axiosInstanceDev, axiosInstance, axiosInstanceDevToken};
