/// <reference path='types/DefinitelyTyped/node/node.d.ts' />
/// <reference path='types/DefinitelyTyped/express/express.d.ts' />

class Panel {
    source: string;
    position: number;

    constructor(source: string, position: number) {
        this.source = source;
        this.position = position;
    }

    updatePos(pos: number) {
        this.position = pos;
    }
}