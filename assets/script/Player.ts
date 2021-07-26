
import { _decorator, Component, Node, tween, Vec3, Tween, AudioSource, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {

    @property({ type: AudioSource })
    jumpSource: AudioSource = null!;

    private jumpHeight: number = 200;

    private jumpAction: Tween<any> = new Tween();
    private translateAction: Tween<any> = new Tween();
    private v: number = 0;
    private accel: number = 10;
    private centerDelta: number = 0;


    onLoad() {
        var jumpUp = tween().by(0.8, { y: this.jumpHeight }, { easing: 'sineOut' });
        var jumpDown = tween().by(0.8, { y: -this.jumpHeight }, { easing: 'sineIn' });

        var squash = tween().to(0.2, { x: 1.1, y: 0.8 }, { easing: 'sineOut' });
        var stretch = tween().to(0.3, { x: 1, y: 1.2 }, { easing: 'sineOut' });
        var normal1 = tween().to(0.6, { x: 1, y: 1 }, { easing: 'sineOut' });
        var normal2 = tween().to(0.5, { x: 1, y: 1 }, { easing: 'sineOut' });

        var jump = tween().sequence(jumpUp, jumpDown).call(() => { this.jumpSource.play(); });
        var translate = tween().sequence(stretch, normal2, normal1, squash);

        this.jumpAction = tween(this.node.position).repeatForever(jump);
        this.translateAction = tween(this.node.scale).repeatForever(translate);

        this.centerDelta = Math.floor(this.node.getComponent(UITransform)!.height / 2);

    }

    getCenterPos() {
        return new Vec3(this.node.position.x, this.node.position.y + this.centerDelta);
    }

    startJump() {
        this.node.position = new Vec3(0, -100, 0);
        this.jumpAction.start();
        this.translateAction.start();
    }

    stopJump() {
        this.jumpAction.stop();
        this.translateAction.stop();
        this.v = 0;
    }

    onMove(direct: string) {
        switch (direct) {
            case "left":
                this.v -= this.accel;
                break;
            case "right":
                this.v += this.accel;
                break;
        }
    }

    update(deltaTime: number) {

        if ((this.node.position.x >= 450 && this.v > 0) || (this.node.position.x <= -450 && this.v < 0)) {
            this.v = 0;
        }

        Vec3.add(this.node.position, this.node.position, new Vec3(this.v * deltaTime, 0, 0));

        this.node.position = this.node.position;
        this.node.scale = this.node.scale;
    }
}