// GameView.ts
import { _decorator, Component, Node, Vec3, tween } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('GameView')
export class GameView extends Component {

    @property(Node)
    topCardNode: Node | null = null;

    // 之前已有
    public playReplaceTopCard(movingCardNode: Node): void {
        if (!this.topCardNode) {
            console.error('GameView: topCardNode 未设置');
            return;
        }

        const targetWorldPos = this.topCardNode.worldPosition.clone();
        const parent = movingCardNode.parent;
        if (!parent) {
            return;
        }

        //const targetLocalPos = parent.worldToLocal(targetWorldPos);不要再声明，直接用worldpos

        tween(movingCardNode)
            .to(0.3, { worldPosition: targetWorldPos })
            .start();
    }

    // ⭐ 新增：Stack 区点击时，和当前 top 牌互换位置
    // GameView.ts
    public playSwapStackTop(
    clickedNode: Node,
    topNode: Node,
    onComplete?: () => void
    ): void {
    const posA = clickedNode.position.clone();
    const posB = topNode.position.clone();

    let done = 0;
    const check = () => {
        done++;
        if (done >= 2 && onComplete) {
            onComplete();
        }
    };

    tween(clickedNode)
        .to(0.25, { position: posB })
        .call(check)
        .start();

    tween(topNode)
        .to(0.25, { position: posA })
        .call(check)
        .start();
    }

}
