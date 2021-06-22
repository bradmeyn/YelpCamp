const express = require('express');
const router = express.Router({mergeParams: true});

const Campground = require('../models/campground');
const Review = require('../models/review');
const {validateReview} = require('../middleware');



const catchAsync = require('../utils/catchAsync');

const ExpressError = require('../utils/ExpressError');



//post route for review
router.post('/',validateReview, catchAsync(async(req, res)=> {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success','New review created');
    res.redirect(`/campgrounds/${campground._id}`);
}));


//delete route for the review
router.delete('/:reviewId', catchAsync(async (req, res) =>{
    const {id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(req.params.reviewId);
    req.flash('success','Review deleted');
    res.redirect(`/campgrounds/${id}`)

}));

module.exports = router;