/// <reference path='types/DefinitelyTyped/node/node.d.ts' />
/// <reference path='types/DefinitelyTyped/express/express.d.ts' />
///<reference path='DBManager.ts'/>
/// <reference path='Comic.ts' />
/// <reference path='Panel.ts' />
var globalMonk = require('monk');
var globalDB = globalMonk('mongodb://admin:sloth@ds051635.mongolab.com:51635/sloth310');
var globalCollection = globalDB.get('comiccollection');
var users = globalDB.get('accounts');
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
        var username = req.session.passport.user;
        username = String(username);
        var comicId = req.body.comicId;
        console.log(comicId);
        globalCollection.findOne({ _id: comicId }, {}, function (err, comic) {
            if (err) {
                res.send("Cannot find comic: " + err);
            }
            else {
                // initialize comic here
                var comic = comic;
                // TODO figure out a way to give a unique ID to each comment
                var randomizedId = Math.floor((Math.random() * 10000));
                // add new comment to end of comments list
                comic.comments.push({
                    _id: randomizedId,
                    text: commentText,
                    username: username,
                    score: 0,
                    date: new Date()
                });
                globalCollection.update({ _id: comic._id }, comic, function (err, result) {
                    if (err) {
                        res.send("Unable to add comment: " + err);
                    }
                    else {
                        res.redirect('/view/' + comicId);
                    }
                });
            }
        });
    };
    ComicEditor.prototype.deleteComment = function (req, res) {
        //var userId = req.body.userId;
        var username = "name";
        var comicId = req.body.comicid;
        globalCollection.findOne({ _id: comicId }, {}, function (err, comic) {
            if (err) {
                res.send("Cannot find comic: " + err);
            }
            else {
                // initialize comic here
                var comic = comic;
                // TODO figure out a way to give a unique ID to each comment
                var i = 0;
                for (i = 0; i < comic.comments.length; i++) {
                    if (Number(comic.comments[i]._id) === Number(req.body.commentid)) {
                        comic.comments.splice(i, 1);
                        break;
                    }
                }
                globalCollection.update({ _id: comic._id }, comic, function (err, result) {
                    if (err) {
                        res.send("Unable to add comment: " + err);
                    }
                    else {
                        res.redirect('/view/' + comicId);
                    }
                });
            }
        });
    };
    ComicEditor.prototype.changeScore = function (req, res) {
        //var userId = req.body.userId;
        var comicId = req.body.comicid;
        globalCollection.findOne({ _id: comicId }, {}, function (err, comic) {
            if (err) {
                res.send("Cannot find comic: " + err);
            }
            else {
                // initialize comic here
                var comic = comic;
                var commentId = Number(req.body.commentid);
                var buttonval = Number(req.body.buttonval);
                var delta = Number(req.body.delta);
                var username = req.session.passport.user;
                username = String(username);
                for (var i = 0; i < comic.comments.length; i++) {
                    if (comic.comments[i]._id === commentId) {
                        comic.comments[i].score += delta;
                    }
                }
                globalCollection.update({ _id: comic._id }, comic, function (err, result) {
                    if (err) {
                        res.send("Unable to update score: " + err);
                    }
                    else {
                        //CURRENTLY USERNAME IS NOT DYNAMIC
                        users.findOne({ username: username }, {}, function (err, user) {
                            if (err) {
                                res.send("Cannot find comic: " + err);
                            }
                            else {
                                var inArray = true;
                                for (var i = 0; i < user.upvotes.length; i++) {
                                    if (user.upvotes[i]._id === commentId) {
                                        if (user.upvotes[i].score === -delta && user.upvotes[i].score === buttonval) {
                                            user.upvotes[i].score = 0;
                                            inArray = false;
                                            break;
                                        }
                                        else {
                                            user.upvotes[i].score = delta;
                                            inArray = false;
                                            break;
                                        }
                                    }
                                }
                                if (inArray) {
                                    user.upvotes.push({
                                        _id: commentId,
                                        score: delta
                                    });
                                }
                                users.update({ username: username }, user, function (err, result) {
                                    if (err) {
                                        res.send("Unable to update score: " + err);
                                    }
                                    else {
                                        res.redirect(comicId);
                                    }
                                });
                            }
                        });
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
    ComicEditor.prototype.addrating = function (req, res) {
        // Get our form values
        var rateselection = Number(req.body.rating);
        var username = req.session.passport.user;
        username = String(username);
        var accounts = globalDB.get('accounts');
        var comicId = req.body.comicid;
        var comicIdString = String(req.body.comicid);
        globalCollection.findOne({ _id: comicId }, {}, function (err, comic) {
            if (err) {
                res.send("Cannot find comic: " + err);
            }
            else {
                accounts.findOne({ username: username }, {}, function (err, user) {
                    if (err) {
                        res.send("Cannot find user: " + err);
                    }
                    else {
                        var oldrating = Number(req.body.oldrating);
                        if (oldrating === 0) {
                            var newsumallscores = Number(comic.rating.sumallscores) + rateselection;
                            var newnumbervotes = Number(comic.rating.numbervotes) + 1;
                            var newscore = newsumallscores / newnumbervotes;
                            comic.rating = {
                                score: newscore,
                                sumallscores: newsumallscores,
                                numbervotes: newnumbervotes
                            };
                        }
                        if (oldrating !== rateselection && oldrating !== 0) {
                            var newsumallscores = Number(comic.rating.sumallscores) + rateselection - oldrating;
                            var newnumbervotes = Number(comic.rating.numbervotes);
                            var newscore = newsumallscores / newnumbervotes;
                            comic.rating = {
                                score: newscore,
                                sumallscores: newsumallscores,
                                numbervotes: newnumbervotes
                            };
                        }
                        if (oldrating === rateselection) {
                            console.log(comic.rating);
                            var newsumallscores = Number(comic.rating.sumallscores);
                            newsumallscores = newsumallscores - oldrating;
                            var newnumbervotes = Number(comic.rating.numbervotes);
                            var newnumbervotes = newnumbervotes - 1;
                            if (newnumbervotes === 0) {
                                var newscore = 0;
                            }
                            else {
                                var newscore = newsumallscores / newnumbervotes;
                            }
                            comic.rating = {
                                score: newscore,
                                sumallscores: newsumallscores,
                                numbervotes: newnumbervotes
                            };
                        }
                        var i = 0;
                        var alreadyrated = false;
                        if (user.ratings.length !== 0) {
                            console.log("im in if!");
                            for (i = 0; i < user.ratings.length; i++) {
                                if (String(user.ratings[i]._id) === comicIdString) {
                                    if (oldrating === rateselection) {
                                        user.ratings[i] = { _id: comicId, score: 0 };
                                    }
                                    else {
                                        user.ratings[i] = { _id: comicId, score: rateselection };
                                    }
                                    alreadyrated = true;
                                    break;
                                }
                            }
                        }
                        if (!alreadyrated) {
                            console.log("im in second if!");
                            user.ratings.push({ _id: comicId, score: rateselection });
                        }
                        globalCollection.update({ _id: comicId }, comic, function (err, comic) {
                            if (err) {
                                res.send("Unable to add score to comic: " + err);
                            }
                            else {
                                accounts.update({ username: username }, user, function (err, user) {
                                    if (err) {
                                        res.send("Unable to add score to user: " + err);
                                    }
                                    else {
                                        res.redirect('/');
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    };
    return ComicEditor;
})();
var editor = new ComicEditor();
editor.start();
module.exports = editor;
//# sourceMappingURL=ComicEditor.js.map
