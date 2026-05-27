export default class EndScene extends Phaser.Scene {
  constructor() {
    super('end');
  }

  init(data) {
    this.finalScore = data.score || 0;
  }

  create() {
    this.cameras.main.setBackgroundColor('#87CEEB');

    this.add.text(400, 140, 'fin del juego', {
      fontSize: '56px',
      color: '#000',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(400, 240, `Puntuación: ${this.finalScore}`, {
      fontSize: '32px',
      color: '#000',
    }).setOrigin(0.5);

    const button = this.add.rectangle(400, 340, 260, 70, 0x000000, 0.85).setStrokeStyle(2, 0xffffff);
    const buttonText = this.add.text(400, 340, 'volver al inicio', {
      fontSize: '28px',
      color: '#ffffff',
    }).setOrigin(0.5);

    button.setInteractive({ useHandCursor: true });
    button.on('pointerdown', () => {
      this.scene.start('start');
    });

    button.on('pointerover', () => {
      button.setFillStyle(0x333333, 0.95);
    });

    button.on('pointerout', () => {
      button.setFillStyle(0x000000, 0.85);
    });
  }
}
