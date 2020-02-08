

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
        sortCards
    }

    function createPoker() {

        var pokers = [];
        var suits = ['hearts', 'diamonds', 'spades', 'clubs'];
        var points = ['3', '4', '5', '6', '7', '8', '9', '10', 'j', 'q', 'k', 'a'];
    
        var size = 40;
    
    
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
                defaultValue: 15,
                value: 15,
                image: Poker.getCardImage(size, suits[i], '2')
            })
            pokers.push({
                suit: suits[i],
                point: '2',
                defaultValue: 15,
                value: 15,
                image: Poker.getCardImage(size, suits[i], '2')
            })
        }
    
        //小王
        pokers.push({
            suit: 'nt',
            point: '0',
            defaultValue: 19,
            value: 19,
            image: Poker.getCardImage(size, 'spades', 'joker')
        })
        pokers.push({
            suit: 'nt',
            point: '0',
            defaultValue: 19,
            value: 19,
            image: Poker.getCardImage(size, 'spades', 'joker')
        })
    
        //大王
        pokers.push({
            suit: 'nt',
            point: '1',
            defaultValue: 20,
            value: 20,
            image: Poker.getCardImage(size, 'hearts', 'joker')
        })
        pokers.push({
            suit: 'nt',
            point: '1',
            defaultValue: 20,
            value: 20,
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
        } else if (cardIndexs.length === 2 && pokers[cardIndexs[0]].value === pokers[cardIndexs[1]].value
            ) {
    
            return 1;
        } else if (cardIndexs.length >= 4 && cardIndexs.length % 2 === 0) {
    
            for (let i = 1; i <= cardIndexs.length - 3; i += 2) {
    
                const cardIndex = cardIndexs[i];
    
                // 1.每两张牌point和value必相等
                // 2.相邻组牌value = 1或2,
                // 相邻组牌value为1时, 是连对
                // 相邻组牌value为2时, 小value + 1 = 级牌value
                if (pokers[cardIndex].value !== pokers[cardIndexs[i - 1]].value
                    || pokers[cardIndexs[i + 1]].value !== pokers[cardIndexs[i + 2]].value
                    || pokers[cardIndex].point !== pokers[cardIndexs[i - 1]].point
                    || pokers[cardIndexs[i + 1]].point !== pokers[cardIndexs[i + 2]].point
                    || pokers[cardIndexs[i + 1]].value - pokers[cardIndex].value > 2
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
     * @param {array} cardIndexs 已选牌索引数组
     * @param {boolean} isStartPlayer 是否首出
     * @param {number} master 主牌类型
     * @param {number} level 级牌
     */
    function isValidCard( selectCards, currentState ) {
    
        //首出
        //不符合牌型
        if(currentState.startPlayer === currentState.player && getCardType(selectCards) < 0) {
            return false 
        }

        //假设跟出是符合规则的
        return true;

        //跟出

        if(currentState.cardType === 0) {

            
        } else if(currentState.cardType === 1)  {

            if(len > 1) {

               
            } else {

              
            }

        } else if(currentState.cardType === 2)  {

            if(len >= currentState.cards[0].length) {

               
            } else {


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
    
    
        var cardType1 = getCardType(cardIndexs1, levelPoint, master);
        var cardType2 = getCardType(cardIndexs2, levelPoint, master);
    
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
            return pokers[a].value - pokers[b].value
        })
    }

})()
