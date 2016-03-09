///<reference path='../types/DefinitelyTyped/node/node.d.ts'/>
///<reference path='../types/DefinitelyTyped/express/express.d.ts'/>
///<reference path='../ComicEditor.ts'/>
///<reference path='../ComicViewer.ts'/>
///<reference path='../AccountManager.ts'/>
var Router = (function () {
    function Router() {
    }
    Router.prototype.start = function () {
        var express = require('express');
        var router = express.Router();
        var editor = require('../ComicEditor');
        var accountManager = require('../AccountManager');
        var viewer = require('../ComicViewer');
        var mongo = require('mongodb');
        var monk = require('monk');
        //var db = monk('localhost:27017/Sloth');
        var db = monk('mongodb://admin:sloth@ds051635.mongolab.com:51635/sloth310');
        /* GET Index page. */
        router.get('/', function (req, res) {
            res.render('index', { title: 'Comic Application' });
        });
        /* GET View page. */
        router.get('/view/:id/', function (req, res) {
            var comic = req.params.id;
            var collection = db.get('comiccollection');
            collection.find({ "_id": comic }, {}, function (e, docs) {
                res.render('view', {
                    "comic": docs
                });
            });
        });
        /* POST to Add Comic
         * @param comicTitle - the title of the comic to be created
         * @param comicDescription - the description of the comic to be created
         * @param category - the category to be associated with the comic
         *  */
        router.post('/comics/addcomic', function (req, res) {
            editor.addComic(req, function (error, result) {
                // TODO determine which page user should be redirected to
                res.redirect('/');
            });
        });
        /* DELETE to Delete Comic
        * @param comicId - the ID of the comic to be deleted
        * */
        router.delete('/comics/:id/edit/deletecomic', function (req, res) {
            editor.deleteComic(req, function (error, result) {
                res.redirect('/');
            });
        });
        /* POST to Add Panel
        * @param comicId - the ID of the comic which the panel should be added to
        * @param panelSource - a URL where the image representing the panel is located
        * */
        router.post('/comics/:id/edit/addpanel', function (req, res) {
            var pid = {
                "_id": 5,
                "comicTitle": "Not A Villain",
                "comicCategory": "Fantasy",
                "description": "This is a comic",
                "comicSource": "http://navcomic.com/",
                "panels": [
                    {
                        "_id": 1,
                        "source": "http://navcomic.com/wp-content/uploads/2013/05/Page-001-4.png",
                        "position": 1
                    },
                    {
                        "_id": 2,
                        "source": "http://static.navcomic.com/wp-content/uploads/2010/11/Page-001-5-title.png",
                        "position": 2
                    },
                    {
                        "_id": 3,
                        "source": "http://static.navcomic.com/wp-content/uploads/2010/10/Page-002-1.jpg",
                        "position": 3
                    },
                    {
                        "_id": 4,
                        "source": "http://static.navcomic.com/wp-content/uploads/2010/10/Page-003-1.jpg",
                        "position": 4
                    },
                    {
                        "_id": 5,
                        "source": "http://static.navcomic.com/wp-content/uploads/2010/11/Page-004-1.jpg",
                        "position": 5
                    },
                    {
                        "_id": 6,
                        "source": "http://static.navcomic.com/wp-content/uploads/2011/02/Page-005-2.png",
                        "position": 6
                    }
                ]
            };
            editor.addPanel(pid, res);
            //res.redirect('/');
            // TODO REDIRECT?
        });
        /* DELETE to Delete Panel
        * @param panelId - the ID of the panel to be deleted
        * @param comicId - the ID of the comic that the panel belongs to
        * */
        router.delete('/comics/:id/edit/deletepanel', function (req, res) {
            editor.deletePanel(req, res);
        });
        /* POST to Swap Panel */
        // WARNING: This method is currently not working -- DO NOT USE IT
        router.post('/comics/:id/edit/swappanel', function (req, res) {
            editor.swapPanels(req, res);
        });
        /* GET a single comic
         * @param comicId - ID of comic being requested
         */
        router.get('/comics/:id/view/', function (req, res) {
            viewer.getComic(req, function (error, comic) {
                res.render('comic', {
                    comic: comic
                });
            });
        });
        /* GET all comics */
        router.get('/comics/view/all', function (req, res) {
            viewer.getComics(function (error, comics) {
                res.render('comics', {
                    title: "All Comics",
                    comics: comics
                });
            });
        });
        // NOTE: this method is likely not needed; use '/comics/:id/view/all' instead and display
        //      only the first comic
        /* GET first panel from a comic */
        // @param comicId
        router.get('/comics/:id/view/firstpanel', function (req, res) {
            // will add if needed
        });
        /* GET all panels from a comic */
        // @param comicId - ID for comic
        router.get('/comics/:id/view/all', function (req, res) {
            var cid = {
                "_id": 1,
                "comicTitle": "Replay",
                "comicCategory": "Humor",
                "comicSource": "http://replaycomic.com/",
                "description": "This is a comic",
                "panels": [
                    {
                        "source": "http://replaycomic.com/wp-content/uploads/2014/08/13.png",
                        "position": 1
                    },
                    {
                        "source": "http://replaycomic.com/wp-content/uploads/2014/08/23.png",
                        "position": 2
                    },
                    {
                        "source": "http://replaycomic.com/wp-content/uploads/2014/08/33.png",
                        "position": 3
                    },
                    {
                        "source": "http://replaycomic.com/wp-content/uploads/2014/09/4.png",
                        "position": 4
                    },
                    {
                        "source": "http://replaycomic.com/wp-content/uploads/2014/09/5.png",
                        "position": 5
                    },
                    {
                        "source": "http://replaycomic.com/wp-content/uploads/2014/09/6.png",
                        "position": 6
                    }
                ]
            };
            viewer.getPanels(cid, function (error, panels) {
                res.render('edit', {
                    panels: panels,
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
            editor.addComment(req, res);
        });
        /* Update a comment
        * @param comicId - the ID of the comic which the comment belongs to
        * @param commentId - the ID of the comment the user is updating
        * @param userId - the ID of the user who is editing the comment
        * @param comment - the updated text of the comment to be stored
         */
        router.post('/comics/:id/view/updatecomment', function (req, res) {
            editor.updateComment(req, res);
        });
        /* Add a rating to a comic
        * @param comicId - the ID of the comic which the rating belongs to
        * @param userId - the ID of the user who is adding the rating
        * @param rating - a number (1 through 5) representing the desired rating
         */
        router.post('/comics/:id/view/addrating', function (req, res) {
            editor.addRating(req, res);
        });
        /* Update a rating
         * @param comicId - the ID of the comic which the rating belongs to
         * @param ratingId - the ID of the rating the user is updating
         * @param userId - the ID of the user who is editing the rating
         * @param rating - the updated rating to be stored
         */
        router.post('/comics/:id/view/updatecomment', function (req, res) {
            editor.updateComment(req, res);
        });
        /* GET login page */
        router.get('/login', function (req, res) {
            res.render('login', {});
        });
        /* HANDLE user login */
        router.post('/login', function (req, res) {
            accountManager.attemptLogin(req, res);
        });
        /* GET Registration Page */
        router.get('/signup', function (req, res) {
            res.render('register', {});
        });
        /* Handle Registration POST
        * @param username - the username for the account to be created
        * @param password - the password for the account
        * @param firstname - the first name of the user
        * @param email - the email address of the user
        * */
        router.post('/signup', function (req, res) {
            accountManager.createAccount(req, res);
        });
        /* GET Account page
        * @param username (as exists in the database)
        * */
        router.get('/account', function (req, res) {
            // manually setting it to find a specific user until we
            // figure out how to send a specific username as a query
            var user = {
                username: "tomjin"
            };
            accountManager.getAccount(user, function (err, account) {
                if (err) {
                    res.send(err);
                }
                else {
                    res.render('account', {
                        account: account,
                        title: "Account Information"
                    });
                }
            });
        });
        /* GET Home Page */
        router.get('/home', function (req, res) {
            var collection = db.get('comiccollection');
            collection.find({}, {}, function (e, docs) {
                res.render('home', {
                    "comics": docs
                });
            });
        });
        /* GET Search Page */
        router.get('/search', function (req, res) {
            var collection = db.get('comiccollection');
            collection.find({}, {}, function (e, docs) {
                res.render('search', {
                    "comics": docs
                });
            });
        });
        /* GET edit page */
        //router.get('/edit', function (req, res) {
        //    res.render('edit', {});
        //});
        /* Handle Logout */
        router.get('/signout', function (req, res) {
            res.redirect('/');
        });
        module.exports = router;
    };
    return Router;
})();
var router = new Router();
router.start();
//# sourceMappingURL=index.js.map