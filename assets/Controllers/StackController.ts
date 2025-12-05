import { _decorator, Component, Node, Vec3, tween } from 'cc';
import { CardView } from '../Views/CardView';
import { GameView } from '../Views/GameView';

const { ccclass, property } = _decorator;

@ccclass('StackController')
export class StackController extends Component {

    @property(Node)
    stackArea: Node | null = null;

    @property(GameView)
    gameView: GameView | null = null;

    private _isSwappingStack: boolean = false;

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
    public getTopCardView(): CardView | null {
        const topNode = this._findTopCardNode();
        if (!topNode) return null;
        return topNode.getComponent(CardView);
    }

    // 给 PlayfieldController 用：接收一张桌面匹配牌，让它飞到 stack 并变成新的 top
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

        //const localPos = stackParent.worldToLocal(oldWorldPos);
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

    private _sortStackByX(): void {
        if (!this.stackArea) return;

        const nodes = this.stackArea.children.filter(n => n.getComponent(CardView));
        nodes.sort((a, b) => a.position.x - b.position.x);
        nodes.forEach((node, index) => {
            node.setSiblingIndex(index);
        });
    }
}
