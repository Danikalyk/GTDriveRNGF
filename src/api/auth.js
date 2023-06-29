import Base64 from 'base-64';
import localStorage from '../store/localStorage';
import {getRequest, putRequest} from './request';

export async function getTokens() {
  try {
    return await localStorage.getItem('tokens');
  } catch (e) {
    return null;
  }
}

export async function saveTokens({login, password}) {
  try {
    const token = `${Base64.encode(`${login}:${password}`)}`;

    await localStorage.setItem('tokens', {
      login,
      password,
      token,
    });
  } catch (e) {
    return null;
  }
}

export async function fetchUsers() {
  return getRequest('/users', {}, true);
}


export async function userAuth(params) {
  return putRequest('/auth', params)
}