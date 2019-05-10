'use strict'

module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;
    const CatelogSchema = new Schema({
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            default: '',
            required: false
        },
        // content: {
        //     type: String,
        //     default: '',
        //     required: false
        // },
        // 种类下拥有的文章（存文章_id）
        ownsArticle_ids: {
            type: [{type: Schema.Types.ObjectId, ref: 'Article'}],
        },
        create_user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        create_time: {
            type: Date,
            default: Date.now,
        },
        update_time: {
            type: Date,
            default: Date.now,
        },
        delete_time: {
            type: String,
            default: '-1'
        },
        status: {
            type: String,
            enum: ['-1', '0', '1'], // -1删除，1正常，0作保留
            default: '1'
        }
    });
    return mongoose.model('Catelog', CatelogSchema);
}