import { _decorator, Component, Node, Prefab, instantiate, Vec3, __private } from 'cc';
import { GameView } from '../Views/GameView';
import { CardView } from '../Views/CardView';
import { kLevel1Config, CardPosConfig } from '../Configs/LevelConfig';
import { StackController } from './StackController';
import { PlayfieldController } from './PlayfieldController';


const { ccclass, property } = _decorator;


/*
 GameController

功能：
负责本关卡中卡牌的整体生成与初始化；
根据关卡配置（kLevel1Config）在 Playfield 和 Stack 区域实例化卡牌；
负责为卡牌绑定点击事件，并将点击交给对应的 Controller（StackController / PlayfieldController）处理。
 
职责：
为游戏场景的“总调度”，协调视图层（GameView、CardView）与业务控制层（StackController、PlayfieldController）；
管理关卡中卡牌节点的生成、父节点挂载以及初始坐标设置。
 
使用场景：
场景加载后，由 Cocos 生命周期自动调用 start()；
在 start() 中初始化当前关卡的卡牌布局，并为其绑定交互逻辑。
 */
@ccclass('GameController')
export class GameController extends Component {

    @property(Node)
    playfieldArea: Node | null = null;
    /*
    Playfield 区域根节点
    用途：所有桌面上的牌（playfield 卡牌）都会作为子节点挂在此节点下。在编辑器中通过拖拽方式进行绑定。
     */
    @property(Node)
    stackArea: Node | null = null;
     /*
    Stack 区域根节点
    用途：所有堆牌区的牌（stack 卡牌）都会作为子节点挂在此节点下。在编辑器中通过拖拽方式进行绑定。
     */
    @property([Prefab])
    playfieldCardPrefabs: Prefab[] = [];
    /**
    Playfield 区域使用的卡牌预制体数组
    用途：根据关卡配置，在 playfieldArea 中实例化卡牌节点。
     */
    @property([Prefab])
    stackCardPrefabs: Prefab[] = [];
    /*
    Stack 区域使用的卡牌预制体数组
    用途：根据关卡配置，在 stackArea 中实例化堆牌区的卡牌。
     */
    @property(GameView)
    gameView: GameView | null = null;
    /*
    GameView 视图层引用
    用途：用于调用 GameView 中的动画或通用展示逻辑（例如：交换动画、替换动画等）。
     */
    @property(StackController)
    stackController: StackController | null = null;
     /*
    StackController 控制器
    用途：专门处理堆牌区 Stack 的点击逻辑与业务规则。
     */
    @property(PlayfieldController)
    playfieldController: PlayfieldController | null = null;
    /*
    PlayfieldController 控制器
    用途：专门处理桌面 Playfield 区域中的卡牌点击逻辑与业务规则。
     */

    private readonly kDesignWidth = 1080;
    private readonly kDesignHeight = 2080;

    private _isSwappingStack = false;
    /*
    标记 Stack 区是否正在执行交换动画
    用途：防止在交换过程中重复点击导致逻辑混乱。
     */

    start() {
        this.spawnPlayfieldCards();
        this.spawnStackCards();
        
         this.bindCardClicks(); 
    }
    /*
    Cocos 生命周期：start
     功能：
     在节点初始化完成后自动调用；根据关卡配置生成 Playfield 与 Stack 中的卡牌；
     为所有已生成的卡牌绑定点击事件，将交互分发给对应的 Controller。
     */

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
    /*
    生成 Playfield 区域的卡牌
    功能：
    遍历 kLevel1Config.playfield 配置；
    使用 playfieldCardPrefabs 实例化卡牌；
     将卡牌挂载到 playfieldArea 节点下。
     */

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
    /*
    生成 Stack 区域的卡牌
    功能：
    遍历 kLevel1Config.stack 配置；
    使用 stackCardPrefabs 实例化堆牌区的卡牌；
    将卡牌挂载到 stackArea 节点下。
    若编辑器中未配置 stackCardPrefabs，则会打印错误日志并提前返回。
     */

    // 关键修改：在创建卡牌时立即绑定点击回调



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
            
        }

        return node;
    }

    
    /*
    通用卡牌创建函数
    功能：
    根据单张卡牌配置（CardPosConfig）实例化预制体；
    将其挂载到指定父节点；
    设置卡牌在场景中的初始位置与牌面属性。
    @param cfg   单张卡牌的配置（牌面点数、花色、位置）
    @param parent 该卡牌要挂载到的父节点（Playfield 或 Stack 区域）
    @param prefab 用于实例化的卡牌预制体
    @returns 创建完成的卡牌节点 Node
     */



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
     /*
    扫描场景中所有 CardView，并绑定点击回调
    功能：
    遍历当前 GameController 节点下所有子节点中的 CardView 组件；
    判断其父节点属于 Stack 区或 Playfield 区；
    将点击事件分别绑定到 StackController 或 PlayfieldController 的处理函数上。
    使用场景：
    在所有卡牌生成完毕之后调用（start 阶段），统一完成点击事件的分发绑定。
     */   


}