'use strict'

module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;
    const CollectionSchema = new Schema({
        collection_name:{
            type: String,
            required: true
        },
        collection_description: {
            type: String,
            required: false
        },
        create_user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        ownsArticle_ids: {
            type: [{type: Schema.Types.ObjectId, ref: 'Article'}],
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
        meta: {
            collect_count: {type: Number, default: 0}
        }
    });
    return mongoose.model('Collection', CollectionSchema);
}