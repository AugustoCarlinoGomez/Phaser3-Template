export default class ControlsScene extends Phaser.Scene {
  constructor() {
    super('controls');
  }

  preload() {
    this.load.image('mov', 'Resources/mov.png');
    this.load.image('arr', 'Resources/arr.png');
  }

  create() {
    this.cameras.main.setBackgroundColor('#344cb8');

    this.add.text(400, 100, 'Controles', {
      fontSize: '52px',
      color: '#000',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.rectangle(160, 300, 240, 240, 0xffffff).setStrokeStyle(2, 0x000000);
    this.add.rectangle(640, 300, 240, 240, 0xffffff).setStrokeStyle(2, 0x000000);

    const moveImage = this.add.image(160, 300, 'mov');
    moveImage.setDisplaySize(240, 240);

    const arrowImage = this.add.image(640, 300, 'arr');
    arrowImage.setDisplaySize(240, 240);

    this.add.text(160, 160, 'Movimiento', {
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5).setDepth(1);

    this.add.text(640, 160, 'Salto', {
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5).setDepth(1);

    const backButton = this.add.rectangle(400, 520, 220, 70, 0x000000, 0.85).setStrokeStyle(2, 0xffffff);
    const backButtonText = this.add.text(400, 520, 'volver', {
      fontSize: '32px',
      color: '#ffffff',
    }).setOrigin(0.5);

    backButton.setInteractive({ useHandCursor: true });
    backButton.on('pointerdown', () => {
      this.scene.start('start');
    });

    backButton.on('pointerover', () => {
      backButton.setFillStyle(0x333333, 0.95);
    });

    backButton.on('pointerout', () => {
      backButton.setFillStyle(0x000000, 0.85);
    });
  }
}
