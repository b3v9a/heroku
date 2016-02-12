/// <reference path='types/DefinitelyTyped/node/node.d.ts' />
/// <reference path='types/DefinitelyTyped/express/express.d.ts' />
/// <reference path='Comic.ts' />
/// <reference path='Panel.ts' />

var monk = require('monk');
var db = monk('mongodb://admin:sloth@ds051635.mongolab.com:51635/sloth310');
var collection = db.get('comiccollection');

class ComicViewer {


    start() {

    }

    getComic(req, res) {
        // find comic using properties from req
        var comicTitle = req.body.comictitle;

        //
        collection.find({comicTitle: comicTitle}, {}, function(err, docs) {
            res.render('/comictile', {
                "comictile" : docs
            });
        });
    }

    getComics(req, res) {
        // return all comics
        collection.find({}, {}, function(err, docs) {
            res.render('/comiclist', {
                "comiclist": docs
            });
        });
    }

    getFirstPanel(req, res) {
        // find first panel for a comic
        var comicTitle = req.body.comictitle;

        var comic = collection.find({comicTitle: comicTitle});
        var panel = comic.panels[0];

        res.render('/firstpanel', {
            "panel": panel
        })
    }

    getPanels(req, res) {
        // find all panels in a given comic
        var comicTitle = req.body.comictitle;

        var comic = collection.find({comicTitle: comicTitle});
        var panels = comic.getPanels();

        res.render('/panellist', {
            "panellist": panels
        })
    }


}

var viewer = new ComicViewer();
viewer.start();
