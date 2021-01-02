# Full Stack JavaScript Techdegree v2 - REST API Project

A REST API which includes express routes to add, edit or delete a user, with validation errors and authentication. User password is hashed before stored in the database.

Also includes routes to add a course. Editing or deleting a course will only be performed if the currrent user is the owner of that course. All with validation errors and authentication.

The courses table is associated with the users table and it displays the owner of the course from a connection to the user's id.

# Technologies used:

- JavaScript
- Express
- Bcrypt
- Sequilize

## Getting Started

To get up and running with this project, run the following commands from the root of the folder that contains this README file.

First, install the project's dependencies using `npm`.

```
npm install

```

Second, seed the SQLite database.

```
npm run seed
```

And lastly, start the application.

```
npm start
```

If you want to stop the application from running.

```
-ctrl + c on the terminal runnig the app
```

To test the Express server, browse to the URL [http://localhost:5000/](http://localhost:5000/).
