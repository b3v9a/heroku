/// <reference path='types/DefinitelyTyped/node/node.d.ts' />
/// <reference path='types/DefinitelyTyped/express/express.d.ts' />
var Panel = (function () {
    function Panel(id, source, position) {
        this._id = id;
        this.source = source;
        this.position = position;
    }
    Panel.prototype.updatePos = function (pos) {
        this.position = pos;
    };
    return Panel;
}());
