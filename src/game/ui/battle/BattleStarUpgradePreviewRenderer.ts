import Phaser from 'phaser';
import { HudTokens } from '../layout/HudTokens';
import { signatureForBeast } from '../../battle/BeastRoles';
import { signatureTierTagline } from '../../run/StarProfile';
import { beastDisplayName } from '../icons/UnitIconRegistry';
import { drawCard } from '../layout/HudTokens';
import type { BattleFormation, FormationUnit } from '../../battle/BattleFormation';
import type { RunRoster } from '../../run/RunRoster';
import type { RunLinkShardPool } from '../../run/RunLinkShardPool';

export class BattleStarUpgradePreviewRenderer {
  constructor(
    private readonly scene: Phaser.Scene,
    private readonly formation: BattleFormation,
    private readonly managedObjects: Phaser.GameObjects.GameObject[],
    private readonly runRoster?: RunRoster,
    private readonly shardPool?: RunLinkShardPool,
  ) {}

  render(selectedId: string | null): void {
    const deployed = new Set(
      this.formation.units.filter((unit) => unit.slotId !== null).map((unit) => unit.unitId),
    );
    const reserves = this.formation.units.filter((unit) => unit.slotId === null);
    const selected = selectedId ? this.formation.getUnit(selectedId) : undefined;
    const unit =
      selected ??
      reserves.find(
        (item) =>
          this.runRoster?.consolidationPreview(item.unitId, deployed, this.shardPool?.count ?? 0)
            ?.canConsolidate,
      ) ??
      reserves[0];

    if (!unit) return;
    const signature = signatureForBeast(unit.beastId);

    const card = drawCard(this.scene, 36, 166, 220, 276, HudTokens.colors.bgSurface, 0.96);
    this.managedObjects.push(card);

    this.addText(50, 180, beastDisplayName(unit.beastId), 17, '#ffffff', 'bold');
    this.addText(50, 205, 'STAR EVOLUTION', 12, '#fbbf24', 'bold');

    ([1, 2, 3] as const).forEach((star, index) => {
      const y = 238 + index * 58;
      this.addText(
        50,
        y,
        `${'★'.repeat(star)}${star === unit.star ? '  CURRENT' : ''}`,
        14,
        star === 3 ? '#fbbf24' : '#93c5fd',
        'bold',
      );
      this.addText(
        50,
        y + 21,
        signatureTierTagline(signature, star),
        13,
        star === unit.star ? '#ffffff' : '#94a3b8',
      ).setWordWrapWidth(190);
    });
  }

  private addText(
    x: number,
    y: number,
    value: string,
    size: number,
    color: string,
    style = '',
  ): Phaser.GameObjects.Text {
    const text = this.scene.add.text(x, y, value, {
      fontFamily: HudTokens.fonts.family,
      fontSize: `${size}px`,
      color,
      fontStyle: style,
      lineSpacing: 3,
    });
    this.managedObjects.push(text);
    return text;
  }
}
