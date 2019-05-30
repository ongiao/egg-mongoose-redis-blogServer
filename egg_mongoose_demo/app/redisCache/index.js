'use strict'

// const config = require('../../config/config.default');
const cacheKey = require('./keys');
const Redis = require('ioredis');
const redisConfig = {
    port: 6379,
    host: '127.0.0.1',
    family: 4 
}
const redis = new Redis({
    port: redisConfig.port,
    host: redisConfig.host,
    family: redisConfig.family
});

redis.on( 'connect', () => {
    console.info('Redis连接成功');
    console.info(`[Redis Info]: ${redisConfig.host}:${redisConfig.port}`);
});

redis.on('error', (err) => {
    console.error('Redis连接失败', err.message);
    console.info(`[Redis Info]: ${redisConfig.host}:${redisConfig.port}`);
});

// 下面是常用的redis操作方法
module.exports = {
    setBitToCache,
    getBitFromCache,
    getBitCountFromCache,
    increKeyValueToCache,
    upsertSetToCache,
    scardFromCache,
    saddToCache,
    zaddToCache

};

// 设置或清空bitmap中的offset位置（默认设置为1）
async function setBitToCache(keyName, offset, value = 1) {
    return await redis.setbit(keyName, offset, value);
}

// 获取字符串offset位置的bit值，不存在返回0
async function getBitFromCache(keyName, offset) {
    return await redis.getbit(keyName, offset);    
}

// 获取bitmap中1的数量
async function getBitCountFromCache(keyName) {
    return await redis.bitcount(keyName);
}

// 字符串缓存自增1
async function increKeyValueToCache(keyName, value = 1) {
    return await redis.incrby(keyName, value);
}

// 判断是否有对应key的集合，没有则生成，防止为空下次继续走sql，无值默认插入0
async function upsertSetToCache(keyName, fn, expire) {
    let result = await scardFromCache(keyName) || 0;
    if(!result && typeof fn === 'function') {
        const results = await fn();
        if(results && results.length > 0) {
            result = results.length;
            await saddToCache(keyName, results, expire);
        }
    }
    return result;
}

// 获取集合元素个数
async function scardFromCache(keyName) {
    return redis.scard(keyName);
}

// 集合中添加元素
async function saddToCache(keyName, content, expire) {
    return redis.sadd(keyName, content)
    .then(() => {
        if(expire) {
            return redis.expire(keyName, expire);
        } else {
            return null;
        }
    });
}

// 向有序集合汇总添加元素
async function zaddToCache(keyName, score, content, expire) {
    return redis.zadd(keyName, [score, content])
    .then(() => {
        if(expire) {
            return redis.expire(keyName, expire);
        } else {
            return null;
        }
    });
}




