// This code is for viewing purposes only. Not licensed for reuse or distribution.

const path = require('path');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const badgeRouter = require('./routes/badgeRoutes');
const friendshipRouter = require('./routes/friendshipRoutes');
const rankRouter = require('./routes/rankRoutes');
const practiceRouter = require('./routes/practiceRoutes');
const AppError = require('./utils/appError');
const rateLimiters = require('./middlewares/rateLimiters');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.use(helmet.contentSecurityPolicy({}));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(rateLimiters.apiLimiter);

app.use(
  express.json({
    limit: '10kb',
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '10kb',
  })
);

app.use(cookieParser());

app.use(mongoSanitize());

app.use(
  hpp({
    whitelist: [],
  })
);

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/badges', badgeRouter);
app.use('/api/ranks', rankRouter);
app.use('/api/friendship', friendshipRouter);
app.use('/api/practice', practiceRouter);

app.use('/.well-known', (req, res, next) => {
  res.status(204).send();
});

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
