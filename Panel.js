/// <reference path='types/DefinitelyTyped/node/node.d.ts' />
/// <reference path='types/DefinitelyTyped/express/express.d.ts' />
var Panel = (function () {
    function Panel(source, position) {
        this.source = source;
        this.position = position;
    }
    Panel.prototype.updatePos = function (pos) {
        this.position = pos;
    };
    return Panel;
})();
//# sourceMappingURL=Panel.js.map