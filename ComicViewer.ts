/// <reference path='types/DefinitelyTyped/node/node.d.ts' />
/// <reference path='types/DefinitelyTyped/express/express.d.ts' />
///<reference path='DBManager.ts'/>
/// <reference path='Comic.ts' />
/// <reference path='Panel.ts' />

var globalMonk = require('monk');
var globalDB = globalMonk('mongodb://admin:sloth@ds051635.mongolab.com:51635/sloth310');
var globalCollection = globalDB.get('comiccollection');

class ComicViewer {

    dbmanager;

    start() {
        var monk = require('monk');
        var db = monk('mongodb://admin:sloth@ds051635.mongolab.com:51635/sloth310');
        this.dbmanager = db.get('comiccollection');

        // TODO figure out how to hook this up to DBManager
        //this.dbmanager = require('./DBManager');
    }

    getComic(req, res) {
        var comicId = req.param('_id');

        globalCollection.findOne({_id: comicId}, {}, function(err, comic) {
            if (err) {
                res.send(err)
            } else {
                res(null, comic)
            }
        });

        //this.dbmanager.getComic({_id: comicId}, function(err, comic) {
        //    if (err) {
        //        res(err);
        //    } else {
        //        res(null, comic);
        //    }
        //});
    }

    getComics(res) {
        // return all comics

        globalCollection.find({}, {}, function(err, comics) {
            if (err) {
                res.send(err)
            } else {
                res(null, comics)
            }
        });

        //this.dbmanager.getComic({}, function(err, comics) {
        //    if (err) {
        //        res(err);
        //    } else {
        //        res(null, comics);
        //    }
        //});
    }

    getPanels(req, res) {
        // find all panels in a given comic
        var comicId = req.param('_id');

        globalCollection.find({_id: comicId}, {}, function(err, comic) {
            if (err) {
                res.send(err)
            } else {
                res(null, comic.panels)
            }
        });

        //this.dbmanager.getComic({_id: comicId}, function(err, comic) {
        //    if (err) {
        //        res(err);
        //    } else {
        //        res(null, comic.panels);
        //    }
        //});
    }


}

var viewer = new ComicViewer();
viewer.start();
module.exports = viewer;