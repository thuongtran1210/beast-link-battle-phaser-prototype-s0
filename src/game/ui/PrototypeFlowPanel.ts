import Phaser from 'phaser';

export interface FlowPanelAction {
  label: string;
  onAction: () => void;
}
export interface FlowPanelEnergyRow {
  label: string;
  actionLabel: string;
  onAction: () => void;
}

/** P1-S0 navigation-only panel. It is deliberately not a gameplay rule surface. */
export class PrototypeFlowPanel {
  private readonly objects: Array<Phaser.GameObjects.Rectangle | Phaser.GameObjects.Text> = [];

  constructor(private readonly scene: Phaser.Scene, private readonly x: number, private readonly y: number) {}

  render(title: string, lines: string[], actionLabel: string | null, onAction?: () => void, actions?: FlowPanelAction[], energyRows?: FlowPanelEnergyRow[]): void {
    this.destroy();
    const actionCount = (actionLabel && onAction ? 1 : 0) + (actions ? actions.length : 0);
    const panel = this.scene.add.rectangle(this.x + 175, this.y + 190, 350, 380, 0xe7e2d7).setStrokeStyle(2, 0xb9ae9d);
    const heading = this.scene.add.text(this.x, this.y, title, { fontFamily: 'Arial, sans-serif', fontSize: '22px', color: '#18212b', fontStyle: 'bold' });
    const body = this.scene.add.text(this.x, this.y + 44, lines.join('\n'), { fontFamily: 'Arial, sans-serif', fontSize: '15px', color: '#44525f', lineSpacing: 6, wordWrap: { width: 310 } });
    const panelHeight = Math.max(380, body.height + 100 + actionCount * 44 + (energyRows?.length ?? 0) * 42);
    panel.setSize(350, panelHeight).setPosition(this.x + 175, this.y + panelHeight / 2);
    this.objects.push(panel, heading, body);

    let nextActionY = body.y + body.height + 14;
    if (actionLabel && onAction) {
      const action = this.scene.add.text(this.x, Math.max(this.y + 290, nextActionY), actionLabel, {
        fontFamily: 'Arial, sans-serif', fontSize: '15px', color: '#ffffff', fontStyle: 'bold', backgroundColor: '#b45309', padding: { x: 16, y: 10 }, wordWrap: { width: 300 },
      }).setInteractive({ useHandCursor: true });
      action.on('pointerup', onAction);
      this.objects.push(action);
      nextActionY = Math.max(this.y + 290, nextActionY) + 48;
    }
    if (actions && actions.length > 0) {
      actions.forEach((act) => {
        const btn = this.scene.add.text(this.x, nextActionY, act.label, {
          fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#ffffff', fontStyle: 'bold', backgroundColor: '#1e3a5f', padding: { x: 12, y: 7 }, wordWrap: { width: 310 },
        }).setInteractive({ useHandCursor: true });
        btn.on('pointerup', act.onAction);
        this.objects.push(btn);
        nextActionY += 38;
      });
    }
    if (energyRows && energyRows.length > 0) {
      energyRows.forEach((row) => {
        const label = this.scene.add.text(this.x, nextActionY + 7, row.label, { fontFamily: 'Arial, sans-serif', fontSize: '14px', color: '#18212b', fontStyle: 'bold' });
        const button = this.scene.add.text(this.x + 190, nextActionY, row.actionLabel, {
          fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#ffffff', fontStyle: 'bold', backgroundColor: '#1e3a5f', padding: { x: 10, y: 7 },
        }).setInteractive({ useHandCursor: true });
        button.on('pointerup', row.onAction);
        this.objects.push(label, button);
        nextActionY += 42;
      });
    }
  }

  destroy(): void { this.objects.splice(0).forEach((object) => object.destroy()); }
  setVisible(visible: boolean): void { this.objects.forEach((object) => object.setVisible(visible)); }
}
