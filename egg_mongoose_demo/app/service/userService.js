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
        let onlineUserCount;
        try {
            [onlineUserCount, res] = await Promise.all([
                cacheMethod.getBitCountFromCache(cacheKey.NowOnlineUser.keyName),
                user.save()
            ]);
            // res = await user.save();
            console.log('保存成功', res);
            // 用户信息脱敏
            res.password = '';
            res.salt = '';
            console.log('删除密码成功', res);
            // 保存用户信息至session中，方便后面读取
            this.ctx.session.userInfo = res;
            // 设置登录在线缓存，设置用户上线
            cacheMethod.setBitToCache(cacheKey.NowOnlineUser.keyName, res.id, 1);
            // onlineUserCount = await cacheMethod.getBitCountFromCache(cacheKey.NowOnlineUser.keyName);
        } catch(err) {
            console.log(err);
        }
        
        res.onlineUser = onlineUserCount;
        // res = Object.assign({}, {onlineUser: onlineUserCount}, res);
        console.log(onlineUserCount, res);
        return [onlineUserCount, res];
        // return res;
    }

    async signin() {
        const body = this.ctx.request.body;
        // 看数据库中是否存在此用户信息
        const user = await this.ctx.model.UserModel.findOne({$or: [{"username": body.username}, {"email": body.email}]});
        // 若存在，则验证密码
        let onlineUserCount;
        if(user) {
            const flag = user.authenticatePassword(body.password, user.password, user.getSalt());
            if(flag) {
                // 同时要更新用户的上次登录时间
                user.lastLoginTime = Date.now();
                const res = await user.save();
                // 用户信息脱敏
                res.password = '';
                res.salt = '';
                console.log('登录成功', res);
                this.ctx.session.userInfo = res;
                // 设置登录在线缓存，设置用户上线
                cacheMethod.setBitToCache(cacheKey.NowOnlineUser.keyName, res.id, 1);
                onlineUserCount = cacheMethod.getBitCountFromCache(cacheKey.NowOnlineUser.keyName);
                return [onlineUserCount, res];
            } else {
                return Promise.reject('error: 用户密码不正确');
            }
            return [onlineUserCount, flag];
        } else {
            return Promise.reject('error: 没有找到该用户s');
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

    async getUserDetail(user_id) {
        const where = {
            "_id": user_id,
            "status": 1
        };
        let res;
        try {
            res = await this.ctx.model.UserModel.findOne(where, {
                "id": 1,
                "username": 1,
                "email": 1,
                "registerTime": 1,
                "lastLoginTime": 1
            });
            if(!res) {
                return Promise.reject('error: 没有找到该用户的详情');
            }
        } catch(err) {
            console.error(err);
        }
        return res;
    }
}

module.exports = UserService;