const mongoose = require('mongoose');

const StockSchema = new mongoose.Schema({
  stock: { type: String, required: true },
  likes: { type: Number, default: 0 },
  IPs: { type: [String], default: [] }
});

const Stock = mongoose.model('Stock', StockSchema);

module.exports = Stock;