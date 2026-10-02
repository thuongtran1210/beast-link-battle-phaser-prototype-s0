import Phaser from 'phaser';
import type { ComboState } from '../combo/ComboSystem';
import type { BattleQueueEntry } from '../queue/BattleQueue';

/** S2 display-only view for Combo and Battle Queue state. */
export class HUDView {
  private readonly text: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.text = scene.add.text(x, y, '', { fontFamily: 'Arial, sans-serif', fontSize: '16px', color: '#18212b', lineSpacing: 9 });
  }

  render(combo: Readonly<ComboState>, entries: ReadonlyArray<BattleQueueEntry>): void {
    const queue = entries.length === 0 ? 'No Beasts queued yet' : entries.map((entry) => `${entry.contentId.split('-').at(-1)?.toUpperCase() ?? entry.contentId}        ×${entry.count}`).join('\n');
    this.text.setText([
      'PREPARATION', '', 'COMBO', combo.active ? 'ACTIVE' : 'INACTIVE',
      `${combo.remainingSeconds.toFixed(1)}s`, `Matches: ${combo.count}`,
      '', 'BATTLE QUEUE', queue,
    ].join('\n'));
  }

  setVisible(visible: boolean): void { this.text.setVisible(visible); }
}
