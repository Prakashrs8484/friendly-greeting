const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  preferences: { type: Object, default: {} },
  autoApply: { type: Boolean, default: false }, // whether to auto apply actions

  createdAt: { type: Date, default: Date.now }
});

UserSchema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model('User', UserSchema);
