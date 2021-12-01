const { Schema, model } = require('mongoose');

const calendarEventSchema = Schema({
    calendarId: {
        type: Schema.Types.ObjectId,
        ref: 'Calendar',
        required: true,
    },
    eventId: {
        type: Schema.Types.ObjectId,
        ref: 'Event',
        required: true,
    },
});

module.exports = model('CalendarEvent', calendarEventSchema);