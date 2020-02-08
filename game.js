var config = {
    cardNum: 108
}

var STAGE = {
    init: 0,
    setHole: 1,
    play: 2,
    end: 3
}

function Game(players, options) {

    this.stage = -1;
    this.stageHandle = ['init', 'setHole', 'play', 'end'];
    this.players = players;
    this.cards = [];
    for (var i = 0; i < config.cardNum; i++) { this.cards.push(i); }

    //全局游戏信息
    this.globalInfo = {
        level: [3, 3]
    }

    //本场游戏信息
    this.currentInfo = {
        level: 3,
        banker: -1,
        master: null,
        score: 0,
        holeCards: []
    }

    //本轮出牌信息
    this.currentState = {
        startPlayer: -1, //第一个出牌人
        cards: [], //已出牌
        group: "", //首出牌种类
        type: -1, // 首出牌牌型
        player: -1, //出牌人
        scroe: 0, // 本轮中的分数
        bigCardPlayer: -1, //出牌中最大者
    }

}

Game.prototype.setStage = function (stage) {
    this.stage = stage;
    this[this.stageHandle[stage]]();
}

Game.prototype.addPlayer = function (seat) {

    if( this.players.length < 4 && seat < 4) {
        this.players[seat] = new Player(seat)
    } else {
        console.log("已满座")
    }
}

Game.prototype.init = function () {
    this.players.forEach(player => {
        player.clearCard();
    });
    this.currentInfo.score = 0;
    this.currentInfo.holeCards = [];
    this.start();
}

Game.prototype.start = function () {
    this.stuffle();
    this.deal(); 

}

// 洗牌算法
Game.prototype.stuffle = function () {

    for (var i = this.cards.length-1; i >=0; i--) {
        var randomIndex = Math.floor(Math.random()*(i+1));
        var itemAtIndex = this.cards[randomIndex];
        this.cards[randomIndex] = this.cards[i];
        this.cards[i] = itemAtIndex;
    }

    console.log('cards', this.cards)
}

Game.prototype.deal = function (callback) {
    this.dealOneCard(0)
}


Game.prototype.dealOneCard = function (i) {
    var card = this.cards[i];

    if (i < config.cardNum - 8) {
        this.players[i % 4].addCard(card)
    } else {
        if(this.currentInfo.banker === -1) {
            this.setBanker(Math.floor( 4 * Math.random()))
        }
        if(this.currentInfo.master === null) {
            this.currentInfo.master = 'hearts'
        }

        this.players[this.currentInfo.banker].addCard(card)
    }

    if(i === config.cardNum - 1) {

        console.log('players', this.players);

        setPokersValue(this.currentInfo.level, this.currentInfo.master)

        this.players.forEach(function(player) {

            player.divideCard(this.currentInfo.master)
        })

        this.setStage(STAGE.setHole);
        return ;
    }
    i++;

    setTimeout(() => {
        this.dealOneCard.call(this, i)
    }, 50);
}

Game.prototype.setBanker = function (playerId) {
    this.currentInfo.banker = playerId;
    this.currentState.startPlayer = playerId;
    this.players[playerId].isBanker = true;
}


Game.prototype.setMasterCard = function (master) {
    this.currentInfo.master = playerId;
}

Game.prototype.setHoleCards = function (player, cards) {
    player.setHoleCards(cards);
    this.currentInfo.holeCards = cards;

    this.setStage(STAGE.play)
}

Game.prototype.setHole = function() {

    console.log('setHole');
}

Game.prototype.play = function (cards) {

    console.log('play');

    // return;

    if(this.currentState.cards.length === 4) {
        //...
        // next
        console.log("\n----------------\n")

        console.log("手牌:");

        this.players.forEach(player => {
            console.log("玩家 " + player.seat)
            for (const key in player.groupedCards) {
                if (player.groupedCards.hasOwnProperty(key)) {
                    console.log(key + " : ", player.groupedCards[key].toString())
                }
            }
        })

        if(this.players[0].cards.length === 0) {

            this.setStage(STAGE.end);
            return;
        }
    }

    if(this.currentState.player === 0) {

        this.showPlayPanel(() => {
            this.play();
        });
    } else {
        var selectCards = this.players[this.currentState.player].selectRandomCards(this.currentState);
        this.players[this.currentState.player].playCard(selectCards);
        this.currentState.cards.push(selectCards);
        this.currentState.player = (this.currentState.player + 1) % 4;

        if(this.currentState.player === this.currentState.startPlayer){

            this.currentState.group = pokers[selectCards[0]].isMaster ? "master" : pokers[selectCards[0]].suit;
            this.currentState.type = pokerHelper.getCardType(selectCards);
        }

        console.log(this.currentState.player, "出牌: ", console.log(selectCards.map(cardIndex => pokers[cardIndex])))

        this.play();
    }




}

Game.prototype.end = function (cards) {

    console.log('end')
}

Game.prototype.showPlayPanel = function (callback) {

    console.log('showPlayPanel');


    
}
