

var gameInfoDom = {
    globalInfo: {
        allLevel: document.getElementById("allLevel"),
    },
    currentInfo: {
        levelPoint: document.getElementById("levelPoint"),
        banker: document.getElementById("banker"),
        master: document.getElementById("master"),
        score: document.getElementById("score"),
        // holeCards: document.getElementById("holeCards"),
    },
    // currentState: {
    //     player: document.getElementById("player"),
    //     startPlayer: document.getElementById("startPlayer"),
    //     cards: document.getElementById("cards"),
    //     group: document.getElementById("group"),
    //     cardType: document.getElementById("cardType"),
    //     score: document.getElementById("score2"),
    //     bigCardPlayer: document.getElementById("bigCardPlayer"),
    // }
}

// 出牌框
var playCardDom = [
    document.getElementById("playCard0"),
    document.getElementById("playCard1"),
    document.getElementById("playCard2"),
    document.getElementById("playCard3")
];

var cardsDom = [
    document.getElementsByClassName("card0-box"),
    document.getElementsByClassName("card1-box"),
    document.getElementsByClassName("card2-box"),
    document.getElementsByClassName("card3-box")
]

//出牌按钮
var playCardButton = document.getElementById("playCard");

var message = document.getElementById("message");
