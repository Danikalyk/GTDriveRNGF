import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://upd.gt-logistics.su',
  timeout: 5000,
});

export async function getRequestUpdate() {
  const req = axiosInstance.get('/_GTDrive/app.json');

  return req
    .then(response => {
      //console.log("newversion", response.data);

      const json = response.data;

      return json;
    })
    .catch(error => {
      console.error(error.toJSON());

      return error.toJSON();
    });
}
