var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var request = require("request");
var AWS = require("aws-sdk");
var sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
AWS.config.update({region: 'us-west-1'});
var s3 = new AWS.S3({apiVersion: '2006-03-01'});
var bucketName = "mkdecisions";
var params = {Bucket:bucketName,Key:"data.json"};


// s3.listBuckets(function(err, data) {
//    if (err) {
//       console.log("Error", err);
//    } else {
//       console.log("Bucket List", data.Buckets);
//    }
// });


app.get("/",function(req,res){
   res.render("Login"); 
});

app.get("/ContactForm",function(req,res){
   res.render("ContactForm");
});

app.get("/EndingPage",function(req,res){

   
   res.render("EndingPage");
})

app.post("/ContactForm",function(req,res){
   var usernameInput = req.body.username;
   var passwordInput = req.body.password;

   s3.getObject(params,function(err,data){
      if(err){
         console.log("Error in getObject");
      }else{
         var data = data.Body.toString();
         
         data = data.replace("Users = [","")
         .replace("]","")
         .replace("","")
         .replace("","")
         .trim()
         .split("\":\"");

         for (var i = 1; i < data.length; i+=2){
            var index1 = data[i].indexOf("\",\r");
            var username = data[i].substring(0,index1);
            if(username === usernameInput){
               var index2 = data[i+1].indexOf("\"\r");
               var password = data[i+1].substring(0,index2);
               if(password === passwordInput){
                  res.redirect("/ContactForm");
                  return ;
               }
            }
         }
         res.redirect("/");
      }
   });
});

app.post("/EndingPage",function(req,res){
   var nameInput = req.body.name;
   var emailInput = req.body.email;
   var messageInput = req.body.message;
   
   var msg = {
     to: emailInput,
     from: 'chunhsien1217@gmail.com',
     subject: nameInput,
     text: messageInput,
   };
   sgMail.send(msg);

   res.redirect("/EndingPage");
});



app.listen(process.env.PORT,process.env.IP,function(){
   console.log("server is started") 
});


