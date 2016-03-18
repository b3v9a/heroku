//very much a work in progress, but at least all of the software is set up now!


//var request = require('supertest');
var expect = require('expect.js');
var should = require('should');
var send = require('send');
var request = require('request');
var assert = require('assert');

describe('does view page have correct status code', function() {
    var login_url = "http://localhost:3000/view/5";
    it('does view page have correct status code', function (done) {
        request.get(login_url, function (req, res){
			expect(res.statusCode).to.equal(200);    
			console.log(res.comicTitle);
			done();
    });
});
});

describe('does view page have correct status code', function() {
    var login_url = "http://localhost:3000/comics/:id/view/all";
    it('does edit page have correct status code', function (done) {
        request.get(login_url, function (req, res){
			expect(res.statusCode).to.equal(200);    
			console.log(res.comicTitle);
			done();
    });
});
});


describe('take from database', function() {
    var login_url = "http://localhost:3000";
    it('take from database', function (done) {
        request.get(login_url, function (req,res) {
			var collection = db.getCollection('usercollection');
           // need to find out how to properly add something to the database from here
		/*	collection.insertOne({
							_id: "10"
							username: "happy",
							userPassword: "happy",
							firstname: "happy",
							email: "happy@hotmail.com"
								}) 
		*/	}); 
        done();
    });
});


//Practicing mocha
/*

describe('Array', function() {
  describe('#indexOf()', function () {
    it('ensures that the test code is executing, if this fails, something is wrong', function () {
      assert.equal(-1, [1,2,3].indexOf(15));
      assert.equal(-1, [1,2,3].indexOf(0));
    });
  });
});
*/