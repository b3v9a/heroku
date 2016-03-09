/// <reference path='types/DefinitelyTyped/node/node.d.ts' />
/// <reference path='types/DefinitelyTyped/express/express.d.ts' />

class Panel {
    _id: number;
    source: string;
    position: number;

    constructor(id: number, source: string, position: number) {
        this._id = id;
        this.source = source;
        this.position = position;
    }

    updatePos(pos: number) {
        this.position = pos;
    }
}