const WebSocket = require('ws');

const {pokerHelper} = require('./pokerHelper.js');

const wsPort = process.env.WS_PORT || 3000;

const STATE = {
    CONNECTION: 0,
    READY: 1,
    START: 2,
    SETMASTER: 3,
    PLAY: 4,
    DISCONNECT: 5,
}

function WsClient () {

    this.size = 4;
    this.aliveCount = 0;
    this.readyCount = 0;

    this.clients = new Array(4);

    this.get = function(ip) {

        return this.clients.find(client => client.ip === ip);
    }

    this.add = function (ip) {

        if(this.aliveCount === 4 || this.isExist(ip)) return;

        for (let i = 0; i < this.size; i++) {

            if (!this.clients[i]) {

                this.clients[i] = {
                    ip: ip,
                    seat: i,
                    // createTime: new Date()
                }

                this.aliveCount++;

                return true;
            }
        }
    }

    this.isExist = function (ip) {

        for (let i = 0; i < this.size; i++) {

            if (this.clients[i] && this.clients[i].ip === ip) {

                return true;
            }
        }
    }

    this.remove = function (ip) {

        for (let i = 0; i < this.size; i++) {

            if (this.clients[i] && this.clients[i].ip === ip) {

                this.clients[i] = null;
                this.aliveCount--;
                this.readyCount--;

                return true;
            }
        }
    }

    this.setReady = function (ip) {

        this.clients.find(client => client.ip === ip).isReady = true;
        this.readyCount++;
    }
}


let wsClient = new WsClient();


function initSocketServer(socketServer) {

    socketServer.on('connection', (socket, upgradeReq) => {

        let ip = (upgradeReq || socket.upgradeReq).socket.remoteAddress;
        ip = ip.slice(7);

        wsClient.add(ip, socket);

        console.log(
            '新建连接: ', ip, '(连接总数: ' + wsClient.aliveCount + ' )\n'
        );

        socketServer.clients.forEach(client => {

            if (client.readyState === WebSocket.OPEN) {

                client.send(JSON.stringify({
                    type: STATE.CONNECTION,
                    msg: {
                        isSelf: client === socket,
                        seat: wsClient.get(ip).seat,
                        clients: wsClient.clients
                    }
                }));
            }
        });

        

        socket.on('message', (msg) => {

            console.log("收到来自ip:", ip, " 的信息:", msg, '\n');

            let data = JSON.parse(msg);

            if(data.type === undefined || data.type === null) return;

            switch(data.type) {

                case STATE.READY:

                    wsClient.setReady(ip);

                    socketServer.clients.forEach(client => {

                        if (client.readyState === WebSocket.OPEN) {

                            client.send(JSON.stringify({
                                type: STATE.READY,
                                msg: {
                                    isSelf: client === socket,
                                    seat: wsClient.get(ip).seat,
                                    clients: wsClient.clients
                                }
                            }));
                        }
                    });

                    if (wsClient.readyCount === 4) {

                        let cards = pokerHelper.stuffle();
                        socketServer.clients.forEach(client => {

                            if (client.readyState === WebSocket.OPEN) {

                                client.send(JSON.stringify({ 
                                    type: STATE.START, 
                                    msg: {
                                        cards: cards,
                                        clients: wsClient.clients
                                    }
                                }));
                            }
                        });
                    }
                    break;

                case STATE.SETMASTER:

                    socketServer.clients.forEach(client => {

                        if (client.readyState === WebSocket.OPEN) {

                            client.send(JSON.stringify({ 
                                type: STATE.SETMASTER, 
                                msg: {
                                    seat: data.msg.seat,
                                    master: data.msg.master
                                } 
                            }));
                        }
                    });
                    break;

                case STATE.PLAY:

                    socketServer.clients.forEach(client => {

                        if (client.readyState === WebSocket.OPEN) {

                            client.send(JSON.stringify({ 
                                type: STATE.PLAY, 
                                msg: data.msg
                            }));
                        }
                    });
                    break;

                default: break;
            }

        });

        socket.on('close', (code) => {

            let seat = wsClient.get(ip).seat;

            if(wsClient.remove(ip)) {

                socketServer.clients.forEach(client => {

                    if (socket === client) return;
                    if (client.readyState === WebSocket.OPEN) {

                        client.send(JSON.stringify({ 
                            type: STATE.DISCONNECT, 
                            msg: {
                                seat
                            } 
                        }));
                    }
                });
            }
            console.log(
                'ip为: ', ip, ' 的客户端, 连接关闭 (剩余连接数: ' + wsClient.aliveCount + ' )\n'
            );
        });

        socket.on('error', (e) => {
            console.error('ip为: ', ip, ' 的客户端, 连接出错:', e, '\n');
            socket.close();
        });

    });
}

let ws;

ws = new WebSocket.Server({ port: wsPort, perMessageDeflate: false });

initSocketServer(ws);
