/// <reference path='types/DefinitelyTyped/node/node.d.ts' />
/// <reference path='types/DefinitelyTyped/express/express.d.ts' />

class UserComment {
    _id: string;
    text: string;
    userId: string;
    date: Date;

    constructor(id: string, text: string, uid: string, date: Date) {
        this._id = id;
        this.text = text;
        this.userId = uid;
        this.date = date;
    }

    // TODO add method to allow editing of comment
}