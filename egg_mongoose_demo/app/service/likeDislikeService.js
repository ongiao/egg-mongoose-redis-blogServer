'use strict'

const Service = require('egg').Service;
const { likeDislikeConvert } = require('../middleware/helper');

class LikeDislikeService extends Service {

    /**
     * 如果用户之前点踩过文章，现在点赞，则必须将dislike_user里面的userId删除，dislike_count-1，
     * like_user里面增加userId，like_count+1。（还得忽略重复点赞的用户）
     * 如果之前没有点踩过文章，则直接like_user里面增加userId，like_count+1。
     */
    async createLike(entity_type, entity_id) {
        let res;
        const user = this.ctx.session.userInfo;
        // 判断赞的实体类型
        if(entity_type === 'article') {
            return this.ctx.model.ArticleModel.findById(entity_id, function(err, article) {
                // 看dislike_user里是否有该用户的信息
                console.log('在点赞中', article);
                likeDislikeConvert(article, 'like', user);
                // 要判断有没有重复喜欢的用户
                const likeItem = article.like_info.like_user;
                for(let index = 0; index < likeItem.length; index++) {
                    // 如果找到重复点赞的用户，则直接返回不做任何操作
                    if(likeItem[index].toString() === user._id.toString()) {
                        article.save();
                        return;
                    }
                }
                likeItem.push(user._id);
                article.meta.like_count += 1;
                article.save();
            });
        } else if(entity_type === 'comment') {
            return this.ctx.model.CommentModel.findById(entity_id, function(err, comment) {
                // 看dislike_user里是否有该用户的信息
                likeDislikeConvert(comment, 'like', user);
                // 要判断有没有重复喜欢的用户
                const likeItem = comment.like_info.like_user;
                for(let index = 0; index < likeItem.length; index++) {
                    if(likeItem[index].toString() === user._id.toString()) {
                        comment.save();
                        return;
                    }
                }
                likeItem.push(user._id);
                comment.meta.like_count += 1;
                comment.save();
            });
        }
    }

    /**
     * 如果用户之前点赞过文章，现在点踩，则必须将like_user里面的userId删除，like_count-1，
     * dislike_user里面增加userId，dislike_count+1。（还得忽略重复点踩的用户）
     * 如果之前没有点赞过文章，则直接dislike_user里面增加userId，dislike_count+1。
     */
    async createDislike(entity_type, entity_id) {
        let res;
        const user = this.ctx.session.userInfo;
        // 判断踩的实体类型
        if(entity_type === 'article') {
            return this.ctx.model.ArticleModel.findById(entity_id, function(err, article) {
                // 点踩之前判断是否之前点过赞
                likeDislikeConvert(article, 'dislike', user);
                // 要判断有没有重复点踩的用户
                const item = article.dislike_info.dislike_user;
                for(let index = 0; index < item.length; index++) {
                    if(item[index].toString() === user._id.toString()) {
                        article.save();
                        return;
                    }
                }
                article.dislike_info.dislike_user.push(user._id);
                article.meta.dislike_count += 1;
                article.save();
            });
        } else if(entity_type === 'comment') {
            return this.ctx.model.CommentModel.findById(entity_id, function(err, comment) {
                // 点踩之前判断是否之前点过赞
                likeDislikeConvert(comment, 'dislike', user);
                // 要判断有没有重复喜欢的用户
                const item = comment.dislike_info.dislike_user;
                for(let index = 0; index < item.length; index++) {
                    if(item[index].toString() === user._id.toString()) {
                        comment.save();
                        return;
                    }
                }
                comment.dislike_info.dislike_user.push(user._id);
                comment.meta.dislike_count += 1;
                comment.save();
            });
        }
    }

    async getEntityLikeCount(entity_type, entity_id) {
        if(entity_type === 'article') {
            const article = await this.ctx.service.articleService.getArticleDetail(entity_id);
            return article.meta.like_count;
        } else if(entity_type === 'comment') {
            const comment = await this.ctx.service.commentService.getCommentDetail(entity_id);
            return comment.meta.like_count;
        }
    }

    async getEntityDislikeCount(entity_type, entity_id) {
        if(entity_type === 'article') {
            const article = await this.ctx.service.articleService.getArticleDetail(entity_id);
            return article.meta.dislike_count;
        } else if(entity_type === 'comment') {
            const comment = await this.ctx.service.commentService.getCommentDetail(entity_id);
            return comment.meta.dislike_count;
        }
    }
}

module.exports = LikeDislikeService;