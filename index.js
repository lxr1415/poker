
var STATE = {
    CONNECTION: 0,
    READY: 1,
    START: 2,
    PLAY: 3,
    DISCONNECT: 4,
}


var pokers = pokerHelper.createPoker();

var game = new Game({});


let ws = new WebSocket('ws://119.23.139.60:3000');

ws.onmessage = function (msg) {

    let msg = JSON.parse(msg);

    console.log("收到来自ip:", ip, " 的信息:", msg);

    let data = msg.data;

    if (data.type === undefined || data.type === null) return;

    switch (data.type) {

        case STATE.CONNECTION:

            let {isSelf, seat, clients} = data.msg;

            if(isSelf) {

                game.setMainSeat(seat);
                clients.forEach(client => client && game.addPlayer(client.seat));
            } else {
                game.addPlayer(seat);
            }

            console.log(`%c 入座`, 'color: #FFF, background: #000', ` ip为 ${clients[seat].ip} 入座seat ${seat}`)

            break;

        case STATE.READY:

            let { isSelf, seat, clients } = data.msg;

            game.getPlayer(seat).onReady();

            console.log(`%c 准备`, 'color: #FFF, background: #AA0', ` 座位seat ${seat} 准备就绪`)

            break;

        case STATE.START:

            // let clients = data.msg.clients;
            let cards = data.msg.cards;

            console.log(`%c 开始`, 'color: #FFF, background: #0A0', ` 所有玩家准备就绪`);

            game.start(cards);
            break;

        case STATE.PLAY:

            let { seat, selectCards } = data.msg;

            console.log(`%c 出牌`, 'color: #FFF, background: #00A', ` 座位seat ${seat} 已出牌`, selectCards);

            game.play(seat, selectCards)
            break;

        case STATE.DISCONNECT:

            let { seat } = data.msg;

            console.log(`%c 掉线`, 'color: #FFF, background: #F00', ` 座位seat ${seat} 已掉线`)

            break;

        default: break;
    }
}



//清空出牌框
function clearPlayCard() {

    for (var i = 0; i < playCardDom.length; i++) {
        playCardDom[i].innerHTML = ""
    }
}

function ready() {

    ws.send(JSON.stringify({
        type: STATE.READY
    }))

    playCardButton.removeEventListener('click', ready, false);
}


playCardButton.addEventListener('click', ready, false);
