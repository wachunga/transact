'use strict';

const routes = require('express').Router();
const transactionService = require('./transactionService');

routes.get('/a/1/transactions', (req, res) => {
	transactionService.downloadAllTransactions()
		.then(transactions => {
			res.status(200).json({ transactions });
		}).catch(err => {
			console.error(err.stack);
			res.send(500);
		});
});

module.exports = routes;