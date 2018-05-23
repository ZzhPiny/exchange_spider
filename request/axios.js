const axios = require('axios');
const cheerio = require('cheerio');

class Http {
    constructor() {
        this.http = axios.create({
            headers: {
                'Content-Type': 'application/json',
            },
        });
        this.http.interceptors.request.use((config) => {
            return config;
        });
        this.http.interceptors.response.use((response) => {
            return cheerio.load(response);
        });
    }
}

module.exports = Http;