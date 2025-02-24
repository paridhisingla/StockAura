const mongoose = require('mongoose');
const { mongoUri } = require('../config/db');

const dbConnect = () => {
  mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));
};

module.exports = { dbConnect };
