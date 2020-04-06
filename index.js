

var gameInfoDom = {
    globalInfo: {
        allLevel: document.getElementById("allLevel"),
    },
    currentInfo: {
        levelPoint: document.getElementById("levelPoint"),
        banker: document.getElementById("banker"),
        master: document.getElementById("master"),
        score: document.getElementById("score"),
        holeCards: document.getElementById("holeCards"),
    },
    currentState: {
        player: document.getElementById("player"),
        startPlayer: document.getElementById("startPlayer"),
        cards: document.getElementById("cards"),
        group: document.getElementById("group"),
        cardType: document.getElementById("cardType"),
        score: document.getElementById("score2"),
        bigCardPlayer: document.getElementById("bigCardPlayer"),
    }
}

// 出牌框
var playCardDom = [
    document.getElementById("playCard0"),
    document.getElementById("playCard1"),
    document.getElementById("playCard2"),
    document.getElementById("playCard3")
]

//出牌按钮
var playCardButton = document.getElementById("playCard");

var player = new Player(0);
var robot1 = new Player(1);
var robot2 = new Player(2);
var robot3 = new Player(3);

var pokers = pokerHelper.createPoker();

var game = new Game([player, robot1, robot2, robot3], {});

game.start();


//清空出牌框
function clearPlayCard() {

    for (var i = 0; i < playCardDom.length; i++) {
        playCardDom[i].innerHTML = ""
    }
}
