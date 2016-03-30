/// <reference path='types/DefinitelyTyped/node/node.d.ts' />
/// <reference path='types/DefinitelyTyped/express/express.d.ts' />
///<reference path='User.ts'/>
///<reference path='ViewerUser.ts'/>
///<reference path='DBManager.ts'/>
var globalMonk = require('monk');
var globalDB = globalMonk('mongodb://admin:sloth@ds051635.mongolab.com:51635/sloth310');
var globalCollection = globalDB.get('accounts');
var AccountManager = (function () {
    function AccountManager() {
    }
    AccountManager.prototype.start = function () {
        this.bCrypt = require('bcrypt-nodejs');
        this.vieweruser = require('./ViewerUser');
        var monk = require('monk');
        var db = monk('mongodb://admin:sloth@ds051635.mongolab.com:51635/sloth310');
        this.userCollection = db.get('accounts');
        // TODO figure out how to hook this up to DBManager
        //this.dbmanager = require('./DBManager');
        //this.userCollection = this.dbmanager.userCollection;
    };
    AccountManager.prototype.isValidPassword = function (user, password) {
        return this.bCrypt.compareSync(user.getPassword(), password);
    };
    AccountManager.prototype.createHash = function (password) {
        return this.bCrypt.hashSync(password);
    };
    ;
    /* Handle Registration POST */
    AccountManager.prototype.createAccount = function (req, res) {
        var username = req.body.username;
        var userPassword = this.createHash(req.body.password);
        var firstname = req.body.firstname;
        var email = req.body.email;
        //var user = this.vieweruser.constructor(firstname, userName, email, userPassword);
        var doesUserExist;
        globalCollection.find({ "username": username }, {}, function (e, docs) {
            if (e) {
                res.send("find error");
            }
            else {
                doesUserExist = docs.length > 0;
                if (doesUserExist) {
                    res.send("User Already Exists");
                }
                else {
                    globalCollection.insert({
                        "username": username,
                        "userPassword": userPassword,
                        "firstname": firstname,
                        "email": email,
                        "readingList": [],
                        "upvotes": [],
                        "ratings": []
                    }, function (err, doc) {
                        if (err) {
                            res.send("There was a problem adding the information to the database.");
                        }
                        else {
                        }
                        res.redirect("/");
                    });
                }
            }
        });
    };
    AccountManager.prototype.getAccount = function (req, res) {
        var currentUser = req.username;
        globalCollection.findOne({ "username": currentUser }, {}, function (err, user) {
            if (err) {
                return res.send("There was an error processing your request, please try again");
            }
            else {
                // TODO add additional check here for verification before returning user
                if (user) {
                    // blank out the password before returning the user
                    var secureUser = user;
                    secureUser.userPassword = "";
                    return res(null, secureUser);
                }
                else {
                    return res.send("Something went wrong. Please try your request again");
                }
            }
        });
    };
    AccountManager.prototype.attemptLogin = function (req, res) {
        var enteredUsername = req.body.username;
        var enteredPassword = req.body.password;
        globalCollection.findOne({ "username": enteredUsername }, {}, function (err, user) {
            if (err) {
                return res.send("Whoops, something went wrong! Please try again.");
            }
            else {
                // TODO add back in check to see if password is actually valid
                //this.isValidPassword(user.password, enteredPassword)
                if (user) {
                    return res.redirect('/');
                }
                else {
                    return res.send("Invalid user/password combination entered. Please try again.");
                }
            }
        });
    };
    return AccountManager;
})();
var accountManager = new AccountManager();
accountManager.start();
module.exports = accountManager;
//# sourceMappingURL=AccountManager.js.map