import {postRequest} from './request';

export async function acceptImages(params) {
  return postRequest('/accept_images', params);
}
