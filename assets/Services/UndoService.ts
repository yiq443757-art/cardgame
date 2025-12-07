import { _decorator, Component, Node, Vec3, tween } from 'cc';
import { CardView } from '../Views/CardView';

const { ccclass, property } = _decorator;

// 只有一种类型：从 Playfield 移动到 Stack
//可以在里面加入新的回退类型，比如stack到playfield
enum UndoRecordType {
    PlayfieldToStack = 0,
}

//回退的牌记录的类型
interface UndoPlayfieldToStackRecord {
    type: UndoRecordType.PlayfieldToStack;
    cardNode: Node;
    playfieldParent: Node;  // 原来的父节点（PlayfieldArea）
    playfieldPos: Vec3;     // 原来的本地坐标
    playfieldSiblingIndex: number;   // 原来的层级顺序
}

type UndoRecord = UndoPlayfieldToStackRecord;

@ccclass('UndoService')
export class UndoService extends Component {

    private _records: UndoRecord[] = [];//_records 就是一条条撤销记录组成的数组

    // ====== 1. 记录一次“桌面牌 → 手牌”动作 ======
    public recordMovePlayfieldToStack(cardView: CardView, playfieldArea: Node): void {
        const node = cardView.node;
        if (!node || !node.isValid) {
            return;
        }

        const record: UndoPlayfieldToStackRecord = {
            type: UndoRecordType.PlayfieldToStack,
            cardNode: node,
            playfieldParent: playfieldArea,
            playfieldPos: node.position.clone(),
            playfieldSiblingIndex: node.getSiblingIndex(),
        };

        this._records.push(record);
        //计入这个record里面，然后在回退的时候使用
        console.log('UndoService: 记录一条移动', record);
    }

    // ====== 2. UI按钮点击时调用这个函数 ======
    public onUndoButtonClick(): void {
        if (this._records.length === 0) {
            console.log('UndoService: 没有可回退记录');
            return;
        }

        const record = this._records.pop()!;
        switch (record.type) {
            case UndoRecordType.PlayfieldToStack:
                this._undoMovePlayfieldToStack(record);
                break;
        }
    }

    // ====== 3. 实际执行“反向移动回 Playfield” ======
    private _undoMovePlayfieldToStack(record: UndoPlayfieldToStackRecord): void {
        const node = record.cardNode;
        if (!node || !node.isValid) {
            return;
        }

        const fromParent = node.parent;
        if (!fromParent) {
            return;
        }

        // 当前在 Stack 里的世界坐标
        const worldPos = node.worldPosition.clone();

        // 重新挂到 PlayfieldArea，同时保持当前的视觉位置
        const targetParent = record.playfieldParent;
        targetParent.addChild(node);
        node.setPosition(worldPos);
        
        // 恢复当时在 Playfield 里的层级（谁在上谁在下固定）
        node.setSiblingIndex(record.playfieldSiblingIndex);
        
        // tween 平滑移动回原始 Playfield 位置
        const targetPos = record.playfieldPos.clone();
        tween(node)
            .to(0.25, { position: targetPos })
            .start();
    }
}
