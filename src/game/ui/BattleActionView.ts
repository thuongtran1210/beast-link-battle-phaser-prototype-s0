import Phaser from 'phaser';
import type { AutonomousBattleSnapshot, CombatUnit } from '../battle/AutonomousBattleModel';
import type { BattleHealPresentation, BattleTickPresentation } from '../battle/BattlePresentation';

interface UnitVisual {
  container: Phaser.GameObjects.Container;
  body: Phaser.GameObjects.Rectangle;
  hpBg: Phaser.GameObjects.Rectangle;
  hpFill: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
}

export class BattleActionView {
  private readonly objects: Phaser.GameObjects.GameObject[] = [];
  private readonly units = new Map<string, UnitVisual>();
  private enemyContainer?: Phaser.GameObjects.Container;
  private enemyBody?: Phaser.GameObjects.Rectangle;
  private enemyHpBg?: Phaser.GameObjects.Rectangle;
  private enemyHpFill?: Phaser.GameObjects.Rectangle;
  private enemyLabel?: Phaser.GameObjects.Text;

  constructor(private readonly scene: Phaser.Scene, private readonly x: number, private readonly y: number) {}

  render(snapshot: AutonomousBattleSnapshot): void {
    if (!this.enemyContainer) {
      this.createBattleGrid();
      this.createEnemy(snapshot);
    }
    this.syncEnemy(snapshot);
    snapshot.units.forEach((unit) => this.syncUnit(unit));
  }

  playTick(event: BattleTickPresentation): void {
    event.attackers.forEach((attacker, index) => {
      const visual = this.units.get(attacker.unitId);
      if (!visual || visual.container.alpha <= 0.1) return;
      const delay = index * 55;
      if (attacker.role === 'Tanker' || attacker.role === 'Assassin') {
        this.scene.tweens.add({
          targets: visual.container,
          x: visual.container.x + 16,
          duration: 90,
          yoyo: true,
          ease: 'Quad.Out',
          delay,
        });
      } else {
        this.scene.time.delayedCall(delay, () => this.projectileFrom(visual.container));
      }
    });

    if (event.enemyDamage > 0 && this.enemyBody) {
      this.scene.time.delayedCall(140, () => {
        this.flash(this.enemyBody!, 0xef4444);
        this.floatText(this.enemyContainer!.x, this.enemyContainer!.y - 48, `-${formatNumber(event.enemyDamage)}`, '#b91c1c');
      });
    }

    if (event.enemyTargetId) {
      this.scene.time.delayedCall(260, () => {
        const visual = this.units.get(event.enemyTargetId!);
        if (!visual) return;
        this.flash(visual.body, 0xef4444);
        if (event.targetDamage > 0) {
          this.floatText(visual.container.x, visual.container.y - 38, `-${formatNumber(event.targetDamage)}`, '#b91c1c');
        }
      });
    }

    event.defeatedUnitIds.forEach((unitId) => {
      this.scene.time.delayedCall(360, () => {
        const visual = this.units.get(unitId);
        if (!visual) return;
        this.scene.tweens.add({ targets: visual.container, alpha: 0.28, angle: 7, duration: 220 });
      });
    });

    if (event.enemyDefeated && this.enemyContainer) {
      this.scene.time.delayedCall(360, () => {
        this.scene.tweens.add({ targets: this.enemyContainer!, alpha: 0.3, angle: -5, duration: 220 });
      });
    }
  }

  playHeal(event: BattleHealPresentation): void {
    if (!event.unitId || event.amount <= 0) return;
    const visual = this.units.get(event.unitId);
    if (!visual) return;
    this.floatText(visual.container.x, visual.container.y - 42, `+${formatNumber(event.amount)} HP`, '#15803d');
    this.scene.tweens.add({
      targets: visual.body,
      scaleX: 1.14,
      scaleY: 1.14,
      duration: 120,
      yoyo: true,
      ease: 'Sine.Out',
    });
  }

  destroy(): void {
    this.scene.tweens.killTweensOf([...this.objects]);
    this.objects.splice(0).forEach((object) => object.destroy());
    this.units.clear();
    this.enemyContainer = undefined;
    this.enemyBody = undefined;
    this.enemyHpBg = undefined;
    this.enemyHpFill = undefined;
    this.enemyLabel = undefined;
  }

  private createBattleGrid(): void {
    const battlefieldX = this.x + 36;
    const topY = this.y + 132;
    const slotW = 70;
    const slotH = 62;
    const colGap = 82;
    const rowGap = 112;

    const title = this.scene.add.text(battlefieldX, this.y + 108, 'BATTLE FIELD', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#475569',
      fontStyle: 'bold',
    });
    this.objects.push(title);

    // Player formation rows.
    ['FRONT', 'MID', 'BACK'].forEach((rowLabel, rowIndex) => {
      const rowY = topY + rowIndex * rowGap;
      const label = this.scene.add.text(battlefieldX - 4, rowY - 48, rowLabel, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '11px',
        color: '#64748b',
        fontStyle: 'bold',
      });
      this.objects.push(label);
      for (let col = 0; col < 6; col += 1) {
        const slot = this.scene.add.rectangle(
          battlefieldX + 34 + col * colGap,
          rowY,
          slotW,
          slotH,
          0xf8fafc,
          0.35,
        ).setStrokeStyle(1, 0xcbd5e1);
        this.objects.push(slot);
      }
    });

    // Enemy side is intentionally one fixture in current P1 rules.
    const enemyLabel = this.scene.add.text(this.x + 466, topY - 48, 'ENEMY FRONT', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '11px',
      color: '#991b1b',
      fontStyle: 'bold',
    });
    const enemySlot = this.scene.add.rectangle(
      this.x + 500,
      topY,
      126,
      90,
      0xfef2f2,
      0.55,
    ).setStrokeStyle(2, 0xfca5a5);
    this.objects.push(enemyLabel, enemySlot);

    const divider = this.scene.add.rectangle(this.x + 458, this.y + 292, 2, 340, 0x94a3b8, 0.8);
    this.objects.push(divider);
  }

  private createEnemy(snapshot: AutonomousBattleSnapshot): void {
    const body = this.scene.add.rectangle(0, 0, 120, 82, 0x7f1d1d).setStrokeStyle(3, 0x450a0a);
    const label = this.scene.add.text(0, -2, 'ENEMY', {
      fontFamily: 'Arial, sans-serif', fontSize: '20px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);
    const hpBg = this.scene.add.rectangle(0, 54, 130, 12, 0x1f2937).setOrigin(0.5);
    const hpFill = this.scene.add.rectangle(-65, 54, 130, 12, 0xdc2626).setOrigin(0, 0.5);
    // Single current enemy fixture occupies an opposing frontline slot.
    const container = this.scene.add.container(this.x + 500, this.y + 180, [body, label, hpBg, hpFill]);
    this.objects.push(container);
    this.enemyContainer = container;
    this.enemyBody = body;
    this.enemyHpBg = hpBg;
    this.enemyHpFill = hpFill;
    this.enemyLabel = label;
    this.syncEnemy(snapshot);
  }

  private syncEnemy(snapshot: AutonomousBattleSnapshot): void {
    if (!this.enemyHpFill || !this.enemyLabel) return;
    const ratio = snapshot.enemyMaxHp > 0 ? snapshot.enemyHp / snapshot.enemyMaxHp : 0;
    this.enemyHpFill.width = 130 * Math.max(0, Math.min(1, ratio));
    this.enemyLabel.setText(`ENEMY\n${formatNumber(snapshot.enemyHp)} / ${snapshot.enemyMaxHp}`);
  }

  private syncUnit(unit: CombatUnit): void {
    let visual = this.units.get(unit.unitId);
    if (!visual) {
      visual = this.createUnit(unit);
      this.units.set(unit.unitId, visual);
    }
    const ratio = unit.maxHp > 0 ? unit.currentHp / unit.maxHp : 0;
    visual.hpFill.width = 74 * Math.max(0, Math.min(1, ratio));
    visual.label.setText(`${shortBeast(unit.beastId)} · ${unit.role}\n${unit.star}★  HP ${formatNumber(unit.currentHp)}`);
    if (unit.currentHp > 0) {
      visual.container.setAlpha(1).setAngle(0);
    }
  }

  private createUnit(unit: CombatUnit): UnitVisual {
    const rowIndex = unit.row === 'Front' ? 0 : unit.row === 'Mid' ? 1 : 2;
    const px = this.x + 70 + (unit.column - 1) * 82;
    const py = this.y + 180 + rowIndex * 112;
    const body = this.scene.add.rectangle(0, 0, 66, 58, roleFill(unit.role)).setStrokeStyle(2, 0x475569);
    const label = this.scene.add.text(0, 0, '', {
      fontFamily: 'Arial, sans-serif', fontSize: '10px', color: '#0f172a', align: 'center', fontStyle: 'bold',
    }).setOrigin(0.5);
    const hpBg = this.scene.add.rectangle(0, 39, 74, 8, 0x334155).setOrigin(0.5);
    const hpFill = this.scene.add.rectangle(-37, 39, 74, 8, 0x16a34a).setOrigin(0, 0.5);
    const container = this.scene.add.container(px, py, [body, label, hpBg, hpFill]);
    this.objects.push(container);
    return { container, body, hpBg, hpFill, label };
  }

  private projectileFrom(source: Phaser.GameObjects.Container): void {
    if (!this.enemyContainer) return;
    const projectile = this.scene.add.circle(source.x + 20, source.y, 6, 0x38bdf8);
    this.objects.push(projectile);
    this.scene.tweens.add({
      targets: projectile,
      x: this.enemyContainer.x - 55,
      y: this.enemyContainer.y,
      duration: 180,
      ease: 'Quad.In',
      onComplete: () => {
        const index = this.objects.indexOf(projectile);
        if (index >= 0) this.objects.splice(index, 1);
        projectile.destroy();
      },
    });
  }

  private flash(target: Phaser.GameObjects.Rectangle, color: number): void {
    const original = target.fillColor;
    target.setFillStyle(color);
    this.scene.time.delayedCall(100, () => {
      if (target.active) target.setFillStyle(original);
    });
  }

  private floatText(x: number, y: number, value: string, color: string): void {
    const text = this.scene.add.text(x, y, value, {
      fontFamily: 'Arial, sans-serif', fontSize: '16px', color, fontStyle: 'bold',
    }).setOrigin(0.5);
    this.objects.push(text);
    this.scene.tweens.add({
      targets: text,
      y: y - 26,
      alpha: 0,
      duration: 520,
      onComplete: () => {
        const index = this.objects.indexOf(text);
        if (index >= 0) this.objects.splice(index, 1);
        text.destroy();
      },
    });
  }
}

function roleFill(role: CombatUnit['role']): number {
  if (role === 'Tanker') return 0xfacc15;
  if (role === 'Assassin') return 0xf97316;
  if (role === 'Ranger') return 0x22c55e;
  return 0xa78bfa;
}

function shortBeast(beastId: string): string {
  return (beastId.split('-').at(-1) ?? beastId).toUpperCase();
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
