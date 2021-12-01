const { Schema, model } = require('mongoose');

const eventSchema = Schema({
    category: {
        type: String,
        require: true,
    },
    title: {
        type: String,
        require: true,
    },
    desc: {
        type: String,
        require: true,
    },
    date: {
        type: Date,
        require: true,
    },
});

module.exports = model('Event', eventSchema);