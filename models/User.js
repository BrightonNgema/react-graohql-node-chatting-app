const bcrypt = require('bcrypt');
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const faker = require('faker');
let date = new Date();

const UserSchema = new Schema({
    username: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        default:faker.internet.email(),
    },
    password: {
        type: String,
    },
    image_url:{
        type: String,
        default:faker.image.avatar()
    },
    created_at: {
        type: Date,
        required:true,
        default: Date.now(),
    },
    updated_at: {
        type: Date,
        required:true,
        default: Date.now(),
    },
});

UserSchema.pre('save', function (next) {
    if (!this.isModified('password')) {
        return next()
    }
    bcrypt.genSalt(10, (err, salt) => {
        if (err) return next(err);
        bcrypt.hash(this.password, salt, (err, hash) => {
            if (err) return next(err);
            this.password = hash
            next();
        })
    })
})

// UserSchema.plugin(require('mongoose-autopopulate'));
module.exports = mongoose.model('User', UserSchema)
