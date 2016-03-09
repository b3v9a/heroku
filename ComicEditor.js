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
            title: req.body.comictitle,
            category: req.body.comiccategory,
            description: req.body.description
        };
        globalCollection.insert(newComic, {}, function (err, result) {
            if (err) {
                res.send("Insertion unsuccessful: " + err);
            }
            else {
                res.send("Comic added!");
            }
        });
        //this.dbmanager.upsertComic(newComic, function(err, comic) {
        //    if (err) { // return error if insertion fails
        //        res(err)
        //    } else { // return inserted comic if successful
        //        res(comic)
        //    }
        //});
    };
    ComicEditor.prototype.deleteComic = function (req, res) {
        var comicId = req.param('_id');
        // TODO add verification here to ensure user has valid permissions
        globalCollection.delete({ _id: comicId }, {}, function (err, result) {
            if (err) {
                res.send("Deletion unsuccessful: " + err);
            }
            else {
                res.send("Comic deleted!");
            }
        });
        //this.dbmanager.deleteComic(comicId, function(err, result) {
        //    if (err) {
        //        res("Deletion unsuccessful: " + err)
        //    } else {
        //        res("Comic deleted!")
        //    }
        //});
    };
    ComicEditor.prototype.addPanel = function (req, res) {
        var comicId = req.param._id;
        this.dbmanager.find({ _id: comicId }, {}, function (err, result) {
            if (err) {
                res("Cannot find comic: " + err);
            }
            else {
                var comic = result;
                console.log(comic);
                console.log("Comic is above, numPanels is below");
                var numPanels = comic.panels.length;
                var newPanel = {
                    source: req.body.panelsource,
                    position: numPanels
                };
                // insert new panel into last position in current set of panels
                comic.panels[numPanels] = newPanel;
                globalCollection.upsert({ _id: comic._id }, {}, function (err, result) {
                    if (err) {
                        res.send("Insertion unsuccessful: " + err);
                    }
                    else {
                        res.send("Comic updated!");
                    }
                });
            }
        });
        //this.dbmanager.getComic(comicId, function (err, result) {
        //    if (err) {
        //        res("Cannot find comic: " + err)
        //    } else {
        //        comic = result;
        //    }
        //});
    };
    ComicEditor.prototype.deletePanel = function (req, res) {
        var comicId = req.param('_id');
        var panelIndex = req.body.panelposition;
        // pull comic from DB
        var comic;
        globalCollection.find({ _id: comicId }, {}, function (err, result) {
            if (err) {
                res.send("Cannot find comic: " + err);
            }
            else {
                for (var i = 0; i < comic.panels.length; i++) {
                    if (comic.panels[i].position === panelIndex) {
                        comic.panels.splice(i, 1);
                    }
                }
                globalCollection.upsert(comic, {}, function (err, result) {
                    if (err) {
                        res.send("Insertion unsuccessful: " + err);
                    }
                    else {
                        res.send("Comic updated!");
                    }
                });
            }
        });
        //this.dbmanager.getComic(comicId, function (err, result) {
        //    if (err) {
        //        res("Cannot find comic: " + err)
        //    } else {
        //        comic = result;
        //    }
        //});
        //
        //for (var i=0; i<comic.panels.length; i++) {
        //    if (comic.panels[i].position === panelIndex) {
        //        comic.panels.splice(i, 1);
        //    }
        //}
        //
        //this.dbmanager.upsertComic(comic, function(err, result) {
        //    if (err) {
        //        res("Insertion unsuccessful: " + err)
        //    } else {
        //        res("Comic updated!")
        //    }
        //})
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