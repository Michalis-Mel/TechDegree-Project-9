'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const bcryptjs = require('bcryptjs');
const Sequelize = require('sequelize');
const { Op, json } = require('sequelize');
const auth = require('basic-auth');
const { authenticateUser } = require('./middleware/auth-user');
const { asyncHandler } = require('./middleware/asyncHandler');
const { body, validationResult } = require('express-validator');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'fsjstd-restapi.db'
});

// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

//variables
const Course = require('./models').Course;
const User = require('./models').User;

// create the Express app
const app = express();

// setup morgan which gives us http request logging
app.use(morgan('dev'));
app.use(express.json());

//Checking if the connection to database is successful
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection to the database successful!');
  } catch (error) {
    console.error('Error connecting to the database: ', error);
  }
})();


// TODO setup your api routes here

//Returns the currently authenticated user
app.get('/api/users', authenticateUser, asyncHandler(async(req,res) => {
  const currentUser = req.currentUser;
  const users = await User.findAll({
    where: {
      emailAddress: currentUser.emailAddress
    },
    attributes: ['id', 'firstName', 'lastName', 'emailAddress']
  });
  res.status(200).json(users)
}))

//Creates a user, sets the Location header to "/", and returns no content
app.post('/api/users', asyncHandler(async(req,res) => {
  let existing;
  let user;
  try{
    user = req.body;
    console.log(req.body);
    if(user.password){
      user.password = bcryptjs.hashSync(user.password);
    }
    if(user.emailAddress){
       existing = await User.findOne({
        where: {
          emailAddress: {
            [Op.eq] : user.emailAddress
          }
        }
      })
    }
    if(!existing){
      await User.create(user);
      res.status(201).location('/').end()
    } else {
      res.status(400).json({"Error": "Woops, that email already exists"})
    }
  } catch(error){
    if(error.name === "SequelizeValidationError") {
      console.log(req.body);
      res.status(400).json({"Error" : error.message})
    } else {
      throw error
    }
  }
  
}))

//Returns a list of courses (including the user that owns each course)
app.get('/api/courses', asyncHandler(async(req,res) => {
  
}))

//Returns the course (including the user that owns the course) for the provided course ID
app.get('/api/courses/:id', asyncHandler(async(req,res) => {
  //200
}))

//Creates a course, sets the Location header to the URI for the course, and returns no content
app.post('/api/courses', asyncHandler(async(req,res) => {
  //201
}))

//Updates a course and returns no content
app.put('/api/courses/:id', asyncHandler(async(req,res) => {
  //204
}))

//Deletes a course and returns no content
app.delete('/api/courses/:id', asyncHandler(async(req,res) => {
  //204
}))


// setup a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});

// set our port
app.set('port', process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});
