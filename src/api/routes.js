import {getRequest, putRequest} from './request';

export async function uploadLocation(params) {
  console.log('uploadLocation', params);
  return putRequest('/geo_info_users', params);
}


export async function getRoutes() {
  return getRequest('/routes')
}

export async function getRoute(uid) {
  return getRequest(`/routes/${uid}`)
}