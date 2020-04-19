const mongoose = require('mongoose');

const OAuthUserSchema = new mongoose.Schema({
    googleId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        unique: true
    },
    surname: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        unique: true
    }
});

const OAuthUser = mongoose.model('OAuthuser', OAuthUserSchema);

module.exports = OAuthUser;
