var hightLightMasterPanel = 
    {
        used: false,
        dom: `
            <div id="highLightMaster">
                <div class="suit nt" style="font-size: 20px;">NT</div>
                <div class="suit hearts">
                    ♥
                    <div class="suitNum">0</div>
                </div>
                <div class="suit spades">
                    ♠
                    <div class="suitNum">0</div>
                </div>
                <div class="suit diamonds">
                    ♦
                    <div class="suitNum">0</div>
                </div>
                <div class="suit clubs">
                    ♣
                    <div class="suitNum">0</div>
                </div>
            </div>
        `,
        state: {
            nt: {
                color: "#000",
                colored: false
            },
            hearts: {
                color: "#A00",
                colored: false
            },
            spades: {
                color: "#000",
                colored: false
            },
            diamonds: {
                color: "#A00",
                colored: false
            },
            clubs: {
                color: "#000",
                colored: false
            },
        },
        addToDom: function(parentNode) {

            if(this.used) return;

            parentNode.innerHTML = this.dom;

            
            this.used = true;
        },
        colour: function(suit) {

            if(this.state[suit].colored || !this.used) return;

            var suitDom = document.getElementsByClassName(suit)[0];

            suitDom.style.color = this.state[suit].color;

            suitDom.onclick = function () {

                game.setMasterCard(suit, game.mainSeat)
            }

            this.state[suit].colored = true;
        },
        addNum: function(suit) {

            if(!this.used) return;

            var suitDom = document.getElementsByClassName(suit)[0];

            var suitNum = suitDom.children[0];

            if(suitNum) {
                suitNum.textContent++;
            }
            
        },
        remove: function() {

            if(!this.used) return;

            document.getElementById("highLightMaster").remove();

            for (const key in this.state) {
                if (this.state.hasOwnProperty(key)) {
                    this.state[key].colored = false;
                }
            }

            this.used = false;
        }
    }
