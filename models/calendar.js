const { Schema, model } = require('mongoose');

const calendarSchema = Schema({
    name: {
        type: String,
        require: true,
    },
    desc: {
        type: String,
        require: true,
    },
    color: {
        type: String,
        require: true,
    },
    type: {
        type: String,
        require: true,
        default: 'active',
        enum: ['active', 'hide', 'delete'],
    },
});

module.exports = model('Calendar', calendarSchema);
