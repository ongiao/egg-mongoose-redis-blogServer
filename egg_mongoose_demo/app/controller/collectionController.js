'use strict'

const Controller = require('egg').Controller;
const elasticsearch = require('../service/elasticsearch');

class CollectionController extends Controller {

    async create() {
        /**
         * collection_name, collection_description, create_user
         * 
         */
        const body = this.ctx.request.body;
        const rules = {
            collection_name: { required: true, type: 'string', min: 1 },
            collection_description: { required: false, type: 'string', min: 1 },
        };
        const user = this.ctx.session.userInfo;
        if (!user) {
            return Promise.reject('error: 非登陆状态不允许创建收藏夹');
        }
        try {
            const error = this.ctx.validate(rules, body);
            if (!error) {
                const res = await this.ctx.service.collectionService.create(user);
                // const res = await this.ctx.service.catelogService.create(user);
                console.log('创建收藏夹成功', res);
                if (res) {
                    this.ctx.redirect('/');
                }
            }
        } catch (err) {
            console.error(err);
        }
    }

    async update() {
        const collection_id = this.ctx.query.collection_id;
        if(!collection_id) {
            return Promise.reject('error: 缺少必要参数collection_id');
        }
        const collectionDetail = await this.ctx.service.collectionService.getCollectionDetail(collection_id);
        if(!collectionDetail) {
            return Promise.reject('error: 没有找到要修改的收藏夹详情');
        }
        const user = this.ctx.session.userInfo;
        if (!user) {
            return Promise.reject('error: 非登陆状态不允许创建收藏夹');
        }
        if(collectionDetail.create_user._id.toString() !== user._id.toString()) {
            return Promise.reject('error: 你不是该收藏夹的创建用户，无权修改');
        }
        const body = this.ctx.request.body;
        const rules = {
            collection_name: { required: true, type: 'string', min: 1 },
            collection_description: { required: false, type: 'string', min: 1 },
        };
        try {
            const error = this.ctx.validate(rules, body);
            if(!error) {
                const res = await this.ctx.service.collectionService.update(collection_id);
            }
        } catch(err) {
            console.error(err);
        }
    }

    async getCollectionDetail() {
        const collection_id = this.ctx.query.collection_id;
        if (!collection_id) {
            return Promise.reject('error: 缺少必要参数collection_id');
        }
        // 要判断是否在登录下，且登录用户是否和该收藏夹的创建用户相同
        const user = this.ctx.session.userInfo;
        if (!user) {
            return Promise.reject('error: 非登陆状态不允许查看收藏夹');
        }

        const collectionDetail = await this.ctx.service.collectionService.getCollectionDetail(collection_id);
        if (!collectionDetail) {
            return Promise.reject('error: 没有找到该收藏夹的详情');
        }
        if (collectionDetail.create_user._id.toString() !== user._id.toString()) {
            return Promise.reject('error: 你不是该收藏夹的创建用户，无权访问');
        }
        this.ctx.body = collectionDetail;
        this.ctx.apiResult = { data: collectionDetail };
    }

    async collectArticle() {
        const { article_id, collection_id } = this.ctx.query;
        if (!article_id || !collection_id) {
            return Promise.reject('error: 缺少必要参数article_id或collection_id');
        }
        const user = this.ctx.session.userInfo;
        if (!user) {
            return Promise.reject('error: 非登陆状态不允许收藏文章');
        }
        const article = await this.ctx.service.articleService.getArticleDetail(article_id);
        if (!article) {
            return Promise.reject('error: 没有找到该文章');
        }
        const collection = await this.ctx.service.collectionService.getCollectionDetail(collection_id);
        if (!collection) {
            return Promise.reject('error: 没有找到该收藏夹');
        }
        if (collection.create_user._id.toString() !== user._id.toString()) {
            return Promise.reject('error: 你不是该收藏夹的创建用户，无权给该收藏夹添加文章');
        }
        const res = await Promise.all([
            this.ctx.service.collectionService.collectArticle(article_id, collection_id),
            this.collectionArticleES(article._id, 'create', collection.collection_name, article)
        ]);
        // const res = await this.ctx.service.collectionService.collectArticle(article_id, collection_id);
        // // 收藏夹新增的文章同步至elasticsearch
        // await this.collectionArticleES(article._id, 'create', collection.collection_name, article);
        this.ctx.body = res;
        this.ctx.apiResult = { data: res };
    }

    async cancelCollectedArticle() {
        const { article_id, collection_id } = this.ctx.query;
        if (!article_id || !collection_id) {
            return Promise.reject('error: 缺少必要参数article_id或collection_id');
        }
        const user = this.ctx.session.userInfo;
        if (!user) {
            return Promise.reject('error: 非登陆状态不允许取消收藏文章');
        }
        const article = await this.ctx.service.articleService.getArticleDetail(article_id);
        if (!article) {
            return Promise.reject('error: 没有找到该文章');
        }
        const collection = await this.ctx.service.collectionService.getCollectionDetail(collection_id);
        if (!collection) {
            return Promise.reject('error: 没有找到该收藏夹');
        }
        if (collection.create_user._id.toString() !== user._id.toString()) {
            return Promise.reject('error: 你不是该收藏夹的创建用户，无权给该收藏夹删除文章');
        }
        const res = await Promise.all([
            this.ctx.service.collectionService.cancelCollectedArticle(article_id, collection_id),
            this.collectionArticleES(article._id, 'delete', collection.collection_name, article)
        ]);
        // const res = await this.ctx.service.collectionService.cancelCollectedArticle(article_id, collection_id);
        // // 收藏夹新增的文章同步至elasticsearch
        // await this.collectionArticleES(article._id, 'create', collection.collection_name, article);
        this.ctx.body = res;
        this.ctx.apiResult = { data: res };
    }

    async search() {
        const { keyword } = this.ctx.request.body;
        if (!keyword) {
            return Promise.reject('error: 缺少搜索关键字keyword');
        }
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
        const result = await this.service.searchService.search('colletcion', {
            query,
            sort
        });
        this.ctx.body = result;
        this.ctx.apiResult = { data: result };
    }

    // 收藏夹的文章同步至ElasticSearch
    async collectionArticleES(id, action, type, article) {
        console.log('在ES中');
        // 索引为collection，表示收藏夹
        id = id.toString();
        if (action === 'delete') {
            return elasticsearch.deleteES('blog', type, id);
        }
        const esBody = {
            title: article.title,
            content: article.content,
            create_time: article.create_time,
            update_time: article.update_time,
            // create_user: article.create_user
        };
        if (action === 'create') {
            return elasticsearch.createES('collection', type, id, esBody);
        } else if (action === 'update') {
            return elasticsearch.updateES('collection', type, id, esBody);
        }
    }
}

module.exports = CollectionController;