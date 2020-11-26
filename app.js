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

//Synchronizing the models with the database.
(async () => {

  try {
    await sequelize.sync()
    console.log("Models successfully synchronize")

  }catch(error) {
    console.log("There was an error synchronizing the models to the data base")
  }

})();


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
    const courses = await Course.findAll({
      attributes: ["id", "userId", "title", "description", "estimatedTime", "materialsNeeded"],
      include: [{
        attributes: ["id", "firstName", "lastName", "emailAddress"],
        model:User
      }]
    });
    res.json(courses);
}))

//Returns the course (including the user that owns the course) for the provided course ID
app.get('/api/courses/:id', asyncHandler(async(req,res) => {
  const course = await Course.findOne({
    where: {id: req.params.id},
    attributes: ["id", "userId", "title", "description", "estimatedTime", "materialsNeeded"],
    include: {
      attributes: ["id", "firstName", "lastName", "emailAddress"],
      model:User
    }
  });
  if (course) {
    res.json(course);
  } else {
    res.status(404).json({"Error" : "Course not found!"})    
  }    
  
}))

//Creates a course, sets the Location header to the URI for the course, and returns no content
app.post('/api/courses', authenticateUser, asyncHandler(async(req,res) => {
  let course;
  try{
    course = await Course.create(req.body);
    res.status(201).location('/api/courses/' + course.id).end()
  }catch(error){
    if(error.name === "SequelizeValidationError"){
      res.status(400).json({"Error" : error.message})
    }else{
      throw error;
    }
  }
}))

//Updates a course and returns no content
//Using express-validator to make sure that the title and the description of the body are not empty
app.put('/api/courses/:id', authenticateUser, [
  body("title").notEmpty().withMessage("Please enter a title"),
  body("description").notEmpty().withMessage("Please enter a description")
 ], asyncHandler(async(req,res) => {
  try{
    
    let course = await Course.findByPk(req.params.id);
    if(course){
      if(course.userId === req.currentUser.id){
        const errors = validationResult(req);
        if(!errors.isEmpty()){
          const errorArray = errors.array();
          const message = errorArray.map(error => error.msg);
          return res.status(400).json({ "Error" : message});
        }else{
          await course.update(req.body)
          res.status(204).end()
        }
      }else{
        res.status(403).json({ "Error" : "You are not authorized to edit this course"})
      }
    }else{
      res.statu(404).end();
    }
  }catch(error){
    if(error.name === "SequelizeValidationError") {
      res.json({"Error":error.message})
      } else {
        throw error
      }
  }

}))

//Deletes a course and returns no content
app.delete('/api/courses/:id', authenticateUser, asyncHandler(async(req,res) => {
  let course = await Course.findByPk(req.params.id);
  if(course){
    if(course.userId === req.currentUser.id){
      await course.destroy();
      res.status(204).end();
    }else{
      res.status(403).json({ "Error" : "You are not authorized to delete this course"});
    }
  }else{
    res.statu(404).end();
  }
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
