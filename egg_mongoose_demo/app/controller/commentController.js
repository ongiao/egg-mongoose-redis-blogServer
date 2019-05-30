'use strict'

const Controller = require('egg').Controller;

class CommentController extends Controller {

    async create() {
        const body = this.ctx.request.body;
        const { entity_id, entity_type } = this.ctx.query;
        if(!entity_id) {
            return Promise.reject('error: 实体id为空');
        }
        if(!entity_type) {
            return Promise.reject('error: 实体类型为空');
        }
        if(entity_type === 'article') {
            const article = await this.ctx.service.articleService.getArticleDetail(entity_id);
            if(!article) {
                return Promise.reject('error: 没有找到要评论的文章实体');
            }
        } 
        else if(entity_type === 'comment') {
            const comment = await this.ctx.service.commentService.getCommentDetail(entity_id);
            if(!comment) {
                return Promise.reject('error: 没有找到要评论的评论实体');
            }
        }
        const rules = {
            content: { type: 'string', required: true, min: 1 }
        };
        const user = this.ctx.session.userInfo;
        if(!user) {
            return Promise.reject('error: 非登陆状态不允许发布评论');
        }
        try {
            const error = this.ctx.validate(rules, body);
            if(!error) {
                const res = await this.ctx.service.commentService.create(entity_type, entity_id);
                console.log('发布评论成功', res);
                if(res) {
                    this.ctx.redirect('/');
                }
            }
        } catch(err) {
            console.error(err);
        }
    }

    // 删除评论后要将其_id从文章中删除
    async delete() {
        const comment_id = this.ctx.query.comment_id;
        if(!comment_id) {
            return Promise.reject('error: comment_id为空');
        }
        const user = this.ctx.session.userInfo;
        if(!user) {
            return Promise.reject('error: 非登陆状态不允许删除评论');
        }
        const commentDetail = await this.ctx.service.commentService.getCommentDetail(comment_id);
        console.log('在删除评论中', commentDetail);
        if(!commentDetail) {
            return Promise.reject('error: 没有找到该评论的详情');
        }
        if(commentDetail.create_user._id != user._id) {
            return Promise.reject('error: 登录用户不是该评论的创建者，没有权限删除');
        }
        const deletedComment = await this.ctx.service.commentService.delete(comment_id);
        this.ctx.apiResult = { data: deletedComment };
        if(deletedComment) {
            this.ctx.redirect('/');
        }
    }

    async getCommentDetail() {
        const comment_id = this.ctx.query.comment_id;
        if(!comment_id) {
            return Promise.reject('error: commentId为空');
        }
        let commentDetail = await this.ctx.service.commentService.getCommentDetail(comment_id);
        console.log('getCommentDetail控制器结果', commentDetail);
        if(!commentDetail) {
            return Promise.reject('error: 没有找到该评论的详情');
        }
        this.ctx.body = commentDetail;
        this.ctx.apiResult = { data: commentDetail };
    }
}

module.exports = CommentController;