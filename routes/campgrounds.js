const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');

const Campground = require('../models/campground');

const {isLoggedIn, isAuthor, validateCampground} = require('../middleware');



//display all campgrounds and pass through all campgrounds from database
router.get("/", catchAsync(campgrounds.index));

//create a new campground with form
router.get('/new', isLoggedIn,campgrounds.renderNewForm);

//post request to /campgrounds for creation of new campground
router.post('/', isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));

//find and display single campground searching db by id
router.get('/:id', catchAsync(campgrounds.showCampground));

//serve form to update an existing campground
router.get('/:id/edit', isLoggedIn,isAuthor, campgrounds.renderEditForm);

//edit single campground
router.put('/:id', isLoggedIn,isAuthor, validateCampground, catchAsync(campgrounds.updateCampground));

//delete route for single campground
router.delete('/:id', isLoggedIn,isAuthor, catchAsync(campgrounds.deleteCampground));


module.exports = router