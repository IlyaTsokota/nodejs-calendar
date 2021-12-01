const { Router } = require('express');
const auth = require('../middleware/auth');
const Calendar = require('../models/calendar');
const CalendarUser = require('../models/calendarUser');
const CalendarEvent = require('../models/calendarEvent');
const User = require('../models/user');

const router = Router();

function mapCalendars(calendars) {
    return calendars.map(({ calendarId }) => ({  
        ...calendarId._doc,
        id: calendarId.id,
    }));
}

function mapUsers(users) {
    return users.map(({ userId }) => ({  
        ...userId._doc,
        id: userId.id,
    }));
}

function mapEvents(events) {
    return events.map(({ eventId }) => ({  
        ...eventId._doc,
        id: eventId.id,
    }));
}

router.post('/create', auth, async (req, resp) => {
    try {
        const { name, desc, color } = req.body;

        if (!name.length || !desc.length || !color.length) {
            resp.status(422).json({ error: 'All values must be filled!' })
            return;
        }
        
        const calendar = new Calendar({
            name,
            desc,
            color,
        });

        const calendarUser = new CalendarUser({
            calendarId: calendar,
            userId: req.user,
            isAdmin: true,
        });

        await calendar.save();
        await calendarUser.save();

        resp.status(200).json(null);
        return;
    } catch (e) {
        console.log(e);
    }
});

router.post('/active/:id', auth, async (req, resp) => {
    try {
        const { id } = req.params;
        
        await Calendar.findOneAndUpdate({  _id: id }, {type: 'active'});

        resp.status(200).json(null);
    } catch (e) {
        console.log(e);
    }
});

router.post('/hide/:id', auth, async (req, resp) => {
    try {
        const { id } = req.params;
        
        await Calendar.findOneAndUpdate({ _id: id }, {type: 'hide'});

        resp.status(200).json(null);
    } catch (e) {
        console.log(e);
    }
});

router.post('/delete/:id', auth, async (req, resp) => {
    try {
        const { id } = req.params;

        await Calendar.findOneAndUpdate({ _id: id }, {type: 'delete'});

        resp.status(200).json(null);
    } catch (e) {
        console.log(e);
    }
});

router.get('/add-user/:calendarId', auth, async (req, resp) => {
    try {
        const { calendarId } = req.params;
        
        const calendar = await Calendar.findOne({ _id: calendarId });

        resp.render('calendar/add-user', {
            title: `Calendar ${calendar.name} - Add user`,
            isMain: true,
            calendar,
        });
    } catch (e) {
        console.log(e);
    }
});

router.post('/add-user/:calendarId', auth, async (req, resp) => {
    try {
        const { calendarId } = req.params;
        const { login, isAdmin } = req.body;

        const user = await User.findOne({ login });
       
        if (user && user._id.toString() !== req.user._id.toString()) {
            const calendarUser = new CalendarUser({
                calendarId,
                userId: user,
                isAdmin,
            });

            await calendarUser.save();
            return resp.redirect('/');
        }
        
        const calendar = await Calendar.findOne({ _id: calendarId });

        resp.render('calendar/add-user', {
            title: `Calendar ${calendar.name} - Add user`,
            isMain: true,
            calendar,
            error: 'User not found!'
        });
    } catch (e) {
        console.log(e);
    }
});

router.get('/edit/:calendarId', auth, async (req, resp) => {
    try {
        const { calendarId } = req.params;
        
        const calendar = await Calendar.findOne({ _id: calendarId });
        const users = await CalendarUser.find({ calendarId }).populate({
            path: 'userId',
        });;

        resp.render('calendar/edit', {
            title: `Edit calendar - ${calendar.name}`,
            isMain: true,
            calendar,
            users: mapUsers(users), 
        });
    } catch (e) {
        console.log(e);
    }
});

router.post('/edit/:calendarId', auth, async (req, resp) => {
    try {
        const { calendarId } = req.params;
        
        const calendar = await Calendar.findOne({ _id: calendarId });

        Object.assign(calendar, req.body);

        await calendar.save();

        resp.redirect('/calendar/edit/' + calendarId);
    } catch (e) {
        console.log(e);
    }
});

router.get('/:calendarId', auth, async (req, resp) => {
    try {
        const { calendarId } = req.params;
        const calendar = await Calendar.findOne({ _id: calendarId });

        resp.render('calendar/index', {
            title: `Show calendar - ${calendar.name}`,
            calendar,
        });
    } catch (e) {
        console.log(e);
    }
});

router.post('/events', auth, async (req, resp) => {
    try {
        const { id: calendarId, date } = req.body;
        
        let events = await CalendarEvent.find({ calendarId }).populate({
            path: 'eventId',
            match: { date },
        });

        events = events.filter(({eventId}) => eventId);
        
        if (events.length) {
            const mappedEvents = mapEvents(events);
            resp.status(200).json(mappedEvents);
        } else {
            resp.status(200).json(null);
        }
    } catch (e) {
        console.log(e);
    }
});

module.exports = router;
