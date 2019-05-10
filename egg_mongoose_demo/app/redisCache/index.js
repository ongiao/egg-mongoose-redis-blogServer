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
    getBitCount,
};

// 设置用户登录状态
async function setBitToCache(keyName, OffsetValue, onOff) {
    await redis.setbit(keyName, OffsetValue, onOff);
}

// 

// 获取bit为1的数量
async function getBitCount(keyName) {
    await redis.bitcount(keyName);
}



