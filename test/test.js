var should = require('should');
var expressKnexTransaction = require('../index');
var knex = require('knex');

describe('express-knex-transaction', function () {
  describe('parameters', function () {
    it('should throw a TypeError when parameter is undefined', function () {
      (function () {
        expressKnexTransaction();
      }).should.throw(TypeError);
    });

    it('should throw a TypeError when parameter is null', function () {
      (function () {
        expressKnexTransaction(null);
      }).should.throw(TypeError);
    });

    it('should throw a TypeError when parameter is of primitive type', function () {
      (function () {
        expressKnexTransaction(4);
      }).should.throw(TypeError);
      (function () {
        expressKnexTransaction('hello');
      }).should.throw(TypeError);
      (function () {
        expressKnexTransaction(true);
      }).should.throw(TypeError);
    });

    it('should throw a TypeError when parameter is an array', function () {
      (function () {
        expressKnexTransaction([]);
      }).should.throw(TypeError);
    });

    it('should throw a TypeError when parameter is of type object', function () {
      (function () {
        expressKnexTransaction({});
      }).should.throw(TypeError);
    });

    it('should throw a TypeError when parameter is a function without a \'transaction\' member', function () {
      (function () {
        expressKnexTransaction(function () {});
      }).should.throw(TypeError);
    });

    it('should return a function', function () {
      expressKnexTransaction(knex({})).should.be.a.Function;
    });
  });
});
