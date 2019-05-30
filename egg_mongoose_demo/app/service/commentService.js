'use strict'

const Service = require('egg').Service;
const ObjectId = require('mongoose').Types.ObjectId;

class CommentService extends Service {
    
    async create(entity_type, entity_id) {
        const body          = this.ctx.request.body;
        body.create_user    = this.ctx.session.userInfo._id;
        body.entity_type    = entity_type;
        body.entity_id      = entity_id;
        const comment       = new this.ctx.model.CommentModel(body);
        console.log('在comment服务中', comment);
        let res;
        if(entity_type === 'article') {
            try {
                res = await comment.save();
                console.log('comment保存成功', res);
                // 里面要将comment_count+1
                const addCommentToArticleRes = await this.ctx.service.articleService.addCommentToArticle(entity_id, res._id);
            } catch (err) {
                console.error(err);
            }
        } else if(entity_type === 'comment') {
            try {
                res = await comment.save();
                console.log('comment保存成功', res);
                const addCommentToCommentRes = await this.ctx.service.commentService.addCommentToComment(entity_id, res._id);
            } catch(err) {
                console.error(err);
            }
        }
        return res;
    }

    async delete(comment_id) {
        const commentId = new ObjectId(comment_id);
        const where = {
            "_id": comment_id
        };
        // 非永久删除，仅逻辑删除，置status为-1
        const options = {
            "status": -1,
            "delete_time": new Date().toISOString()
        };
        let res;
        try {
            const commentDetail = await this.ctx.service.commentService.getCommentDetail(comment_id);
            if(commentDetail.entity_type === 'article') {
                const articleId = commentDetail.entity_id;
                res = await this.ctx.model.CommentModel.update(where, options);
                // 删除评论后要将其_id从文章中删除
                await this.ctx.service.articleService.deleteCommentFromArticle(articleId, comment_id);
            } else if(commentDetail.entity_type === 'comment') {
                const commentEntityId = commentDetail.entity_id;
                res = await this.ctx.model.CommentModel.update(where, options);
                // 删除评论后要将其_id从文章中删除
                await this.ctx.service.commentService.deleteCommentFromComment(commentEntityId, comment_id);
            }
        } catch(err) {
            console.error(err);
        }
        return res;
    }

    async getCommentDetail(comment_id) {
        const commentId = new ObjectId(comment_id);
        const where = {
            "_id": commentId,
            "status": 1
        };
        let res;
        try {
            res = await this.ctx.model.CommentModel.findOne(where)
            .populate({
                path: 'create_user',
                select: {
                    username: 1,
                    email: 1
                }
            })
        } catch(err) {
            console.error(err);
        }
        return res;
    }

    // 添加评论id进评论实体的comment数组中
    async addCommentToComment(commentEntityId, commentId = {}) {
        if(!commentEntityId || !commentId) {
            return Promise.reject('error: add缺少必要参数commentEntityId或commentId');
        }
        return this.ctx.model.CommentModel.findById(commentEntityId, function(err, commentEntity) {
            commentEntity.comment.push(commentId);
            commentEntity.meta.comment_count += 1;
            commentEntity.save();
        });
    }

    // 从评论实体的comment数组中删除评论id
    async deleteCommentFromComment(commentEntityId, commentId = {}) {
        if(!commentEntityId || !commentId) {
            return Promise.reject('error: delete缺少必要参数commentEntityId或commentId');
        }
        return this.ctx.model.CommentModel.findById(commentEntityId, function(err, commentEntity) {
            for(let index = 0; index < commentEntity.comment.length; index++) {
                if(commentEntity.comment[index].toString() == commentId.toString()) {
                    commentEntity.comment.splice(index, 1);
                }
            }
            commentEntity.meta.comment_count -= 1;
            commentEntity.save();
        });
    }
}

module.exports = CommentService;