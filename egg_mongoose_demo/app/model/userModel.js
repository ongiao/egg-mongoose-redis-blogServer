'use strict';

const { encrypt, decrypt, autoIncrementModelId } = require('../middleware/helper');

module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;

    const UserSchema = new Schema(
        {
            id: {
                type: Number,
                unique: true,
                min: 1
            },
            username: {
                type: String,
                unique: true,
                minlength: 1,
                maxlength: 15,
                match: /[a-zA-Z0-9]+/
            },
            password: {
                type: String
            },
            salt: {
                type: String,
                default: ''
            },
            email: {
                type: String,
                unique: true
            },
            status: {
                type: String,
                enum: ['-1', '0', '1'],
                default: 1
            }, // 状态1为正常，-1为用户已删除，0作保留值
            registerTime: {
                type: Date,
                default: new Date()
            },
            lastLoginTime: {
                type: Date
            },
        }
    );
    UserSchema.methods = {
        // 产生盐值
        makeSalt() {
            return Date.now();
        },

        // 获取该用户盐值
        getSalt() {
            return this.salt;
        },

        //  加密密码
        encryptPassword(password, salt) {
            return encrypt(password, salt);
        },

        // 验证密码
        authenticatePassword(password, encryptedPassword, salt) {
            return password === decrypt(encryptedPassword, salt);
        }
    };
    UserSchema.pre('save', function(next) {
        if(!this.isNew) {
            next();
            return;
        }
        autoIncrementModelId('RegisteredUser', this, next);
    });
    return mongoose.model('User', UserSchema);
}