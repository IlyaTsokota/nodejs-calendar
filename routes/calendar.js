const { Router } = require('express');
const auth = require('../middleware/auth');
const Calendar = require('../models/calendar');
const CalendarUser = require('../models/calendarUser');
const User = require('../models/user');

const router = Router();

function mapCalendars(calendars) {
    return calendars.map(({ calendarId }) => ({  
        ...calendarId._doc,
        id: calendarId.id,
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
        
        const calendar = await Calendar({ _id: calendarId });

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
        const { login, isAdmin } = req.body;

        const user = await User.findOne({ login });
       
        if (user) {
            const calendarUser = new CalendarUser({
                calendarId,
                userId: user,
                isAdmin,
            });

            await calendarUser.save();
            return resp.redirect('/');
        }
       
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

module.exports = router;
