///<reference path='../types/DefinitelyTyped/node/node.d.ts'/>
///<reference path='../types/DefinitelyTyped/express/express.d.ts'/>
///<reference path='../ComicEditor.ts'/>
///<reference path='../ComicViewer.ts'/>
var Router = (function () {
    function Router() {
    }
    Router.prototype.start = function () {
        var express = require('express');
        var router = express.Router();


        var mongo = require('mongodb');
        var monk = require('monk');
        //var db = monk('localhost:27017/Sloth');
        db = monk('mongodb://admin:sloth@ds051635.mongolab.com:51635/sloth310');

        var bCrypt = require('bcrypt-nodejs');

        var isValidPassword = function(user, password){
            return bCrypt.compareSync(user.getPassword(), password);
        };
        // Generates hash using bCrypt
        var createHash = function(password){

            return bCrypt.hashSync(password);
        };





        /* GET index page. */
        router.get('/', function (req, res, next) {
            res.render('index', { title: 'Express' });
        });
        /* POST to Add Comic */
        router.post('/addcomic', function (req, res) {
            editor.addComic(req, res);
        });
        /* POST to Add Panel */
        // TODO determine how panels should be added - should this point to the "Edit" page?
        router.post('/addpanel', function (req, res) {
            editor.addPanel(req, res);
        });
        /* DELETE to Delete Comic */
        router.delete('/deletecomic', function (req, res) {
            editor.deleteComic(req, res);
        });
        /*DELETE to Delete Panel */
        router.delete('/deletepanel', function (req, res) {
            editor.deletePanel(req, res);
        });
        /* POST to Swap Panel */
        // TODO verify this is correct RESTful design
        router.post('/swappanel', function (req, res) {
            editor.swapPanels(req, res);
        });
        /* GET a single comic */
        // requires comic title
        router.get('/comictile', function (req, res) {
            viewer.getComic(req, res);
        });
        /* GET all comics */
        router.get('/comiclist', function (req, res) {
            viewer.getComics(req, res);
        });
        /* GET first panel from a comic */
        // requires comic title
        router.get('/firstpanel', function (req, res) {
            viewer.getFirstPanel(req, res);
        });
        /* GET all panels from a comic */
        // requires comic title
        router.get('panellist', function (req, res) {
            viewer.getPanels(req, res);
        });
		
		
		 /* GET comicview page */
        router.get('/comicview', function (req, res) {
			// var db = req.db;
            var collection = db.get('commentcollection');
			collection.find({}, {}, function (e, docs) {
                res.render('comicview', {title: 'comic title',"comment": docs });
            });
        });

        /* GET comicview page */
        router.get('/view', function (req, res) {
            // var db = req.db;
            var collection = db.get('commentcollection');
            collection.find({}, {}, function (e, docs) {
                res.render('view', {"comment": docs });
            });
        });
		
		/* Add a comment to view page */
		
		router.post('/addcomment', function (req, res) {
            // Set our internal DB variable
            // var db = req.db;
            // Get our form values. These rely on the "name" attributes
            var aComment = req.body.comment;
            var c = new viewComment(aComment);
            // Set our collection
            var c_collection = db.get('commentcollection');
            // Submit to the DB
            c_collection.insert({
                "comment": c.getComment(),
            }, function (err, doc) {
                if (err) {
                    // If it failed, return error
                    res.send("There was a problem adding the 	information to the database.");
                }
                else {
                    // And forward to success page
                    res.redirect("view");
                }
            });
        });


        /* GET login page. */
        router.get('/', function(req, res) {
        res.render('index', { });
        });


        router.post('/login', function(req, res) {


        // var db = req.db;
        var userName = req.body.username;

        var userPassword = req.body.password;
        // console.log(userPassword);
        var user = new User("",userName, "", userPassword);

        var collection = db.get('usercollection');


        collection.findOne( {"username": user.getUsername()}, {}, function (e, docs) {
        if(e){
            res.send("find error");
        }
        //console.log(docs);
        if(!docs) {
            return res.send("Username does not exist");
        }
        // console.log("Login Pass" + req.body.password);
        // console.log("Login Pass" + user.getPassword());
        // console.log("DB Return Pass" + docs.userPassword);

        if(!isValidPassword(user, docs.userPassword))
            return res.send("Username Exists But Wrong Password");
        else
            res.redirect('/home');
        });

        });


        /* GET Registration Page */
        router.get('/signup', function(req, res){

            res.render('register',{});
        });

        /* Handle Registration POST */
        router.post('/signup', function(req, res) {



        // var db = req.db;
        var userName = req.body.username;
        var userPassword = createHash(req.body.password);
        var firstname = req.body.firstname;
        var email = req.body.email;
        var user = new User(firstname, userName, email, userPassword);

        var collection = db.get('usercollection');

        //console.log(user.getUsername());
        collection.find( {"username": user.getUsername()}, {}, function (e, docs) {
            if(e){
                res.send("find error");
            } else {
                doesUserExist = false;
                if (docs.length > 0) {
                    doesUserExist = true;
                }

                if (doesUserExist) {

                    res.send("User Already Exists");
                }else {

                    // console.log("Inserted Pass" + req.body.password);
                    // console.log("Inserted Pass" + user.getPassword());
        collection.insert({
        "username": user.getUsername(),
        "userPassword": user.getPassword(),
        "firstname" : user.getFirstname(),
        "email" : user.getEmail()

        }, function (err, doc) {
        if (err) {
            res.send("There was a problem adding the information to the database.");
        } else {

        }
            res.redirect("/");

        });

        }


        }
        });
        });

    /* GET Home Page */
    router.get('/home', function(req, res){
        //res.render('home',{ user : 'hi' });
        // var db = req.db;
        var collection = db.get('comics');
        collection.find({}, {},  function(e, docs){
 //           console.log(docs);
            res.render('home',{
                "comics" : docs
            });
        });
    });


    /* Handle Logout */
    router.get('/signout', function(req, res) {

        res.redirect('/');
    });





        module.exports = router;
    };
    return Router;
})();


var User = (function () {
    function User(firstname, username, email, password) {
        this.username = username;
        this.firstname = firstname;
        this.email = email;
        this.password = password;

    }
    User.prototype.getUsername = function () {
        return this.username;
    };
    User.prototype.getFirstname = function () {
        return this.firstname;
    };
    User.prototype.getEmail = function () {
        return this.email;
    };
    User.prototype.getPassword = function () {
        return this.password;
    };

    return User;
})();


// viewcomment class
var viewComment = (function () {
    function bComment(comment) {
        this.comment = comment;
    }
    bComment.prototype.getComment = function () {
        return this.comment;
    };
    return bComment;
})();


var router = new Router();
router.start();
//# sourceMappingURL=index.js.map


