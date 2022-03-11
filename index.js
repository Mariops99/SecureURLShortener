const express = require('express')
const bodyParser = require("body-parser");

var firebase = require("firebase/app");
require("firebase/auth");
require("firebase/database");
require('dotenv').config()
const app = express()
const port = 80

app.use(express.static(__dirname + '/public'));
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(bodyParser.urlencoded({ extended: false }));

var firebaseConfig = {
    apiKey: process.env.apiKey,
    authDomain: process.env.authDomain,
    databaseURL: process.env.databaseURL,
    projectId: process.env.projectId,
    storageBucket: process.env.storageBucket,
    messagingSenderId: process.env.messagingSenderId,
    appId: process.env.appId,
    measurementId: process.env.measurementId
 };

 firebase.initializeApp(firebaseConfig);

 app.get('/', (req, res) => {
     res.render("index", {result:null})
 })
 
 app.get('/getapi', (req, res) => {
     res.render("register")
 });

 app.get('/docs', (req, res) =>{
    res.render('docs')
 });
 
 app.post('/short', (req, res) => {
     var link = req.body.url;
     if(link) {
         if(!link.includes("http://") && !link.includes("https://")) {
             link = "http://" + link;
         }
         var key = firebase.database().ref('pages/').push().key;        
         firebase.database().ref('pages/' + key).set({
             url: link,
             clicked: 0
         }, (error) => {
             if(error) {
                 res.render('index',  {result:error})
             } else {
                 var newURL = process.env.SERVER+"/"+key
                 res.render('index',  {result:newURL})
             }
         });
     }
 });
 
 app.post('/register', (req, res) => {
     firebase.auth().createUserWithEmailAndPassword(req.body.email, req.body.password)
     .then((userCredential) => {
         var user = userCredential.user;       
         firebase.database().ref('users/' + user.uid).set({
             email: req.body.email,
             apikey: user.uid,
             company: req.body.company
         }, (error) => {
             if(error) {
                 res.render('index',  {result:error})
             } else {
                 res.redirect('/');
             }
         });
     }) .catch((error) => {
         res.render('index', {result:error})
     });
 });
 
 app.get('/api', (req, res) => {
     return firebase.database().ref('/users/' + req.query.api).once('value').then((snapshot) => {
         var link = req.query.url;
         if(link) {
             if(!link.includes("http://") && !link.includes("https://")) {
                 link = "http://" + link;
             }
             var key = firebase.database().ref('pages/').push().key;        
             firebase.database().ref('pages/' + key).set({
                 url: link,
                 user:req.query.api,
                 clicked: 0
             }, (error) => {
                 if(error) {
                     res.send({result:error})
                 } else {
     
                     var newURL = process.env.SERVER+"/"+key
                     res.send({url: newURL})
                 }
             });
         }
     });
 });
 
 app.get('/api/custom', (req, res) => {
     return firebase.database().ref('/users/' + req.query.api).once('value').then((snapshot) => {
         var link = req.query.url;
         firebase.database().ref('/pages/' + req.query.customkey).once('value').then((snapshot) => {
             if(snapshot.val()!=undefined) {
                 res.send({error: "CustomKey Already Exists"})
             } else {
                 if(link) {
                     if(!link.includes("http://") && !link.includes("https://")) {
                         link = "http://" + link;
                     }
                     var key = req.query.customkey;       
                     firebase.database().ref('pages/' + key).set({
                         url: link,
                         user: req.query.api,
                         clicked: 0
                     }, (error) => {
                         if(error) {
                             res.send({result:error})
                         } else {
                             var newURL = process.env.SERVER+"/"+key
                             res.send({url: newURL})
                         }
                     });
                 }
             } 
         });
     });
 });
 
 app.get('/api/clicks', (req, res) => {
     return firebase.database().ref('/users/' + req.query.api).once('value').then((snapshot) => {
        firebase.database().ref('/pages/' + req.query.key).once('value').then((snapshot) => {
            res.send({clicked: snapshot.val().clicked})
        })
     });
 });
 
 app.get('/:key', (req, res) => {
     if(req.params.key != "favicon.ico") {
         return firebase.database().ref('/pages/' + req.params.key).once('value').then((snapshot) => {
             var url = snapshot.val().url;
             var clicked = snapshot.val().clicked
             var newClicked = clicked +1;
             var newValues = {
                 url: snapshot.val().url,
                 clicked: newClicked
             }
             firebase.database().ref('/pages/' + req.params.key).update(newValues);
             res.redirect(url)
         });
     }
 });
 
 app.listen(port, () => {
   console.log(`App listening at ${process.env.SERVER}:${port}`)
 })