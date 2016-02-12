/// <reference path='types/DefinitelyTyped/node/node.d.ts' />
/// <reference path='types/DefinitelyTyped/express/express.d.ts' />
/// <reference path='Comic.ts' />
/// <reference path='Panel.ts' />
var monk = require('monk');
var db = monk('mongodb://admin:sloth@ds051635.mongolab.com:51635/sloth310');
var collection = db.get('comiccollection');
var ComicViewer = (function () {
    function ComicViewer() {
    }
    ComicViewer.prototype.start = function () {
    };
    ComicViewer.prototype.getComic = function (req, res) {
        // find comic using properties from req
        var comicTitle = req.body.comictitle;
        //
        collection.find({ comicTitle: comicTitle }, {}, function (err, docs) {
            res.render('/comictile', {
                "comictile": docs
            });
        });
    };
    ComicViewer.prototype.getComics = function (req, res) {
        // return all comics
        collection.find({}, {}, function (err, docs) {
            res.render('/comiclist', {
                "comiclist": docs
            });
        });
    };
    ComicViewer.prototype.getFirstPanel = function (req, res) {
        // find first panel for a comic
        var comicTitle = req.body.comictitle;
        var comic = collection.find({ comicTitle: comicTitle });
        var panel = comic.panels[0];
        res.render('/firstpanel', {
            "panel": panel
        });
    };
    ComicViewer.prototype.getPanels = function (req, res) {
        // find all panels in a given comic
        var comicTitle = req.body.comictitle;
        var comic = collection.find({ comicTitle: comicTitle });
        var panels = comic.getPanels();
        res.render('/panellist', {
            "panellist": panels
        });
    };
    return ComicViewer;
})();
var viewer = new ComicViewer();
viewer.start();
//# sourceMappingURL=ComicViewer.js.map