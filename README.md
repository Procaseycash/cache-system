## Cache System
This service uses `express-generator` to scaffold the application structure which was later modified.

The API Postman documentation can be download <a href='/doc/Cache%20System%20API.postman_collection.json'> API Documentation </a> and the environment configuration from  <a href='/doc/Cache%20System%20Environment.postman_environment.json'> API Environment </a>

### Setup and Running of the app
All that is needed to be done is:

```
$ npm install
$ npm run start
```

### Base Service URL
Visit http://localhost:4000/api/v1/ as the base of the service URL.

### Libraries
All library usage can be found in `package.json` and engine setup is on

```$xslt
node 15.X and above
npm 7.X and above
```

### Service Structure
```
bin/
src/
    configs/
    controllers/
    dtos/
    models/
    routes/
    services/
    utils/
    server.js
.env    
```

### Scheduler

There is a schedule that clean up expired cache data from database and the in-memory db to avoid overloading the database.

### Environment
Made use of environment system called `.env` to handle some global configuration for the server side through the `dotenv` library.
This is added as part of the repo only for the sake of easy access.

### Choice of Language
Bare Javascript is used to avoid transpile ATM but this is design on OOP concept. 

### Choice of setup
    1. Favoured application decoupling.
    2. Easy to manage, maintainability and ease for new developer to join with less work through.
    3. Applied MVC pattern
    4. Stay true to SOLID, KISS and DRY principles.
    5. Service based approach is used to make sure segragation of concerns are met.
  
    
### Choice on Storage for AccessToken
The use of mongodb and in-memory to handle quick reliable data access is to aid performance and in situation of service restart or the in-memory in damaged, it will rely solely on the mongo db data stored to retrieve information not found in the in-memory DB
