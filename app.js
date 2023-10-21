const bodyParser = require("body-parser");
const fs = require('fs');
const express = require("express");
const ejs = require("ejs");
const multer=require('multer');
const { v4: uuidv4 } = require('uuid');

const app = express();


var response;
var existingData;
// const upload = multer({ dest: "uploads/" });
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = file.originalname.split('.').pop();
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + extension);
  }
});

const upload = multer({
  storage: storage
});

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

fs.readFile('response.json', 'utf8', function(err, data) {
  if (err) {
    console.log('Error:', err);
    res.send('Error reading form data');
  } else {
    existingData = JSON.parse(data);
  }
  });

app.get("/", function(req,res){
 res.render("form"); 
});

app.get("/form", function(req,res){
 res.render("form");
});


app.get("/response", function(req,res){
 res.render("response", {users: existingData, });
});



app.post("/form-handler",upload.fields([{name:'cv'},{name:'image'}]), function(req, res) {
  response = req.body;
;
  const cvData = req.files['cv'][0].filename;
  const imageData=req.files['image'][0].filename;
  const uniqueId = uuidv4();

  response.id=uniqueId;
  response.cv=cvData;
  response.image=imageData;

 
      existingData.push(response);
  
      // Write the updated JSON data back to the file
      fs.writeFile('response.json',JSON.stringify(existingData), 'utf8', function(err) {
        if (err) {
          console.log('Error:', err);
          res.send('Error saving form data');
        } else {
          console.log('Data appended to the file successfully.');
          res.redirect("/response");
        }
      });
});

app.get('/view',(req,res)=>{
  const id=req.query.id;
  fs.readFile("response.json", "utf8", (err, data)=>{
    if (err)
    {
        res.send("Cant read data");
    }

const user = JSON.parse(data);
// console.log(user.users)

const userData = user.find(obj => obj.id === id);
res.render("view", {userData})
});
});

app.get('/delete', (req, res)=>{
  id = req.query.id;
  fs.readFile("response.json", "utf8", (err, data)=>{
      if (err)
      {
          res.send("Cant read data");
      }
  
  const user = JSON.parse(data);
  const updatedUsers = user.filter(user => user.id !== id);

  if (user.length !== updatedUsers.length) {
    const updatedData = JSON.stringify(updatedUsers);
    

    fs.writeFile('response.json', updatedData, 'utf8', (err) => {
      if (err) {
        res.send('Unable to delete user');
      } else {
        res.send('User deleted successfully');
      }
    });
  } else {
    res.status(404).send('User not found');
  }
});
res.redirect('/form');
});



app.get('/update',(req,res)=>{
 const id=req.query.id;
 fs.readFile("response.json", "utf8", (err, data)=>{
  if (err)
  {
      res.send("Cant read data");
  }

const users = JSON.parse(data);
// console.log(user.users)

const user = users.find(obj => obj.id === id);
// console.log(user);

res.render("update",{user});
});
});


app.post('/update', (req, res) => {
  const id = req.query.id; // Retrieve the id from the query parameter

  fs.readFile("response.json", "utf8", (err, data) => {
    if (err) {
      res.send("Can't read data");
      return;
    }

    const user = JSON.parse(data);
    const userDataIndex = user.findIndex(obj => obj.id === id); // Find the index of the user data with the matching id

    if (userDataIndex === -1) {
      res.send("User not found");
      return;
    }

    // Update the user data with the data from req.body
    user[userDataIndex].name = req.body.name;
    user[userDataIndex].password = req.body.password;
    user[userDataIndex].course = req.body.course;
    user[userDataIndex].credit_card = req.body.credit_card;
    user[userDataIndex].city = req.body.city;


    // Update other fields as needed

    // Write the updated user data back to the response.json file
    fs.writeFile("response.json", JSON.stringify(user, null, 2), (err) => {
      if (err) {
        res.send("Error updating data");
        return;
      }

      res.send("Data updated successfully");
    });
  });
});

app.listen(3000, function(req,res){
console.log("Server started at port 3000");
});




    
