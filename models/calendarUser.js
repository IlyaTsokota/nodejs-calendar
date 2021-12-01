const { Schema, model } = require('mongoose');

const calendarUserSchema = Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    calendarId: {
        type: Schema.Types.ObjectId,
        ref: 'Calendar',
        required: true,
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false,
    },
    isSendNotification: {
        type: Boolean,
        required: true,
        default: true,
    },
});

module.exports = model('CalendarUser', calendarUserSchema);