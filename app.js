const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const Campground = require('./models/campground');


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

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//add ability to parse body
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));


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
app.post('/campgrounds', catchAsync(async (req, res, next) => {
   if(!req.body.campground) throw new ExpressError('Invalid campground data',500);
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
    
}));

//find and display single campground searching db by id
app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', {campground});
}));

//serve form to update an existing campground
app.get('/campgrounds/:id/edit', async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', {campground});
});


app.put('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id} = req.params;
  const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground });
  res.redirect(`/campgrounds/${campground._id}`);
}));

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const {id} = req.params;
  const campground = await Campground.findByIdAndDelete(id, {...req.body.campground });
  res.redirect('/campgrounds');
}));





app.all('*', (req, res, next) =>{
    next( new ExpressError('Page not found', 404))
});

app.use((err, req, res, next)=> {
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'something went wrong'
    res.status(statusCode).render('error', {err});
   
});
app.listen(3000, () => {
   console.log('server running on port 3000')
});