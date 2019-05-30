'use strict'

const Service = require('egg').Service;
const ObjectId = require('mongoose').Types.ObjectId;

class CollectionService extends Service {

    async create(user) {
        const body = this.ctx.request.body;
        body.create_user = user._id;
        const collection = new this.ctx.model.CollectionModel(body);
        let res;
        try {
            res = await collection.save();
            console.log('collection保存成功');
        } catch(err) {
            console.error(err);
        }
        return res;
    }

    async update(collection_id) {
        const body = this.ctx.request.body;
        const where = {
            _id: collection_id
        };
        const extraUpdated = {
            update_time: Date.now(),
        };
        const options = Object.assign({}, body, extraUpdated);
        let res;
        try {
            res = await this.ctx.model.CollectionModel.update(where, options);
            console.log('收藏夹修改成功', res); 
        } catch(err) {
            console.error(err);
        }
        return res;
    }

    async getCollectionDetail(collection_id) {
        const collectionId = new ObjectId(collection_id);
        const where = {
            "_id": collectionId,
            "status": 1
        };
        let res;
        try {
            res = await this.ctx.model.CollectionModel.findOne(where)
            .populate({
                path: 'create_user',
                select: {
                    username: 1,
                    email: 1
                }
            })
            .populate({
                path: 'ownsArticle_ids',
                select: {
                    title: 1,
                    content: 1
                }
            });
        } catch(err) {
            console.error(err);
        }
        console.log('找到收藏夹详情', res);
        return res;
    }

    async collectArticle(article_id, collection_id) {
        const articleId = new ObjectId(article_id);
        return this.ctx.model.CollectionModel.findById(collection_id, function(err, collection) {
            collection.ownsArticle_ids.push(articleId);
            collection.meta.collect_count += 1;
            collection.save();
        });
    }

    async cancelCollectedArticle(article_id, collection_id) {
        const articleId = new ObjectId(article_id);
        return this.ctx.model.CollectionModel.findById(collection_id, function(err, collection) {
            for(let index = 0; index < collection.ownsArticle_ids.length; index++) {
                if(collection.ownsArticle_ids[index].toString() == article_id.toString()) {
                    collection.ownsArticle_ids.splice(index, 1);
                }
            }
            collection.meta.collect_count -= 1;
            collection.save();
        });
    }
}

module.exports = CollectionService;