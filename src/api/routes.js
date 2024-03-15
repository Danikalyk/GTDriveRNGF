import {getRequest, putRequest} from './request';

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
