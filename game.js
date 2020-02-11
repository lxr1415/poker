var config = {
    cardNum: 108, //总牌数
    holeNum: 8, //底牌数
    dealTimeout: 10, //发牌间隔ms
    defaultBanker: 0, //默认庄家
    defaultMaster: "hearts", // 默认主牌花色
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
        cardType: -1, // 首出牌牌型
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
    this.run();
}

Game.prototype.start = function () {
    this.setStage(0);
}

Game.prototype.run = function () {
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

    console.log('洗牌', this.cards)
}

Game.prototype.deal = function (callback) {
    this.dealOneCard(0)
}


Game.prototype.dealOneCard = function (i) {

    console.log("发牌", i)
    var card = this.cards[i];

    if (i < config.cardNum - 8) {
        this.players[i % 4].addCard(card)
    } else {
        if(this.currentInfo.banker === -1) {
            // this.setBanker(Math.floor( 4 * Math.random()))
            this.setBanker(config.defaultBanker)
        }
        if(this.currentInfo.master === null) {
            this.currentInfo.master = config.defaultMaster
        }

        this.players[this.currentInfo.banker].addCard(card)
    }

    if(i === config.cardNum - 1) {

        console.log('players', this.players);

        pokerHelper.setPokersValue(this.currentInfo.level, this.currentInfo.master)

        this.players.forEach(player => {

            player.divideCards(this.currentInfo.master)
        })

        this.addCardToDom();

        this.setStage(STAGE.setHole);
        return ;
    }
    i++;

    setTimeout(() => {
        this.dealOneCard.call(this, i)
    }, config.dealTimeout);
}

Game.prototype.setBanker = function (playerId) {
    this.currentInfo.banker = playerId;
    this.currentState.startPlayer = playerId;
    this.currentState.player = playerId;
    this.players[playerId].isBanker = true;
}


Game.prototype.setMasterCard = function (master) {
    this.currentInfo.master = playerId;
}

Game.prototype.setHoleCards = function (player, cards) {
    player.setHoleCards(cards);
    this.currentInfo.holeCards = cards;
    console.log("扣底: ", cards)
    this.setStage(STAGE.play)
}

Game.prototype.setHole = function() {

    //假设默认玩家为庄家
    console.log('请扣底: ');

    var playCardButton = document.getElementById("playCard");
    playCardButton.innerHTML = "扣底"
    playCardButton.style.display = "inline-block";

    var player = this.players[this.currentInfo.banker];

    var cardsBox = document.getElementsByClassName("card" + player.seat + "-box");

    for (let i = cardsBox.length - 1; i >= 0; i--) {
        const cardBox = cardsBox[i];
        
        cardBox.onclick = function () {

            var cardIndex = this.getAttribute("data-cardindex");

            var childNodes = this.childNodes;

            var img = childNodes[0];

            if(img.tagName === "IMG") {


                if(img.style.top === "-10px"){
                    img.style.top = "0"

                    player.selectCards.splice(player.selectCards.indexOf(cardIndex), 1);
                } else {

                    img.style.top = "-10px"
                    player.selectCards.push(cardIndex);
                }
            }
        }
    }
    

    playCardButton.onclick = () => {

        var selectCards = player.selectCards;
    
        if(selectCards.length === config.holeNum) {

            this.setHoleCards(player, selectCards);

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

            document.getElementById("message").innerHTML = "";

            player.selectCards.forEach(cardIndex => {

                var cardBox = Array.prototype.find.call(cardsBox, cardBox => cardBox.getAttribute("data-cardindex") == cardIndex)
                
                cardBox.remove();
            })

            player.selectCards = [];
            
        } else {
            console.log("牌数必须为" + config.holeNum +"张")
            document.getElementById("message").innerHTML = "牌数必须为" + config.holeNum +"张";
        }
    }
}

Game.prototype.play = function (cards) {

    console.log('play');

    console.log("\n----------------\n")

    console.log("手牌:");

    this.players.forEach(player => {
        console.log("玩家 " + player.seat)
        console.log("cards", player.cards)
        for (const key in player.groupedCards) {
            if (player.groupedCards.hasOwnProperty(key)) {
                console.log(key + " : ", player.groupedCards[key].toString())
            }
        }
    })

    console.log('本轮信息', this.currentState)
    console.log('本轮出牌者: 玩家', this.currentState.player)
    // return;

    if(this.currentState.cards.length === 4) {
        //...
        //本轮结算
        // next
        console.log("\n----------------\n")

        console.log("手牌:");

        this.players.forEach(player => {
            console.log("玩家 " + player.seat)
            console.log("cards", player.cards)
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

        this.currentState = {
            startPlayer: 0, //第一个出牌人
            cards: [], //已出牌
            group: "", //首出牌种类
            cardType: -1, // 首出牌牌型
            player: 0, //出牌人
            scroe: 0, // 本轮中的分数
            bigCardPlayer: -1, //出牌中最大者
        }
        // return; // 测试只打一轮

    }

    if(this.currentState.player === 0) {

        this.showPlayPanel((selectCards) => {

            this.players[0].playCard(selectCards);
            this.currentState.cards.push(selectCards);

            if(this.currentState.player === this.currentState.startPlayer){

                this.currentState.group = pokers[selectCards[0]].isMaster ? "master" : pokers[selectCards[0]].suit;
                this.currentState.cardType = pokerHelper.getCardType(selectCards, this.currentInfo.level);
            }

            console.log(this.currentState.player, "出牌: ", selectCards)

            this.currentState.player = (this.currentState.player + 1) % 4;

            this.play();
        });
    } else {
        this.players[this.currentState.player].selectRandomCards(this.currentState);
        var selectCards = this.players[this.currentState.player].selectCards;

        console.log("随机选牌:", selectCards)

        this.players[this.currentState.player].playCard(selectCards);
        this.currentState.cards.push(selectCards);

        if(this.currentState.player === this.currentState.startPlayer){

            this.currentState.group = pokers[selectCards[0]].isMaster ? "master" : pokers[selectCards[0]].suit;
            this.currentState.cardType = pokerHelper.getCardType(selectCards, this.currentInfo.level);
        }
 
        console.log(this.currentState.player, "出牌: ", selectCards)

        this.currentState.player = (this.currentState.player + 1) % 4;

        this.play();
    }




}

Game.prototype.end = function (cards) {

    console.log('end')
}


Game.prototype.showPlayPanel = function (callback) {

    console.log('showPlayPanel', '你出牌: ');

    playCardButton.innerHTML = "出牌";

    var player = this.players[0];

    var flag = true;

    playCardButton.onclick = () => {

        if(!flag) return;

        clearPlayCard(); //清空牌桌上上一轮打的牌

        var selectCards = player.selectCards;

        //判断出牌是否符合规则
        if(selectCards.length > 0 && pokerHelper.isValidCard(selectCards, player.groupedCards, this.currentState, this.currentInfo.level)){

            callback(selectCards)
    
            flag = false;

            selectCards = [];
            document.getElementById("message").innerHTML = ""

        } else {
            console.log("出牌不符合规则")
            document.getElementById("message").innerHTML = "出牌不符合规则";

        }
    }

}


//每发一张牌就应该加入dom中显示出来，以便亮主、抢庄。此处先不考虑，默认玩家为庄家。
Game.prototype.addCardToDom = function () {

    this.players.forEach(player => {

        var palyerCardBox = document.getElementById("player" + player.seat + "-card");

        var suits = ['master', 'hearts', 'spades', 'diamonds', 'clubs'];

        suits.forEach(suit => {

            const element = player.groupedCards[suit];
                
            for (let i = element.length - 1; i >= 0; i--) {
                const cardIndex = element[i];
                var div = document.createElement("div");
                div.style.display = "inline-block";
                div.setAttribute("class", "card-box card" + player.seat + "-box");
                div.setAttribute("data-cardindex", cardIndex);
                div.appendChild(pokers[cardIndex].image)

                palyerCardBox.appendChild(div)
            }
        })
    })
}
