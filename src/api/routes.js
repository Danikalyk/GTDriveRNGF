import {putRequest} from './request';

export async function uploadLocation(params) {
  console.log('uploadLocation', params);
  return putRequest('/geo_info_users', params);
}
