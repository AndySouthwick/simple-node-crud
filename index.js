const  express = require('express');
const  monk = require('monk');
const dotenv = require('dotenv');
const connectMongoDb = dotenv.load();
const  db =  monk(`${connectMongoDb.parsed.MONGO_CONNECTION}`);
const  app = new express();
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const isLoggedIn = require('./utils')
const bcrypt = require('bcrypt');
const saltRounds = 10;
const salt =  require('./secrets')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const projects = db.get('usertest')

app.post('/loginUser', (req, res) => {
   let loginCreds = req.body
    projects.findOne({accountUser: loginCreds.accountUser}).then((docs) => {
      bcrypt.compare(loginCreds.password, docs.accountPassIt, (err, theResponse) => {
            const theToken = {
        token: jwt.sign({
        exp: Math.floor(Date.now() / 1000) + (60 * 60),
        sub: docs.accountUser
      },
        salt)
    }
    console.log(theToken)
        res.send(theToken)
      })
    }).catch(e => {
      return res.send('nothing')
    })
  })

app.post('/createNewAccount', (req, res) => {
  const newAccount = req.body
  bcrypt.hash(newAccount.password, saltRounds, function(err, hash) {
    projects.insert({
      firstname: newAccount.firstname,
      lastname: newAccount.lastname,
      email: newAccount.email,
      accountPassIt: hash
    })
    res.send(newAccount)
  });
  })

app.post('/createAndUpdateProject', (req, res) => {
  console.log(req.headers)
  if(!req.headers.token){
    return res.send('you must sign in first')
  }
  isLoggedIn(req.headers.token)
  const newProject = req.body
  projects.update({accountUser: newProject.accountUser},  newProject).then((e) => {
    console.log('from then', e)
  }).catch((e) => {
    console.log('from catch', e)
  })
  res.send(newProject)
   console.log(newProject)
})

app.get('/sendcred/:id', (req, res) => {
  const user = req.params.id
 return projects.findOne({accountUser: user}).then((docs) => {
   if(!docs){
     return res.send('no user by that name')
   }
   console.log(docs)
   return res.send(docs)
}).catch(e => {
  return res.send(e)
 })
})


app.listen(3000)

