'use strict'

module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;
    const CommentSchema = new Schema({
        /**
         * 评论内容、评论针对实体、实体objectId、评论用户、评论创建时间、状态吗
         * 评论更新时间、评论删除时间、元数据｛点赞数、点踩数｝
         */
        content: {
            type: String,
            required: true
        },
        create_user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        entity_type: {
            type: String,
            enum: ['article', 'comment'], // 
            default: 'article',
            required: true
        },
        entity_id: {
            type: Schema.Types.ObjectId,
            required: true
        },
        comment: {
            type: [{type: Schema.Types.ObjectId, ref: 'Comment'}],
            ref: 'Comment'
        },
        create_time: {
            type: Date,
            default: Date.now
        },
        update_time: {
            type: Date,
            default: Date.now
        },
        delete_time: {
            type: String,
            default: -1
        },
        status: {
            type: String,
            enum: ['-1', '0', '1'], // -1删除，1正常，0作保留
            default: '1'
        },
        like_info: {
            like_user: {
                type: [{type: Schema.Types.ObjectId, ref: 'User'}],
                ref: 'User'
            }
        },
        dislike_info: {
            dislike_user: {
                type: [{type: Schema.Types.ObjectId, ref: 'User'}],
                ref: 'User'
            }
        },
        meta: {
            like_count: {type: Number, default: 0},
            dislike_count: {type: Number, default: 0},
            comment_count: {type: Number, default: 0}
        }
    });
    return mongoose.model('Comment', CommentSchema);
};