const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
    datetime: {
        type: Date,
        required: true,
    },
    temperature: {
        type: Number,
        required: true,
    },
    Sp02: {
        type: Number,
        required: true,
    },
    pulse: {
        type: Number,
        required: true,
    },
}, { versionKey: false });

const Data = mongoose.model('Data', dataSchema);
module.exports = { Data };