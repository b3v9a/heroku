/// <reference path='types/DefinitelyTyped/node/node.d.ts' />
/// <reference path='types/DefinitelyTyped/express/express.d.ts' />
///<reference path='User.ts'/>

class ViewerUser implements User {
    private firstname: string;
    private username: string;
    private email: string;
    private password: string;

    constructor(firstname: string, username: string, email: string, password: string) {
        this.username = username;
        this.firstname = firstname;
        this.email = email;
        this.password = password;

    }

    getUsername(){
        return this.username;
    }

    getFirstname() {
        return this.firstname;
    }

    getEmail(){
        return this.email;
    }

    getPassword(){
        return this.password;
    }
}