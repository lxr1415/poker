function Player(seat) {

    this.seat = seat;
    this.group = seat % 2;
    this.isBanker = false;
    this.cards = [];
    this.sortCards = {
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
}

Player.prototype.setHoleCards = function(cards) {
    this.cards = this.cards.filter(function(_, index) {
        return cards.indexOf(index) < 0
    })
}


Player.prototype.clearCard = function(cards) {
    this.cards = [];
    this.sortCards = {
        master: [],
        hearts: [],
        diamonds: [],
        spades: [],
        clubs: []
        //...
    }
    this.isBanker = false;
}

Player.prototype.selectRandomCards = function(cards, isStartPlayer) {
    
}

Player.prototype.sortCards = function() {

    this.cards.forEach(cardIndex => {
        

    });


    cardIndexs.sort(function(a, b) {
        return pokers[a].value - pokers[b].value
    })
}







