'use strict'

const crypto = require('crypto');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// 计数器，插入模型的id（自增唯一标识，类似autoincrementID），可用于redis setbit中的offset
const counterSchema = new Schema({
    _id: { type: String, require: true },
    seq: { type: Number, default: 0 }
});
counterSchema.index({ _id: 1, seq: 1 }, { unique: true });
const counterModel = mongoose.model('counter', counterSchema);

module.exports =  {
    // 加密
    encrypt: (data, key) => {
        const cipher = crypto.createCipher('aes192', key);
        var crypted = cipher.update(data, 'utf8', 'hex');
        crypted += cipher.final('hex');
        return crypted;
    },

    // 解密
    decrypt: (encrypted, key) => {
        const decipher = crypto.createDecipher('aes192', key);
        var decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    },

    // 自增每个模型的id
    autoIncrementModelId: (modelName, doc, next) => {
        counterModel.findByIdAndUpdate(        // ** Method call begins **
            modelName,                           // The ID to find for in counters model
            { $inc: { seq: 1 } },                // The update
            { new: true, upsert: true },         // The options
            function (error, counter) {           // The callback
                if (error) return next(error);

                doc.id = counter.seq;
                next();
            }
        );                                     // ** Method call ends **
    },

    // 定时器，作定时任务
    timeOutTask: (fn, argss, timeout) => {
        var func = fn;
        var args = argss;
        setTimeout(async () => {
            return await func(args);
        }, timeout);
    },

    // 点赞点踩反转
    likeDislikeConvert: (entity, type, user) => {
        console.log('在点赞点踩中间件中', entity);
        if(type === 'like') {
            const dislikeItem = entity.dislike_info.dislike_user;
            if(dislikeItem != undefined) {
                for(let index = 0; index < dislikeItem.length; index++) {
                    // 如果有该用户，删除该用户并数量-1
                    if(dislikeItem[index].toString() === user._id.toString()) {
                        dislikeItem.splice(index, 1);
                        entity.meta.dislike_count -= 1;
                    }
                }
            }   
        } else if(type === 'dislike') {
            const likeItem = entity.like_info.like_user;
            if(likeItem != undefined) {
                for(let index = 0; index < likeItem.length; index++) {
                    // 如果有该用户，删除该用户并数量-1
                    if(likeItem[index].toString() === user._id.toString()) {
                        likeItem.splice(index, 1);
                        entity.meta.like_count -= 1;
                    }
                }
            }
            console.log(entity);
        }
    }
}