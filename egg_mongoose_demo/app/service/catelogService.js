'use strict'

const Service = require('egg').Service;
const ObjectId = require('mongoose').Types.ObjectId;

class CatelogService extends Service {

    async create(user) {
        let body = this.ctx.request.body;
        body.create_user = user._id;
        const catelog = new this.ctx.model.CatelogModel(body);
        let res;
        try {
            res = await catelog.save();
            console.log('catelog保存成功', res);
        } catch (err) {
            console.error(err);
        }
        return res;
    }

    async update(catelog_id) {
        const body = this.ctx.request.body;
        const catelogId = new ObjectId(catelog_id);
        const where = {
            "_id": catelog_id
        }
        const options = Object.assign({}, body, {update_time: Date.now()});
        let res;
        try {
            res = await this.ctx.model.CatelogModel.update(where, options);
            console.log('类别修改成功', res);
            
        } catch(err) {
            console.error(err);
        }
        return res;
    }

    async delete(catelog_id) {
        const catelogId = new ObjectId(catelog_id);
        const where = {
            "_id": catelog_id
        };
        // 非永久删除，仅逻辑删除，置status为-1
        const options = {
            "status": -1,
            "delete_time": new Date().toISOString()
        };
        let res;
        try {
            res = await this.ctx.model.CatelogModel.update(where, options);
            console.log('类别删除成功', res);
        } catch(err) {
            console.error(err);
        }
        return res;
    }

    async getCatelogDetail(catelog_id) {
        const catelogId = new ObjectId(catelog_id);
        // console.log(ObjectId.isValid(catelogId));
        const where = {
            "_id": catelogId,
            "status": 1
        };
        let res;
        try {
            res = await this.ctx.model.CatelogModel.findOne(where);
        } catch(err) {
            console.error(err);
        }
        console.log('找到类别详情', res);
        return res;
    }

    async getAllCatelogsDetail() {
        const where = {};
        const options = {
            "create_time": 1
        };
        let res;
        try {
            res = await this.ctx.model.CatelogModel.find(where).sort(options);
        } catch(err) {
            console.error(err);
        }
        console.log('找到所有类别详情', res);
        return res;
    }

    async addArticleToCatelog(catelogId, articleId = {}) {
        if(!catelogId || !articleId) {
            return Promise.reject('error: add缺少必要参数catelogId或articleId');
        }
        console.log('在添加文章进类别');
        return this.ctx.model.CatelogModel.findById(catelogId, function(err, catelog) {
            catelog.ownsArticle_ids.push(articleId);
            catelog.save();
        });
    }

    async deleteArticleFromCatelog(catelogId, articleId = {}) {
        if(!catelogId || !articleId) {
            return Promise.reject('error: delete缺少必要参数catelogId或articleId');
        }
        return this.ctx.model.CatelogModel.findById(catelogId, function(err, catelog) {
            for(let index = 0; index < catelog.ownsArticle_ids.length; index++) {
                if(catelog.ownsArticle_ids[index].toString() == articleId.toString()) {
                    catelog.ownsArticle_ids.splice(index, 1);
                }
            }
            catelog.save();
        });
    }
}

module.exports = CatelogService;