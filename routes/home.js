const { Router } = require('express');
const auth = require('../middleware/auth');
const router = Router();

router.get('/', auth, (req, resp) => {
    resp.redirect('/calendars/active');
});

module.exports = router;
