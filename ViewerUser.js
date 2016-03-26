/// <reference path='types/DefinitelyTyped/node/node.d.ts' />
/// <reference path='types/DefinitelyTyped/express/express.d.ts' />
///<reference path='User.ts'/>
var ViewerUser = (function () {
    function ViewerUser(firstname, username, email, password) {
        this.username = username;
        this.firstname = firstname;
        this.email = email;
        this.password = password;
    }
    ViewerUser.prototype.getUsername = function () {
        return this.username;
    };
    ViewerUser.prototype.getFirstname = function () {
        return this.firstname;
    };
    ViewerUser.prototype.getEmail = function () {
        return this.email;
    };
    ViewerUser.prototype.getPassword = function () {
        return this.password;
    };
    return ViewerUser;
}());
//# sourceMappingURL=ViewerUser.js.map