require("dotenv").config();
const mongoose =require("mongoose");
const express = require("express");
const ejs = require("ejs");
const session = require("express-session");
const passport = require("passport");
const PassportLocalMongoose = require("passport-local-mongoose")
const fs = require('fs');
const path = require('path');


const app=express();

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const client = require("twilio")(accountSid,authToken)


app.use(express.static("public"));
app.use(express.urlencoded({extended:true}));
app.set("view engine","ejs");

app.use(session({
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:false
 }));

 app.use(passport.initialize());
 app.use(passport.session());

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        unique:true
    },
    password:String,
});

userSchema.plugin(PassportLocalMongoose);

const userSecSchema = new mongoose.Schema({
    username:{
        type:String,
        unique:true
    },
    profession:String,
    Phone:String,
    Name:String,
    Enrollment:String   
})
const compSchema = new mongoose.Schema({
    username:String,
    description:String,
    timestamps:String,
    latitude:String,
    longitude:String,
    yn:String
})

const commSchema = new mongoose.Schema({
    review:String,
    name:String
})

const volSchema = new mongoose.Schema({
    username:String,
    profession:String,
    time:String,
    area:String,
    emergencyno:String
})

const User = mongoose.model("User",userSchema);
const UserSec = mongoose.model("UserSec",userSecSchema);
const Complaint = mongoose.model("Complaint",compSchema);
const Scomm = mongoose.model("Scomm",commSchema);
const Acomm = mongoose.model("Acomm",commSchema);
const Volunteer = mongoose.model("Volunteer",volSchema);


passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const activeuser = {Name:"",Enrollment:"",username:"",profession:""};
app.get("/",async(req,res)=>{
    res.render("landingPage");
});

app.get("/login",async(req,res)=>{
    res.render("login");
});

app.get("/index",async(req,res)=>{
    res.set(
        'Cache-Control', 
        'no-cache, private, no-store, must-revalidate, max-stal e=0, post-check=0, pre-check=0' 
        );
    if(req.isAuthenticated()){
        res.render("index",{user:activeuser});
    }
    else
    {
        res.redirect('/login');
    }
});

app.get("/index/community",async(req,res)=>{
    res.set(
        'Cache-Control', 
        'no-cache, private, no-store, must-revalidate, max-stal e=0, post-check=0, pre-check=0' 
        );
    if(req.isAuthenticated()){
        const sfind = await Scomm.find({});
        const afind = await Acomm.find({});
        res.render("community",{slist:sfind,alist:afind});
    }
    else
    {
        res.redirect('/login');
    }
});

app.get("/index/incidentReporting",async(req,res)=>{
    res.set(
        'Cache-Control', 
        'no-cache, private, no-store, must-revalidate, max-stal e=0, post-check=0, pre-check=0' 
        );
    if(req.isAuthenticated()){
        res.render("incidentReporting",{key:process.env.GMAP_KEY});
    }
    else
    {
        res.redirect('/login');
    }
});

app.get("/index/volunteer",async(req,res)=>{
    res.set(
        'Cache-Control', 
        'no-cache, private, no-store, must-revalidate, max-stal e=0, post-check=0, pre-check=0' 
        );
    if(req.isAuthenticated()){
        res.render("volunteer");
    }
    else
    {
        res.redirect('/login');
    }
})

app.get("/logout",async(req,res)=>{
   req.logout(function(err){
     if(err)
     console.log(err);
     else
     res.redirect("/");
   });
});

app.get("/index/virtualwalk",async(req,res)=>{
    res.set(
        'Cache-Control', 
        'no-cache, private, no-store, must-revalidate, max-stal e=0, post-check=0, pre-check=0' 
        );

    if(req.isAuthenticated()){
        res.render("virtualwalk");
    }
    else
    {
        res.redirect('/login');
    }
})

app.get("/index/mapblkspot",async(req,res)=>{
    res.set(
        'Cache-Control', 
        'no-cache, private, no-store, must-revalidate, max-stal e=0, post-check=0, pre-check=0' 
        );

    if(req.isAuthenticated()){
        res.sendFile(path.join(__dirname, './views', 'map.html'));
    }
    else
    {
        res.redirect('/login');
    }
})


app.post("/index/volunteer",async(req,res)=>{

    try {
        const u = await Volunteer.findOne({username:activeuser.username});
        if(u)
        {
            res.sendFile(path.join(__dirname, './views', 'VolunteerError.html'));
        }
        else
        {
            const volunteer = new Volunteer({
                username:activeuser.username,
                profession:activeuser.profession,
                time:req.body.time,
                area:req.body.area,
                emergencyno:req.body.emergencyno
            })
            volunteer.save();
            res.redirect("/index");
        }
    } catch (error) {
        console.log("error");
        res.send("<h3>unknown error</h3> <a href='/index'>click here to go back to home page </a>");
    }
 
})

app.post("/index",async(req,res)=>{
    const vols = await Volunteer.find({});

    vols.forEach((u)=>{
    client.messages
    .create({
      body: `EMERGENCY MESSAGE SOS ALERT AT LATITUDE: ${req.body.latlocation}, LONGITUDE: ${req.body.lnglocation} BY ${activeuser.Name} ENROLLMENT NUMBER: ${activeuser.Enrollment}`,
      to: u.emergencyno, 
      from: process.env.TWILIO_PHONE, 
    })
    .then((message) => console.log("success"))
    .catch((error)=>{
        console.log("unsuccessful");
    });
});
  res.redirect("/index");
})

app.post("/index/community/student",async(req,res)=>{
    if(activeuser.profession === "student")
    {
         const scomm = new Scomm({
            review:req.body.ucomm,
            name:activeuser.Name
         });

         await scomm.save();
         res.redirect("/index/community");
    }
    else
    {
        res.sendFile(path.join(__dirname, './views', 'CommunityStudentError.html'));
    }
})

app.post("/index/community/admin",async(req,res)=>{
    if(activeuser.profession === "student")
    {
         res.render("communityStudentError2");
    }
    else
    {
        const acomm = new Acomm({
            review:req.body.dcomm,
            name:activeuser.Name
         });

         acomm.save();
         res.redirect("/index/community");
    }
})

app.post("/index/incidentReporting",async(req,res)=>{
    try {
        const u = await Complaint.findOne({username:activeuser.username});
        if(u)
        {
            res.sendFile(path.join(__dirname, './views', 'incidentReportingError.html'));
        }
        else
        {
            const complaint = new Complaint({
                username:activeuser.username,
                description:req.body.description,
                timestamps:req.body.datetime,
                latitude:req.body.lat,
                longitude:req.body.lng,
                yn:req.body.yn
            });

            complaint.save();
            res.sendFile(path.join(__dirname, './views', 'incidentReportingSuccess.html'));
        }
    } catch (error) {
        console.log(error);
        res.redirect("/index/incidentReporting");
    }
});

app.post("/register",async(req,res)=>{
  User.register({username:req.body.username}, req.body.password, function(err,user){
     if(err)
     {
        console.log(err);
        res.redirect("/");
     }
     else
     {
        const usersec= new UserSec({
            username:req.body.username,
            profession:req.body.profession,
            Phone:req.body.Phone,
            Name:req.body.Name,
            Enrollment:req.body.Enrollment
        });
        usersec.save();

        activeuser.Name = req.body.Name;
        activeuser.Enrollment = req.body.Enrollment;
        activeuser.username = req.body.username;
        activeuser.profession=req.body.profession;
        
        passport.authenticate("local")(req,res,function(){
            res.redirect("/index");
        });
     }
  });
});
app.post("/login",passport.authenticate("local"),async(req,res)=>{
  const user = new User({
    username:req.body.username,
    password:req.body.password
})

  req.login(user,function(err){
    if(err)
    console.log(err);
    else
    {   UserSec.findOne({username:req.body.username}).then((u)=>{
        if(u)
        {
        activeuser.Name=u.Name;
        activeuser.Enrollment = u.Enrollment;
        activeuser.username = u.username;
        activeuser.profession=u.profession;
        }
    }).catch((error)=>{
        console.log(error);
    });
        passport.authenticate("local")(req,res,function(){
        res.redirect("/index");
 
    });
}
  });
});


app.listen(process.env.PORT,async()=>{
    try {
        await mongoose.connect(process.env.MONGO_DB_URI);
    } catch (error) {
        console.log(error);
    }
    console.log(`server started on port ${process.env.PORT}`);
})
