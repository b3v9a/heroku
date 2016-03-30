/// <reference path='types/DefinitelyTyped/node/node.d.ts' />
/// <reference path='types/DefinitelyTyped/express/express.d.ts' />
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');
var Account = new Schema({
    firstname: String,
    email: String,
    username: String,
    password: String,
    access: String,
    readingList: [],
    upvotes: [],
    ratings: []
});
Account.plugin(passportLocalMongoose);
module.exports = mongoose.model('accounts', Account);
//# sourceMappingURL=Account.js.map