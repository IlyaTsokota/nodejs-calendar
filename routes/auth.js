const { Router } = require('express');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const regEmail = require('../emails/registration');
const resetEmail = require('../emails/reset');
const transporter = require('../utils/transporter-mailer');
const { registerValidators, loginValidators } = require('../utils/validators');
const Calendar = require('../models/calendar');
const CalendarUser = require('../models/calendarUser');
const router = Router();

router.get('/login', async(req, resp) => {
    resp.render('auth/login', {
        title: 'Login',
        isLogin: true,
        error: req.flash('error'),
    });
});

router.get('/register', async(req, resp) => {
    resp.render('auth/register', {
        title: 'Register',
        isRegister: true,
        error: req.flash('error'),
    });
});

router.get('/logout', async(req, resp) => {
    req.session.destroy(() => {
        resp.redirect('/auth/login');
    });
});

router.post('/login', loginValidators, async(req, resp) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return resp.status(422).render('auth/login', {
                title: 'Login',
                isLogin: true,
                error: errors.array()[0].msg,
                data: {
                    ...req.body 
                },
            });
        }

        const { login, password } = req.body;
        const candidate = await User.findOne({ login });

        if (candidate &&  await bcrypt.compare(password, candidate.password)) {
            req.session.user = candidate;
            req.session.isAuthentificated = true;
            req.session.save((err) => {
                if (err) {
                    throw err;
                }

                resp.redirect('/');
            })
        } else {
            return resp.status(422).render('auth/login', {
                title: 'Login',
                isLogin: true,
                error: 'Invalid login or password!',
                data: {
                    ...req.body 
                },
            });
        }
    } catch (e) {
        console.log(e);
    }
});


router.post('/register', registerValidators , async(req, resp) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return resp.status(422).render('auth/register', {
                title: 'Register',
                isRegister: true,
                error: errors.array()[0].msg,
                data: {
                    ...req.body 
                },
            });
        }

        const { login, email, firstName, lastName, password } = req.body;
        const hashPassword = await bcrypt.hash(password, 10);
        const user = new User({
            login,
            email,
            firstName,
            lastName,
            password: hashPassword,
        });

        const calendar = new Calendar({
            name: 'Default calendar',
            desc: "This is default calendar!",
            color: '#000',
        });

        const calendarUser = new CalendarUser({
            calendarId: calendar,
            userId: user,
            isAdmin: true,
        });
        
        await user.save();
        await calendar.save();
        await calendarUser.save();

        resp.redirect('/auth/login');
        await transporter.sendMail(regEmail(email));
    } catch (e) {
        console.log(e);
    }
});


router.get('/reset', (req, resp) => {
    resp.render('auth/reset', {
        title: 'Забыли пароль?',
        error: req.flash('error'),
    });
});

router.post('/reset', (req, resp) => {
    try {
        crypto.randomBytes(32, async(err, buffer) => {
            if (err) {
                req.flash('error', 'Что-то пошло не так, повторите попытку позже!');
                return resp.redirect('/auth/reset')
            }

            const candidate = await User.findOne({ email: req.body.email })

            if (candidate) {
                const token = buffer.toString('hex');
                candidate.resetToken = token;
                candidate.resetTokenExp = Date.now() + 60 * 60 * 1000;

                await candidate.save();
                resp.redirect('/auth/login');
                await transporter.sendMail(resetEmail(candidate.email, token));
            } else {
                req.flash('error', 'Такого email нет!');
                resp.redirect('/auth/reset')
            }
        });
    } catch (e) {
        console.log(e);
    }
});

router.get('/password/:token', async(req, resp) => {
    const token = req.params.token;
    if (!token) {
        return resp.redirect('/auth/login');
    }

    try {
        const user = await User.findOne({
            resetToken: token,
            resetTokenExp: { $gt: Date.now() },
        });

        if (!user) {
            return resp.redirect('/auth/login');
        }

        resp.render('auth/reset-password', {
            title: 'Забыли пароль?',
            error: req.flash('error'),
            userId: user._id,
            token,
        });
    } catch (e) {
        console.log(e);
    }
});

router.post('/password', async (req, resp) => {
    try {
        const { token, userId, password } = req.body;
        const user = await User.findOne({
            _id: userId,
            resetToken: token,
            resetTokenExp: { $gt: Date.now() },
        });

        if (!user) {
            req.flash('error', 'Token has expired');
            return resp.redirect('/auth/login');
        }
        const newPassword = await bcrypt.hash(password, 10);
        user.password = newPassword;
        user.resetToken = undefined;
        user.resetTokenExp = undefined;
        await user.save();
        resp.redirect('/auth/login');
    } catch (e) {
        console.log(e);
    }
});

module.exports = router;
