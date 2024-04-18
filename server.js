
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const redis = require('redis');
const { v4: uuidv4 } = require('uuid')

let server = express();


let conn = null;
let redisConn = null;


const initRedis = async () => {
    redisConn = redis.createClient();
    redisConn.on("error", (err) => console.log("Redis Client Error", err));
    await redisConn.connect();
};

server.use(bodyParser.json());
server.use(morgan('dev'));
server.use(cors());

server.get('/task', async function (req, res, next) {
    let cachedData = await redisConn.get("task-4");


    const loadDataCache = JSON.parse(cachedData);

    return res.status(200).json({
        code: 1,
        message: 'OK',
        data: loadDataCache
    })
});

server.post('/task', async function (req, res, next) {

    let task = {}

    task.id = uuidv4();
    task.task_name = req.body.task_name;
    task.discription = req.body.discription;
    task.status = "TO-DO"
    console.log(task)
    console.log('TASKS :', task.task_name, 'Created!')

    let cachedData = await redisConn.get("task-4");
    let newData = [];

    const loadDataCache = JSON.parse(cachedData);
    if (loadDataCache) {
        newData = loadDataCache
    }

    newData.push(task)
    await redisConn.set("task-4", JSON.stringify(newData));

    return res.status(201).json({
        code: 1,
        message: 'OK',
        data: newData
    });
});

server.put('/task', async function (req, res, next) {
    const id = req.body.id;
    let task = req.body;
    console.log(req.body)

    let cachedData = await redisConn.get("task-4");

    let updateData = "";
    if (cachedData) {
        const loadDataCache = JSON.parse(cachedData);
        let selectedIndex = loadDataCache.findIndex((res) => res.id === id);
        loadDataCache[selectedIndex] = task;
        updateData = loadDataCache;
    }


    await redisConn.set("task-4", JSON.stringify(updateData));

    return res.status(200).json({
        code: 1,
        message: 'OK',
        data: updateData
    });
});

server.delete('/task', async function (req, res, next) {
    const id = req.body.id;  
    let cachedData = await redisConn.get("task-4");
    let updateData = "";
    if (cachedData) {
        const loadDataCache = JSON.parse(cachedData);
        let position = loadDataCache.findIndex((res) => res.id === id);

        loadDataCache.splice(position, 1);
        updateData = loadDataCache;
    }

    await redisConn.set("task-4", JSON.stringify(updateData));

    return res.status(200).json({
        code: 1,
        message: 'OK',
        data: updateData
    })
});


server.get('/prefix', async function (req, res, next) {
    console.log(req.body)
    let words = req.body;

    if (!words[0] || words.length == 1) return words[0] || "";
    let i = 0;

    while (words[0][i] && words.every(w => w[i] === words[0][i]))
        i++;

    let result = words[0].substr(0, i);
    console.log(result)

    return res.status(200).json({
        code: 1,
        message: 'OK',
        data: result
    })
});


server.listen(3000, async function () {
    await initRedis();
    console.log('Server Listen at http://localhost:3000');
});