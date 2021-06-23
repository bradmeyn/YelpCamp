const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');

const Campground = require('../models/campground');

const {isLoggedIn, isAuthor, validateCampground} = require('../middleware');



//display all campgrounds and pass through all campgrounds from database
router.get("/", catchAsync(async (req, res) =>{
    const campgrounds = await Campground.find();
    res.render('campgrounds/index', {campgrounds});
}));

//create a new campground with form
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');

});

//post request to /campgrounds for creation of new campground
router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    console.log(req.body);
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash('success','New campground created');
    res.redirect(`/campgrounds/${campground._id}`)
}));

//find and display single campground searching db by id
router.get('/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews', 
        populate: {
        path: 'author'
    }}).populate('author');

    console.log( campground);

    if(!campground){
        req.flash('error', 'Cannot find that campground');
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', {campground});
}));

//serve form to update an existing campground
router.get('/:id/edit', isLoggedIn,isAuthor, async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);

    if(!campground){
        req.flash('error', 'Cannot find that campground');
        return res.redirect('/campgrounds')
    }

    res.render('campgrounds/edit', {campground});
});

//edit single campground
router.put('/:id', isLoggedIn,isAuthor, validateCampground, catchAsync(async (req, res) => {
  
    const {id} = req.params;
    
   const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground });
  req.flash('success','Camground successfully updated');
  res.redirect(`/campgrounds/${campground._id}`);
}));

//delete route for single campground
router.delete('/:id', isLoggedIn,isAuthor, catchAsync(async (req, res) => {

const {id} = req.params;
  
const campground = await Campground.findByIdAndDelete(id, {...req.body.campground });
req.flash('success','Campground deleted');
res.redirect('/campgrounds');
}));


module.exports = router