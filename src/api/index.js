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
