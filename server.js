const cors = require('cors')
const express = require("express");
const mongoose = require('mongoose')
const database = require('./configDB')
const { login, register } = require('./login_register')
const webSocket = require('ws')
require('dotenv').config();
const admin = require('firebase-admin');
const serviceAccount = require('./nt131p12-firebase-adminsdk-bkmfm-341e5e5d3b.json');

//Thông báo khi có bất thườngường
const DEVICE_TOKEN = 'ftm2uG09QQmhoFcdQl_J39:APA91bHKRst7wmkf46O5ax22w6tfmAlL2t4v6VaSuuQzKP_VXS4tYqURR0XeAUOHecFnZRuETe_4jLrvBC2c863qSe-guChaydeupPCiTHpfaF3A_Yi1EU0';
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
})

function sendNotification(deviceToken, title, body) {
    const message = {
        token: deviceToken,
        notification: {
            title: title,
            body: body,
        },
    };
    admin.messaging().send(message)
        .then((response) => {
            console.log('Successfully sent message:', response);
        })
        .catch((error) => {
            console.log('Error sending message:', error);
        });
}

database.connectDB();
mongoose.set('strictQuery', true);
const app = express();
app.use(cors());
app.use(express.json());
app.use((req, res, next) => [
    res.setHeader('Access-Control-Allow-Origin', '*'),
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'),
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'),
    next()
]);

app.post('/login', login);
app.post('/register', register);

//ESP32 gửi dữ liệu lên server
let temperatureData = [];
let bpmData = []
let spo2Data = [];

app.post('/data', (req, res) => {
    console.log(req.body);
    temperatureData.push(req.body.temperature);
    bpmData.push(req.body.bpm);
    spo2Data.push(req.body.spo2);
    var isNoti_BPM = false;
    var isNoti_SPO2 = false;
    var isNoti_Temperature = false;
    var total = 0;
    if (temperatureData.length == 30) {
        temperatureData.forEach(temperature => {
            total += temperature;
        });
        temperatureData = [];
        var temperature = total / 30;
        if (temperature < 36.5 && temperature > 37.5) {
            isNotiTemperature = true;
        }
    };

    if (bpmData.length == 30) {
        total = 0;
        bpmData.forEach(bpm => {
            total += bpm;
        });
        bpmData = [];
        var bpm = total / 30;
        if (bpm < 90 && bpm > 105) {
            isNotiBPM = true;
        }
    }

    if (spo2Data.length == 30) {
        total = 0;
        spo2Data.forEach(spo2 => {
            total += spo2;
        });
        spo2Data = [];
        var spo2 = total / 30;
        if (spo2 < 90) {
            isNotiSPO2 = true;
        }
    }

    if (isNotiTemperature && isNotiBPM && isNotiSPO2) {
        sendNotification(DEVICE_TOKEN, `Cảnh báo', 'Nhiệt độ, SpO2, BPM có dấu hiệu bất thường (${req.body.temperature}C', ${req.body.bpm}BPM, ${req.body.spo2})%`);
    }
    else if (isNoti_BPM && isNoti_SPO2) {
        sendNotification(DEVICE_TOKEN, `Cảnh báo', 'SpO2, BPM có dấu hiệu bất thường (${req.body.bpm}BPM, ${req.body.spo2})%`);
    }
    else if (isNoti_BPM && isNoti_Temperature) {
        sendNotification(DEVICE_TOKEN, `Cảnh báo', 'Nhiệt độ, BPM có dấu hiệu bất thường (${req.body.temperature}C', ${req.body.bpm}BPM)`);
    }
    else if (isNoti_SPO2 && isNoti_Temperature) {
        sendNotification(DEVICE_TOKEN, `Cảnh báo', 'Nhiệt độ, SpO2 có dấu hiệu bất thường (${req.body.temperature}C', ${req.body.spo2})%`);
    }
    else if (isNoti_BPM) {
        sendNotification(DEVICE_TOKEN, `Cảnh báo', 'BPM có dấu hiệu bất thường (${req.body.bpm}BPM)`);
    }
    else if (isNoti_SPO2) {
        sendNotification(DEVICE_TOKEN, `Cảnh báo', 'SpO2 có dấu hiệu bất thường (${req.body.spo2})%`);
    }
    else if (isNoti_Temperature) {
        sendNotification(DEVICE_TOKEN, `Cảnh báo', 'Nhiệt độ có dấu hiệu bất thường (${req.body.temperature}C)`);
    }

    clients.forEach(client => {
        if (client.readyState === webSocket.OPEN) {
            try {
                client.send(`${req.body.temperature} , ${req.body.bpm} , ${req.body.spo2}`);
            } catch (error) {
                console.log("Error sending message:", error);
            }
        }
    });
    return res.status(200).json();
});

//tạo websocket
const wss = new webSocket.Server({ noServer: true });;
let clients = [];

//client kết nối đến websocket sau khi login 
wss.on('connection', (ws, request) => {
    console.log("New client connected");
    clients.push(ws);
    console.log("Total clients connected:", clients.length);

    ws.on('close', () => {
        console.log("Client disconnected");
        clients = clients.filter(client => client !== ws);
    });

    ws.on('message', (message) => {
        console.log(`Message from client: ${message}`);
        clients.forEach(client => {
            if (client.readyState === webSocket.OPEN) {
                try {
                    client.send(`${message}`);
                    console.log(`${message}`);
                } catch (error) {
                    console.log("Error sending message:", error);
                }
            }
        });

    });
});

const server = app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
})

//server tạo kết nối websocket
server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});