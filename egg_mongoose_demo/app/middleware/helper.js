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
    encrypt: (data, key) => {
        const cipher = crypto.createCipher('aes192', key);
        var crypted = cipher.update(data, 'utf8', 'hex');
        crypted += cipher.final('hex');
        return crypted;
    },

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
    }

}