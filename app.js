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
const taskRouter=require('./routes/task');
const projectRouter=require('./routes/project');
const project_toolRouter=require('./routes/project_tool');
const project_materialRouter=require('./routes/project_material');
const jobSearchRouter = require('./routes/jobSearchRoutes'); // Import the job search route

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
app.use('/task',taskRouter);
app.use('/project_tool',project_toolRouter);
app.use('/project_material',project_materialRouter);
app.use('/jobs', jobSearchRouter); // Mount the job search route

module.exports = app;