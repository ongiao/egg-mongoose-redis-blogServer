'use strict'

module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;
    // article-5cd662c3f6f2351dc0e9f3aa:[userIds...]
    const UvRecordSchema = new Schema({
        sourceType: {
            type: String,
            default: '',
            comment: '资源的类型，如article文章，note笔记，comment其他用户评论等'
        },
        objectId: {
            type: Schema.Types.ObjectId,
            required: true
        },
        userIds: [
            {type: Schema.Types.ObjectId, ref: 'User'}
        ],
    });
    return mongoose.model('UvRecord', UvRecordSchema);
};