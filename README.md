# express-knex-transaction
Express middleware that adds a knex transaction object as `req.trx` so you can easily wrap middleware and routes in a single transaction.

## Usage
Called with a valid knex object, this module returns a middleware function you can `.use()` before any middleware that requires database access. It then adds a `trx` property to the request object that you can use for `knex.transacting()` or as a knex client.

Commit and rollback are handled based on the status code of the final response.


## Example
```javascript
var expressKnexTransaction = require('express-knex-transaction');
var express = require('express');
var knex = require('knex')({});

var app = new express();

app.use(expressKnexTransaction(knex));

app.get('/', function(req, res) {
  knex('table1')
    .transacting(req.trx)
    .then(function(data) {
      res.status(200).json(data);
    })
    .catch(function() {
      res.sendStatus(400);
    });
});
```
