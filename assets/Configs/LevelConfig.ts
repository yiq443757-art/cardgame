// assets/Configs/LevelConfig.ts

export interface CardPosConfig {
    cardFace: number;
    cardSuit: number;
    position: { x: number; y: number };
}

export interface LevelConfig {
    playfield: CardPosConfig[];
    stack: CardPosConfig[];
}

// 关卡 1，完全照你给的 JSON 改成 ts 版
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
