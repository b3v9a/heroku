///<reference path='../types/DefinitelyTyped/node/node.d.ts'/>
///<reference path='../types/DefinitelyTyped/express/express.d.ts'/>
///<reference path='../ComicEditor.ts'/>
///<reference path='../ComicViewer.ts'/>


class Router {


    start() {

        var express = require('express');
        var router = express.Router();


        /* GET home page. */
        router.get('/', function (req, res, next) {
            res.render('index', {title: 'Express'});
        });

        /* POST to Add Comic */
        router.post('/addcomic', function(req, res) {
            editor.addComic(req, res)
        });

        /* POST to Add Panel */
        // TODO determine how panels should be added - should this point to the "Edit" page?
        router.post('/addpanel', function(req, res) {
            editor.addPanel(req, res)
        });

        /* DELETE to Delete Comic */
        router.delete('/deletecomic', function(req, res) {
            editor.deleteComic(req, res)
        });

        /*DELETE to Delete Panel */
        router.delete('/deletepanel', function (req, res) {
            editor.deletePanel(req, res)
        });

        /* POST to Swap Panel */
        // TODO verify this is correct RESTful design
        router.post('/swappanel', function (req, res) {
            editor.swapPanels(req, res)
        });

        /* GET a single comic */
        // requires comic title
        router.get('/comictile', function(req, res) {
            viewer.getComic(req, res);
        });

        /* GET all comics */
        router.get('/comiclist', function(req, res) {
            viewer.getComics(req, res);
        });

        /* GET first panel from a comic */
        // requires comic title
        router.get('/firstpanel', function(req, res) {
            viewer.getFirstPanel(req, res);
        });

        /* GET all panels from a comic */
        // requires comic title
        router.get('panellist', function (req, res) {
            viewer.getPanels(req, res);
        });

        module.exports = router;
    }
}

var router = new Router();
router.start();