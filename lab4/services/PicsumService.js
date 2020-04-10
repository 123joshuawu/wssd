const axios = require('axios').default;

const client = axios.create({
    baseURL: 'https://picsum.photos'
});

client.interceptors.response.use(
    ({ data, headers }) => {
        return { 
            data,
            link: headers['link']
        }; 
    }, 
    ({ response: { data, status: code, statusText: message } }) => {

        return Promise.reject({ code, message });
    }    
);

const fs = require('fs');
const { promisify } = require('util');

module.exports = {
    /** @param {Object.<string, any>} params
     *  @param {number} params.page
     *  @param {number} params.limit
     */
    getPhotos: (params) => {
        // return client.get(
        //     '/v2/list',
        //     {
        //         params
        //     }
        // );
        return promisify(cb => fs.readFile('responses.json', (err, data) => cb(err, {data: JSON.parse(data.toString())})))()
    },
    /** @param {number} id
     */
    getPhotoInfo: (id) => {
        return client.get(
            `/id/${id}/info`
        );
    }
}