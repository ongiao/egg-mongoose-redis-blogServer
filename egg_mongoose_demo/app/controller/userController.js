'user strict';

const Controller = require('egg').Controller;

class UserController extends Controller {

    // 用户注册
    async signup() {
        const rules = {
            username: { required: true, type: 'string', min: 1, max: 15},
            password: { required: true, type: 'string', min: 6, max: 20},
            email: { required: true, type: 'email'},
        };
        try {
            const error = this.ctx.validate(rules, this.ctx.request.body);
            console.log('错误', error);
            if(!error) {
                const result = await this.ctx.service.userService.signup();
                console.log('注册成功', result);
                
                if(result) {
                    this.ctx.redirect('/');
                }
            }
        } catch(err) {
            console.error(err);
        }
    }

    // 用户登录
    async signin() {
        const rules = {
            // 登录可用用户名+密码、邮箱+密码两种方式登录
            username: { required: true, type: 'string', min: 1, max: 15},
            password: { required: true, type: 'string', min: 6, max: 20},
            email: { required: false, type: 'email'},
        };
        try {
            const error = this.ctx.validate(rules, this.ctx.request.body);
            console.log('错误', error);
            if(error) {
                ;
            } else {
                const user = await this.ctx.service.userService.signin();
                this.ctx.redirect('/');
            }
        } catch(err) {
            console.error(err);
        }
    }

    // 用户退出登录
    async signout() {
        const res = await this.ctx.service.userService.signout();
        console.log('退出登录', this.ctx.session.userInfo);
        this.ctx.redirect('/');
    }

    // // 用户注销（暂不提供该接口）
    // async cancelAccount() {
    //     // 只允许注销自己的账户
    //     let res = await this.ctx.service.userService.cancelAccount();
    // }

    async getUserDetail() {
        const user_id = this.ctx.query.user_id;
        if(!user_id) {
            return Promise.reject('error: 缺少必要参数user_id');
        }
        const userDetail = await this.ctx.service.userService.getUserDetail(user_id);
        if(!userDetail) {
            return Promise.reject('error: 没有找到该用户的详情');
        }
        this.ctx.body = userDetail;
        this.ctx.apiResult = { data: userDetail };
    }
}
module.exports = UserController;