'use strict'

const Controller = require('egg').Controller;

class LikeDislikeController extends Controller {

    async createLike() {
        console.log('在createLike里面');
        const { entity_type, entity_id } = this.ctx.query;
        if(!entity_type || !entity_id) {
            return Promise.reject('error: 缺少必要参数entity_type或entity_id');
        }
        if(entity_type === 'article') {
            const article = await this.ctx.service.articleService.getArticleDetail(entity_id);
            if(!article) {
                return Promise.reject('error: 没有找到要点赞的文章实体');
            }
        } 
        else if(entity_type === 'comment') {
            const comment = await this.ctx.service.commentService.getCommentDetail(entity_id);
            if(!comment) {
                return Promise.reject('error: 没有找到要点赞的评论实体');
            }
        }
        const user = this.ctx.session.userInfo;
        if(!user) {
            return Promise.reject('error: 非登陆状态不允许点赞');
        }
        let res;
        try {
            res = await this.ctx.service.likeDislikeService.createLike(entity_type, entity_id);
            if(res) {
                this.ctx.redirect('/');
            }
        } catch(err) {
            console.error(err);
        }
    }

    async createDislike() {
        console.log('在createDislike里面');
        const { entity_type, entity_id } = this.ctx.query;
        if(!entity_type || !entity_id) {
            return Promise.reject('error: 缺少必要参数entity_type或entity_id');
        }
        if(entity_type === 'article') {
            const article = await this.ctx.service.articleService.getArticleDetail(entity_id);
            if(!article) {
                return Promise.reject('error: 没有找到要点踩的文章实体');
            }
        } 
        else if(entity_type === 'comment') {
            const comment = await this.ctx.service.commentService.getCommentDetail(entity_id);
            if(!comment) {
                return Promise.reject('error: 没有找到要点踩的评论实体');
            }
        }
        const user = this.ctx.session.userInfo;
        if(!user) {
            return Promise.reject('error: 非登陆状态不允许点踩');
        }
        let res;
        try {
            res = await this.ctx.service.likeDislikeService.createDislike(entity_type, entity_id);
            if(res) {
                this.ctx.redirect('/');
            }
        } catch(err) {
            console.error(err);
        }
    }

    async getEntityLikeCount() {
        const { entity_type, entity_id } = this.ctx.query;
        if(!entity_type || !entity_id) {
            return Promise.reject('error: 缺少必要参数entity_type或entity_id');
        }
        if(entity_type === 'article') {
            const articleDetail = await this.ctx.service.articleService.getArticleDetail(entity_id);
            if(!articleDetail) {
                return Promise.reject('error: 没有找到该文章的详情');
            }
        }
        if(entity_type === 'comment') {
            const commentDetail = await this.ctx.service.commentService.getCommentDetail(entity_id);
            if(!commentDetail) {
                return Promise.reject('error: 没有找到该评论的详情');
            }
        }
        const likeCount = await this.ctx.service.likeDislikeService.getEntityLikeCount(entity_type, entity_id);
        this.ctx.body = likeCount;
    }

    async getEntityDislikeCount() {
        const { entity_type, entity_id } = this.ctx.query;
        if(!entity_type || !entity_id) {
            return Promise.reject('error: 缺少必要参数entity_type或entity_id');
        }
        if(entity_type === 'article') {
            const articleDetail = await this.ctx.service.articleService.getArticleDetail(entity_id);
            if(!articleDetail) {
                return Promise.reject('error: 没有找到该文章的详情');
            }
        }
        if(entity_type === 'comment') {
            const commentDetail = await this.ctx.service.commentService.getCommentDetail(entity_id);
            if(!commentDetail) {
                return Promise.reject('error: 没有找到该评论的详情');
            }
        }
        const dislikeCount = await this.ctx.service.likeDislikeService.getEntityDislikeCount(entity_type, entity_id);
        this.ctx.body = dislikeCount;
    }
}

module.exports = LikeDislikeController;