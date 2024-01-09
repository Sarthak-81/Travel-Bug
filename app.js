const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const session = require("express-session");
const flash = require("connect-flash");


main().then(() =>{
    console.log("Connected to DB")
}).catch(err =>{
    console.log(err);
})
async function main() {
    await mongoose.connect(MONGO_URL);
  }

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const sessionOptions = {
    secret: "mysecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
};

// Root Directory
app.get("/", (req, res) =>{
    res.send("Root Directory");
});

app.use(session(sessionOptions));
app.use(flash());

app.use((req, res, next) =>{
    res.locals.success = req.flash("success");
    next();
});

app.use("/listings", listings);  // They are written below flash and session
app.use("/listings/:id/reviews", reviews); // They are written below flash and session


//Middlewares
// app.use((req, res) =>{
//     res.status(404).send("Page not found.");
// });

app.use("/api",(req, res, next)=>{
    let {token} = req.query;
    if(token==="giveaccess"){
        next();
    }
    res.send("ACCESS DENIED BY ADMIN");
})

app.use("/api", (req, res)=>{
    res.send("data");
});

app.all("*", (req, res, next) =>{
    next(new ExpressError(404, "Page Not Found."))
})

app.use((err, req, res, next) =>{
    let {status=500, message = "Something went wrong."} = err;
    // res.status(status).send(message);
    res.render("error.ejs", {message});
});

app.listen(8080, () => {
    console.log("listening to port 8080");
});




// app.get("/testListing", async(req, res)=>{
//     let sampleListing = new Listing({
//         title: "My new Home",
//         description: "by the beach",
//         price: 1200,
//         location: "Goa",
//         country: "India",
//     });
//     await sampleListing.save();
//     console.log("sample was saved.")
//     res.send("Successful");
// })
