const path = require('path');
const csrf = require('csurf');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const Handlebars = require('handlebars');
const exphbs = require('express-handlebars');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongodb-session')(session);
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const homeRoutes = require('./routes/home');
const profileRoutes = require('./routes/profile');
const authRoutes = require('./routes/auth');
const calendarRoutes = require('./routes/calendar');
const calendarsRoutes = require('./routes/calendars');
const eventRoutes = require('./routes/event');

const varMiddleware = require('./middleware/variables');
const userMiddleware = require('./middleware/user');
const errorHandler = require('./middleware/error');
const fileMiddleware = require('./middleware/file');

const config = require('./config');
const app = express();

const { PORT = 3000 } = process.env;

const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs',
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    helpers: require('./utils/hbs-helpers'),
});

const store = new MongoStore({
    collection: 'sessions',
    uri: config.MONGODB_URI,
});

app.engine('hbs', hbs.engine);

app.set('view engine', 'hbs');
app.set('views', 'views');

app.use(session({
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store,
}));

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(fileMiddleware.single('avatar'));
app.use(cookieParser())
app.use(csrf({ cookie: true }))
app.use(flash());
app.use(helmet({
    contentSecurityPolicy: false,
}));
app.use(express.json())
app.use(compression());

app.use(varMiddleware);
app.use(userMiddleware);

app.use('/', homeRoutes);
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/calendar', calendarRoutes);
app.use('/calendars', calendarsRoutes);
app.use('/event', eventRoutes);

app.use(errorHandler);

async function start() {
    try {
        await mongoose.connect(config.MONGODB_URI, {
            useNewUrlParser: true,
        });

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (e) {
        console.log(e);
    }
}

start();
