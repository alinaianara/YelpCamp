const express   = require("express"),
      router    = express.Router(),
      Campground= require("../models/campground"),
      middleware= require("../middleware");

//INDEX -show all campgrounds
router.get("/", function(req, res){
    // Get all campgrounds from DB
    Campground.find({},function(err, allCampgrounds){
        if(err){
            console.log(err);
        } else {
           res.render("campgrounds/index", {campgrounds:allCampgrounds, page: "campgrounds"}); 
        }
    });
});

//CREATE - add new campgrounds to DB
router.post("/", middleware.isLoggedIn, function(req, res){
    //get data from form and add to campgrounds array
    const name          = req.body.name,
          price         = req.body.price,
          image         = req.body.image,
          desc          = req.body.description,
          author        = {id: req.user._id, username: req.user.username},
          newCampground = {name: name, price: price, image: image, description: desc, author: author};
    //Create a new campground and save to the data base
    Campground.create(newCampground, function(err,newlyCreated){
        if(err){
            console.log(err);
        } else {
            //Redirect back to campgrounds
            console.log(newlyCreated);
            res.redirect("/campgrounds");   
        }
    });
});

//NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res) {
    res.render("campgrounds/new");
});

//SHOW - shows more info about one campground
router.get("/:id", function(req, res){
    //find the campground with provided ID
    // Campground.findById(req.params.id, function(err,foundCampgroud){
    Campground.findById(req.params.id).populate("comments").exec (function(err, foundCampground){
        if(err|| !foundCampground){
            req.flash("error", "Campground not found");
            res.redirect("back");
        } else {
            console.log("im in campgrounds")
            console.log(foundCampground);
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }  
    });
});

//EDIT CAMPGROUND
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err){
            req.flash("error","You don't have permission to do that");
            res.redirect("/campgrounds");
        } else {
            req.flash("success","Successfully updated!");
            res.render("campgrounds/edit", {campground: foundCampground});
        }
    });
});

//UPDATE CAMPGROUND
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
    //find and update the correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampgroud){
        if(err){
            res.redirect("/campgrounds");
        } else {
            //redirect somewhere(show page)
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

//DESTROY CAMPGROUND
router.delete("/:id", middleware.checkCampgroundOwnership, function (req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/campgrounds");
        } else {
            req.flash("success","Successfully deleted!");
            res.redirect("/campgrounds");
        }
    });
});

module.exports = router;