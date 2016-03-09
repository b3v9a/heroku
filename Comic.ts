/// <reference path='types/DefinitelyTyped/node/node.d.ts' />
/// <reference path='types/DefinitelyTyped/express/express.d.ts' />
/// <reference path='Panel.ts' />

class Comic {

    // _id is only set after insertion into the DB; it will be a long alphanumeric
    //      string, unfortunately
    // TODO: find a way to store comic IDs more effectively
    _id: number;
    title: string;
    category: string;
    panels: Panel[];

    constructor(title: string, category: string, panels: Panel[]) {
        this.title = title;
        this.category = category;
        this.panels = panels;
    }

    // deletes the specified panel from the list of panels
    deletePanel(pos: number) {
        this.panels.splice(pos, 1);
        this.updatePanels();
    }

    // updates the indices of the panels after a panel has been added/moved/deleted
    updatePanels() {
        for (var i=0; i<this.panels.length; i++) {
            this.panels[i].updatePos(i);
        }
    }

    addPanel(panel: Panel) {
        // adds panel to the end of current list of panels
        // is there a better way to add to the end of an array in TypeScript?
        var len = this.panels.length;
        panel.position = len;
        this.panels[len] = panel;
    }

    swapPanel(pos: number, newPos: number) {
        var currPanel = this.panels[pos];
        var changePanel = this.panels[newPos];

        currPanel.position = newPos;
        changePanel.position = pos;
    }

    getPanels() {
        return this.panels;
    }
}