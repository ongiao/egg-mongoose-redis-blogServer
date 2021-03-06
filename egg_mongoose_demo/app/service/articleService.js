'use strict'

const Service = require('egg').Service;
const ObjectId = require('mongoose').Types.ObjectId;
const uvHelper = require('../middleware/uvHelper');

class ArticleService extends Service {
    async create(user, catelog_id) {
        const body          = this.ctx.request.body;
        const catelogId     = new ObjectId(catelog_id);
        body.catelog        = catelogId;
        body.create_user    = this.ctx.session.userInfo._id;
        const article       = new this.ctx.model.ArticleModel(body);
        console.log('在article服务中', article);
        let res;
        try {
            res = await article.save();
            console.log('article保存成功', res);
            const addArticleToCatelogRes = await this.ctx.service.catelogService.addArticleToCatelog(catelogId, res._id);
        } catch (err) {
            console.error(err);
        }
        return res;
    }

    async update(article_id) {
        const body = this.ctx.request.body;
        const articleId = new ObjectId(article_id);
        const where = {
            "_id": article_id
        }
        // 没有catelog_id说明不用修改文章所属类别
        const catelogId = this.ctx.query.catelog_id || '';
        console.log('类别id为：', catelogId);
        if(catelogId) {
            console.log('进去了吗');
            const catelogDetail = await this.ctx.service.catelogService.getCatelogDetail(catelogId);
            if(!catelogDetail) {
                return Promisr.reject('error: 找不到指定的类别详情');
            }
        }
        const articleDetail = await this.ctx.service.articleService.getArticleDetail(article_id);
        
        let res;
        if(catelogId) {
            try {
                /**
                 * 1.将文章中的catelog更新为新的catelog
                 * 2.将原catelog中的文章id删除
                 * 3.在新catelog中的ownsArticle_ids中添加此文章_id
                 */
                const extraUpdated = {
                    update_time: Date.now(),
                    catelog: catelogId
                };
                const options = Object.assign({}, body, extraUpdated);
                const [updateArticleCatelog, deleteArtIdFromOldCatelog, addArtIdToNewCatelog] = 
                res = await Promise.all([
                    this.ctx.model.ArticleModel.update(where, options),
                    this.ctx.service.catelogService.deleteArticleFromCatelog(articleDetail.catelog, articleId)],
                    this.ctx.service.catelogService.addArticleToCatelog(catelogId, articleId));
                // res = await this.ctx.model.ArticleModel.update(where, options);    
                console.log('类别修改成功', res); 
            } catch(err) {
                console.error(err);
            }
        } else {
            try {
                /**
                 * 不用更新文章所属类别，只更新文章内容
                 */
                const extraUpdated = {
                    update_time: Date.now()
                };
                const options = Object.assign({}, body, extraUpdated);
                 res = await this.ctx.model.ArticleModel.update(where, options);    
                console.log('类别修改成功', res);    
            } catch(err) {
                console.error(err);
            }
        }
        return res;
    }

    async delete(article_id) {
        if(!article_id) {
            return Promise.reject('error: 文章id缺失');
        }
        const articleId = new ObjectId(article_id);
        const where = {
            "_id": article_id
        };
        // 非永久删除，仅逻辑删除，置status为-1
        const options = {
            "status": -1,
            "delete_time": new Date().toISOString()
        };
        let res;
        try {
            const articleDetail = await this.ctx.service.articleService.getArticleDetail(article_id);
            const catelogId = articleDetail.catelog;
            res = await this.ctx.model.ArticleModel.update(where, options);
            console.log('文章删除成功', catelogId);
            // 删除文章后要将其_id从类别中清除
            await this.ctx.service.catelogService.deleteArticleFromCatelog(catelogId, articleId);
        } catch(err) {
            console.error(err);
        }
        return res;
    }

    async getArticleDetail(article_id, option = '') {
        if(!article_id) {
            return Promise.reject('error: 文章id缺失');
        }
        const articleId = new ObjectId(article_id);
        const where = {
            "_id": articleId,
            "status": 1
        };
        let res;
        try {
            res = await this.ctx.model.ArticleModel.findOne(where)
            .populate({
                path: 'create_user',
                select: {
                    username: 1,
                    email: 1
                }
            })
            .populate({
                path: 'catelog',
                select: {
                    title: 1,
                    description: 1
                } 
            });
            if(!res) {
                return Promise.reject('error: 没有找到该文章');
            }
            /**
             * 获取某篇文章详情，实际是点击进去，增加一个浏览量，后面使用缓存存储，
             * 在使用定时器定期更新至持久层数据库，避免频繁操作数据库造成太大压力
             */
            if(option) {
                const options = {$inc: {"meta.view_count": 1}};
                const increRes = await this.ctx.model.ArticleModel.update(where, options)
                console.log('浏览量加一', increRes);
            }
            // option参数表示该此是用户浏览文章还是只是单纯获取文章详情
            // if(!option) {
            //     console.log('还是进来了');
            //     uvHelper.updateUv('article', res._id, this.ctx.session.userInfo._id);
            // }   
        } catch(err) {
            console.error(err);
        }
        console.log('找到文章详情', res);
        return res;
    }

    async getAllArticlesDetail() {
        const where = {};
        const options = {
            "create_time": -1
        };
        let res;
        try {
            res = await this.ctx.model.ArticleModel.find(where)
            .populate({
                path: 'create_user',
                select: {
                    username: 1,
                    email: 1
                } 
            })
            .populate({
                path: 'catelog',
                select: {
                    title: 1,
                    description: 1
                } 
            })
            .sort(options);
        } catch(err) {
            console.error(err);
        }
        console.log('找到所有文章详情', res);
        return res;
    }

    // 添加评论到文章中
    async addCommentToArticle(articleId, commentId = {}) {
        if(!articleId || !commentId) {
            return Promise.reject('error: add缺少必要参数articleId或commentId');
        }
        console.log('在添加评论进文章');
        return this.ctx.model.ArticleModel.findById(articleId, function(err, article) {
            article.comment.push(commentId);
            article.meta.comment_count += 1;
            article.save();
        });
    }

    // 从文章中删除评论
    async deleteCommentFromArticle(articleId, commentId = {}) {
        if(!articleId || !commentId) {
            return Promise.reject('error: delete缺少必要参数articleId或commentId');
        }
        return this.ctx.model.ArticleModel.findById(articleId, function(err, article) {
            for(let index = 0; index < article.comment.length; index++) {
                if(article.comment[index].toString() == commentId.toString()) {
                    article.comment.splice(index, 1);
                }
            }
            article.meta.comment_count -= 1;
            article.save();
        });
    }
}

module.exports = ArticleService;