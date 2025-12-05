import { _decorator, Component, Node, EventTouch } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CardView')
export class CardView extends Component {
    
     @property
    cardFace: number = 0;   // 0-12 : A,2,3,...,K

    @property
    cardSuit: number = 0;   // 0-3 : ♣♦♥♠

    // 点击回调，由 GameController 在 start 里注入
    private _clickHandler: ((card: CardView) => void) | null = null;

    onLoad() {
        console.log("CardView 挂载成功！", this.node.name);// 监听点击
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
    }

    public setClickHandler(handler: (card: CardView) => void): void {
        this._clickHandler = handler;
    }

    private onTouchStart(event: EventTouch): void {
        console.log("DEBUG: CardView 上的 onTouchStart 触发了！");
        if (this._clickHandler) {
            this._clickHandler(this);   // 把“我被点了”告诉外面
        }
    }
}
