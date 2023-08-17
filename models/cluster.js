const mongoose = require('mongoose');

const clusterSchema = new mongoose.Schema({
  name: String
});

module.exports = mongoose.model("Cluster", clusterSchema);
