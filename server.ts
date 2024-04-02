import express from 'express';
import http from 'http';

const app = express();
const server = http.createServer(app);

app.get('/users-stats', (req, res) => {

        res.status(200).json({
            "processId": process.pid,
            "port": server.address(),
            "usersCount": 500,
            "averageAge": 20,
            "gender": "male",
            "averageVisits": 276
        });
});

process.on('message', (msg: any) => {
    server.listen(msg.port, msg.host, () => {
        console.log(`[Create] Process ID: ${process.pid} \t`, server.address());
    });
});
