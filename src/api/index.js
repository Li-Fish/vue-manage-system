import request from '../utils/request';

const base_url = 'http://127.0.0.1:5000/api/';

export const fetchData = query => {
    return request({
        url: './table.json',
        method: 'get',
        params: query
    });
};

export const getData = (prefix, query) => {
    return request.post(base_url + prefix, query);
};

export const uploadFile = (prefix, file, json) => {
    let param = new FormData();
    param.append('file', file);
    param.append('json', JSON.stringify(json));

    let config = {
        headers: { 'Content-Type': 'multipart/form-data' }
    };
    return request.post(base_url + prefix, param, config);
};
