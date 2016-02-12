/// <reference path='types/DefinitelyTyped/node/node.d.ts' />
/// <reference path='types/DefinitelyTyped/express/express.d.ts' />
/// <reference path='Comic.ts' />
/// <reference path='Panel.ts' />
var monk = require('monk');
var db = monk('mongodb://admin:sloth@ds051635.mongolab.com:51635/sloth310');
var collection = db.get('comiccollection');
var ComicEditor = (function () {
    function ComicEditor() {
    }
    // I don't think this is needed; actions can be performed
    // directly on the db instead
    //comics: Array<Comic>;
    ComicEditor.prototype.start = function () {
    };
    ComicEditor.prototype.addComic = function (req, res) {
        // creating a new comic using the req that was passed
        var newComic = new Comic(req.body.comictitle, req.body.comiccategory, req.body.panels);
        collection.insert({ newComic: newComic }, function (err, doc) {
            // TODO add error handling for this insertion
            //if (err) {
            //    // return error if insertion fails
            //    res.send("Oops! It seems there was an error. Please try again!");
            //} else {
            //    // TODO add "comiclist" page to redirect to upon successful insertion
            //    res.redirect("comiclist");
            //}
        });
    };
    ComicEditor.prototype.deleteComic = function (req, res) {
        var comicTitle = req.body.comictitle;
        // TODO add verification here to ensure user has valid permissions
        collection.remove({ comicTitle: comicTitle });
    };
    ComicEditor.prototype.addPanel = function (req, res) {
        var comicTitle = req.body.comictitle;
        var newPanel = new Panel(req.body.panelsource, req.body.position);
        var comic = collection.find({ comictitle: comicTitle });
        comic.addPanel(newPanel);
        // TODO verify this works by adding a new panel to a list of panels
        collection.update({ comictitle: comicTitle }, comic);
    };
    ComicEditor.prototype.deletePanel = function (req, res) {
        var comicTitle = req.body.comictitle;
        var panelIndex = req.body.paneltodelete;
        // pull comic from DB
        var comic = collection.find({ comicTitle: comicTitle });
        // delete panel and update indices
        comic.deletePanel(panelIndex);
        // update comic back to db with new information; passing whole comic replaces
        // existing comic while preserving the ID
        collection.update({ comicTitle: comic.title }, comic);
    };
    ComicEditor.prototype.swapPanels = function (req, res) {
        var comicTitle = req.body.comictitle;
        var panelIndex = req.body.paneltoswap;
        var newIndex = req.body.newpos;
        var comic = collection.find({ comicTitle: comicTitle });
        comic.swapPanel(panelIndex, newIndex);
        collection.update({ comicTitle: comic.title }, comic);
    };
    return ComicEditor;
})();
var editor = new ComicEditor();
editor.start();
//# sourceMappingURL=ComicEditor.js.map