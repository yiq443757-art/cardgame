import { LevelConfig, CardSlotConfig, kLevel1Config } from "../Configs/LevelConfig";

export class GameModel {

    playfieldCards: CardSlotConfig[] = [];
    stackCards: CardSlotConfig[] = [];

    // 当前顶牌（手牌区顶部）
    topPlayfieldCard: CardSlotConfig | null = null;

    initLevel(config: LevelConfig): void {
        // 做个浅拷贝，避免直接改原始配置
        this.playfieldCards = config.playfield.map(c => ({ ...c }));
        this.stackCards = config.stack.map(c => ({ ...c }));

        this.topPlayfieldCard = this.playfieldCards.length > 0
            ? this.playfieldCards[0]
            : null;
    }

    initDefaultLevel(): void {
        this.initLevel(kLevel1Config);
    }

    updateTopCard(newCard: CardSlotConfig): void {
        this.topPlayfieldCard = newCard;
    }
}
