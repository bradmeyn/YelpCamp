const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Campground = require ('./models/campground');


//connect mongoose to mongodb server
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});


//confirm database connection
const db = mongoose.connection;
db.on('error',console.error.bind('connection error:'));
db.once('open', () => {
    console.log("database connected");
});

//use express
const app = express();


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//add ability to parse body
app.use(express.urlencoded({extended:true}));


app.get("/", (req, res) =>{
    res.render('home')
});

//display all campgrounds and pass through all campgrounds from database
app.get("/campgrounds", async (req, res) =>{
    const campgrounds = await Campground.find();
    res.render('campgrounds/index', {campgrounds});
});

//create a new campground with form
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');

});

//post request to /campgrounds for creation of new campground
app.post('/campgrounds', async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
});

//find and display single campground searching db by id
app.get('/campgrounds/:id', async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', {campground});
});




app.listen(3000, () => {
   console.log('server running on port 3000')
});