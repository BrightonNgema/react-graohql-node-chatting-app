const mongoose = require("mongoose");
const { v4 } = require('uuid');

let uuidv4 = v4
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  content:{
    type: String,
    required:true
  },
  uuid:{
    type:String,
    default:() => uuidv4(),
    required:true,
  },
  reaction:[{
    type: Schema.Types.ObjectId,
    ref : 'Reaction',
    autopopulate: true
  }],
  from:{
    type: String,
    required:true,
  },
  to:{
    type: String,
    required:true,
  },
  created_at: {
    type: Date,
    required:true,
    default: () => { return new Date() },
  },
});

MessageSchema.plugin(require('mongoose-autopopulate'));
module.exports = mongoose.model('Message', MessageSchema)
