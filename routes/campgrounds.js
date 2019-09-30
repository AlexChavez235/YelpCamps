var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

// INDEX - Show all campgrounds
router.get("/", (req, res) => {
    Campground.find({}, (err, campgrounds)=> {
        if (err) {
            
        } else {
            res.render("campgrounds/index", {campgrounds: campgrounds});
        }
    });
});

// CREATE - Add a new campground to the db
router.post("/", middleware.isLoggedIn, (req, res) => {
    // get data from form 
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var description = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampground = {name: name, image: image, description: description, author: author, price: price};
    // Create a new campground and save to the database
    Campground.create(newCampground, (err, campground) => {
        if (err) {
            
        } else {
            // redirect back to campgrounds page
            // default is to redirect as a get request
            res.redirect("/campgrounds");
        }
    });
});

// NEW - Displays form to make a new campground
router.get("/new", middleware.isLoggedIn, (req, res) => {
    res.render("campgrounds/new");
});

// SHOW - Shows info about one campground
router.get("/:id", (req, res) => {
    // find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec((err, foundCampground) => {
        if (err) {
            
        } else {
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
    
});

// EDIT - Shows form to edit a campground
router.get("/:id/edit", middleware.checkCampgroundOwnership, (req, res) => {
    // If user logged in?
    Campground.findById(req.params.id, (err, foundCampground) => {
        res.render("campgrounds/edit", {campground: foundCampground});
    });
});

// UPDATE
router.put("/:id", middleware.checkCampgroundOwnership, (req, res) => {
    // find and update the correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCamp) => {
        if (err) {
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
    // redirect to the show page
});

// DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findByIdAndRemove(req.params.id, (err, campgroundRemoved) => {
        if (err) {
            res.redirect("/campgrounds");
        } 
        Comment.deleteMany( {_id: { $in: campgroundRemoved.comments } }, (err) => {
            if (err) {
                
            }
            res.redirect("/campgrounds");
        });

    });
});

module.exports = router;