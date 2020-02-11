function Player(seat) {

    this.seat = seat;
    this.group = seat % 2;
    this.isBanker = false;
    this.cards = [];
    this.groupedCards = {
        master: [],
        hearts: [],
        diamonds: [],
        spades: [],
        clubs: []
        //...
    }
    this.selectCards = [];

}

Player.prototype.init = function() {
    this.selectCards = [];
}

Player.prototype.addCard = function(card) {

    if(Array.isArray(card)){

        this.cards = this.cards.concat(card)
    }else {
        
        this.cards.push(card)
    }
}

Player.prototype.playCard = function() {

    this.cards = this.cards.filter((cardIndex) => {
        return this.selectCards.indexOf(cardIndex) < 0
    })

    var palyCardBox = document.getElementById("playCard" + this.seat);
    var cardsBox = document.getElementsByClassName("card" + this.seat + "-box");

    for (let i = this.selectCards.length - 1; i >= 0 ; i--) {

        const cardIndex = this.selectCards[i];
        this.groupedCards[pokers[cardIndex].group].splice(this.groupedCards[pokers[cardIndex].group].indexOf(cardIndex), 1)

        var cardBox = Array.prototype.find.call(cardsBox, cardBox => cardBox.getAttribute("data-cardindex") == cardIndex)
        console.log(cardIndex, cardBox)
        palyCardBox.appendChild(cardBox)
      
    }

    this.selectCards = [];
}

Player.prototype.setHoleCards = function(cards) {
    this.cards = this.cards.filter(function(cardIndex) {
        return cards.indexOf(cardIndex) < 0
    })

    cards.forEach(cardIndex => {

        this.groupedCards[pokers[cardIndex].group].splice(this.groupedCards[pokers[cardIndex].group].indexOf(cardIndex), 1)
    })
}


Player.prototype.clearCard = function(cards) {
    this.cards = [];
    this.groupedCards = {
        master: [],
        hearts: [],
        diamonds: [],
        spades: [],
        clubs: []
        //...
    }
    this.isBanker = false;
}

Player.prototype.selectRandomCards = function(currentState, levelPoint) {
    
    if(this.seat === currentState.startPlayer) {
        
        console.log("首出")
        var randomCardIndex = this.cards[Math.floor(Math.random() * this.cards.length)]
        this.selectCards.push(randomCardIndex)
    } else {
        console.log("跟出")
        var len = this.groupedCards[currentState.group].length;
        var needLen = currentState.cards[0].length;
        if(len > 0) {

            //跟一张单牌
            if(currentState.cardType === 0) {

                var randomCardIndex = this.groupedCards[currentState.group][Math.floor(Math.random() * len)]
                console.log('玩家 ', player.seat, ' 随机选择牌: ', pokers[randomCardIndex])
                this.selectCards.push(randomCardIndex)
            } else if(currentState.cardType === 1)  {

                if(len > 1) {

                    // 查找对子
                    var index = this.groupedCards[currentState.group].findIndex((cardIndex, i) =>{

                        return i < len - 1 
                        && 1 === pokerHelper.getCardType([cardIndex, this.groupedCards[currentState.group][i + 1]], levelPoint)
                    })

                    // 有对子出对子
                    if(index >= 0) {

                        this.selectCards.push(
                            this.groupedCards[currentState.group][index], 
                            this.groupedCards[currentState.group][index + 1]
                        )
                    } else {

                        this.selectCards.push(
                            this.groupedCards[currentState.group][0], 
                            this.groupedCards[currentState.group][1]
                        )
                    }
                } else {

                    // 只剩一张牌，选择剩余的牌，加上相邻的一张牌。
                    this.selectCards.push(this.groupedCards[currentState.group][0])

                    var index = this.cards.findIndex((cardIndex) => 
                        this.groupedCards[currentState.group][0] === cardIndex
                    ) 

                    if(index > 0) {
                        this.selectCards.push(this.cards[index - 1])
                    } else {
                        this.selectCards.push(this.cards[index + 1])
                    }
                }

            } else if(currentState.cardType === 2)  {

                if(len >= needLen) {

                    //查找拖拉机
                    var randomCardIndex = this.groupedCards[currentState.group].findIndex((_, i) =>{

                        return i < len - needLen 
                                && pokerHelper.getCardType(this.groupedCards[currentState.group].slice(i, i + needLen - 1)) === 2
                    })

                    // 有拖拉机出拖拉机
                    if(randomCardIndex >= 0) {

                        currentState.cards[0].forEach((_, i) => {

                            this.selectCards.push(this.groupedCards[currentState.group][randomIndex + i])
                        })
                    } else {

                        // 无拖拉机时，查找对子
                        this.groupedCards[currentState.group].forEach((cardIndex, i) =>{

                            if(
                                this.selectCards.length < needLen
                                && i < len - 1 
                                && 1 === pokerHelper.getCardType([cardIndex, this.groupedCards[currentState.group][i + 1]], levelPoint)
                            ) {

                                this.selectCards.push(
                                    this.groupedCards[currentState.group][i], 
                                    this.groupedCards[currentState.group][i + 1]
                                )
                            }
                        })

                        if(this.selectCards.length < needLen){
                            //无对子时，任选相同花色和牌数的牌
                            if(this.selectCards.length === 0) {
                                currentState.cards[0].forEach((_, i) => {

                                    this.selectCards.push(this.groupedCards[currentState.group][i])
                                })
                            } else {

                                //从剩余牌中选择需要补上的牌数
                                var copyCards = JSON.parse(JSON.stringify(this.groupedCards[currentState.group]));

                                this.selectCards.forEach(cardIndex => {
            
                                    copyCards.splice(copyCards.indexOf(cardIndex), 1)
                                })
            
                                var leastNum = needLen - this.selectCards.length;
            
                                var randomIndex = Math.floor(Math.random() * (copyCards.length - leastNum ));
            
                                for (var i = 0; i < leastNum; i++) {
                                    this.selectCards.push(copyCards[randomIndex + i])
                                }
                            }
                        }
                       
                        
                    }
                } else {

                    // 该花色的牌全打出
                    this.groupedCards[currentState.group].forEach((_, i) => {

                        this.selectCards.push(this.groupedCards[currentState.group][i])
                    })

                    //从其他花色牌中选择需要补上的牌数
                    var copyCards = JSON.parse(JSON.stringify(this.cards));

                    this.selectCards.forEach(cardIndex => {

                        copyCards.splice(copyCards.indexOf(cardIndex), 1)
                    })

                    var leastNum = needLen - this.selectCards.length;

                    var randomIndex = Math.floor(Math.random() * (copyCards.length - leastNum ));

                    for (var i = 0; i < leastNum; i++) {
                        this.selectCards.push(copyCards[randomIndex + i])
                    }

                }
            }

        } else { //随机出牌, 垫牌

            var randomIndex = Math.floor(Math.random() * (this.cards.length - needLen ));

            currentState.cards[0].forEach((_, i) => {

                this.selectCards.push(this.cards[randomIndex + i])
            })
        }
    }
}

Player.prototype.divideCards = function(master) {

    this.cards.forEach(cardIndex => {
        
        if(pokers[cardIndex].value >= 15 || pokers[cardIndex].suit === master) {

            this.groupedCards.master.push(cardIndex);
            pokers[cardIndex].isMaster = true;
            pokers[cardIndex].group = 'master';
        } else {
            this.groupedCards[pokers[cardIndex].suit].push(cardIndex);
            pokers[cardIndex].group = pokers[cardIndex].suit;
        }
    });

    for (const suit in this.groupedCards) {
        if (this.groupedCards.hasOwnProperty(suit)) {
           
            pokerHelper.sortCards(this.groupedCards[suit])
        }
    }

    console.log("groupedCards", this.groupedCards)
}







