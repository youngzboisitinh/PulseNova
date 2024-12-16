const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    title: { type: String, required: true },
    date: { type: String, required: true },
    body: { type: String, required: true },
}, { versionKey: false });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;