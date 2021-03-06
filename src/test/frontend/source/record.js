// external libs
var assert = require('assert');
var validate = require('jsonschema').validate;
var fs = require('fs');

// model to test
import Record from "../../../app/frontend/sources/record";

var schema = JSON.parse(fs.readFileSync('./test/frontend/schema/record.json'));
var createJSON = {
    "record" : {
        "title" : "record title",
        "description" : "<p>record description</p>",
        "state" : "draft",
        "lat" : 15,
        "lng" : 20,
        "date_from" : "2017-01-01",
        "location" : {"address" : "address"}
    }
};
var updateJSON = {
    "record" : {
        "title" : "record title",
        "description" : "record description",
        "state" : "pending_review",
        "lat" : 15,
        "lng" : 20,
        "date_from" : "2017-01-01",
        "location" : {"address" : "address"}
    }
};

var patchJSON = {
    "record" : {
        "state" : "flagged"
    }
};
// used when to store the created resource id to show, update and destroy later
var tempResourceId = null;

describe('Record', function() {
    this.slow(200);

    it('should list records', function(done) {
        Record.index()
            .then((response)=>{
                assert.equal("application/json; charset=utf-8", response.headers['content-type']);
                assert.equal(200, response.status);
                done();
            })
            .catch((response) => {done(response);});
    });

    it('should create a record', function(done) {
        Record.create(null, createJSON)
            .then((response)=>{
                assert.equal("application/json; charset=utf-8", response.headers['content-type']);
                assert.equal(validate(response.data, schema).errors.length, 0);
                assert.equal(200, response.status);
                assert.equal(createJSON.record.title, response.data.title);
                assert.equal(createJSON.record.description, response.data.description);
                assert.equal(createJSON.record.state, response.data.state);
                assert.equal(createJSON.record.lat, response.data.lat);
                assert.equal(createJSON.record.lng, response.data.lng);
                assert.equal(createJSON.record.date_from, response.data.date_from);
                assert.equal(createJSON.record.location.address, response.data.location.address);
                tempResourceId  = response.data.id;
                done();
            })
            .catch((response) => {done(response);});
    });

    it('should update a record', function(done) {
        Record.update(null, tempResourceId, updateJSON)
            .then((response)=>{
                assert.equal(validate(response.data, schema).errors.length, 0);
                assert.equal(200, response.status);
                assert.equal(tempResourceId, response.data.id);
                assert.equal(updateJSON.record.title, response.data.title);
                assert.equal(updateJSON.record.description, response.data.description);
                assert.equal(updateJSON.record.state, response.data.state);
                assert.equal(updateJSON.record.lat, response.data.lat);
                assert.equal(updateJSON.record.lng, response.data.lng);
                assert.equal(updateJSON.record.date_from, response.data.date_from);
                assert.equal(createJSON.record.location.address, response.data.location.address);
                done();
            })
            .catch((response) => {done(response);});
    });

    it('should change state of the record', function(done) {
        Record.patch(null, tempResourceId, patchJSON)
            .then((response)=>{
                assert.equal(validate(response.data, schema).errors.length, 0);
                assert.equal(200, response.status);
                assert.equal(tempResourceId, response.data.id);
                assert.equal(patchJSON.record.state, response.data.state);
                done();
            })
            .catch((response) => {done(response);});
    });

    it('should show a record', function(done) {
        Record.show(null, tempResourceId)
            .then((response)=>{
                assert.equal("application/json; charset=utf-8", response.headers['content-type']);
                assert.equal(validate(response.data, schema).errors.length, 0);
                assert.equal(200, response.status);
                assert.equal(tempResourceId, response.data.id);
                assert.equal(createJSON.record.title, response.data.title);
                assert.equal(createJSON.record.description, response.data.description);
                assert.equal(createJSON.record.state, 'draft');
                assert.equal(createJSON.record.lat, response.data.lat);
                assert.equal(createJSON.record.lng, response.data.lng);
                assert.equal(createJSON.record.date_from, response.data.date_from);
                assert.equal(createJSON.record.location.address, response.data.location.address);
                done();
            })
            .catch((response) => {done(response);});
    });

    it('should delete a record', function(done) {
        Record.destroy(null, tempResourceId)
            .then((response)=>{
                assert.equal(204, response.status);
                done();
            })
            .catch((response) => { done(response);});
    });
});