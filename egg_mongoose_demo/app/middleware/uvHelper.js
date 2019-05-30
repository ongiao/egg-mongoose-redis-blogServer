'use strict'
const cacheKey = require('../redisCache/keys');
const cacheMethod = require('../redisCache/index');
const UvRecordModel = require('../model/UvRecordModel');

module.exports = app => {
    updateUv,
    uvsToRedis,
    getUVsFromDB
};

async function updateUv(sourceType, objectId, userObjectId) {
    const keyName = `${cacheKey.uv.keyName}:${sourceType}-${objectId}`;
    const expire = cacheKey.uv.expire;
    await uvsToRedis(sourceType, objectId);
    await this.ctx.model.UvRecordModel.update({
        "sourceType": sourceType,
        "objectId": objectId
    }, 
    {$addToSet: {"userIds": userObjectId}},
    {upsert: true});
}

// uv入缓存
async function uvsToRedis(sourceType,objectId) {
    const keyName = `${cacheKey.uv.keyName}:${sourceType}-${objectId}`;
    const expire = cacheKey.uv.expire;
    return cacheMethod.upsertSetToCache(keyName, getUVsFromDB.bind(null, sourceType, objectId), expire);
}

// 从数据库中获取某一资源的uv
async function getUVsFromDB(sourceType, objectId) {
    const results = await UvRecordModel.findOne(
        {
            "sourceType": sourceType,
            "objectId": objectId
        }, 
        {
            _id: 0,
            userIds: 1
        });
    return results ? results.userIds : []; 
}