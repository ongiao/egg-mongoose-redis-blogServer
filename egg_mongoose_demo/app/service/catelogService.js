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
            // 同时删除类别下拥有的文章id
            // 首先获取类别下的文章id，组成一个数组，遍历数组删除
            const catelog = await this.getCatelogDetail(catelog_id);
            for(let index = 0; index < catelog.ownsArticle_ids.length; index++) {
                await this.deleteArticleFromCatelog(catelog_id, catelog.ownsArticle_ids[index]._id);
            }
            res = await this.ctx.model.CatelogModel.update(where, options);
            // 删除类别之后同时要将此类别下的所有文章的状态置为-1
            const deleteArticleRes = await this.ctx.model.ArticleModel.update(
                {
                    "catelog": catelog_id,
                    "status" : 1
                },
                {
                    "status": -1,
                    
                    "delete_time": new Date().toISOString()
                },
                {multi: true}
            );
            // const deleteArtId = await this.deleteArticleFromCatelog();
            if(!res || !deleteArticleRes) {
                return Promise.reject('error: 类别删除出错');
            }
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
            res = await this.ctx.model.CatelogModel.findOne(where)
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
            res = await this.ctx.model.CatelogModel.find(where)
            .populate({
                path: 'create_user',
                select: {
                    username: 1,
                    email: 1
                }
            })
            .sort(options);
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

    async getCatelogArticles(catelog_id) {
        if(!catelog_id) {
            return Promise.reject('error: 缺少必要参数catelog_id');
        }
        const where = {
            "status": 1,
            "catelog": catelog_id
        };
        const options = {};
        let res;
        try{
            res = await this.ctx.model.ArticleModel.find(where)
                .populate({
                    path: 'catelog',
                    select: {title: 1}
                })
                .sort({create_time: -1});
        } catch(err) {
            console.error(err);
        }
        if(!res || res.length === 0) {
            return Promise.reject('error: 该类别下暂无文章');
        }
        console.log('在getCatelogArticles服务中', res);
        return res;
    }
}

module.exports = CatelogService;