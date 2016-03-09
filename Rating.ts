/// <reference path='types/DefinitelyTyped/node/node.d.ts' />
/// <reference path='types/DefinitelyTyped/express/express.d.ts' />

class Rating {

    _id: number;
    value: number;
    userId: string;
    date: Date;

    constructor (id: number, value: number, uid: string, date: Date) {
        this._id = id;
        this.value = value;
        this.userId = uid;
        this.date = date;
    }

    // TODO add method to allow editing of rating
}