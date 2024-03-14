import Base64 from 'base-64';
import localStorage from '../store/localStorage';
import {getRequest, getRequestJwt, postRequestJwt, putRequest} from './request';

export async function getTokens() {
  try {
    return await localStorage.getItem('tokens');
  } catch (e) {
    console.error('ERROR getTokens', e);
    return null;
  }
}

export async function saveTokens({login, password, ...rest}) {
  try {
    // const token = `${Base64.encode(`${login}:${password}`)}`;

    await localStorage.setItem('tokens', {
      login,
      password,
      ...rest,
    });
  } catch (e) {
    console.error('ERROR saveTokens', e);
    return null;
  }
}

export async function fetchUsers() {
  return getRequest('/users', {}, true);
}

export async function userAuth(params) {
  return putRequest('/auth', params);
}

export async function getDevTokens({isRefresh = false}) {
  try {
    // await localStorage.removeItem('devToken'); // TODO удалить потом
    const token = await localStorage.getItem('jwtToken');
    if (token && !isRefresh) {
      return token;
    } else {
      const {access} = await getRequestJwt('/token');
      if (access) {
        await localStorage.setItem('jwtToken', access);
        return access;
      }
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}
