export default class StartScene extends Phaser.Scene {
  constructor() {
    super('start');
  }

  create() {
    this.cameras.main.setBackgroundColor('#344cb8');

    this.add.text(400, 180, 'Atrapa las figuras', {
      fontSize: '64px',
      color: '#000',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const button = this.add.rectangle(400, 320, 220, 70, 0x000000, 0.85).setStrokeStyle(2, 0xffffff);
    const buttonText = this.add.text(400, 320, 'jugar', {
      fontSize: '32px',
      color: '#ffffff',
    }).setOrigin(0.5);

    button.setInteractive({ useHandCursor: true });
    button.on('pointerdown', () => {
      this.scene.start('hello-world');
    });

    button.on('pointerover', () => {
      button.setFillStyle(0x333333, 0.95);
    });

    button.on('pointerout', () => {
      button.setFillStyle(0x000000, 0.85);
    });

    const controlsButton = this.add.rectangle(400, 410, 220, 70, 0x000000, 0.85).setStrokeStyle(2, 0xffffff);
    const controlsButtonText = this.add.text(400, 410, 'controles', {
      fontSize: '32px',
      color: '#ffffff',
    }).setOrigin(0.5);

    controlsButton.setInteractive({ useHandCursor: true });
    controlsButton.on('pointerdown', () => {
      this.scene.start('controls');
    });

    controlsButton.on('pointerover', () => {
      controlsButton.setFillStyle(0x333333, 0.95);
    });

    controlsButton.on('pointerout', () => {
      controlsButton.setFillStyle(0x000000, 0.85);
    });
  }
}
