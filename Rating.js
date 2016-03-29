/// <reference path='types/DefinitelyTyped/node/node.d.ts' />
/// <reference path='types/DefinitelyTyped/express/express.d.ts' />
var Rating = (function () {
    function Rating(id, value, uid, date) {
        this._id = id;
        this.value = value;
        this.userId = uid;
        this.date = date;
    }
    return Rating;
})();
//# sourceMappingURL=Rating.js.map