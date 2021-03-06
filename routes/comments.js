const express    = require("express"),
      router     = express.Router({mergeParams: true}),
      Campground = require("../models/campground"),
      Comment    = require("../models/comment"),
      middleware = require("../middleware");

//Comments new
router.get("/new", middleware.isLoggedIn, function(req, res) {
    // find campground by id
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        } else {
           res.render("comments/new", {campground: campground}); 
        }
    })
});

//Comments create
router.post("/", middleware.isLoggedIn, function(req, res) {
    // lookup campgrounds using id
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
            req.flash("error","Something went wrong");
            res.redirect("/campgrounds");
        } else {
          // Create new comment
          Comment.create(req.body.comment,function(err, comment){
            if(err){
                console.log(err);
            } else { 
                //add username and id to comment
                comment.author.id = req.user._id;
                comment.author.username = req.user.username;
                //save comments
                comment.save();
                //connect new comment to campground
                campground.comments.push(comment);
                campground.save();
                //redirect campground show page
                res.redirect("/campgrounds/"+ campground._id);
            }
          });
        }
    });
});

//Comments edit
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err|| !foundCampground){
            req.flash("error", "Campground not found");
            return res.redirect("back");
        }
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                res.redirect("back");
            } else {
                res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
            }
        });
    });
});

//Comments edit
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            res.redirect("back");
        } else {
            res.redirect("/campgrounds/" + req.params.id );
        }
    });
});

//Comment delete
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    //findByIdAndRemove
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if (err){
            req.flash("error","Something went wrong");
            res.redirect("back");
        } else {
            req.flash("success","Successfully deleted!");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});


module.exports = router;