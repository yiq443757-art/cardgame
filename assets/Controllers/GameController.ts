import { _decorator, Component, Node, Prefab, instantiate, Vec3, __private } from 'cc';
import { GameView } from '../Views/GameView';
import { CardView } from '../Views/CardView';
import { kLevel1Config, CardPosConfig } from '../Configs/LevelConfig';
import { StackController } from './StackController';
import { PlayfieldController } from './PlayfieldController';


const { ccclass, property } = _decorator;


@ccclass('GameController')
export class GameController extends Component {

    @property(Node)
    playfieldArea: Node | null = null;

    @property(Node)
    stackArea: Node | null = null;

    @property([Prefab])
    playfieldCardPrefabs: Prefab[] = [];

    @property([Prefab])
    stackCardPrefabs: Prefab[] = [];

    @property(GameView)
    gameView: GameView | null = null;

    @property(StackController)
    stackController: StackController | null = null;

    @property(PlayfieldController)
    playfieldController: PlayfieldController | null = null;


    private readonly kDesignWidth = 1080;
    private readonly kDesignHeight = 2080;
    private _isSwappingStack = false;

    start() {
        this.spawnPlayfieldCards();
        this.spawnStackCards();
        // ❌ 移除：不再使用全局查找绑定，避免层级问题
         this.bindCardClicks(); 
    }

    private spawnPlayfieldCards(): void {
        if (!this.playfieldArea) return;
        if (this.playfieldCardPrefabs.length === 0) {
            console.error('GameController: playfieldCardPrefabs 为空，请在编辑器里至少拖 1 个 Playfield 用的 Card.prefab');
            return;
        }

        for (let i = 0; i < kLevel1Config.playfield.length; i++) {
            const cfg = kLevel1Config.playfield[i];
            const prefab = this.playfieldCardPrefabs[i % this.playfieldCardPrefabs.length];
            this.createCard(cfg, this.playfieldArea, prefab);
        }
    }

    private spawnStackCards(): void {
        if (!this.stackArea) return;
        if (this.stackCardPrefabs.length === 0) {
            console.error('GameController: stackCardPrefabs 为空，请在编辑器里至少拖 1 个 Stack 用的 Card.prefab');
            return;
        }

        for (let i = 0; i < kLevel1Config.stack.length; i++) {
            const cfg = kLevel1Config.stack[i];
            const prefab = this.stackCardPrefabs[i % this.stackCardPrefabs.length];
            this.createCard(cfg, this.stackArea, prefab);
        }
    }

    // ✅ 关键修改：在创建卡牌时立即绑定点击回调
    private createCard(cfg: CardPosConfig, parent: Node, prefab: Prefab): Node {
        const node = instantiate(prefab);

        const x = cfg.position.x - this.kDesignWidth / 2;
        const y = cfg.position.y - this.kDesignHeight / 2;
        node.setPosition(new Vec3(x, y, 0));
        parent.addChild(node);

        const view = node.getComponent(CardView);
        if (view) {
            (view as any).cardConfig = cfg;
            //写牌的属性
            view.cardFace = cfg.cardFace;
            view.cardSuit = cfg.cardSuit;
            // ⭐ 绑定点击事件处理函数
           // view.setClickHandler(this.onCardClicked.bind(this)); 
            //console.log(`DEBUG: Card ${node.name} 绑定成功。`);
        }

        return node;
    }

    
    private bindCardClicks(): void {
    const cards = this.node.getComponentsInChildren(CardView);

    for (const card of cards) {
        const parent = card.node.parent;
        if (parent === this.stackArea && this.stackController) {
            // Stack 区卡牌 → 交给 StackController
            card.setClickHandler(this.stackController.onStackCardClicked.bind(this.stackController));
        } else if (parent === this.playfieldArea && this.playfieldController) {
            // Playfield 区卡牌 → 交给 PlayfieldController
            card.setClickHandler(this.playfieldController.onPlayfieldCardClicked.bind(this.playfieldController));
        }
    }
    }

    /*private onCardClicked(cardView: CardView): void {
        console.log("DEBUG: onCardClicked 触发！");
        const node = cardView.node;

        // 1. 如果点击的是 Stack 区的牌，走 Stack 逻辑
        if (this.stackArea && node.parent === this.stackArea) {
            console.log("DEBUG: 进入 Stack 逻辑.");
            this._handleStackCardClick(cardView);
            return;
        }

        // 2. 其它（比如 Playfield）先沿用原来的逻辑
        if (!this.gameView) {
            return;
        }
        this.gameView.playReplaceTopCard(node);
    }

    // 私有：处理 Stack 区点击
    private _handleStackCardClick(cardView: CardView): void {
    if (!this.stackArea || !this.gameView) {
        return;
    }

    // 交换过程中，直接忽略新的点击
    if (this._isSwappingStack) {
        return;
    }

    const clickedNode = cardView.node;

    const stackChildren = this.stackArea.children;
    const stackCardNodes: Node[] = [];
    for (const child of stackChildren) {
        if (child.getComponent(CardView)) {
            stackCardNodes.push(child);
        }
    }
    if (stackCardNodes.length === 0) {
        return;
    }

    // 找 x 最大的 top 卡
    let topNode = stackCardNodes[0];
    let maxX = topNode.position.x;
    for (const n of stackCardNodes) {
        if (n.position.x > maxX) {
            maxX = n.position.x;
            topNode = n;
        }
    }

    // 点击的是 top 就不换
    if (clickedNode === topNode) {
        return;
    }

    // 标记正在交换
    this._isSwappingStack = true;

    // 把“交换完毕”的回调传给 GameView
    this.gameView.playSwapStackTop(clickedNode, topNode, () => {
        this._isSwappingStack = false;
     // 交换结束后重新排序层级
    this._sortStackByX();
    });
    }
    
    //渲染层级的确定：

    private _sortStackByX(): void {
    if (!this.stackArea) return;

    const nodes = this.stackArea.children.filter(n => n.getComponent(CardView));

    // 按 x 升序排序（最小 → 最大）
    nodes.sort((a, b) => a.position.x - b.position.x);

    // 重新设置 siblingIndex，保证视觉层级正确
    nodes.forEach((node, index) => {
        node.setSiblingIndex(index);  // index 越大越上层
    });
}*/



}