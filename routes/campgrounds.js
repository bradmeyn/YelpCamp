const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const Campground = require('../models/campground');





//display all campgrounds and pass through all campgrounds from database
router.route('/')
    .get( catchAsync(campgrounds.index))
    .post( isLoggedIn, upload.array('image'), validateCampground,  catchAsync(campgrounds.createCampground));
    

//create a new campground with form
router.get('/new', isLoggedIn,campgrounds.renderNewForm);

//post request to /campgrounds for creation of new campground
router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn,isAuthor,upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn,isAuthor, catchAsync(campgrounds.deleteCampground));

//serve form to update an existing campground
router.get('/:id/edit', isLoggedIn,isAuthor, campgrounds.renderEditForm);




module.exports = router