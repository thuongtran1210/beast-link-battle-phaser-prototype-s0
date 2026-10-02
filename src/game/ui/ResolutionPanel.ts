import Phaser from 'phaser';
import type { BattleQueueEntry } from '../queue/BattleQueue';
import type { DeployedUnit } from '../queue/StarConverter';

/** Reflows all Resolution controls from a vertical cursor, avoiding overlap. */
export class ResolutionPanel {
  private readonly objects: Phaser.GameObjects.Text[] = [];

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly x: number,
    private readonly y: number,
    private readonly deploy: (id: string) => void,
    private readonly start: () => void,
  ) {}

  render(entries: BattleQueueEntry[], units: DeployedUnit[]): void {
    this.objects.forEach((object) => object.destroy());
    this.objects.length = 0;
    let cursor = this.y;
    this.text(this.x, cursor, 'RESOLUTION', 22, '#18212b', 'bold');
    cursor += 42;
    this.text(this.x, cursor, 'QUEUE', 14, '#66737f', 'bold');
    cursor += 25;
    if (!entries.length) {
      this.text(this.x, cursor, 'No Beasts remaining in Queue.', 15, '#66737f');
      cursor += 30;
    } else entries.forEach((entry) => {
      this.text(this.x, cursor + 5, label(entry.contentId), 17, '#18212b', 'bold');
      this.text(this.x + 44, cursor + 5, `×${entry.count}`, 16, '#44525f');
      const button = this.text(this.x + 105, cursor, 'DEPLOY', 13, '#1e3a5f', 'bold', '#dbeafe', { x: 10, y: 5 });
      button.setInteractive({ useHandCursor: true });
      button.on('pointerup', () => this.deploy(entry.contentId));
      cursor += 34;
    });
    cursor += 14;
    this.text(this.x, cursor, 'DEPLOYED', 14, '#66737f', 'bold');
    cursor += 25;
    if (!units.length) {
      this.text(this.x, cursor, 'None yet', 15, '#66737f');
      cursor += 30;
    } else units.forEach((unit) => {
      this.text(this.x, cursor, label(unit.contentId), 17, '#18212b', 'bold');
      this.text(this.x + 90, cursor, `${unit.star}★`, 17, '#b45309', 'bold');
      cursor += 27;
    });
    cursor += 18;
    const start = this.text(this.x, cursor, 'START BATTLE', 18, '#ffffff', 'bold', '#b45309', { x: 18, y: 10 });
    start.setInteractive({ useHandCursor: true });
    start.on('pointerup', this.start);
  }

  setVisible(visible: boolean): void { this.objects.forEach((object) => object.setVisible(visible)); }

  private text(x: number, y: number, value: string, size: number, color: string, style = '', backgroundColor?: string, padding?: { x: number; y: number }): Phaser.GameObjects.Text {
    const text = this.scene.add.text(x, y, value, { fontFamily: 'Arial, sans-serif', fontSize: `${size}px`, color, fontStyle: style, backgroundColor, padding });
    this.objects.push(text);
    return text;
  }
}

function label(id: string): string { return (id.split('-').at(-1) ?? id).slice(0, 1).toUpperCase(); }
