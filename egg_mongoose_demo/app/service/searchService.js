'use strict'

const Service = require('egg').Service;
const elasticsearch = require('./elasticsearch');

class SearchService extends Service {

    async search(index, options = {}) {
        return elasticsearch.searchByES7(index, options);
    }
}

module.exports = SearchService;