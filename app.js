const express = require('express');
//use express
const app = express();
const path = require('path');

const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');


app.use(express.static(path.join(__dirname, 'public')));

//override post routes for form submission
const methodOverride = require('method-override');

//routes files
const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');

//connect mongoose to mongodb server
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});


//confirm database connection
const db = mongoose.connection;
db.on('error',console.error.bind('connection error:'));
db.once('open', () => {
    console.log("database connected");
});



app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//add ability to parse body
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));




//use router files with defined prefixes
app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);




app.get("/", (req, res) =>{
    res.render('home')
});





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