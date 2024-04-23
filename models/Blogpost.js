const mongoose  = require('mongoose');

const blogpostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
      },
    body: {
        type: String,
        required: true
      },
    author: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    radio: {
      type: String,
      required: true
    },
    comments: [{
        body: String,
        date: Date
      }],
    date: { 
        type: Date, 
        default: Date.now 
      },
    image: {
        type: String
      }


});

module.exports = mongoose.model("Blogpost", blogpostSchema)