import {postRequest} from './request';

export async function getChat(params) {
  return postRequest('/chat_driver_answer', params);
}
