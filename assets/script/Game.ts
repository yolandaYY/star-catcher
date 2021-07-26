
import { _decorator, Component, Node, Prefab, instantiate, Vec3, NodePool, Label, systemEvent, SystemEvent, macro, EventKeyboard, EventTouch, view, sys, AudioSource, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Game')
export class Game extends Component {
    @property({ type: Prefab })
    starPrefab: Prefab = null!;

    @property({ type: Node })
    player: Node = null!;

    @property({ type: Node })
    ground: Node = null!;

    @property({ type: Label })
    scoreLabel: Label = null!;

    @property({ type: Label })
    detailsLabel: Label = null!;

    @property({ type: AudioSource })
    gainScoreSource: AudioSource = null!;

    private playerComponent: any;
    private jumpHeight: number = 0;
    private groundY: number = 0;
    private starPool: NodePool = null!;
    private star: Node = null!;
    private score: number = 0;
    private isPlaying: boolean = false;
    private startIntro: string = "press S to play";

    private limitTime: number = 4;
    private timer: number = 0;

    onLoad() {
        this.playerComponent = this.player.getComponent('Player');
        this.jumpHeight = this.playerComponent.jumpHeight;
        this.groundY = Math.floor(this.ground.getComponent(UITransform)!.height / 2) + this.ground.position.y;

        this.starPool = new NodePool("Star");

        if (sys.isMobile) {
            this.startIntro = "touch move to play";
        }

        this.detailsLabel.string = this.startIntro;

        systemEvent.on(SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouch, this);

    }

    onKeyDown(event: EventKeyboard) {
        if (!this.isPlaying && event.keyCode == macro.KEY.s) {
            this.toPlay();
        } else if (this.isPlaying) {
            switch (event.keyCode) {
                case macro.KEY.a:
                    this.playerComponent.onMove("left");
                    break;
                case macro.KEY.d:
                    this.playerComponent.onMove("right");
                    break;
                default:
                    break;
            }
        }
    }

    onTouch(event: EventTouch) {
        if (!this.isPlaying) {
            this.toPlay();
            return;
        }

        if (event.getDeltaX() > 0) {
            this.playerComponent.onMove("right")
        } else {
            this.playerComponent.onMove("left")
        }
    }

    updateScoreDisplay() {
        this.scoreLabel.string = "Score: " + this.score;
    }

    start() {

    }

    getRandomPosition() {
        var randomY = Math.random() * this.jumpHeight + this.groundY + 33;
        var randomX = Math.floor((Math.random() - 0.5) * this.node.getComponent(UITransform)!.width);
        return new Vec3(randomX, randomY, 0);
    }

    spawnNewStar() {
        var newStar;

        if (this.starPool.size() > 0) {
            newStar = this.starPool.get(this);
        } else {
            newStar = instantiate(this.starPrefab) as any;
        }

        this.node.addChild(newStar);
        newStar.setPosition(this.getRandomPosition());
        this.star = newStar;
    }

    despawnStar() {
        this.starPool.put(this.star);
    }

    update(deltaTime: number) {
        if (!this.isPlaying) return;

        if (this.timer >= this.limitTime) {
            this.toStop();
            return
        }

        var pos1 = this.playerComponent.getCenterPos();
        var pos2 = this.star.position;

        this.timer += deltaTime;

        if (Vec3.distance(pos1, pos2) < 60) {
            this.gainScore();
        }

        this.star.getComponent("Star")?.fadeOut(this.timer / this.limitTime);
    }

    toPlay() {
        if (this.detailsLabel) this.detailsLabel.string = "";

        this.spawnNewStar();
        this.score = 0;
        this.updateScoreDisplay();
        this.timer = 0;

        this.playerComponent.startJump();
        this.isPlaying = true;
    }

    toStop() {
        if (this.detailsLabel) this.detailsLabel.string = this.startIntro;
        this.despawnStar();

        this.playerComponent.stopJump();
        this.isPlaying = false;

    }

    gainScore() {
        this.despawnStar();
        this.spawnNewStar();
        this.score++;
        this.updateScoreDisplay();
        this.timer = 0;
        this.gainScoreSource.play();
    }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.0/manual/en/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.0/manual/en/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.0/manual/en/scripting/life-cycle-callbacks.html
 */
