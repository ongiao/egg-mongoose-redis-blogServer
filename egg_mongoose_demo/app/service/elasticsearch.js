'use strict'

const elasticsearch = require('@elastic/elasticsearch');
// ES配置
const esConfig = {
    node: 'http://localhost:9200',
    maxRetries: 5,
    requestTimeout: 60000,
    sniffOnStart: true
};
const esClient = new elasticsearch.Client(esConfig);

module.exports = {
    createES,
    deleteES,
    updateES,
    searchByES7
};

// 建立索引
async function createES(index, type, id, body) {
    console.log('在ES create中');
    return esClient.index({index, type, id, body});
}

// 删除索引
async function deleteES(index, type, id) {
    return esClient.delete({index, type, id});
}

// 更新索引
async function updateES(index, type, id, options) {
    const body = {
        doc: options,
        doc_as_upsert: true
    };
    return esClient.update({index, type, id, body});
}

// 搜索文章
async function searchByES7(index, options = {}) {
    const query = options.query;
    const body = { query };
    if(options.sort) {
        body.sort = options.sort;
    }
    // const result = await searchFromES(index, body);
    // const res = await esClient.search({index, from, size, body});
    const res = await esClient.search({index, body});
    console.log('在es搜索中', res);
    return res.body.hits.hits;
}

async function searchFromES(index, params = {}) {

}