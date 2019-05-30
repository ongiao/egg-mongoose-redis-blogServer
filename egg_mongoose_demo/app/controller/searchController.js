'use strict'

const Controller = require('egg').Controller;
const elasticsearch = require('../service/elasticsearch');

class SearchController extends Controller {

    // 文章搜索接口
    async search() {
        // 通过keyword搜索文章内容
        const keyword = this.ctx.request.body.keyword;
        if(!keyword) {
            return Promise.reject('error: 缺少搜索关键字keyword');
        }
        // const query = { bool: {} };
        // query.bool.should = [
        //     {
        //         mutli_match: {
        //             type: 'phase',
        //             query: keyword,
        //             analyzer: 'ik_max_word',
        //             fields: ['title', 'content']
        //         }
        //     },
        //     {
        //         mutli_match: {
        //             type: 'phase_prefix',
        //             query: keyword,
        //             analyzer: 'ik_max_word',
        //             fields: ['title', 'content']
        //         }
        //     },
        // ];
        const query = {
            "bool": {
                "should": [
                    {
                        "multi_match": {
                            // "type": 'phase_prefix', 
                            "query": keyword,
                            // "analyzer": 'ik_max_word',
                            "fields": ["title", "content"]
                        }
                    },
                ]
            }
        };
        const sort = keyword ? {_score: 'desc'} : {update_time: 'desc', _id: 'desc'};
        const result = await this.service.searchService.search('blog', {
            query,
            sort
        });
        this.ctx.body = result;
        this.ctx.apiResult = { data: result };
    }
}

module.exports = SearchController;