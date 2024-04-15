import {getRequest, putRequest, postRequest, postRequestJwt} from './request';

export async function uploadLocation(params) {
  console.log('uploadLocation', params);
  return putRequest('/geo_info_users', params);
}

export async function getRoutes(userId) {
  return getRequest(`/routes?user=${userId}`);
}

export async function getRoute(uid) {
  return getRequest(`/route/${uid}`);
}

export async function postRoute(uid, payload) {
  return postRequest(`/route/${uid}`, payload);
}


