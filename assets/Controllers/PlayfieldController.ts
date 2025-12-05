import { _decorator, Component, Node } from 'cc';
import { CardView } from '../Views/CardView';
import { StackController } from './StackController';
import { UndoService } from '../Services/UndoService';

const { ccclass, property } = _decorator;

@ccclass('PlayfieldController')
export class PlayfieldController extends Component {

    @property(Node)
    playfieldArea: Node | null = null;

    @property(StackController)
    stackController: StackController | null = null;

    @property(UndoService)
    undoService: UndoService | null = null;


    // GameController 在 bindCardClicks 里把点击回调指到这里
    public onPlayfieldCardClicked(cardView: CardView): void {
        if (!this.playfieldArea || !this.stackController) return;

        const clickedNode = cardView.node;
        if (clickedNode.parent !== this.playfieldArea) {
            // 只处理桌面区域的牌
            return;
        }
        
        const topCardView = this.stackController.getTopCardView();
        if (!topCardView) {
            console.log('当前没有手牌区顶部牌，无法匹配');
            return;
        }

        const clickedFace = cardView.cardFace;
        const topFace = topCardView.cardFace;

        // 点数差 1 才允许匹配
        if (Math.abs(clickedFace - topFace) === 1) {
            // 在移动之前记录一条回退信息
            if (this.undoService) {
            this.undoService.recordMovePlayfieldToStack(cardView, this.playfieldArea);
            }
            // 符合规则，交给 StackController 接收这张牌
            this.stackController.acceptMatchedFromPlayfield(cardView);
        } else {
            console.log('不满足匹配条件：点数差不为 1');
        }
    }
}
