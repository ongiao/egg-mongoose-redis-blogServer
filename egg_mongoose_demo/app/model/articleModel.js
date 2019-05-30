'use strict'

module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;
    const ArticleSchema = new Schema({
        /**
         * 标题、内容、创建作者、创建时间、更新时间、删除时间、状态码、
         * 所属类别、标签、元数据｛浏览量、喜欢数、评论数｝
         */
        title: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        },
        create_user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
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
            default: '-1'
        },
        status: {
            type: String,
            enum: ['-1', '0', '1'], // -1删除，1正常，0作保留
            default: '1'
        },
        catelog: {
            type: Schema.Types.ObjectId,
            ref: 'Catelog'
        },
        comment: {
            type: [{type: Schema.Types.ObjectId, ref: 'Comment'}],
            ref: 'Comment'
        },
        // tags: {
        //     type: [{type: Schema.Types.ObjectId, ref: 'Tag'}]
        // },
        like_info: {
            like_user: {
                type: [{type: Schema.Types.ObjectId, ref: 'User'}],
                default: [],
                ref: 'User'
            }
        },
        dislike_info: {
            dislike_user: {
                type: [{type: Schema.Types.ObjectId, ref: 'User'}],
                default: [],
                ref: 'User'
            }
        },
        meta: {
            view_count: {type: Number, default: 0},
            like_count: {type: Number, default: 0},
            dislike_count: {type: Number, default: 0},
            comment_count: {type: Number, default: 0}
        }
    });
    return mongoose.model('Article', ArticleSchema);
}