const mongoose = require('mongoose');

const supervisorSchema = new mongoose.Schema({
  name: String
});

module.exports = mongoose.model("Supervisor", supervisorSchema);
