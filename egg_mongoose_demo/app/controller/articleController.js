'use strict'

const Controller = require('egg').Controller;
const ObjectId = require('mongoose').Types.ObjectId;

class ArticleController extends Controller {

    // 创建新文章
    async create() {
        const body = this.ctx.request.body;
        // 所属类别从params catelog_id中获取
        const catelog_id = this.ctx.query.catelog_id;
        // const catelogId = new ObjectId(catelog_id);
        const catelogDetail = await this.ctx.service.catelogService.getCatelogDetail(catelog_id);
        if(!catelogDetail) {
            return Promise.reject('error: 没有找到该类别的详情');
        }
        const rules = {
            title: { type: 'string', required: true, min: 1 },
            content: { type: 'string', required: true, min: 1 }
        };
        const user = this.ctx.session.userInfo;
        if(!user) {
            return Promise.reject('error: 非登陆状态不允许创建类型');
        }
        try {
            const error = this.ctx.validate(rules, body);
            if(!error) {
                const res = await this.ctx.service.articleService.create(user, catelog_id);
                console.log('发布文章成功', res);
                if(res) {
                    this.ctx.redirect('/');
                }
            }
        } catch(err) {
            console.error(err);
        }
    }

    async update() {
        // 有可能设计到修改文章所属的类别，修改之后要把旧的类别删除，添加进新的类别里
        const article_id = this.ctx.query.article_id;
        const user = this.ctx.session.userInfo;
        if(!article_id) {
            return Promise.reject('error: 文章id为空');
        }
        if(!user) {
            return Promise.reject('error: 非登录状态下不允许修改类型');
        }
        let articleDetail = await this.ctx.service.articleService.getArticleDetail(article_id);
        if(!articleDetail) {
            return Promise.reject('error: 没有找到该文章的详情');
        }
        // 要判断该登录用户是否是该类型的创建用户
        if(articleDetail.create_user != user._id) {
            return Promise.reject('error: 登录用户不是该类型的创建者，没有权限修改');
        }
        const updatedArticleDetail = await this.ctx.service.articleService.update(article_id);
        this.ctx.body = updatedArticleDetail;
        this.ctx.apiResult = { data: updatedArticleDetail };
    }

    async delete() {
        // 删除文章后要将其_id从类别中清除
        const article_id = this.ctx.query.article_id;
        if(!article_id) {
            return Promise.reject('error: articleId为空');
        }
        const user = this.ctx.session.userInfo;
        if(!user) {
            return Promise.reject('error: 非登陆状态不允许删除文章');
        }
        const articleDetail = await this.ctx.service.articleService.getArticleDetail(article_id);
        console.log('在删除文章中', articleDetail);
        if(!articleDetail) {
            return Promise.reject('error: 没有找到该文章的详情');
        }
        if(articleDetail.create_user != user._id) {
            return Promise.reject('error: 登录用户不是该文章的创建者，没有权限删除');
        }
        const deletedArticle = await this.ctx.service.articleService.delete(article_id);
        this.ctx.apiResult = { data: deletedArticle };
        if(deletedArticle) {
            this.ctx.redirect('/');
        }
    }

    async getArticleDetail() {
        const article_id = this.ctx.query.article_id;
        if(!article_id) {
            return Promise.reject('error: articleId为空');
        }
        let articleDetail = await this.ctx.service.articleService.getArticleDetail(article_id);
        console.log('getArticleDetail控制器结果', articleDetail);
        if(!articleDetail) {
            return Promise.reject('error: 没有找到该文章的详情');
        }
        this.ctx.body = articleDetail;
        this.ctx.apiResult = { data: articleDetail };
    }

    async getAllArticlesDetail() {
        const allArticlesDetail = await this.ctx.service.articleService.getAllArticlesDetail();
        if(!allArticlesDetail) {
            return Promise.reject('error: 没有找到任何文章的详情');
        }
        this.ctx.body = allArticlesDetail;
        this.ctx.apiResult = { data: allArticlesDetail };
    }
}

module.exports = ArticleController;