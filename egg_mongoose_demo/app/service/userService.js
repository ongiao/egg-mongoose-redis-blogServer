'use strict'

const Service = require('egg').Service;
const cacheMethod = require('../redisCache/index');
const cacheKey = require('../redisCache/keys');

class UserService extends Service {

    async signup() {
        const user                  = new this.ctx.model.UserModel(this.ctx.request.body);
        var registerAndLoginTime    = Date.now();
        user.registerTime           = registerAndLoginTime;
        user.lastLoginTime          = registerAndLoginTime;
        user.salt                   = user.makeSalt();
        user.password               = user.encryptPassword(user.password, user.getSalt());
        let res = null;
        try {
            res = await user.save();
            console.log('保存成功', res);
            // 在返回的结果中清空密码，脱敏
            res.password = '';
            console.log('删除密码成功', res);
            // 保存用户信息至session中，方便以后读取
            this.ctx.session.userInfo = res;
            // 设置登录在线缓存，设置用户上线
            cacheMethod.setBitToCache(cacheKey.NowOnlineUser.keyName, res.id, 1);
        } catch(err) {
            console.log(err);
        }
        return res;
    }

    async signin() {
        const body = this.ctx.request.body;
        // 看数据库中是否存在此用户信息
        const user = await this.ctx.model.UserModel.findOne({$or: [{"username": body.username}, {"email": body.email}]});
        // 若存在，则验证密码
        if(user) {
            const flag = user.authenticatePassword(body.password, user.password, user.getSalt());
            if(flag) {
                user.password = '';
                console.log('登录成功', user);
                this.ctx.session.userInfo = user;
                // 设置登录在线缓存，设置用户上线
                cacheMethod.setBitToCache(cacheKey.NowOnlineUser.keyName, user.id, 1);
                return user;
            }
            return flag;
        }
    }

    async signout() {
        let flag;
        if(this.ctx.session.userInfo) {
            // 设置登录在线缓存，设置用户下线
            cacheMethod.setBitToCache(cacheKey.NowOnlineUser.keyName, this.ctx.session.userInfo.id, 0);
            this.ctx.session.userInfo = null;
            flag = true;
        } else {
            flag = false;
        }
        return flag;
    }

    // async cancelAccount() {

    // }
}

module.exports = UserService;