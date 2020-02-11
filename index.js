

var player = new Player(0);
var robot1 = new Player(1);
var robot2 = new Player(2);
var robot3 = new Player(3);

var pokers = pokerHelper.createPoker();

var game = new Game([player, robot1, robot2, robot3], {});

game.start();




var playCardButton = document.getElementById("playCard");

function clearPlayCard() {

    var playCardBoxs = document.getElementsByClassName("playCard");

    for (var i = 0; i < playCardBoxs.length; i++) {
        playCardBoxs[i].innerHTML = ""
    }
}