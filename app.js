const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const materialRouter = require('./routes/material');
const toolRouter = require('./routes/tool');
const skillRouter=require('./routes/skill');
//const storeRouter=require('./routes/store');
const projectRouter=require('./routes/project');
const app = express();

app.use(cors({origin:"*"}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/material',materialRouter);
app.use('/tool',toolRouter);
app.use('/skill',skillRouter);
//app.use('/store',storeRouter);
app.use('/project',projectRouter);
module.exports = app;