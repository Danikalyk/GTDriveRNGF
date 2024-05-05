import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'https://router.project-osrm.org',
    timeout: 5000,
});

export async function getRequestOSRM(coordinates) {
    const req = axiosInstance.get('/route/v1/driving/' + coordinates.join(';') + '?overview=full&alternatives=true&steps=true&geometries=geojson')

    return req
        .then(response => {
            if (response.status === 200) {
                const polyline = response.data.routes[0].geometry.coordinates;

                return polyline;
            } else {
                throw new Error('Failed to fetch polyline');
            }
        })
        .catch(error => {
            console.error(error.toJSON());
            return error.toJSON();
        });
}