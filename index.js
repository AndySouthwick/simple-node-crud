const  express = require('express');
const  monk = require('monk');
const dotenv = require('dotenv');
const connectMongoDb = dotenv.load();
const  db =  monk(`${connectMongoDb.parsed.MONGO_CONNECTION}`);
const  app = new express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

const projects = db.get('usertest')

app.post('/createNewAccount', (req, res) => {
  const newAccount = req.body
  projects.insert(newAccount)
  res.send(newAccount)
  })

app.post('/createAndUpdateProject', (req, res) => {
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
