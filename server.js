const cors = require('cors')
const express = require("express");
const mongoose = require('mongoose')
const database = require('./configDB')
const { login, register } = require('./login_register')
const webSocket = require('ws')
require('dotenv').config();
const admin = require('firebase-admin');
const serviceAccount = require('./nt131p12-firebase-adminsdk-bkmfm-341e5e5d3b.json');
const dataModel = require('./dataModel');
const notificationModel = require('./NotificationModel');

//Thông báo khi có bất thường
const DEVICE_TOKEN = process.env.DEVICE_TOKEN;
//khởi tạo firebase admin SDK để tương tác với firebase gửi thông báo về clientclient
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
})

//gửi nội dung thông báo và token của thiết bị sẽ được gửi đến
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

//liên kết với cơ sở dữ liệuliệu
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

//đăng nhập và đăng ký
app.post('/login', login);
app.post('/register', register);

let temperatureData = [];
let bpmData = []
let spo2Data = [];

//get notification
app.get('/data', async (req, res) => {
    const existed = await notificationModel.find();
    console.log(existed);
    if (existed) {
        return res.status(200).json(existed);
    }
    return res.status(404).json();
})

//ESP32 gửi dữ liệu lên server
//Nếu có client kết nối ws trên server thì dữ liệu sẽ lưu và database và được gửi đến client
// Nếu không có client nào thì dữ liệu sẽ được lưu vào database
app.post('/data', async (req, res) => {
    console.log(req.body);
    temperatureData.push(req.body.temperature);
    bpmData.push(req.body.bpm);
    spo2Data.push(req.body.spo2);

    //kiểm tra thông số nhiệt độ, bpm, spo2 có bất thược không để gửi thông báo
    var isNoti_BPM = false;
    var isNoti_SPO2 = false;
    var isNotiTemperature = false;

    //tính trung bình 30 giá trị nhiệt độ, bpm, spo2 gần nhất để kiểm tra nếu có gì bất thường sẽ gửi thông báobáo
    var BPM_avg = 0;
    var TEMP_avg = 0;
    var SPO2_avg = 0;
    var total = 0;

    //nếu đã đủ mẫu sẽ tiến hành tính toán
    if (temperatureData.length == 30) {
        temperatureData.forEach(temperature => {
            total += temperature;
        });
        TEMP_avg = (total / 30).toFixed(1);
        if (TEMP_avg < 36 || TEMP_avg > 37.5) {
            isNotiTemperature = true;
        }
    };

    if (bpmData.length == 30) {
        total = 0;
        bpmData.forEach(bpm => {
            total += bpm;
        });
        BPM_avg = (total / 30).toFixed(0);
        if (BPM_avg < 60 || BPM_avg > 100) {
            isNoti_BPM = true;
        }
    }

    if (spo2Data.length == 30) {
        total = 0;
        spo2Data.forEach(spo2 => {
            total += spo2;
        });
        SPO2_avg = (total / 30).toFixed(0);
        if (SPO2_avg < 93 || SPO2_avg > 101) {
            isNoti_SPO2 = true;
        }
    }

    //kiểm tra xem những thông số nào cần gửi thông báobáo
    var notification = '';
    if (isNotiTemperature && isNoti_BPM && isNoti_SPO2) {
        sendNotification(DEVICE_TOKEN, 'Cảnh báo', `Nhiệt độ, SpO2, BPM có dấu hiệu bất thường (${TEMP_avg}C', ${BPM_avg}BPM, ${SPO2_avg}%)`);
        notification = `Nhiệt độ, SpO2, BPM có dấu hiệu bất thường (${TEMP_avg}C', ${BPM_avg}BPM, ${SPO2_avg}%)`;
    }
    else if (isNoti_BPM && isNoti_SPO2 && !isNotiTemperature) {
        sendNotification(DEVICE_TOKEN, `Cảnh báo', 'BPM, SpO2 có dấu hiệu bất thường (${BPM_avg}BPM, ${SPO2_avg}%)`);
        notification = `BPM, SpO2 có dấu hiệu bất thường (${BPM_avg}BPM, ${SPO2_avg}%)`;
    }
    else if (isNoti_BPM && isNotiTemperature && !isNoti_SPO2) {
        sendNotification(DEVICE_TOKEN, `Cảnh báo', 'Nhiệt độ, BPM có dấu hiệu bất thường (${TEMP_avg}C', ${BPM_avg}BPM)`);
        notification = `Nhiệt độ, BPM có dấu hiệu bất thường (${TEMP_avg}C', ${BPM_avg}BPM)`;
    }
    else if (isNoti_SPO2 && isNotiTemperature && !isNoti_BPM) {
        sendNotification(DEVICE_TOKEN, `Cảnh báo', 'Nhiệt độ, SpO2 có dấu hiệu bất thường (${TEMP_avg}C', ${SPO2_avg}%)`);
        notification = `Nhiệt độ, SpO2 có dấu hiệu bất thường (${TEMP_avg}C', ${SPO2_avg}%)`;
    }
    else if (isNoti_BPM && !isNoti_SPO2 && !isNotiTemperature) {
        sendNotification(DEVICE_TOKEN, `Cảnh báo', 'BPM có dấu hiệu bất thường (${BPM_avg}BPM)`);
        notification = `BPM có dấu hiệu bất thường (${BPM_avg}BPM)`;
    }
    else if (isNoti_SPO2 && !isNoti_BPM && !isNotiTemperature) {
        sendNotification(DEVICE_TOKEN, `Cảnh báo', 'SpO2 có dấu hiệu bất thường (${SPO2_avg}%)`);
        notification = `SpO2 có dấu hiệu bất thường (${SPO2_avg}%)`;
    }
    else if (isNotiTemperature && !isNoti_BPM && !isNoti_SPO2) {
        sendNotification(DEVICE_TOKEN, `Cảnh báo', 'Nhiệt độ có dấu hiệu bất thường (${TEMP_avg}C)`);
        notification = `Nhiệt độ có dấu hiệu bất thường (${TEMP_avg}C)`;
    }
    else if (!isNotiTemperature && !isNoti_BPM && !isNoti_SPO2 && bpmData.length == 30 && temperatureData.length == 30 && spo2Data.length == 30) {
        console.log("Dữ liệu bình thường");
    }

    //nếu đủ 30 mấu thì sẽ tiến hành lưu giá trị trong bình vào database
    if (temperatureData.length == 30 && bpmData.length == 30 && spo2Data.length == 30) {
        const newData = new dataModel.Data({
            datetime: new Date(),
            temperature: TEMP_avg,
            Sp02: SPO2_avg,
            pulse: BPM_avg,
        });
        await newData.save();

        if (notification != '') {
            const date = new Date();
            const newNotification = new notificationModel({
                title: 'Cảnh báo',
                date: `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
                body: notification,
            });
            await newNotification.save();
        }

        spo2Data = [];
        temperatureData = [];
        bpmData = [];
    }

    //nếu có client kết nối sẽ gửi data về client
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

//khởi tạo websocket server
const wss = new webSocket.Server({ noServer: true });;
let clients = [];

//sau khi client login thành công, client sẽ gửi một yêu cầu kết nối websocket đến server
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

//khởi chạy server
const server = app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
})

//server nâng từ http lên websocket cho các client có request kết nối websocket
server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});