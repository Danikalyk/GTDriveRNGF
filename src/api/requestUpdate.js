import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://upd.gt-logistics.su',    
    timeout: 5000,
});

export async function getRequestUpdate() {
    const req = axiosInstance.get('/_GTDrive/app.json')

    console.log(axiosInstance);

    return req
        .then(response => {
            return req;
        })
        .catch(error => {
            console.error(error.toJSON());
            return error.toJSON();
        });
}


