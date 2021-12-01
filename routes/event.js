const { Router } = require('express');
const auth = require('../middleware/auth');
const CalendarEvent = require('../models/calendarEvent');
const Event = require('../models/event');
const Message = require('../models/message');
const EventMessage = require('../models/eventMessage');
const router = Router();

function mapMessages(messages) {
    return messages.map(({ messageId }) => ({  
        ...messageId._doc,
        id: messageId.id,
    }));
}

router.get('/:id', auth, async (req, resp) => {
    try {
        const { id } = req.params;

        const event = await Event.findOne({ _id: id });
        let messages = await EventMessage.find({eventId: id}).populate('messageId');

        messages = messages.filter(({messageId}) => messageId).reverse();

        resp.render('calendar/event', {
            title: 'Event: ' + event.title,
            event,
            messages: messages.length ? mapMessages(messages) : null,
        });
    } catch (e) {
        console.log(e);
    }
});

router.post('/add', auth, async (req, resp) => {
    try {
        const { title, desc, category, date, calendarId } = req.body;
        console.log(req.body);

        if (!title.length || !desc.length || !category.length) {
            resp.status(422).json({ error: 'All values must be filled!' })
            return;
        }

        const event = new Event({
            title,
            desc,
            category,
            date,
        });

        const calendarEvent = new CalendarEvent({
            calendarId,
            eventId: event,
        });

        await event.save();
        await calendarEvent.save();

        resp.status(200).json(null);
        return;
    } catch (e) {
        console.log(e);
    }
});

router.post('/message/add/', auth, async (req, resp) => {
    try {
        const { id, body } = req.body;

        const message = new Message({
            userId: req.user,
            body,
        });

        const eventMessage = new EventMessage({
            messageId: message,
            eventId: id,
        });

        await message.save();
        await eventMessage.save();
        resp.redirect('/event/'+ id);
    } catch (e) {
        console.log(e);
    }
});

module.exports = router;
