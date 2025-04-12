export function wait(scene: Phaser.Scene, ms: number): Promise<void> {
    return new Promise(resolve => {
        scene.time.delayedCall(ms, resolve);
    });
}
