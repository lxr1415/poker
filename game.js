var config = {
    cardNum: 108, //总牌数
    holeNum: 8, //底牌数
    dealTimeout: 50, //发牌间隔ms
    playTimeout: 2000, //打牌间隔ms
    defaultBanker: 0, //默认庄家
    defaultMaster: "hearts", // 默认主牌花色
}

var STAGE = {
    init: 0,
    setHole: 1,
    play: 2,
    end: 3
}


function Game(options) {

    this.stage = -1;
    this.stageHandle = ['init', 'setHole', 'play', 'end'];
    this.players = [null, null, null, null];
    this.cards = [];
    this.options = options;

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
        score: 0, // 本轮中的分数
        bigCardPlayer: -1, //出牌中最大者
    }
}

Game.prototype.setStage = function (stage) {
    this.stage = stage;
    this[this.stageHandle[stage]]();
}

Game.prototype.addPlayer = function (seat) {

    if (seat < 4) {
        this.players[seat] = new Player(seat, this.mainSeat)
    } else {
        // console.log("已满座")
    }
}

Game.prototype.setMainSeat = function (seat) {

    this.mainSeat = seat;
}


Game.prototype.start = function (cards) {

    console.log(cards);
    
    this.cards = cards;
    this.setStage(0); //init
}

Game.prototype.init = function () {
    this.players.forEach(player => {
        player.clearCard();
    });

    gameInfoDom.globalInfo.allLevel.innerHTML = this.globalInfo.level.toString();
    gameInfoDom.currentInfo.levelPoint.innerHTML = this.currentInfo.level;
    gameInfoDom.currentInfo.banker.innerHTML = "";
    gameInfoDom.currentInfo.master.innerHTML = "";
    gameInfoDom.currentInfo.score.innerHTML = 0;

    this.currentInfo.score = 0;
    this.currentInfo.holeCards = [];

    pokerHelper.setPokersValue(this.currentInfo.level, this.currentInfo.master);

    hightLightMasterPanel.addToDom(playCardDom[0]);

    setTimeout(() => {

        this.run();
    }, 1000);
}


Game.prototype.run = function () {

    this.deal();

}


//发牌
Game.prototype.deal = function () {

    this.dealOneCard(0)
}


Game.prototype.dealOneCard = function (i) {

    console.log("发牌", i)
    var card = this.cards[i];

    if (i < config.cardNum - 8) {
        this.players[i % 4].addCard(card)
        this.players[i % 4].divideCards(this.currentInfo.master);
        i % 4 === this.mainSeat && this.addCardToDom();

        if (pokers[this.cards[i]].value < 27) {

            // 统计各类牌牌数
            hightLightMasterPanel.addNum(pokers[this.cards[i]].suit)
        }

        // 拿到级牌时，亮主面板高亮此花色
        if (this.currentInfo.level === pokers[this.cards[i]].defaultValue) {

            hightLightMasterPanel.colour(pokers[this.cards[i]].suit);
        }

        // 拿到一对王时，亮主面板高亮NT
        if (pokers[this.cards[i]].value === 31 || pokers[this.cards[i]].value === 32) {

            var index = this.players[i % 4].groupedCards.master.findIndex(item => pokers[item].value === pokers[this.cards[i]].value);
            if (index >= 0) {
                hightLightMasterPanel.colour("nt");
            }
        }


    } else {

        // 发完基础牌， 清除亮主面板
        hightLightMasterPanel.remove();

        if (this.currentInfo.banker === -1) {
            
            console.log("自动设庄")
            this.setBanker(config.defaultBanker)
        }
        if (this.currentInfo.master === null) {

            console.log("自动设主")
            this.setMasterCard(config.defaultMaster)
        }

        this.players[this.currentInfo.banker].addCard(card);
    }

    if (i === config.cardNum - 1) {

        console.log('players', this.players);

        this.players.forEach(player => {

            player.divideCards(this.currentInfo.master);
        })

        if(this.currentInfo.banker === this.mainSeat) {
            this.addCardToDom();
            this.setStage(STAGE.setHole);
        }

        this.currentState.startPlayer = this.currentInfo.banker;

        return;
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

    gameInfoDom.currentInfo.banker.innerHTML = playerId;

    hightLightMasterPanel.remove();
    playCardButton.innerHTML = "出牌";
    playCardButton.disabled = false;
}


Game.prototype.setMasterCard = function (master, seat) {

    if (this.currentInfo.master) return;// 暂时不允许换主

    if(this.mainSeat === seat) {
        
        ws.send(JSON.stringify({
            type: STATE.SETMASTER,
            msg: {
                seat: this.mainSeat,
                master
            }
        }))
    }

    this.currentInfo.master = master;

    pokerHelper.setPokersValue(this.currentInfo.level, this.currentInfo.master);

    gameInfoDom.currentInfo.master.innerHTML = master;

}

Game.prototype.setHoleCards = function (player, cards) {

    player.setHoleCards(cards);
    this.currentInfo.holeCards = cards;
    console.log("扣底: ", cards)

    if (cards.length === 0) return;

    this.showPlayPanel();
}

Game.prototype.setHole = function () {

    //假设默认玩家为庄家
    console.log('扣底: ');

    var playCardButton = document.getElementById("playCard");
    playCardButton.innerHTML = "扣底"
    playCardButton.style.display = "inline-block";
    playCardButton.style.opacity = 1;

    var player = this.players[this.mainSeat];

    playCardButton.onclick = () => {

        var selectCards = player.selectCards;

        if (selectCards.length === config.holeNum) {

            this.setHoleCards(player, selectCards);

            message.innerHTML = "";

            var cardsBox = cardsDom[0];

            player.selectCards.forEach(cardIndex => {

                var cardBox = Array.prototype.find.call(cardsBox, cardBox => cardBox.getAttribute("data-cardindex") == cardIndex)
                
                cardBox.remove();
            })

            player.selectCards = [];

        } else {
            console.warn("牌数必须为" + config.holeNum + "张")
            message.innerHTML = "牌数必须为" + config.holeNum + "张";
        }
    }

}

Game.prototype.play = function (seat, selectCards) {

    console.log("\n----------------\n")

    console.log('出牌玩家: ', seat)

    // 出牌这不是本人时, 其他玩家出牌
    if (this.mainSeat !== seat) {

        // 首出
        if (seat === this.currentState.startPlayer) {

            this.currentState.group = pokers[selectCards[0]].isMaster ? "master" : pokers[selectCards[0]].suit;
            this.currentState.cardType = pokerHelper.getCardType(selectCards, this.currentInfo.level);
            this.currentState.bigCardPlayer = seat;
        } 
        // 跟牌
        else {

            // 判断是否比别人大
            var isBiger = pokerHelper.compare(
                this.currentState.cards[(this.currentState.bigCardPlayer - this.currentState.startPlayer + 4) % 4],
                selectCards,
                this.currentInfo.level,
                this.currentInfo.master
            )

            if (isBiger) {
                this.currentState.bigCardPlayer = this.currentState.player;

                // 显示'大'字在出牌框右侧
            }
        }

        this.players[seat].playCard(selectCards);
        this.currentState.cards.push(selectCards);

        this.currentState.score += pokerHelper.getScore(selectCards);

        console.log(seat, "出牌: ", selectCards)

        this.currentState.player = (seat + 1) % 4;
        
    }


    if (this.currentState.cards.length === 4) {
        //...
        //本轮结算
        // next

        if (this.players[0].cards.length === 0) {

            this.setStage(STAGE.end);
            return;
        } else {
            
            clearPlayCard(); //清空牌桌上上一轮打的牌
        }

        if (Math.abs(this.currentInfo.banker - this.currentState.bigCardPlayer) % 2 === 1) {

            this.currentInfo.score += this.currentState.score;
            gameInfoDom.currentInfo.score.innerHTML = this.currentInfo.score;
        }

        this.currentState = {
            startPlayer: this.currentState.bigCardPlayer, //第一个出牌人
            cards: [], //已出牌
            group: "", //首出牌种类
            cardType: -1, // 首出牌牌型
            player: this.currentState.bigCardPlayer, //出牌人
            score: 0, // 本轮中的分数
            bigCardPlayer: this.currentState.bigCardPlayer, //出牌中最大者
        }

        if(this.currentState.bigCardPlayer === this.mainSeat) {
            this.showPlayPanel();
        }

    } else if (this.mainSeat === (seat + 1) % 4) {

        this.showPlayPanel();
    }

    

}

Game.prototype.end = function () {

    console.log('end');


    // this.globalInfo;
    // this.currentInfo;

    // this.start();
}


Game.prototype.showPlayPanel = function (callback) {

    console.log('showPlayPanel', '你出牌: ');

    playCardButton.innerHTML = "出牌";
    playCardButton.disabled = false;
    playCardButton.style.opacity = 1;

    var player = this.players[this.mainSeat];

    var flag = true;

    playCardButton.onclick = () => {

        if (!flag) return;


        var selectCards = player.selectCards;

        //判断出牌是否符合规则
        if (selectCards.length > 0 && pokerHelper.isValidCard(selectCards, player.groupedCards, this.currentState, this.currentInfo.level)) {


            if (this.mainSeat === this.currentState.startPlayer) {

                this.currentState.group = pokers[selectCards[0]].isMaster ? "master" : pokers[selectCards[0]].suit;
                this.currentState.cardType = pokerHelper.getCardType(selectCards, this.currentInfo.level);
                this.currentState.bigCardPlayer = this.mainSeat;
            } else {

                var isBiger = pokerHelper.compare(
                    this.currentState.cards[(this.currentState.bigCardPlayer - this.currentState.startPlayer + 4) % 4],
                    selectCards,
                    this.currentInfo.level,
                    this.currentInfo.master
                )

                if (isBiger) {
                    this.currentState.bigCardPlayer = this.mainSeat;
                }
            }

            ws.send(JSON.stringify({
                type: STATE.PLAY,
                msg: {
                    seat: this.mainSeat,
                    selectCards: selectCards
                }
            }));

            this.players[this.mainSeat].playCard(selectCards);
            this.currentState.cards.push(selectCards);


            this.currentState.score += pokerHelper.getScore(selectCards);

            console.log("我出牌: ", selectCards)

            this.currentState.player = (this.mainSeat + 1) % 4;

            flag = false;

            selectCards = [];
            message.innerHTML = ""
            playCardButton.disabled = true;
            playCardButton.style.opacity = 0;

        } else {
            console.log("出牌不符合规则")
            message.innerHTML = "出牌不符合规则";

        }
    }

}


//每发一张牌就应该加入dom中显示出来，以便亮主、抢庄。此处先不考虑，默认玩家为庄家。
Game.prototype.addCardToDom = function () {

    let player = this.players[this.mainSeat];

    var palyerCardBox = document.getElementById("player0-card");

    while (palyerCardBox.firstChild) {
        palyerCardBox.removeChild(palyerCardBox.firstChild);
    }

    var suits = ['master', 'hearts', 'spades', 'diamonds', 'clubs'];

    suits.forEach(suit => {

        var element = player.groupedCards[suit];

        if (element.length === 0) return;

        for (let i = element.length - 1; i >= 0; i--) {

            var cardIndex = element[i];
            var cardBox = document.createElement("div");
            cardBox.style.display = "inline-block";
            cardBox.setAttribute("class", "card-box card0-box");
            cardBox.setAttribute("data-cardindex", cardIndex);
            cardBox.appendChild(pokers[cardIndex].image)

            palyerCardBox.appendChild(cardBox);

            cardBox.onclick = (function (cardIndex) {
                    
                return function () {

                    var childNodes = this.childNodes;

                    var img = childNodes[0];

                    if (img.tagName === "IMG") {


                        if (img.style.top === "-10px") {
                            img.style.top = "0"

                            player.selectCards.splice(player.selectCards.indexOf(cardIndex), 1);
                        } else {

                            img.style.top = "-10px"
                            player.selectCards.push(cardIndex);
                        }
                    }
                }
            })(cardIndex)
        }
    })
}


Game.prototype.destroy = function () {

    this.stage = -1;
    this.stageHandle = ['init', 'setHole', 'play', 'end'];
    this.players = [null, null, null, null];
    this.cards = [];
    this.options = options;

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
        score: 0, // 本轮中的分数
        bigCardPlayer: -1, //出牌中最大者
    }
}