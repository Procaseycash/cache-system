## Cache System
This application uses `express-generator` to scaffold the application structure which was later modified.

The API Postman documentation can be download ![Alt text](doc/Cache%20System%20API.postman_collection.json "API Documentation") and the environment configuration from ![Alt text](doc/Cache%20System%20Environment.postman_environment.json "API Environment Config")

### Setup and Running of the app
All that is needed to be done is:

```
$ npm install
$ npm run start
```

### Access the App launch
Visit http://localhost:3001/ to see the app.

### Libraries
All library usage can be found in `package.json` and engine setup is on

```$xslt
node 15.X and above
npm 7.X and above
```

### Server Side
This is where the backend system is created to interface with the client. The structure of the server side is as follows:
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
