const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');

const {campgroundSchema, reviewSchema} = require('./schemas.js');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const Review = require('./models/review');


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


const validateCampground = (req, res, next) => {
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

const validateReview = (req, res, next) => {
    const {error} =reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

app.get("/", (req, res) =>{
    res.render('home')
});

//display all campgrounds and pass through all campgrounds from database
app.get("/campgrounds", catchAsync(async (req, res) =>{
    const campgrounds = await Campground.find();
    res.render('campgrounds/index', {campgrounds});
}));

//create a new campground with form
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');

});

//post request to /campgrounds for creation of new campground
app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {

   
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
    
}));

//find and display single campground searching db by id
app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    console.log(campground)
    res.render('campgrounds/show', {campground});
}));

//serve form to update an existing campground
app.get('/campgrounds/:id/edit', async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', {campground});
});

//edit single campground
app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const { id} = req.params;
  const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground });
  res.redirect(`/campgrounds/${campground._id}`);
}));

//delete route for single campground
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const {id} = req.params;
  const campground = await Campground.findByIdAndDelete(id, {...req.body.campground });
  res.redirect('/campgrounds');
}));


//post route for review
app.post('/campgrounds/:id/reviews',validateReview, catchAsync(async(req, res)=> {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
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