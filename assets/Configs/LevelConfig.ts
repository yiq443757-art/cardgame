// assets/Configs/LevelConfig.ts
//一个关卡配置文件（LevelConfig）
export interface CardPosConfig {
    cardFace: number;
    cardSuit: number;
    position: { x: number; y: number };
}

export interface LevelConfig {
    playfield: CardPosConfig[];
    stack: CardPosConfig[];
}

//设定的card的实际点数和固定的位置以及花色，花色在游戏的逻辑里没有使用，先全部设成零
export const kLevel1Config: LevelConfig = {
    playfield: [
        { cardFace: 2, cardSuit: 0, position: { x: 250, y: 1000 } },
        { cardFace: 3,  cardSuit: 0, position: { x: 300, y: 800 } },
        { cardFace: 3,  cardSuit: 0, position: { x: 350, y: 600 } },
        { cardFace: 4,  cardSuit: 0, position: { x: 850, y: 1000 } },
        { cardFace: 13,  cardSuit: 0, position: { x: 800, y: 800 } },
        { cardFace: 2,  cardSuit: 0, position: { x: 750, y: 600 } },
    ],
    stack: [
        { cardFace: 2, cardSuit: 0, position: { x: 250, y: 1000 } },
        { cardFace: 3, cardSuit: 0, position: { x: 400, y: 1000 } },
        { cardFace: 4, cardSuit: 0, position: { x: 750, y: 1000 } },
    ],
};
