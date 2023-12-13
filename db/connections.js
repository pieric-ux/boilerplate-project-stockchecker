const mongoose = require('mongoose');

const connect = async () => {
  try {
    await mongoose.connect(process.env['MONGO_URI']);
  }
  catch (error) {
    console.error(error);
  }
  mongoose.connection.on('error', err => 
    console.error(err));
}

module.exports = connect;