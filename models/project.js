const mongoose = require('mongoose');
// const cluster = require('./cluster');

var projectSchema = new mongoose.Schema({
    title: String,
    year: String,
    link: String,
    description: String,
    image:String,
    reviewStatus: Boolean,
    authors:String,
    author: [{

        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: [String],
        user : [String]
    }],
    abstract: String,
    // supervisor: String,
    supervisor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supervisor'
      },
    cluster: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cluster'
    }
})

module.exports = mongoose.model("Project", projectSchema)




// const mongoose = require('mongoose');

// const projectSchema = new mongoose.Schema({
//   // ... other fields
//   supervisor: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Supervisor'
//   },
// });

// module.exports = mongoose.model("Project", projectSchema);
