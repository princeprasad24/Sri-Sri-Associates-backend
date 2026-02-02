const mongoose = require('mongoose');

const targetSchame = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    month: {type: Number , required: true},
    year: {type: Number , required: true},
    targetAmount: {type: Number , required: true},
}, {timestamps: true});

module.exports = mongoose.model('Target' , targetSchame);