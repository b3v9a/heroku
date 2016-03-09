///<reference path='../types/DefinitelyTyped/node/node.d.ts'/>
///<reference path='../types/DefinitelyTyped/express/express.d.ts'/>
///<reference path='../ComicEditor.ts'/>
///<reference path='../ComicViewer.ts'/>
///<reference path='../AccountManager.ts'/>


class Router {


    start() {

        var express = require('express');
        var router = express.Router();

        var editor = require('../ComicEditor');
        var accountManager = require('../AccountManager');
        var viewer = require('../ComicViewer');


        var mongo = require('mongodb');
        var monk = require('monk');
        var db = monk('localhost:27017/Sloth');
        db = monk('mongodb://admin:sloth@ds051635.mongolab.com:51635/sloth310');

        /* GET home page. */
        router.get('/', function (req, res) {
            res.render('index', {title: 'Comic Application'});
        });

        /* POST to Add Comic */
        router.post('/comics/addcomic', function(req, res) {
            editor.addComic(req, function(error, result) {
                // TODO determine which page user should be redirected to
                res.redirect('/')
            })
        });

        /* POST to Add Panel */
        router.post('/comics/:id/edit/addpanel', function(req, res) {
            editor.addPanel(req, res)
        });

        /* DELETE to Delete Comic */
        router.delete('/comics/:id/edit/deletecomic', function(req, res) {
            editor.deleteComic(req, function(error, result) {
                res.redirect('/')
            })
        });

        /*DELETE to Delete Panel
        * @param panelposition
        * @param comicId
        * */
        router.delete('/comics/:id/edit/deletepanel', function (req, res) {
            editor.deletePanel(req, res)
        });

        /* POST to Swap Panel */
        // TODO verify this is correct RESTful design
        router.post('/comics/:id/edit/swappanel', function (req, res) {
            editor.swapPanels(req, res)
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

        // NOTE: this method is likely not needed; use '/comics/:id/view/all' instead and display
        //      only the first comic
        /* GET first panel from a comic */
        // @param comicId
        router.get('/comics/:id/view/firstpanel', function(req, res) {
            // will add if needed
        });

        /* GET all panels from a comic */
        // @param ID for comic
        router.get('/comics/:id/view/all', function (req, res) {
            viewer.getPanels(req, function (error, panels) {
                res.render('panels', {
                    panels: panels
                })
            });
        });

        // TODO switch this over so it is handled by ComicViewer
        /* GET comicview page */
        router.get('/view', function (req, res) {
            // var db = req.db;
            var collection = db.get('commentcollection');
            collection.find({}, {}, function (e, docs) {
                res.render('view', {"comment": docs });
            });
        });

        // TODO switch this over so it is handled by ComicEditor
		/* Add a comment to view page */
		router.post('/addcomment', function (req, res) {
            // Set our internal DB variable
            // var db = req.db;
            // Get our form values. These rely on the "name" attributes
            var aComment = req.body.comment;
            var c = new viewComment(aComment);
            // Submit to the DB
            dbmanager.commentCollection.insert({
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



        /* GET login page */
        router.get('/login', function(req, res) {
            res.render('login', { });
        });

        /* HANDLE user login */
        router.post('/login', function(req, res) {
            accountManager.attemptLogin(req, res);
        });


        /* GET Registration Page */
        router.get('/signup', function(req, res){
            res.render('/register',{});
        });

        /* Handle Registration POST */
        router.post('/signup', function(req, res) {
            accountManager.createAccount(req, res)
        });


        /* GET Account page
        * @param username (as exists in the database)
        * */
        router.get('/account', function(req, res) {
            // manually setting it to find a specific user until we
            // figure out how to send a specific username as a query
            var user = {
                username: "tomjin"
            };
            accountManager.getAccount(user, function (err, account) {
                if (err) {
                    res.send(err)
                } else {
                    res.render('account', {
                        account: account
                    })
                }
            })
        });

        /* GET Home Page */
        router.get('/home', function(req, res){
            var collection = db.get('usercollection');
            collection.find({}, {},  function(e, docs){
                res.render('home',{
                    user : docs
                });
            });
        });

        /* GET edit page */
        router.get('/edit', function (req, res) {
            res.render('edit', {});
        });


        /* Handle Logout */
        router.get('/signout', function(req, res) {
            res.redirect('/');
        });

        module.exports = router;
    }

}

interface CommentInterface {
    getComment( comment: string);

}

class viewComment implements CommentInterface {
    private comment: string;

    constructor(comment: string) {
        this.comment = comment;
    }

    getComment(){
        return this.comment;
    }
}

var router = new Router();
router.start();