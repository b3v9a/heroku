/// <reference path='types/DefinitelyTyped/node/node.d.ts' />
/// <reference path='types/DefinitelyTyped/express/express.d.ts' />
/// <reference path='Comic.ts' />

// This class currently stores the location of the DB
// TODO route basic calls through here to check for authorization before passing down the stack

class DBManager {

    // TODO determine whether collections can/should be accessed through these member variables
    comicCollection;
    userCollection;
    commentCollection;

    start() {
        var monk = require('monk');
        var db = monk('mongodb://admin:sloth@ds051635.mongolab.com:51635/sloth310');
        this.comicCollection = db.get('comiccollection');
        this.userCollection = db.get('usercollection');
        this.commentCollection = db.get('commentcollection');
    }

    getComic(query, res) {
        if (query === {}) {
            this.comicCollection.find({}, {}, function(err, comics) {
                if (err) {
                    res(err)
                } else {
                    res(null, comics)
                }
            });
        } else {
            this.comicCollection.findOne({_id: query}, {}, function(err, comic) {
                if (err) {
                    res(err)
                } else {
                    res(null, comic)
                }
            });
        }
    }

    upsertComic(comic: Comic, res) {
        this.comicCollection.upsert({_id: comic._id}, {}, function(err, result) {
            if (err) {
                res(err)
            } else {
                res.send("Insertion successful");
            }
        });
    }

    deleteComic(comicId, res) {
        this.comicCollection.remove({_id: comicId}, {}, function(err, result) {
            if (err) {
                res(err)
            } else {
                res.send("Deletion successful");
            }
        })
    }

    // TODO implement methods for user collection
}

var dbmanager = new DBManager();
dbmanager.start();
module.exports = DBManager;