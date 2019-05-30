'use strict'

const Service = require('egg').Service;
const cacheMethod = require('../redisCache/index');
const cacheKey = require('../redisCache/keys');

class UserRelationService extends Service {

    async follow(fromId, toId) {
        const score = new Date().getTime();
        const follow_keyName = `${cacheKey.follow.keyName}:${fromId}`;
        const fans_keyName = `${cacheKey.fans.keyName}:${toId}`;
        const expire = cacheKey.follow.expire || cacheKey.fans.expire;
        const [res_1, res_2] = await Promise.all([
            cacheMethod.zaddToCache(follow_keyName, score, toId, expire),
            cacheMethod.zaddToCache(fans_keyName, score, fromId, expire)
        ]);
        return [res_1, res_2];
    }
}

module.exports = UserRelationService;