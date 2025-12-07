import { _decorator, Component, Node, Vec3, tween } from 'cc';
import { CardView } from '../Views/CardView';
import { GameView } from '../Views/GameView';

const { ccclass, property } = _decorator;

/*
StackController
-------------------------
功能：
管理「堆牌区（Stack）」的所有交互与视觉逻辑；
处理堆牌区卡牌的点击（交换顶部牌）；
接收来自桌面（Playfield）的匹配牌，并让其飞入 Stack 成为新的顶部牌。

职责：
只关注 Stack 区域内部的牌顺序、位置与层级；
提供 getTopCardView / acceptMatchedFromPlayfield 供其他控制器调用。

使用场景：
由 GameController 在 bindCardClicks() 中将 Stack 区牌点击事件绑定到 onStackCardClicked()；
由 PlayfieldController 在匹配成功后调用 acceptMatchedFromPlayfield()。
 */
@ccclass('StackController')
export class StackController extends Component {

    @property(Node)
    stackArea: Node | null = null;
    //堆牌区根节点（Stack）
    @property(GameView)
    gameView: GameView | null = null;
    //GameView 视图层引用
    private _isSwappingStack: boolean = false;
    //是否正在进行堆牌区内部的交换动画

    /*
     处理堆牌区卡牌点击的入口方法
    功能：
    GameController 在 bindCardClicks() 中，将 Stack 区所有卡牌的点击回调绑定到本方法；
    当玩家点击一张 Stack 区的牌时：
    如果当前已经在交换动画中，直接忽略；
    找出当前“顶部牌”（x 最大的那张）；若点击的不是顶部牌，则与顶部牌交换位置，播放 tween 动画；
    动画结束后，重新按 x 排序堆牌区的渲染层级。
    
     */
    // GameController 在 bindCardClicks 里会把点击回调指到这里
    public onStackCardClicked(cardView: CardView): void {
        if (!this.stackArea || !this.gameView) return;
        if (this._isSwappingStack) return;

        const clickedNode = cardView.node;
        const topNode = this._findTopCardNode();
        if (!topNode) return;

        // 点击的就是 top，不用动
        if (clickedNode === topNode) {
            return;
        }

        this._isSwappingStack = true;

        // 交换位置的动画
        const posA = clickedNode.position.clone();
        const posB = topNode.position.clone();

        let finished = 0;
        const checkDone = () => {
            finished++;
            if (finished >= 2) {
                this._isSwappingStack = false;
                this._sortStackByX();   // 按 x 排层级
            }
        };

        tween(clickedNode)
            .to(0.25, { position: new Vec3(posB.x, posB.y, posB.z) })
            .call(checkDone)
            .start();

        tween(topNode)
            .to(0.25, { position: new Vec3(posA.x, posA.y, posA.z) })
            .call(checkDone)
            .start();
    }

    // 给 PlayfieldController 用：获取当前 top 的 CardView
    //在所有挂在 stackArea 下、带有 CardView 的节点中；取 x 坐标最大的那一张视为“顶部牌”。
    public getTopCardView(): CardView | null {
        const topNode = this._findTopCardNode();
        if (!topNode) return null;
        return topNode.getComponent(CardView);
    }


    // 给 PlayfieldController 用：接收一张桌面匹配牌，让它飞到 stack 并变成新的 top
    /*
    接收一张来自 Playfield 的匹配牌
    -------------------------
    功能：
    由 PlayfieldController 在匹配成功后调用；
    将桌面上的卡牌节点挂到 stackArea 下；
    保持原世界坐标不突变，然后通过 tween 动画将其移动到当前顶部牌右侧；
    动画结束后按 x 坐标重新确定渲染层级，让它成为视觉上的“最上方”一张牌。
     cardView 从桌面区域移动过来的匹配牌
     */
    public acceptMatchedFromPlayfield(cardView: CardView): void {
        if (!this.stackArea || !this.gameView) return;

        const playfieldNode = cardView.node;
        const topNode = this._findTopCardNode();
        if (!topNode) return;

        // 记录桌面牌的世界坐标
        const oldWorldPos = playfieldNode.worldPosition.clone();

        // 重新挂到 stackArea 下面，同时保持原来的世界位置
        const stackParent = this.stackArea;
        playfieldNode.removeFromParent();
        stackParent.addChild(playfieldNode);


        playfieldNode.setPosition(oldWorldPos);

        // 目标：放到当前 top 的右边一点（成为新的 x 最大）
        const targetPos = topNode.position.clone();
        targetPos.x += 150;   // 你可以根据牌宽调整偏移

        tween(playfieldNode)
            .to(0.25, { position: targetPos })
            .call(() => {
                this._sortStackByX();  // 重新按 x 排层级，确保它在最上面
            })
            .start();
    }

    // ========== 私有工具 ==========

    /*在 Stack 区中找到“顶部牌”对应的 Node
    从 stackArea.children 中筛选出包含 CardView 组件的节点；按 x 坐标比较，选择 x 最大的那一张。
    */
    private _findTopCardNode(): Node | null {
        if (!this.stackArea) return null;

        const stackCardNodes: Node[] = [];
        for (const child of this.stackArea.children) {
            if (child.getComponent(CardView)) {
                stackCardNodes.push(child);
            }
        }
        if (stackCardNodes.length === 0) return null;

        let topNode = stackCardNodes[0];
        let maxX = topNode.position.x;
        for (const n of stackCardNodes) {
            if (n.position.x > maxX) {
                maxX = n.position.x;
                topNode = n;
            }
        }
        return topNode;
    }
    /*
    按 x 坐标对 Stack 区的卡牌进行排序并更新渲染层级
    从 stackArea.children 中筛选出带 CardView 的节点；
    按 x 坐标升序排序；用 setSiblingIndex(index) 重新设置层级，以保证 x 越大的牌越“上层”。
     */
    
    private _sortStackByX(): void {
        if (!this.stackArea) return;

        const nodes = this.stackArea.children.filter(n => n.getComponent(CardView));
        nodes.sort((a, b) => a.position.x - b.position.x);
        nodes.forEach((node, index) => {
            node.setSiblingIndex(index);
        });
    }
}
