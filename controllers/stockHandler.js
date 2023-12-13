const Stock = require("../models/stocks");
const axios = require("axios");
const bcrypt = require("bcrypt");

class StockHandler {
  
  async getQuote(stock) {
    try {
      const quote = await axios.get(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`);

      if (quote.data === 'Unknown symbol') {
        return { symbol: 'Unknown symbol' };
      } else if (quote.data === 'Invalid symbol') {
        return { symbol: 'Invalid symbol' };
      }

      return quote.data;
    }
    catch (err) {
      throw err;
    }
  }
  
  async setLike(stock, ip) {
    try {
      const hashedIP = await bcrypt.hash(ip, 10);
      const stockData = await Stock.findOneAndUpdate({ stock: stock }, {stock: stock}, {new: true, upsert: true});
      
      if (stockData) {
        const isIPAlreadyHashed = stockData.IPs.some(async (hashed) => {
          return await bcrypt.compare(ip, hashed);
        });

        if (!isIPAlreadyHashed) {
          stockData.IPs = [...stockData.IPs, hashedIP];
          stockData.likes++;
          await stockData.save();
        }
      }
    }
    catch (err) {
      throw err;
    }
  }

  async getLikes(stock) {
    try {
      return await Stock.findOne({ stock: stock }, 'likes');
    }
    catch (err) {
      throw err;
    }
  }

  async getStockData(stocks, like, ip) {
    try {
      const quotes = await Promise.all(stocks.map(async stock => this.getQuote(stock)));
      
      if (like === 'true') {
        await Promise.all(stocks.map(async stock => this.setLike(stock, ip)));
      }

      const stocksLikes = await Promise.all(stocks.map(async stock => this.getLikes(stock)));

      if (stocks.length === 1) {
        return {
          stockData: {
            stock: quotes[0].symbol,
            price: quotes[0].latestPrice,
            likes: stocksLikes[0] ? stocksLikes[0].likes : 0
          }
        };
      } else if (stocks.length === 2) {
        return {
          stockData: [
            {
              stock: quotes[0].symbol,
              price: quotes[0].latestPrice,
              rel_likes: (stocksLikes[0] ? stocksLikes[0].likes : 0) - (stocksLikes[1] ? stocksLikes[1].likes : 0)
            },
            {
              stock: quotes[1].symbol,
              price: quotes[1].latestPrice,
              rel_likes: (stocksLikes[1] ? stocksLikes[1].likes : 0) - (stocksLikes[0] ? stocksLikes[0].likes : 0)
            }
          ]
        };
      }
    }
    catch (err) {
      throw err;
    }
  }
}

module.exports = StockHandler;
