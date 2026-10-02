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
  private readonly objects: Array<Phaser.GameObjects.Rectangle | Phaser.GameObjects.Text | Phaser.GameObjects.Container> = [];

  constructor(private readonly scene: Phaser.Scene, private readonly x: number, private readonly y: number) {}

  render(title: string, lines: string[], actionLabel: string | null, onAction?: () => void, actions?: FlowPanelAction[], energyRows?: FlowPanelEnergyRow[]): void {
    this.destroy();
    const actionCount = (actionLabel && onAction ? 1 : 0) + (actions ? actions.length : 0);
    const panelWidth = 340;
    const maxAvailableHeight = 560; // keeps within viewport (y: 145 + 560 = 705 < 760)

    const panel = this.scene.add.rectangle(this.x + panelWidth / 2, this.y + 190, panelWidth, 380, 0xe7e2d7).setStrokeStyle(2, 0xb9ae9d);
    const heading = this.scene.add.text(this.x, this.y, title, { fontFamily: 'Arial, sans-serif', fontSize: '20px', color: '#18212b', fontStyle: 'bold' });
    const body = this.scene.add.text(this.x, this.y + 36, lines.join('\n'), { fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#44525f', lineSpacing: 4, wordWrap: { width: 320 } });
    
    const energyRowCount = energyRows?.length ?? 0;
    const computedHeight = Math.min(
      maxAvailableHeight,
      Math.max(360, body.height + 70 + actionCount * 38 + energyRowCount * 34)
    );
    panel.setSize(panelWidth, computedHeight).setPosition(this.x + panelWidth / 2, this.y + computedHeight / 2);
    this.objects.push(panel, heading, body);

    let nextActionY = body.y + body.height + 12;

    if (actionLabel && onAction) {
      const action = this.scene.add.text(this.x, nextActionY, actionLabel, {
        fontFamily: 'Arial, sans-serif', fontSize: '14px', color: '#ffffff', fontStyle: 'bold', backgroundColor: '#b45309', padding: { x: 14, y: 8 }, wordWrap: { width: 300 },
      }).setInteractive({ useHandCursor: true });
      action.on('pointerup', onAction);
      this.objects.push(action);
      nextActionY += 42;
    }

    if (actions && actions.length > 0) {
      actions.forEach((act) => {
        const btn = this.scene.add.text(this.x, nextActionY, act.label, {
          fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#ffffff', fontStyle: 'bold', backgroundColor: '#1e3a5f', padding: { x: 10, y: 6 }, wordWrap: { width: 310 },
        }).setInteractive({ useHandCursor: true });
        btn.on('pointerup', act.onAction);
        this.objects.push(btn);
        nextActionY += 34;
      });
    }

    if (energyRows && energyRows.length > 0) {
      const rowHeight = 30;
      energyRows.forEach((row) => {
        // Background strip for clean, readable contrast
        const rowBg = this.scene.add.rectangle(this.x + 160, nextActionY + rowHeight / 2, 320, rowHeight, 0xf4f1e8).setStrokeStyle(1, 0xcfc8ba);
        
        // Single row label: "ENERGY-E · 2 charges"
        const label = this.scene.add.text(this.x + 10, nextActionY + 7, row.label, {
          fontFamily: 'Arial, sans-serif',
          fontSize: '12px',
          color: '#18212b',
          fontStyle: 'bold',
        });

        // Clearly visible & clickable CAST HEAL button
        const button = this.scene.add.text(this.x + 225, nextActionY + 4, row.actionLabel, {
          fontFamily: 'Arial, sans-serif',
          fontSize: '11px',
          color: '#ffffff',
          fontStyle: 'bold',
          backgroundColor: '#0284c7',
          padding: { x: 10, y: 5 },
        }).setInteractive({ useHandCursor: true });
        
        button.on('pointerup', row.onAction);
        this.objects.push(rowBg, label, button);
        nextActionY += rowHeight + 4;
      });
    }
  }

  destroy(): void { this.objects.splice(0).forEach((object) => object.destroy()); }
  setVisible(visible: boolean): void { this.objects.forEach((object) => object.setVisible(visible)); }
}
