/// <reference path='types/DefinitelyTyped/node/node.d.ts' />
/// <reference path='types/DefinitelyTyped/express/express.d.ts' />
///<reference path='DBManager.ts'/>
/// <reference path='Comic.ts' />
/// <reference path='Panel.ts' />
var globalMonk = require('monk');
var globalDB = globalMonk('mongodb://admin:sloth@ds051635.mongolab.com:51635/sloth310');
var globalCollection = globalDB.get('comiccollection');
var ComicEditor = (function () {
    function ComicEditor() {
    }
    ComicEditor.prototype.start = function () {
        var monk = require('monk');
        var db = monk('mongodb://admin:sloth@ds051635.mongolab.com:51635/sloth310');
        this.dbmanager = db.get('comiccollection');
        // TODO figure out how to hook this up to DBManager
        //this.dbmanager = require('./DBManager');
    };
    ComicEditor.prototype.addComic = function (req, res) {
        // creating a new comic using the req that was passed
        // TODO determine which props are required on insert
        var newComic = {
            title: req.body.comicTitle,
            category: req.body.category,
            description: req.body.comicDescription
        };
        globalCollection.insert(newComic, {}, function (err, result) {
            if (err) {
                res.send("Unable to add comic: " + err);
            }
            else {
                res.send("Comic added!");
            }
        });
    };
    ComicEditor.prototype.deleteComic = function (req, res) {
        var comicId = req.param.comicId;
        // TODO add verification here to ensure user has valid permissions
        globalCollection.delete({ _id: comicId }, {}, function (err, result) {
            if (err) {
                res.send("Unable to delete comic: " + err);
            }
            else {
                res.send("Comic deleted!");
            }
        });
    };
    ComicEditor.prototype.addPanel = function (req, res) {
        //var comicId = req.param.comicId;
        //var panelSource = req.param.panelSource;
        var panelSource = req.panels[0].source;
        var comicId = req._id;
        //console.log(comicId);
        //console.log(panelSource);
        this.dbmanager.find({ _id: comicId }, {}, function (err, result) {
            if (err) {
                res("Cannot find comic: " + err);
            }
            else {
                var comic = result;
                var pnl = req.panels;
                //var numPanels = comic.panels.length;
                var numPanels = pnl.length;
                //console.log(numPanels);
                var randomizedId = Math.floor((Math.random() * 10000));
                var newPanel = {
                    _id: randomizedId,
                    source: panelSource,
                    position: numPanels + 1
                };
                console.log(newPanel);
                // insert new panel into last position in current set of panels
                //comic.panels[numPanels] = newPanel;
                pnl[numPanels] = newPanel;
                globalCollection.insert({ _id: comic._id }, {}, function (err, result) {
                    if (err) {
                        res.send("Unable to add panel: " + err);
                    }
                    else {
                        res.send("Panel successfully added!");
                    }
                });
            }
        });
    };
    ComicEditor.prototype.deletePanel = function (req, res) {
        var comicId = req.param.comicId;
        var panelId = req.body.panelId;
        // pull comic from DB
        var comic;
        globalCollection.find({ _id: comicId }, {}, function (err, result) {
            if (err) {
                res.send("Cannot find comic: " + err);
            }
            else {
                for (var i = 0; i < comic.panels.length; i++) {
                    if (comic.panels[i]._id === panelId) {
                        comic.panels.splice(i, 1);
                    }
                }
                globalCollection.upsert(comic, {}, function (err, result) {
                    if (err) {
                        res.send("Something went wrong when trying to delete the panel: " + err);
                    }
                    else {
                        res.send("Panel successfully deleted!");
                    }
                });
            }
        });
    };
    ComicEditor.prototype.addComment = function (req, res) {
        // Get our form values
        var commentText = req.body.comment;
        var userId = req.body.userId;
        var comicId = req.body.comicId;
        globalCollection.find({ _id: comicId }, {}, function (err, result) {
            if (err) {
                res.send("Cannot find comic: " + err);
            }
            else {
                // initialize comic here
                var comic = result;
                var numComments = comic.comments.length;
                // TODO figure out a way to give a unique ID to each comment
                var randomizedId = Math.floor((Math.random() * 10000));
                // add new comment to end of comments list
                comic.comments[numComments] = {
                    _id: randomizedId,
                    text: commentText,
                    userId: userId,
                    date: new Date()
                };
                globalCollection.upsert(comic, {}, function (err, result) {
                    if (err) {
                        res.send("Unable to add comment: " + err);
                    }
                    else {
                        res.send("Comment successfully added!");
                    }
                });
            }
        });
    };
    ComicEditor.prototype.updateComment = function (req, res) {
        // Get our form values
        var commentText = req.body.comment;
        // TODO add verification to make sure this user is the one who posted the comment
        var userId = req.body.userId;
        var comicId = req.body.comicId;
        var commentId = req.body.commentId;
        globalCollection.find({ _id: comicId }, {}, function (err, result) {
            if (err) {
                res.send("Cannot find comic: " + err);
            }
            else {
                // initialize comic here
                var comic = result;
                var numComments = comic.comments.length;
                for (var i = 0; i < numComments; i++) {
                    if (comic.comments[i]._id === commentId) {
                        comic.comments[i].text = commentText;
                    }
                }
                globalCollection.upsert(comic, {}, function (err, result) {
                    if (err) {
                        res.send("Unable to edit comment: " + err);
                    }
                    else {
                        res.send("Comment successfully updated!");
                    }
                });
            }
        });
    };
    ComicEditor.prototype.addRating = function (req, res) {
        // Get our form values
        var rating = req.body.rating;
        var userId = req.body.userId;
        var comicId = req.body.comicId;
        globalCollection.find({ _id: comicId }, {}, function (err, result) {
            if (err) {
                res.send("Cannot find comic: " + err);
            }
            else {
                // initialize comic here
                var comic = result;
                var numRatings = comic.ratings.length;
                // TODO figure out a way to give a unique ID to each rating
                var randomizedId = Math.floor((Math.random() * 10000));
                // add new rating to end of ratingslist
                comic.comments[numRatings] = {
                    _id: randomizedId,
                    value: rating,
                    userId: userId,
                    date: new Date()
                };
                globalCollection.upsert(comic, {}, function (err, result) {
                    if (err) {
                        res.send("Unable to add comment: " + err);
                    }
                    else {
                        res.send("Comment successfully added!");
                    }
                });
            }
        });
    };
    ComicEditor.prototype.editRating = function (req, res) {
        // Get our form values
        var userId = req.body.userId;
        var comicId = req.body.comicId;
        var rating = req.body.rating;
        var ratingId = req.body.ratingId;
        globalCollection.find({ _id: comicId }, {}, function (err, result) {
            if (err) {
                res.send("Cannot find comic: " + err);
            }
            else {
                // initialize comic here
                var comic = result;
                var numRatings = comic.ratings.length;
                for (var i = 0; i < numRatings; i++) {
                    if (comic.ratings[i]._id === ratingId) {
                        comic.ratings[i].value = rating;
                    }
                }
                globalCollection.upsert(comic, {}, function (err, result) {
                    if (err) {
                        res.send("Unable to add comment: " + err);
                    }
                    else {
                        res.send("Comment successfully added!");
                    }
                });
            }
        });
    };
    ComicEditor.prototype.swapPanels = function (req, res) {
        var comicId = req.param('_id');
        var panelIndex = req.body.firstPanel;
        var newIndex = req.body.secondPanel;
        var comic;
        this.dbmanager.getComic(comicId, function (err, result) {
            if (err) {
                res("Cannot find comic: " + err);
            }
            else {
                comic = result;
            }
        });
        var first;
        var second;
        for (var i = 0; i < comic.panels.length; i++) {
            if (comic.panels[i].position === panelIndex) {
                first = i;
            }
            else if (comic.panels[i].position === newIndex) {
                second = i;
            }
        }
        var panel = comic.panels[first];
        comic.panels[first] = comic.panels[second];
        comic.panels[second] = panel;
        this.dbmanager.upsertComic(comic, function (err, result) {
            if (err) {
                res("Insertion unsuccessful: " + err);
            }
            else {
                res("Comic updated!");
            }
        });
    };
    return ComicEditor;
})();
var editor = new ComicEditor();
editor.start();
module.exports = editor;
//# sourceMappingURL=ComicEditor.js.map