/// <reference path='types/DefinitelyTyped/node/node.d.ts' />
/// <reference path='types/DefinitelyTyped/express/express.d.ts' />
///<reference path='DBManager.ts'/>
/// <reference path='Comic.ts' />
/// <reference path='Panel.ts' />
var globalMonk = require('monk');
var globalDB = globalMonk('mongodb://admin:sloth@ds051635.mongolab.com:51635/sloth310');
var globalCollection = globalDB.get('comiccollection');
var ComicViewer = (function () {
    function ComicViewer() {
    }
    ComicViewer.prototype.start = function () {
        var monk = require('monk');
        var db = monk('mongodb://admin:sloth@ds051635.mongolab.com:51635/sloth310');
        this.dbmanager = db.get('comiccollection');
        // TODO figure out how to hook this up to DBManager
        //this.dbmanager = require('./DBManager');
    };
    ComicViewer.prototype.getComic = function (req, res) {
        var comicId = req.param.comicId;
        globalCollection.findOne({ _id: comicId }, {}, function (err, comic) {
            if (err) {
                res.send(err);
            }
            else {
                res(null, comic);
            }
        });
        //this.dbmanager.getComic({_id: comicId}, function(err, comic) {
        //    if (err) {
        //        res(err);
        //    } else {
        //        res(null, comic);
        //    }
        //});
    };
    ComicViewer.prototype.getComics = function (res) {
        // return all comics
        globalCollection.find({}, {}, function (err, comics) {
            if (err) {
                res.send(err);
            }
            else {
                res(null, comics);
            }
        });
        //this.dbmanager.getComic({}, function(err, comics) {
        //    if (err) {
        //        res(err);
        //    } else {
        //        res(null, comics);
        //    }
        //});
    };
    ComicViewer.prototype.getPanels = function (req, res) {
        // find all panels in a given comic
        var comicId = req._id;
        globalCollection.find({ "_id": comicId }, {}, function (err, comic) {
            if (err) {
                res.send(err);
            }
            else {
                //console.log(req.panels);
                res(null, req.panels);
            }
        });
        //this.dbmanager.getComic({_id: comicId}, function(err, comic) {
        //    if (err) {
        //        res(err);
        //    } else {
        //        res(null, comic.panels);
        //    }
        //});
    };
    ComicViewer.prototype.searchMatchingComics = function (req, res) {
        var input = new RegExp(req.body.query, 'i');
        var query = {
            "$or": [
                { "comicTitle": input },
                { "description": input }
            ]
        };
        var comics;
        globalCollection.find(query, {}, function (err, comics) {
            if (comics.length === 0) {
                res.render('search', {
                    "query": true,
                    "error": true,
                    "message": "No results found, please try again"
                });
            }
            else {
                var username = String(req.session.passport.user);
                if (username === 'undefined') {
                    res.render('search', {
                        "query": true,
                        "result": true,
                        "results": comics
                    });
                }
                else {
                    // begin terrible code to get reading list of currently logged in user
                    var usercollection = globalDB.get('accounts');
                    usercollection.findOne({ username: username }, {}, function (error, account) {
                        if (error) {
                            res.send("Unable to locate account");
                        }
                        else {
                            // get reading list
                            var readinglist = account.readingList;
                            // var ObjectID = require('mongodb').ObjectID;
                            //
                            // // coerce type to match DB objects
                            // for (var i = 0; i < account.readingList.length; i++) {
                            //     readinglist[i] = ObjectID(readinglist[i]);
                            // }
                            for (var i = 0; i < comics.length; i++) {
                                // set message to show next to the Reading List icon
                                if (readinglist.indexOf(String(comics[i]._id)) === -1) {
                                    comics[i].inReadingList = false;
                                }
                                else {
                                    comics[i].inReadingList = true;
                                }
                                res.render('search', {
                                    "query": true,
                                    "result": true,
                                    "results": comics
                                });
                            }
                        }
                    });
                }
            }
        });
    };
    return ComicViewer;
}());
var viewer = new ComicViewer();
viewer.start();
module.exports = viewer;
