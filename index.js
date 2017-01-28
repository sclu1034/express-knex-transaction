var onFinished = require('on-finished');

module.exports = function(knex) {
    if (typeof knex !== 'function' || typeof knex.transaction !== 'function') {
        throw new TypeError('Parameter "knex" must be an instance of Knex.Client. Got ' + typeof knex);
    }

    return function (req, res, next) {
        knex.transaction(function(trx) {
            req.trx = trx;

            onFinished(res, function (err, res) {
                if (err || (res.statusCode && res.statusCode >= 400)) {
                    trx.rollback();
                } else {
                    trx.commit();
                }
            });

            next();
        });
    }
};
