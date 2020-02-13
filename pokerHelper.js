

// 
// poker {
//     suit // 花色
//     point // 牌点
//     defaultValue //牌默认权值, '3' - 'a' => 3 - 14; '2' => 27; 小王 => 31 大王 => 32
//     value // 牌权值, 修改级牌权值 '3' - 'a' => 15 - 26; '2' => 27, 28; 级牌 => 29, 30;
//     image // 牌的图片
//     isMater // 是否是主牌
// }


window.pokerHelper = {};


(function(){

    pokerHelper = {
        createPoker,
        setPokersValue,
        getLevelCardIndexs,
        isTheSameColor,
        getCardType,
        isValidCard,
        isMaster,
        compare,
        sortCards,
        getScore
    }

    function createPoker() {

        var pokers = [];
        var suits = ['hearts', 'spades', 'diamonds', 'clubs']; //红桃、黑桃、方块、梅花
        var points = ['3', '4', '5', '6', '7', '8', '9', '10', 'j', 'q', 'k', 'a'];
    
        var size = 50;
    
    
        //生成52张牌
        for (var i in suits) {
            for (var j in points) {
    
                pokers.push({
                    suit: suits[i],
                    point: points[j],
                    defaultValue: Number(points[j]) || (Number(j) + 3),
                    value: Number(points[j]) || (Number(j) + 3),
                    image: Poker.getCardImage(size, suits[i], points[j])
                })
                pokers.push({
                    suit: suits[i],
                    point: points[j],
                    defaultValue: Number(points[j]) || (Number(j) + 3),
                    value: Number(points[j]) || (Number(j) + 3),
                    image: Poker.getCardImage(size, suits[i], points[j])
                })
            }
        }
    
        for (var i in suits) {
    
            pokers.push({
                suit: suits[i],
                point: '2',
                defaultValue: 27,
                value: 27,
                image: Poker.getCardImage(size, suits[i], '2')
            })
            pokers.push({
                suit: suits[i],
                point: '2',
                defaultValue: 27,
                value: 27,
                image: Poker.getCardImage(size, suits[i], '2')
            })
        }
    
        //小王
        pokers.push({
            suit: 'nt',
            point: '0',
            defaultValue: 31,
            value: 31,
            image: Poker.getCardImage(size, 'spades', 'joker')
        })
        pokers.push({
            suit: 'nt',
            point: '0',
            defaultValue: 31,
            value: 31,
            image: Poker.getCardImage(size, 'spades', 'joker')
        })
    
        //大王
        pokers.push({
            suit: 'nt',
            point: '1',
            defaultValue: 32,
            value: 32,
            image: Poker.getCardImage(size, 'hearts', 'joker')
        })
        pokers.push({
            suit: 'nt',
            point: '1',
            defaultValue: 32,
            value: 32,
            image: Poker.getCardImage(size, 'hearts', 'joker')
        })
    
        console.log(pokers)
    
        return pokers
    }
    
    /**
     * 根据级牌和主,设置每张牌的权值
     * @param {*} levelPoint 
     * @param {*} master 
     */
    function setPokersValue(levelPoint, master) {
    
        pokers.forEach((poker,i) => {
    
            // 主2
            if(poker.point === '2' && poker.suit === master) {
    
                pokers[i].value = 28
            } 
            // 级牌
            else if(poker.defaultValue === levelPoint) {
    
                pokers[i].value = poker.suit === master ? 30 : 29
            }
            // 其他牌 
            else {
                // 普通主牌
                if(poker.suit === master) {
                    
                    pokers[i].value = poker.defaultValue + 12;
                }
                // 副牌 
                else {
                    
                    pokers[i].value = poker.defaultValue;
                }
            }

            pokers[i].isMaster = false;
        });
    }
    
    /**
     * 重置每张牌的权值
     */
    // function resetPokers() {
    
    //     pokers.forEach(poker => {
            
    //         poker.value = poker.defaultValue;
    //     });
    // }
    
    
    /**
     * 获取所有级牌索引
     * @param {string} point 牌点 
     */
    function getLevelCardIndexs(point) {
    
        var cards = [];
    
        for (let i = 0; i < pokers.length; i++) {
            const poker = pokers[i];
            if (poker.point === point) {
                cards.push(i);
                break;
            }
        }
    
        return cards;
    }
    
    /**
     * 
     * @param {*} cardIndexs 
     * @param {*} master 
     */
    function isTheSameColor(cardIndexs, player, levelPoint, master) {
    
        let poker = pokers[cardIndexs[0]];
    
        for (const key in player.sortCards) {
            if (player.sortCards.hasOwnProperty(key)) {
                const element = player.sortCards[key];
                
    
            }
        }
    }
    
    /**
     * 牌型
     * 1: 单张
     * 2: 对子
     * 3: 拖拉机(连对), 同花色相邻两个或多个对子,也包括4466(5为级牌时)
     */
    
    /**
     * 判断牌型
     * @param {Array} cardIndexs 
     */
    function getCardType(cardIndexs, levelPoint) {
    
        sortCards(cardIndexs);

        // 主牌副牌混合
        if( cardIndexs.find( cardIndex => pokers[cardIndex].isMaster !== pokers[cardIndexs[0]].isMaster ) ) {
            return -1
        }

        // 副牌中不同花色混合
        if(!pokers[cardIndexs[0]].isMaster && cardIndexs.find( cardIndex =>  pokers[cardIndex].suit !== pokers[cardIndexs[0]].suit ) ) {
            return -1
        }



        // 同为主/副牌, 为副牌时,同花色
    
        if (cardIndexs.length === 1) {
    
            return 0;
        } else if (cardIndexs.length === 2
             && pokers[cardIndexs[0]].value === pokers[cardIndexs[1]].value
             && pokers[cardIndexs[0]].suit === pokers[cardIndexs[1]].suit
            ) {
    
            return 1;
        } else if (cardIndexs.length >= 4 && cardIndexs.length % 2 === 0) {
    
            for (let i = 1; i <= cardIndexs.length - 3; i += 2) {
    
                const cardIndex = cardIndexs[i];
    
                // 1.每两张牌point和value,suit必相等 
                // 2.相邻组牌value = 1或2,
                // 相邻组牌value为1时, 是连对
                // 相邻组牌value为2时, 小value + 1 = 级牌value
                if (pokers[cardIndex].value !== pokers[cardIndexs[i - 1]].value
                    || pokers[cardIndex].suit !== pokers[cardIndexs[i - 1]].suit
                    || pokers[cardIndex].point !== pokers[cardIndexs[i - 1]].point
                    || pokers[cardIndexs[i + 1]].value !== pokers[cardIndexs[i + 2]].value
                    || pokers[cardIndexs[i + 1]].suit !== pokers[cardIndexs[i + 2]].suit
                    || pokers[cardIndexs[i + 1]].point !== pokers[cardIndexs[i + 2]].point
                    || pokers[cardIndexs[i + 1]].value - pokers[cardIndex].value > 2
                    || pokers[cardIndexs[i + 1]].value - pokers[cardIndex].value === 0
                    || pokers[cardIndexs[i + 1]].value - pokers[cardIndex].value === 2 && pokers[cardIndex].value + 1 !== levelPoint) {
    
                    return -1
                }
            }
    
            return 2;
        }
    
        return -1;
    }
    
    /**
     * 判断出牌是否符合规则
     * 首出: 任意符合牌型的牌
     * 跟出: 
     *      与首出一致的牌型和花色,首出者出拖拉机时,跟出者无拖拉机则有对子必须出对子.
     *      垫牌,无首出者所出花色牌,可出其他副牌垫牌,此牌小于首出者
     *      毙牌,无首出者所出花色牌时,可出与首出一致的牌型的主牌,此牌大于首出者
     * 
     * @param {array} selectCards 已选牌索引数组
     * @param {array} groupedCards 已分组手牌
     * @param {object} currentState 当前轮次信息
     */
    function isValidCard( selectCards, groupedCards, currentState, levelPoint ) {
    
        //首出
        //不符合牌型
        if(currentState.startPlayer === currentState.player) {
            
            return getCardType(selectCards, levelPoint) >= 0 
        }

        //假设跟出是符合规则的
        // return true;

        //跟出

        //牌数不相等
        if(currentState.cards[0].length !== selectCards.length) {
            return false;
        }

        sortCards(selectCards);

        var group = currentState.group; //首出牌种类

        //手中无首出牌种类的牌， 可出任意牌
        if(groupedCards[group].length === 0) {
            return true
        }

        
        // 手牌中的首出牌种类牌数小于等于需出牌数，但还存在此类牌，需保证全部打出，垫牌。
        if(groupedCards[group].length > 0 && groupedCards[group].length <= currentState.cards[0].length) {

            var num = 0;
            selectCards.forEach(cardIndex => {

                if(pokers[cardIndex].group === group) {
                    num++;
                }
            })

            return num === groupedCards[group].length;
        }

        // 手牌中的首出牌种类牌数大于需出牌数, 需要保证花色相同。
        if(groupedCards[group].length > currentState.cards[0].length){

            var num = 0;
            
            if(selectCards.find(cardIndex => pokers[cardIndex].group !== group)) {

                return false
            }
        }


        // 牌数花色都一致的情况下，牌型也相同，则一定符合规则
        if(getCardType(selectCards, levelPoint) === currentState.cardType) {
            return true
        }
        

        // 牌数花色都一致的情况下，首出者出拖拉机、对子时，有拖拉机必须出拖拉机，有对子必须出对子。
        if(currentState.cardType === 1)  {

            for (let i = 0; i < groupedCards[group].length - 1; i++) {
                
                // 有对子未出对子
                if(getCardType([groupedCards[group][i], groupedCards[group][i +1]], levelPoint ) === 1) {

                    return false
                }
            }

        } else if(currentState.cardType === 2)  {

            var testCards;

            for (let i = 0; i < groupedCards[group].length - currentState.cards[0].length + 1; i++) {
                
                testCards = [];
                currentState.cards[0].forEach((_, j) => {
                    testCards.push(groupedCards[group][i + j])
                });
                
                console.log({testCards})
                // 有拖拉机时未出拖拉机
                if(getCardType(testCards, levelPoint) === 2) {

                    return false
                }
            }

            // 有对子时 未出对子

            var num = 0; //所出对子数
            
            selectCards.forEach((cardIndex, i) => {

                if(i < selectCards.length - 1 && pokers[cardIndex].value === pokers[selectCards[i + 1]].value){
                    num++;
                }
            });

            
            var allNum = 0; //手牌对子数
            groupedCards[group].forEach((cardIndex, i) => {

                if(i < groupedCards[group].length - 1 && pokers[cardIndex].value === pokers[groupedCards[group][i + 1]].value){
                    allNum++;
                }
            });

            //未全出对子, 且手中还有对子
            if(2 * num < selectCards.length &&  num < allNum) {
                return false;
            }
        }
    }
    
    /**
     * 大小王,级牌,2, 为硬主, 
     * 主花色牌为软主
     * @param {*} cardIndexs 
     * @param {*} level 
     * @param {*} master 
     */
    function isMaster(cardIndexs) {
    
        return !cardIndexs.find( cardIndex => !pokers[cardIndex].isMaster)
    }
    
    /**
     * 比较牌大小
     * 牌型以首出为准,牌型相符 > 不符
     * 相同牌型, 主牌大于副牌;同为主牌/副牌,按牌大小比较
     * 牌大小: 
     *        主牌: 大王 > 小王 > 主级牌 > 副级牌 > 主2 > 副2 > a > k > ... > 3
     *        副牌: a > k > ... > 3
     * @param {*} cardIndexs1 已出牌中最大的牌 
     * @param {*} cardIndexs2 需要比较的牌
     * @param {*} level 当前级牌点
     * @param {*} master 主牌类型
     * @return {boolean} 需要比较的牌是否比已出中最大的牌大
     */
    function compare(cardIndexs1, cardIndexs2, levelPoint, master) {
    
    
        var cardType1 = getCardType(cardIndexs1, levelPoint);
        var cardType2 = getCardType(cardIndexs2, levelPoint);
    
        var isMaster1 = isMaster(cardIndexs1, levelPoint, master);
        var isMaster2 = isMaster(cardIndexs2, levelPoint, master);
    
        if (cardType2 !== cardType1) {
            return false
        }
    
        if (isMaster1) {
    
            return isMaster2 ? pokers[cardIndexs1[0]].value < pokers[cardIndexs2[0]].value : false
            
        } else {
    
            return isMaster2 || pokers[cardIndexs1[0]].value < pokers[cardIndexs2[0]].value
            
        }
    }
    
    /**
     * 根据牌权值排序一组牌
     * @param {*} cardIndexs 
     */
    function sortCards(cardIndexs) {
    
        cardIndexs.sort(function(a, b) {

            if(pokers[a].value - pokers[b].value > 0) {
                return 1
            } else if(pokers[a].value - pokers[b].value < 0){
                return -1
            } else {
                return b - a
            }
        })
    }

    /**
     * 统计一组牌中的分数
     * @param {Array} cardIndexs 
     */
    function getScore(cardIndexs) {

        var score = 0;
        cardIndexs.forEach(cardIndex => {

            if (pokers[cardIndex].point === "5") {
                score += 5
            } 
            else if (  pokers[cardIndex].point === "10"
                || pokers[cardIndex].point === "k"
            ){
                score += 10;
            }
        })

        return score;
    }

})()
