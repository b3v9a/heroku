/// <reference path='types/DefinitelyTyped/node/node.d.ts' />
/// <reference path='types/DefinitelyTyped/express/express.d.ts' />
var UserComment = (function () {
    function UserComment(id, text, uid, date) {
        this._id = id;
        this.text = text;
        this.userId = uid;
        this.date = date;
    }
    return UserComment;
}());
//# sourceMappingURL=UserComment.js.map