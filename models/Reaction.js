const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { v4 } = require('uuid');

let uuidv4 = v4
const ReactionSchema = new Schema({
  content:{
    type: String,
    required:true
  },
  uuid:{
    type:String,
    default:() => { return uuidv4() },
    required:true,
  },
  message:{
    type: Schema.Types.ObjectId,
    ref : 'Message',
    autopopulate: true
  },
  user:{
    type: Schema.Types.ObjectId,
    ref : 'User',
    autopopulate: true
  },
  created_at: {
    type: Date,
    required:true,
    default: () => { return new Date() },
  },
});

ReactionSchema.plugin(require('mongoose-autopopulate'));
module.exports = mongoose.model('Reaction', ReactionSchema)