var should = require('should');
var expressKnexTransaction = require('../index');
var knex = require('knex');
var httpMocks = require('node-mocks-http');
var onFinished = require('on-finished');

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
      expressKnexTransaction(knex({ client: 'pg' })).should.be.a.Function;
    });
  });

  describe('behaviour', function () {
    var db;
    var req;
    var res;

    before('mock database connection', function () {
      var mockDB = require('mock-knex');
      db = knex({
        client: 'pg'
      });
      mockDB.mock(db);
    });

    before('mock req objects', function () {
      req = httpMocks.createRequest();
    });

    before('mock res objects', function () {
      res = httpMocks.createResponse();
    });

    it('should add a knex transaction property \'trx\' to the request object', function (done) {
      var check = function (err) {
        if (err) return done(err);

        res.end();
        try {
          should(req).have.propertyByPath('trx', 'client', 'transacting').eql(true);
          done();
        } catch (e) {
          done(e);
        }
      };

      expressKnexTransaction(db)(req, res, check);
    });

    it('should call \'commit\' on the transaction on success', function (done) {
      var next = function (err) {
        if (err) return done(err);

        try {
          should(req).have.propertyByPath('trx', 'commit').and.be.a.Function;
          var oldCommit = req.trx.commit;
          var isCommited = false;

          req.trx.commit = function () {
            isCommited = true;
            oldCommit();
          };

          onFinished(res, function (err) {
            if (err) return done(err);
            try {
              should(isCommited).eql(true);
              done();
            } catch(e) {
              done(e);
            }
          });

          res.status(200).end();
        } catch (e) {
          done(e);
        }
      };

      expressKnexTransaction(db)(req, res, next);
    });

    it('should call \'rollback\' on the transaction on failure', function (done) {
      var next = function (err) {
        if (err) return done(err);

        try {
          should(req).have.propertyByPath('trx', 'rollback').and.be.a.Function;
          var oldRollback = req.trx.rollback;
          var isRolledBack = false;

          req.trx.rollback = function () {
            isRolledBack = true;
            return oldRollback();
          };

          onFinished(res, function (err) {
            if (err) return done(err);
            try {
              should(isRolledBack).eql(true);
              done();
            } catch(e) {
              done(e);
            }
          });

          res.status(500).end();
        } catch (e) {
          done(e);
        }
      };

      expressKnexTransaction(db)(req, res, next);
    });
  });
});
