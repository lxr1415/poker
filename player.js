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

Player.prototype.playCard = function(cards) {

    this.cards = this.cards.filter(function(_, index) {
        return cards.indexOf(index) < 0
    })

    this.selectCards = [];
}

Player.prototype.setHoleCards = function(cards) {
    this.cards = this.cards.filter(function(_, index) {
        return cards.indexOf(index) < 0
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

Player.prototype.selectRandomCards = function(currentState) {
    
    if(player.seat === currentState.startPlayer) {
        
        var randomCardIndex = this.cards[Math.floor(Math.random() * this.cards.length)]
        this.selectCards.push(randomCardIndex)
    } else {

        var len = this.groupedCards[currentState.group].length;
        if(len > 0) {

            if(currentState.cardType === 0) {

                var randomCardIndex = this.groupedCards[currentState.group][Math.floor(Math.random() * len)]
                this.selectCards.push(randomCardIndex)
            } else if(currentState.cardType === 1)  {

                if(len > 1) {

                    var randomCardIndex = this.groupedCards[currentState.group].findIndex((_, i) =>{

                        return i < len - 1 && pokers[i].value === pokers[i + 1].value
                    })

                    if(randomCardIndex >= 0) {

                        this.selectCards.push(
                            this.groupedCards[currentState.group][randomCardIndex], 
                            this.groupedCards[currentState.group][randomCardIndex + 1]
                        )
                    } else {

                        this.selectCards.push(
                            this.groupedCards[currentState.group][0], 
                            this.groupedCards[currentState.group][1]
                        )
                    }
                } else {

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

                if(len >= currentState.cards[0].length) {

                    var randomCardIndex = this.groupedCards[currentState.group].findIndex((_, i) =>{

                        return i < len - currentState.cards[0].length 
                                && pokerHelper.getCardType(this.groupedCards[currentState.group].slice(i, i + currentState.cards[0].length - 1)) === 2
                    })

                    if(randomCardIndex >= 0) {

                        currentState.cards[0].length.forEach((_, i) => {

                            this.selectCards.push(this.groupedCards[currentState.group][randomIndex + i])
                        })
                    } else {
                        currentState.cards[0].forEach((_, i) => {

                            this.selectCards.push(this.groupedCards[currentState.group][i])
                        })
                    }
                } else {

                    this.groupedCards[currentState.group].forEach((_, i) => {

                        this.selectCards.push(this.groupedCards[currentState.group][i])
                    })

                    var copyCards = JSON.parse(JSON.stringify(this.cards));

                    this.selectCards.forEach(cardIndex => {

                        copyCards.splice(copyCards.indexOf(cardIndex), 1)
                    })

                    var leastNum = currentState.cards[0].length - this.selectCards.length;

                    var randomIndex = Math.floor(Math.random() * (copyCards.length - leastNum + 1 ));

                    for (var i = 0; i < leastNum; i++) {
                        this.selectCards.push(this.cards[randomIndex + i])
                    }

                }
            }

        } else { //随机出牌, 垫牌

            var randomIndex = Math.floor(Math.random() * (this.cards.length - currentState.cards[0].length + 1 ));

            currentState.cards[0].length.forEach((_, i) => {

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
        } else {
            this.groupedCards[pokers[cardIndex].suit].push(cardIndex);
        }
    });

    for (const suit in this.groupedCards) {
        if (this.groupedCards.hasOwnProperty(suit)) {
           
            pokerHelper.sortCards(this.groupedCards[suit])
        }
    }

    console.log("groupedCards", this.groupedCards)
}







