/// <reference path='types/DefinitelyTyped/node/node.d.ts' />
/// <reference path='types/DefinitelyTyped/express/express.d.ts' />
/// <reference path='Panel.ts' />
/// <reference path='UserComment.ts' />
/// <reference path='Rating.ts' />
var Comic = (function () {
    function Comic(id, title, category, description, panels, comments, ratings) {
        this._id = id;
        this.title = title;
        this.category = category;
        this.description = description;
        this.panels = panels;
        this.comments = comments;
        this.ratings = ratings;
    }
    // deletes the specified panel from the list of panels
    Comic.prototype.deletePanel = function (pos) {
        this.panels.splice(pos, 1);
        this.updatePanels();
    };
    // updates the indices of the panels after a panel has been added/moved/deleted
    Comic.prototype.updatePanels = function () {
        for (var i = 0; i < this.panels.length; i++) {
            this.panels[i].updatePos(i);
        }
    };
    Comic.prototype.addPanel = function (panel) {
        // adds panel to the end of current list of panels
        // is there a better way to add to the end of an array in TypeScript?
        var len = this.panels.length;
        panel.position = len;
        this.panels[len] = panel;
    };
    Comic.prototype.swapPanel = function (pos, newPos) {
        var currPanel = this.panels[pos];
        var changePanel = this.panels[newPos];
        currPanel.position = newPos;
        changePanel.position = pos;
    };
    Comic.prototype.getPanels = function () {
        return this.panels;
    };
    return Comic;
}());
