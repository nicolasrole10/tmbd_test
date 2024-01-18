const axios = require('axios');

class axiosRepository {

    constructor() {

    }

    async getRequest(endpoint, headers = {}, body = {}) {
        const response = await axios({
            method: 'get',
            url: endpoint,
            headers: headers,
            body: body
        });
        
        return response
    }
}

module.exports = axiosRepository;