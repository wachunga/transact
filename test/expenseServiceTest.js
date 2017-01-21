'use strict';

const assert = require('assert');
const nock = require('nock');
const mockTransaction = require('./testHelper').mockTransaction;
const expenseService = require('../lib/expenseService');

describe('expenseService', () => {
	it('listExpenseCategories handles no transactions', () => {
		nock(/.+/)
			.get('/transactions/1.json')
			.reply(200, {
				totalCount: 0,
				transactions: []
			});

		return expenseService.listExpenseCategories().then(categories => {
			assert.equal(categories.length, 0);
		});
	});

	it('listExpenseCategories groups by category', () => {
		nock(/.+/)
			.get('/transactions/1.json')
			.reply(200, {
				totalCount: 4,
				transactions: [
					mockTransaction('-100', 'Web Hosting'),
					mockTransaction('-100', 'Travel Expense'),
					mockTransaction('-100', 'Business Meals'),
					mockTransaction('-100', 'Web Hosting'),
				]
			});

		return expenseService.listExpenseCategories().then(categories => {
			assert.equal(categories.length, 3);

			const hosting = categories.find(category => category.categoryKey === 'Web Hosting');
			assert.equal(hosting.transactions.length, 2);
		});
	});

	it('listExpenseCategories excludes income (no category)', () => {
		nock(/.+/)
			.get('/transactions/1.json')
			.reply(200, {
				totalCount: 3,
				transactions: [
					mockTransaction('-100', 'Web Hosting'),
					mockTransaction('5000', ''),
					mockTransaction('-100', 'Business Meals'),
				]
			});

		return expenseService.listExpenseCategories().then(categories => {
			const keys = categories.map(category => category.categoryKey).sort();
			assert.deepEqual(keys, ['Business Meals', 'Web Hosting']);
		});
	});

	it('listExpenseCategories sums by category', () => {
		nock(/.+/)
			.get('/transactions/1.json')
			.reply(200, {
				totalCount: 4,
				transactions: [
					mockTransaction('-100', 'Web Hosting'),
					mockTransaction('-100.25', 'Travel Expense')
				]
			})
			.get('/transactions/2.json')
			.reply(200, {
				totalCount: 3,
				transactions: [
					mockTransaction('-200.50', 'Travel Expense'),
					mockTransaction('-100', 'Web Hosting')
				]
			});

		return expenseService.listExpenseCategories().then(categories => {
			assert.equal(categories.length, 2);

			const hosting = categories.find(category => category.categoryKey === 'Web Hosting');
			assert.equal(hosting.total, '-200');
			const travel = categories.find(category => category.categoryKey === 'Travel Expense');
			assert.equal(travel.total, '-300.75');
		});
	});
});