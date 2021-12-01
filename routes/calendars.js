const { Router } = require('express');
const auth = require('../middleware/auth');
const Calendar = require('../models/calendar');
const CalendarUser = require('../models/calendarUser');

const router = Router();

function mapCalendars(calendars) {
    return calendars.map(({ calendarId, isAdmin }) => ({  
        ...calendarId._doc,
        id: calendarId.id,
        isAdmin,
    }));
}

router.get('/:type', auth, async (req, resp) => {
    try {
        const type = req.params.type || 'active';
        let calendars = await CalendarUser.find({ userId: req.user})
            .populate({
                path: 'calendarId',
                match: { type },
            });
            
        resp.render('index', {
            title: 'Calendars',
            isMain: true,
            calendars: mapCalendars(calendars.filter(({ calendarId }) => calendarId)),
            type: type.toUpperCase(),
        });
    } catch (e) {
        console.log(e);
    }
});

module.exports = router;
