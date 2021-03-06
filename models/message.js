const { Schema, model } = require('mongoose');

const messageSchema = Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true, 
    },
    body: {
        type: String,
        required: true, 
    },
    date: {
        type: Date,
        required: true,
        default: Date.now()
    },
});

module.exports = model('Message', messageSchema);