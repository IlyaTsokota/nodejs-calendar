const { body } = require('express-validator');
const User = require('../models/user');

const errorMessageMap = {
    login: 'Login must be at least 3 characters',
    firstName: 'First name must be at least 3 characters',
    lastName: 'Last name must be at least 3 characters',
}

const validationFiledMap = {
    email: () => body('email')
        .isEmail()
        .withMessage('Enter valid email')
        .trim(),
    password: () => body('password', 'Password must be at least 6 characters')
        .isLength({ min:6, max: 56 })
        .isAlphanumeric()
        .trim(),
    confirmPassword: () => body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords must match');
            }
            return true;
        }).trim(),
    text: (name) => body(name)
        .isLength({ min: 3 })
        .withMessage(errorMessageMap[name])
        .trim(),
};

exports.registerValidators = [
    validationFiledMap.email().custom(async (value) => {
            try {   
                const user = await User.findOne({ email: value });
                if (user) {
                    return Promise.reject('This email is already taken');
                }
            } catch (e) {
                console.log(e);
            }
        }),
    validationFiledMap.text('login').custom(async (value) => {
        try {   
            const user = await User.findOne({ login: value });
            if (user) {
                return Promise.reject('This login is already taken');
            }
        } catch (e) {
            console.log(e);
        }
    }),
    validationFiledMap.text('firstName'),
    validationFiledMap.text('lastName'),
    validationFiledMap.password(),
    validationFiledMap.confirmPassword(),
];

exports.loginValidators = [
    validationFiledMap.text('login'),
    validationFiledMap.password(),
];
