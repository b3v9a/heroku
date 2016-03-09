/// <reference path='types/DefinitelyTyped/node/node.d.ts' />
/// <reference path='types/DefinitelyTyped/express/express.d.ts' />

interface User {
    getUsername( username: string);
    getFirstname( firstname: string);
    getEmail( email: string);
    getPassword( password: string);
}