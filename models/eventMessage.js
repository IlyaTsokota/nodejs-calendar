const { Schema, model } = require('mongoose');

const eventMessageSchema = Schema({
    messageId: {
        type: Schema.Types.ObjectId,
        ref: 'Message',
        required: true,
    },
    eventId: {
        type: Schema.Types.ObjectId,
        ref: 'Event',
        required: true,
    },
});

module.exports = model('EventMessage', eventMessageSchema);