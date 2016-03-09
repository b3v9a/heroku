/// <reference path='types/DefinitelyTyped/node/node.d.ts' />
/// <reference path='types/DefinitelyTyped/express/express.d.ts' />
///<reference path='User.ts'/>
///<reference path='ViewerUser.ts'/>
///<reference path='DBManager.ts'/>

var globalMonk = require('monk');
var globalDB = globalMonk('mongodb://admin:sloth@ds051635.mongolab.com:51635/sloth310');
var globalCollection = globalDB.get('usercollection');

class AccountManager{

    // initialization of member variables
    userCollection;
    bCrypt;
    dbmanager;
    vieweruser;

    start() {
        this.bCrypt = require('bcrypt-nodejs');
        this.vieweruser = require('./ViewerUser');

        var monk = require('monk');
        var db = monk('mongodb://admin:sloth@ds051635.mongolab.com:51635/sloth310');
        this.userCollection = db.get('usercollection');

        // TODO figure out how to hook this up to DBManager
        //this.dbmanager = require('./DBManager');
        //this.userCollection = this.dbmanager.userCollection;
    }

    isValidPassword(user, password) {
        return this.bCrypt.compareSync(user.getPassword(), password);
    }

    createHash(password) {
        return this.bCrypt.hashSync(password);
    };

    /* Handle Registration POST */
    createAccount(req, res) {

        var username = req.body.username;
        var userPassword = this.createHash(req.body.password);
        var firstname = req.body.firstname;
        var email = req.body.email;
        //var user = this.vieweruser.constructor(firstname, userName, email, userPassword);

        var doesUserExist;

        globalCollection.find({"username": username}, {}, function (e, docs) {
            if(e){
                res.send("find error");
            } else {
                doesUserExist = docs.length > 0;

                if (doesUserExist) {
                    res.send("User Already Exists");
                } else {

                    globalCollection.insert({
                        "username": username,
                        "userPassword": userPassword,
                        "firstname": firstname,
                        "email": email

                    }, function (err, doc) {
                        if (err) {
                            res.send("There was a problem adding the information to the database.");
                        } else {

                        }
                        res.redirect("/");
                    });
                }
            }
        });
    }

    getAccount(req, res) {
        var currentUser = req.username;
        console.log(currentUser);
        globalCollection.findOne( {"username": currentUser}, {}, function (err, user) {
            if (err) {
                return res.send("There was an error processing your request, please try again")
            } else {
                // TODO add additional check here for verification before returning user
                if (user) {
                    // blank out the password before returning the user
                    var secureUser = user;
                    secureUser.userPassword = "";
                    return res(null, secureUser)
                } else {
                    return res.send("Something went wrong. Please try your request again")
                }
            }
        })
    }

    attemptLogin(req, res) {
        var enteredUsername = req.body.username;
        var enteredPassword = req.body.password;

        globalCollection.findOne( {"username": enteredUsername}, {}, function (err, user) {
            if(err){
                return res.send("Whoops, something went wrong! Please try again.");
            } else {
                // TODO add back in check to see if password is actually valid
                //this.isValidPassword(user.password, enteredPassword)
                if (user) {
                    return res.redirect('/home');
                } else {
                    return res.send("Invalid user/password combination entered. Please try again.");
                }
            }
        });
    }
}

var accountManager = new AccountManager();
accountManager.start();
module.exports = accountManager;