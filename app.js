const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors')
// const dotenv=require('dotenv')
// dotenv.config({path:'./.env'})
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const materialRouter = require('./routes/material');
const app = express();

app.use(cors({origin:"*"}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/material',materialRouter);
module.exports = app;