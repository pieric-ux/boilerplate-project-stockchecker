'use strict';

const StockHandler = require( '../controllers/stockHandler' );

module.exports = function (app) {
  
const stockHandler = new StockHandler();

  app.route('/api/stock-prices')
    .get(async function (req, res){
      const { stock, like } = req.query;
      const ip = req.header('x-forwarded-for');
      const stocks = Array.isArray(stock) ? stock.map((symbol) => symbol.toUpperCase()) : [stock.toUpperCase()];
      
      try {
        const stockData = await stockHandler.getStockData(stocks, like, ip);
        res.json(stockData);
      }
      catch (err) {
        throw err;
      }
    });
    
};
