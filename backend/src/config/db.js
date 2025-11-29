const mongoose = require('mongoose');
module.exports = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if(!uri) throw new Error('MONGODB_URI not set');
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('DB connect error:', err.message);
    process.exit(1);
  }
};
