'use strict'

const Controller = require('egg').Controller;

class CatelogController extends Controller {
    async create() {
        const body = this.ctx.request.body;
        const rules = {
            title: {required: true, type: 'string', min: 1},
            description: {required: false, type: 'string', min: 1},
        };
        const user = this.ctx.session.userInfo;
        if(!user) {
            return Promise.reject('error: 非登陆状态不允许创建类型');
        }
        try {
            const error = this.ctx.validate(rules, body);
            if(!error) {
                const res = await this.ctx.service.catelogService.create(user);
                console.log('发布新类别成功', res);
                if(res) {
                    this.ctx.redirect('/');
                }
            }
        } catch(err) {
            console.error(err);
        }
    }

    async update() {
        // 用过params catelog_Id获取到要修改的类型的_id
        const catelog_id = this.ctx.query.catelog_id;
        const user = this.ctx.session.userInfo;
        if(!catelog_id) {
            return Promise.reject('error: 类型id为空');
        }
        if(!user) {
            return Promise.reject('error: 非登录状态下不允许修改类型');
        }
        let catelotDetail = await this.ctx.service.catelogService.getCatelogDetail(catelog_id);
        if(!catelotDetail) {
            return Promise.reject('error: 没有找到该类别的详情');
        }
        // 要判断该登录用户是否是该类型的创建用户
        if(catelotDetail.create_user != user._id) {
            return Promise.reject('error: 登录用户不是该类型的创建者，没有权限修改');
        }
        const updatedCatelogDetail = await this.ctx.service.catelogService.update(catelog_id);
        this.ctx.body = updatedCatelogDetail;
        this.ctx.apiResult = { data: updatedCatelogDetail };
    }

    // 还未完成：删除类别之后要将其下的所有文章同时删除
    async delete() {
        // 用过params catelog_Id获取到要修改的类型的_id
        const catelog_id = this.ctx.query.catelog_id;
        const user = this.ctx.session.userInfo;
        if(!catelog_id) {
            return Promise.reject('error: 类型id为空');
        }
        if(!user) {
            return Promise.reject('error: 非登录状态下不允许修改类型');
        }
        let catelotDetail = await this.ctx.service.catelogService.getCatelogDetail(catelog_id);
        if(!catelotDetail) {
            return Promise.reject('error: 没有找到该类别的详情');
        }
        // 要判断该登录用户是否是该类型的创建用户
        if(catelotDetail.create_user != user._id) {
            return Promise.reject('error: 登录用户不是该类型的创建者，没有权限删除');
        }
        const deletedCatelogDetail = await this.ctx.service.catelogService.delete(catelog_id);
        // console.log(updatedCatelogDetail);
        this.ctx.apiResult = { data: deletedCatelogDetail };
        if(deletedCatelogDetail) {
            this.ctx.redirect('/');
        }
    }

    async getCatelogDetail() {
        // 用过params catelog_Id获取到要查看的类型的_id
        const catelog_id = this.ctx.query.catelog_id;
        console.log('在getCatelogDetail中', catelog_id);
        if(!catelog_id) {
            return Promise.reject('error: 类型id为空');
        }
        let catelotDetail = await this.ctx.service.catelogService.getCatelogDetail(catelog_id);
        console.log('getCatelogDetail控制器结果', catelotDetail);
        if(!catelotDetail) {
            return Promise.reject('error: 没有找到该类别的详情');
        }
        this.ctx.body = catelotDetail;
        this.ctx.apiResult = { data: catelotDetail };
    }

    async getAllCatelogsDetail() {
        const allCatelogsDetail = await this.ctx.service.catelogService.getAllCatelogsDetail();
        if(!allCatelogsDetail) {
            return Promise.reject('error: 没有找到任何类别的详情');
        }
        this.ctx.body = allCatelogsDetail;
        this.ctx.apiResult = { data: allCatelogsDetail };
    }
}

module.exports = CatelogController;