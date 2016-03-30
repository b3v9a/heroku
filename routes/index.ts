///<reference path='../types/DefinitelyTyped/node/node.d.ts'/>
///<reference path='../types/DefinitelyTyped/express/express.d.ts'/>
///<reference path='../ComicEditor.ts'/>
///<reference path='../ComicViewer.ts'/>
///<reference path='../AccountManager.ts'/>


class Router {


    start() {

        var express = require('express');

        // passport variables
        var passport = require('passport');
        var Account = require('../Account');

        var router = express.Router();

        var editor = require('../ComicEditor');
        var accountManager = require('../AccountManager');
        var viewer = require('../ComicViewer');


        var mongo = require('mongodb');
        var monk = require('monk');
        var db = monk('localhost:27017/Sloth');
        db = monk('mongodb://admin:sloth@ds051635.mongolab.com:51635/sloth310');

        var defaultCategories = [ {name: "Action", urlname: "action", active: false},
            {name: "Alternative", urlname: "alternative", active: false},
            {name: "Children's", urlname: "childrens", active: false},
            {name: "Crime", urlname: 'crime', active: false},
            {name: "Fantasy", urlname: "fantasy", active: false},
            {name: "Horror", urlname: "horror", active: false},
            {name: "Humor", urlname: 'humor', active: false},
            {name: "Manga", urlname: "manga", active: false},
            {name: "Non-Fiction", urlname: "nonfiction", active: false},
            {name: "Political", urlname: "political", active: false},
            {name: "Romance", urlname: "romance", active: false},
            {name: "Science Fiction", urlname: "sciencefiction", active: false},
            {name: "Slice-Of-Life", urlname: "sliceoflife", active: false},
            {name: "Superhero", urlname: "superhero", active: false}];

        /* GET Browse page. */
        router.get('/', function(req, res){
            // initialize local list of categories
            // TODO store this in its own database collection and maintain # of comics using a given category
            var categories = defaultCategories;
            var comicCollection = db.get('comiccollection');
            var username = req.session.passport.user;
            comicCollection.find({ publish : true }, {},  function(e, comics){

                var userCollection = db.get('accounts');

                if (String(username) === 'undefined') {
                    // if not logged in, we simply return the list of comics and active categories
                    for (var i = 0; i < comics.length; i++) {
                        // determine whether comics are on reading list or not
                        var comicCategory = comics[i].comicCategory;
                        for (var j = 0; j < categories.length; j++) {
                            if (categories[j].name === comicCategory) {
                                categories[j].active = true;
                            }
                        }
                    }

                    res.render('index',{
                        "comics" : comics,
                        "categories": categories
                    });
                } else {
                    // if user *is* logged in, we also return what is in their reading list
                    userCollection.findOne({username: username}, {}, function(err, account) {
                        var readingList = account.readingList;

                        for (var i = 0; i < readingList.length; i++) {
                            readingList[i] = String(readingList[i]);
                        }

                        // determine which categories have active comics so only those are shown to the user
                        for (var i = 0; i < comics.length; i++) {
                            // set message to show next to the Reading List icon
                            if (readingList.indexOf(String(comics[i]._id)) === -1) {
                                comics[i].inReadingList = false;
                            } else {
                                comics[i].inReadingList = true
                            }
                            // determine whether comics are on reading list or not
                            var comicCategory = comics[i].comicCategory;
                            for (var j = 0; j < categories.length; j++) {
                                if (categories[j].name === comicCategory) {
                                    categories[j].active = true;
                                }
                            }
                        }

                        res.render('index', {
                            "comics": comics,
                            "categories": categories
                        });
                    });
                }
            });
        });
		
		//POST for addrating
        router.post('/addrating', function(req, res) {
            var user = String(req.session.passport.user);
            if(user != "undefined") {
                editor.addrating(req, res)
            }
        });

        /* GET reading list page
         * @param - username
         * */
        router.get('/readinglist', function(req, res) {
            var userCollection = db.get('accounts');
            var username = String(req.session.passport.user);


            if (String(username) === 'undefined') {
                res.render('readinglist', {
                    "readingList": []
                });
            } else {
                // find the correct account for this user
                userCollection.findOne({username: username}, {}, function (e, account) {
                    var comicCollection = db.get('comiccollection');

                    var readinglist = account.readingList;

                    var ObjectID = require('mongodb').ObjectID;

                    for (var i = 0; i < account.readingList.length; i++) {
                        readinglist[i] = ObjectID(readinglist[i]);
                    }

                    // find all the comics with IDs that match whatever is in the user's reading list
                    comicCollection.find({_id: {$in: readinglist}}, {}, function (err, readingList) {
                        if (err) {
                            res.send(err)
                        } else {
                            res.render('readinglist', {
                                "readingList" : readingList
                            })
                        }
                    });
                });
            }
        });

        /* POST to add comic to reading list */
        router.post('/readinglist/add', function(req, res) {
            var collection = db.get('accounts');
            var username = String(req.session.passport.user);

            collection.findOne({username: username}, {}, function(e, account) {
                var userAcct = account;

                // Add comic to readingList only if not already present
                if (userAcct.readingList.indexOf(req.body.comicid) === -1) {
                    userAcct.readingList.push(req.body.comicid);
                }


                collection.update({username: username}, userAcct, function(err, result) {
                    if (err) {
                        res.send("Unable to add to reading list")
                    } else {
                        // redirect to main browse page
                        // TODO redirect to reading list page?
                        res.redirect('/');
                    }
                })
            });
        });

        /* POST to remove comic from reading list */
        router.post('/readinglist/remove', function(req, res) {
            var collection = db.get('accounts');
            var username = String(req.session.passport.user);

            collection.findOne({username: username}, {}, function(e, account) {
                var userAcct = account;
                var indexToRemove;

                for (var i=0; i<userAcct.readingList.length; i++) {
                    if (userAcct.readingList[i] === req.body.comicid) {
                        indexToRemove = i;
                        break;
                    }
                }

                // remove the specified comic from the reading list
                userAcct.readingList.splice(indexToRemove, 1);

                collection.update({username: username}, userAcct, function(err, result) {
                    if (err) {
                        res.send("Unable to remove from reading list")
                    } else {
                        // redirect to main browse page
                        // TODO redirect to reading list page?
                        res.redirect('/');
                    }
                })
            });
        });

        /* GET Community page. */
        router.get('/community/:username', function(req, res){
            var collection = db.get('accounts');
            collection.findOne({ username : req.params.username}, {},  function(e, account){
                res.render('community',{
                    "account" : account
                });
            });
        });


        /* GET Comic Draft page. */
        router.get('/comics/drafts', function(req, res){
            var collection = db.get('comiccollection');
            collection.find({ publish : false, uploader : req.session.passport.user }, {},  function(e, docs){
                res.render('comicDraft',{
                    "comics" : docs
                });
            });
        });

        /* GET New Comic page
         * @param username (as exists in the database)
         * */
        router.get('/comics/addcomic', function(req, res) {
            res.render('newComic',{});
        });


        /* POST to Add Comic DONE.
         * @param comicTitle - the title of the comic to be created
         * @param comicDescription - the description of the comic to be created
         * @param category - the category to be associated with the comic
         *  */
        router.post('/comics/addcomic', function(req, res) {
            var collection = db.get('comiccollection');
            var comicTitle = req.body.comicTitle;
            var comicCategory = req.body.comicCategory;
            var comicSource = req.body.comicSource;
            var description = req.body.description;
            var firstpanel = req.body.firstpanel;
            var panels = [];


            collection.find({"comicTitle": comicTitle}, {}, function (e, docs) {
                if(e){
                    res.send("find error");
                } else {
                    var doesComicExist = docs.length > 0;

                    if (doesComicExist) {
                        res.send("Comic Already Exists");
                    } else
                    //check if url is a png or jpg image
                    if (!( (firstpanel.match(".png"+"$")==".png") || (firstpanel.match(".jpg"+"$")==".jpg") ) )  {
                        res.send("URL does not end with .png or .jpg");

                    } else

                    if (String(req.session.passport.user) === 'undefined') {
                        res.send("User is not logged in");

                     } else {

                        var randomizedId = Math.floor((Math.random() * 10000));

                        collection.insert({
                            "comicTitle": comicTitle,
                            "comicCategory": comicCategory,
                            "comicSource": comicSource,
                            "description": description,
                            "publish" : false,
                            "uploader" : req.session.passport.user,
                            "uploadDate" : new Date(),
                            "modifiedDate" : new Date(),
                            "panels": [{
                                "_id": randomizedId,
                                "source": firstpanel,
                                "position": 1
                            }],
                            "comments": [],
                            "rating": {
                                "score": 0,
                                "sumallscores": 0,
                                "numbervotes": 0
                            }

                        }, function (err, doc) {
                            if (err) {
                                res.send("Error adding new Comic");
                            } else {
                                //res.send("Added Comic Successfully!");
                                res.redirect('/');
                            }

                        });
                    }
                }
            });

        });



        /* DELETE to Delete Comic DONE.
         * @param comicId - the ID of the comic to be deleted
         * */
        router.post('/comics/:id/edit/deletecomic', function(req, res) {
            var ObjectID = require('mongodb').ObjectID;
            var collection = db.get('comiccollection');
            var comicID = ObjectID(req.params.id);

            collection.findById( comicID, function(err, result) {
                if (err) {
                    res.send("Cannot find comic: " + err)
                } else {
                    var comic = result;

                    collection.remove(
                        { _id: comicID
                        }, function(err, result) {
                            if (err) {
                                res.send("Something went wrong when trying to delete the comic: " + err)
                            } else {
                                //res.send("Comic successfully deleted!")
                                res.redirect('/');
                            }
                        })
                }
            });
        });

        /* POST to Publish DONE.
         * @param comicId - the ID of the comic which the panel should be added to
         * */
        router.post('/comics/:id/edit/publish', function(req, res) {
            var ObjectID = require('mongodb').ObjectID;
            var comicID = ObjectID(req.params.id);
            var collection = db.get('comiccollection');

            collection.findById( comicID,  function(err, docs){
                if (err) {
                    res("Cannot find comic: " + err)
                } else {

                    collection.update(
                        { _id: comicID},
                        { $set: { publish : true }
                        }, function (err, doc) {
                            if (err) {
                                res.send("There was a problem publishing to the database.");
                            }
                            else {
                            }
                            res.redirect('/');
                        });

                }
            });
        });

        /* POST to Unpublish DONE.
         * @param comicId - the ID of the comic which the panel should be added to
         * */
        router.post('/comics/:id/edit/unpublish', function(req, res) {
            var ObjectID = require('mongodb').ObjectID;
            var comicID = ObjectID(req.params.id);
            var collection = db.get('comiccollection');

            collection.findById( comicID,  function(err, docs){
                if (err) {
                    res("Cannot find comic: " + err)
                } else {

                    collection.update(
                        { _id: comicID},
                        { $set: { publish : false }
                        }, function (err, doc) {
                            if (err) {
                                res.send("There was a problem publishing to the database.");
                            }
                            else {
                            }
                            res.redirect("/view/" + comicID);
                        });

                }
            });
        });

        /* POST to Edit Button.
         * @param comicId - the ID of the comic which the panel should be added to
         * */
        router.post('/comics/:id/view/all', function(req, res) {
            var ObjectID = require('mongodb').ObjectID;
            var comicID = ObjectID(req.params.id);
            var collection = db.get('comiccollection');

            collection.findById( comicID,  function(err, docs){
                if (err) {
                    res("Cannot find comic: " + err)
                } else {

                    collection.update(
                        { _id: comicID},
                        { $set: { "modifiedDate" : new Date() }
                        }, function (err, doc) {
                            if (err) {
                                res.send("There was a problem hitting the edit button.");
                            }
                            else {
                            }
                            res.redirect("/comics/" + comicID + "/view/all");
                        });

                }
            });
        });






        /* POST to Add Panel DONE.
         * @param comicId - the ID of the comic which the panel should be added to
         * @param source - a URL where the image representing the panel is located
         * */
        router.post('/comics/:id/edit/addpanel', function(req, res) {
            var ObjectID = require('mongodb').ObjectID;
            var comicID = ObjectID(req.params.id);
            var collection = db.get('comiccollection');
            var source = req.body.source;

            collection.findById( comicID,  function(err, docs){
                if (err) {
                    res("Cannot find comic: " + err)
                } else

                //check if url is a png or jpg image
                if (!( (source.match(".png"+"$")==".png") || (source.match(".jpg"+"$")==".jpg") ) )  {
                    res.send("URL does not end with .png or .jpg");

                } else {

                    var comic = docs;
                    var numPanels = comic.panels.length;
                    var randomizedId = Math.floor((Math.random() * 10000));

                    //insert panel into array of panels
                    collection.update(
                        { _id: comicID},
                        { $push: { panels : {
                            _id: randomizedId,
                            source: source,
                            position: numPanels + 2 }}
                        }, function (err, doc) {
                            if (err) {
                                res.send("There was a problem adding panels to the database.");
                            }
                            else {
                            }
                            res.redirect('back');
                        });

                }
            });
        });

        /* POST to Delete Panel DONE.
         * @param panelId - the ID of the panel to be deleted
         * @param comicId - the ID of the comic that the panel belongs to
         * */
        router.post('/comics/:id/edit/deletepanel', function (req, res) {
            var ObjectID = require('mongodb').ObjectID;
            var collection = db.get('comiccollection');
            var comicID = ObjectID(req.params.id);
            var panelID = Number(req.body.panelID);

            collection.findById( comicID, function(err, result) {
                if (err) {
                    res.send("Cannot find comic: " + err)
                } else {
                    var comic = result;

                    collection.update(
                        { _id: comicID},
                        { $pull: { panels: { _id: panelID} }
                        }
                        , function(err, result) {
                            if (err) {
                                res.send("Something went wrong when trying to delete the panel: " + err)
                            } else {
                                //res.send("Panel successfully deleted!")
                                res.redirect('back');
                            }
                        })
                }
            });
        });


        /* POST to Swap Panel DONE.
         */
        router.post('/comics/:id/edit/swappanel', function (req, res) {
            var ObjectID = require('mongodb').ObjectID;
            var collection = db.get('comiccollection');
            var comicID = ObjectID(req.params.id);

            var index = Number(req.body.index);
            var otherindex = index + 1;

            collection.findById( comicID,  function(err, comic){
                if (err) {
                    res.send("Cannot swap panels: " + err)
                } else

                if (otherindex === comic.panels.length) {
                    var previndex = index - 1;

                    var panel = comic.panels[index];
                    comic.panels[index] = comic.panels[previndex];
                    comic.panels[previndex] = panel;

                    collection.update(
                        { _id : comicID },
                        comic,function (err, doc) {
                            if (err) {
                                res.send("There was a problem adding the information to the database.");
                            } else {

                                res.redirect('back');
                            }
                        });

                } else {

                    var panel = comic.panels[index];
                    comic.panels[index] = comic.panels[otherindex];
                    comic.panels[otherindex] = panel;

                    collection.update(
                        { _id : comicID },
                        comic,function (err, doc) {
                            if (err) {
                                res.send("There was a problem adding the information to the database.");
                            } else {

                                res.redirect('back');
                            }
                        });
                }

            });
        });

        /* GET a single comic
         * @param comicId - ID of comic being requested
         */
        router.get('/comics/:id/view/', function(req, res) {
            viewer.getComic(req, function (error, comic) {
                res.render('comic', {
                    comic: comic
                })
            });
        });

        /* GET all comics */
        router.get('/comics/view/all', function(req, res) {
            viewer.getComics(function (error, comics) {
                res.render('comics', {
                    title: "All Comics",
                    comics: comics
                })
            })
        });

        /* GET all panels from a comic DONE. */
        // @param comicId - ID for comic
        router.get('/comics/:id/view/all', function (req, res) {
            var collection = db.get('comiccollection');
            collection.find({}, {},  function(e, docs){
                res.render('edit',{
                    "comicID" : req.params.id,
                    "comics" : docs,
                    "panelpos" : docs.panels,
                    title: "Edit Comic Here!"
                });
            });
        });


        /* Add a comment to a comic
         * @param comicId - the ID of the comic which the comment belongs to
         * @param userId - the ID of the user who is posting the comment
         * @param comment - the text of the comment to be stored
         * */
        router.post('/comics/:id/view/addcomment', function (req, res) {
            editor.addComment(req, res)
        });

        /* Update a comment
         * @param comicId - the ID of the comic which the comment belongs to
         * @param commentId - the ID of the comment the user is updating
         * @param userId - the ID of the user who is editing the comment
         * @param comment - the updated text of the comment to be stored
         */
        router.post('/comics/:id/view/updatecomment', function( req, res) {
            editor.updateComment(req, res)
        });

        /* Add a rating to a comic
         * @param comicId - the ID of the comic which the rating belongs to
         * @param userId - the ID of the user who is adding the rating
         * @param rating - a number (1 through 5) representing the desired rating
         */
        router.post('/comics/:id/view/addrating', function(req, res) {
            editor.addRating(req, res)
        });

        /* Update a rating
         * @param comicId - the ID of the comic which the rating belongs to
         * @param ratingId - the ID of the rating the user is updating
         * @param userId - the ID of the user who is editing the rating
         * @param rating - the updated rating to be stored
         */
        router.post('/comics/:id/view/updatecomment', function( req, res) {
            editor.updateComment(req, res)
        });

        //Josh's view methods
        router.post('/view/changescore', function(req, res) {
            editor.changeScore(req,res);
        });

        router.post('/view/deletecomment', function (req, res) {
            editor.deleteComment(req, res)
        });

        router.post('/view/:id/addcomment', function (req, res) {
            editor.addComment(req, res)
        });

        //get view apge
        router.get('/view/:id', function(req, res) {
            var collection = db.get('comiccollection');
            var users = db.get('accounts');
            var username = req.session.passport.user;
            username = String(username);
            collection.findOne({_id: req.params.id}, {}, function (err, comic) {
                if (err) {
                    res("Comic not found")
                } else {
                    users.findOne({username: username}, {}, function (err, user) {
                        if (err) {
                            res("user not found")
                        } else {
                            res.render('view', {
                                "user": user,
                                "comic": comic,
                                "comments": comic.comments.reverse(),
                                "panels": comic.panels
                            })
                        }
                    });
                }
            });
        });

        // PASSPORT
        /* GET Register */
        router.get('/register', function (req, res) {
            res.render('register', {});
        });

        /* POST Register */
        router.post('/register', function(req, res, next) {
            Account.register(new Account({ username : req.body.username, email : req.body.email }), req.body.password, function(err, account) {
                if (err) {
                    return res.render("register", {info: "Sorry. That username already exists. Try again."});
                }

                passport.authenticate('local')(req, res, function () {
                    req.session.save(function (err) {
                        if (err) {
                            return next(err);
                        }
                        res.redirect('/');
                    });
                });
            });
        });

        /* GET Login */
        router.get('/login', function(req, res) {
            res.render('login', { user : req.user, message : req.flash('error')});
            res.render('layout', { user : req.user, message : req.flash('error')});
        });

        /* POST Login */
        router.post('/login', passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), function(req, res, next) {
            req.session.save(function (err) {
                if (err) {
                    return next(err);
                }
                res.redirect('/');
            });
        });

        /* GET Logout */
        router.get('/logout', function(req, res, next) {
            req.logout();
            req.session.save(function (err) {
                if (err) {
                    return next(err);
                }
                res.redirect('/');
            });
        });

        /* GET Account page FIXING.
         * @param username (as exists in the database)
         * */
        router.get('/account/:username', function(req, res) {
            var collection = db.get('accounts');
            collection.find({},{}, function(e,docs){
                res.render('account',{
                    "user" : req.params.username,
                    "users" : docs
                });
            });
        });

        /* POST to Account Page DONE. */
        router.post('/account/:username/edit', function(req, res) {
            var ObjectID = require('mongodb').ObjectID;
            var collection = db.get('accounts');
            var user = req.params.username;
            var username = req.body.username;
            var email = req.body.email;
            var firstname = req.body.firstname;

            collection.findOne({ username : user }, {},  function(err, account){
                if (err) {
                    res("Cannot find user: " + err)
                } else {

                    if(username == ''){
                        username = account.username;
                    }
                    if(email == '') {
                        email = account.email;
                    }
                    if(firstname == ''){
                        firstname = account.firstname;
                    }
                    collection.update(
                        { username : user},
                        { $set: {
                            "username" : username,
                            "email" : email,
                            "firstname" : firstname
                        }
                        }, function (err, doc) {
                            if (err) {
                                res.send("There was a problem updating user info to the database.");
                            }
                            else {
                            }
                            res.redirect('/account/' + username);
                        });

                }
            });
        });




        /* GET View Page */
        router.get('/view/:id', function(req, res) {
            var comicCollection = db.get('comiccollection');
            comicCollection.findOne({_id: req.params.id}, {}, function (e, comic) {
                var userCollection = db.get('accounts');
                userCollection.find({}, {}, function (err, accounts) {
                    if (err) {
                        res.send("error when finding account")
                    } else {
                        res.render('view', {
                            "comicID": req.params.id,
                            "comic": comic,
                            "panels": comic.panels,
                            "accounts": accounts
                        })
                    }
                });
            });
        });

        /* GET Category Page */
        router.get('/view/category/:category', function(req, res) {
            // get category from default list
            var category;
            for (var i=0; i<defaultCategories.length; i++) {
                if (req.params.category === defaultCategories[i].urlname)
                    category = defaultCategories[i];
            }

            var comicCollection = db.get('comiccollection');
            comicCollection.find({$and:
                [{comicCategory: category.name},
                    {publish: true}]}, {}, function (e, comics) {
                // var userCollection = db.get('accounts');
                // userCollection.find({}, {}, function (err, accounts) {
                //     if (err) {
                //         res.send("error when finding account")
                //     } else {
                if (e) {
                    res.send(e);
                } else {
                    res.render('category', {
                        "category": category,
                        "comics": comics
                    })
                }
            });
        });

        /* GET Search Page */
        router.get('/search', function(req, res){
            res.render('search');
        });


        router.post('/search', function(req, res) {
            viewer.searchMatchingComics(req, res);
        });






        module.exports = router;
    }

}

var router = new Router();
router.start();