import Phaser from 'phaser';
import type { SignatureFxPresentation } from '../../battle/BattlePresentation';
import { FeedbackEffects } from '../feedback/FeedbackEffects';
import { signatureTierLabel } from '../../run/StarProfile';
import { isCompactLandscape } from '../layout/MobilePresentation';
import { BattleCharacterView } from '../art/BattleCharacterView';
import { EnemyCharacterView } from '../art/EnemyCharacterView';

export interface UnitVisualHandle {
  container: Phaser.GameObjects.Container;
  characterView: BattleCharacterView;
  body: Phaser.GameObjects.Rectangle;
}

export interface EnemyVisualHandle {
  container: Phaser.GameObjects.Container;
  characterView: EnemyCharacterView;
  body: Phaser.GameObjects.Rectangle;
}

export class BattleSignatureVfxRenderer {
  private activeSignatureLabel?: Phaser.GameObjects.Text;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly managedObjects: Phaser.GameObjects.GameObject[],
    private readonly units: Map<string, UnitVisualHandle>,
    private readonly enemies: Map<string, EnemyVisualHandle>,
  ) {}

  playSignatureFx(event: SignatureFxPresentation): void {
    const source = this.units.get(event.unitId);
    if (!source || !source.container.active) return;
    // Ranged identity is carried by traveling projectiles and persistent control props.
    // Avoid stacking beams, auras and text over the same shot.
    if (['FocusShot', 'TwinVolley', 'ArcaneBloom', 'TickingBomb'].includes(event.signatureId)) return;

    if (event.star === 3 && (event.signatureId === 'ArcaneBloom' || event.signatureId === 'FocusShot')) return;
    if (event.signatureId === 'WoollyRescue' || event.signatureId === 'ToyWorkshop' || event.signatureId === 'BubbleTrap') return;
    if (event.signatureId === 'TickingBomb') {
      event.targetIds.forEach((id) => {
        const enemy = this.enemies.get(id);
        if (enemy) FeedbackEffects.pulseRing(this.scene, enemy.container.x, enemy.container.y - 20, 0xc8b58a, 55);
      });
      return;
    }
    source.characterView.playSignature(event.signatureId === 'ArcaneBloom' ? 1100 : 820);
    const sourcePoint = source.characterView.getEffectPoint(source.container.x, source.container.y);

    const targets = event.targetIds
      .map((id) => this.enemies.get(id))
      .filter((visual): visual is EnemyVisualHandle => Boolean(visual));

    const addLabel = (label: string, color: string, holdMs = 520) => {
      if (isCompactLandscape() && this.activeSignatureLabel) {
        this.scene.tweens.killTweensOf(this.activeSignatureLabel);
        const index = this.managedObjects.indexOf(this.activeSignatureLabel);
        if (index >= 0) this.managedObjects.splice(index, 1);
        this.activeSignatureLabel.destroy();
        this.activeSignatureLabel = undefined;
      }
      const text = this.scene.add.text(
        isCompactLandscape() ? this.scene.scale.width / 2 : sourcePoint.x,
        isCompactLandscape() ? 117 : sourcePoint.y - 46,
        label,
        {
          fontFamily: 'Arial, sans-serif',
          fontSize: event.star === 3 ? '20px' : '14px',
          color,
          fontStyle: 'bold',
          backgroundColor: '#24352b',
          padding: { x: 8, y: 4 },
          stroke: '#11152b',
          strokeThickness: 2,
        },
      ).setOrigin(0.5).setDepth(175);

      this.managedObjects.push(text);
      if (isCompactLandscape()) this.activeSignatureLabel = text;
      this.scene.tweens.add({
        targets: text,
        y: text.y - 10,
        alpha: 0,
        delay: holdMs,
        duration: 430,
        ease: 'Cubic.Out',
        onComplete: () => {
          const index = this.managedObjects.indexOf(text);
          if (index >= 0) this.managedObjects.splice(index, 1);
          text.destroy();
        },
      });
    };

    const drawTrails = (color: number, width = 4) => {
      if (!targets.length) return;
      const graphics = this.scene.add.graphics().setDepth(165);
      graphics.lineStyle(isCompactLandscape() ? 2 : width, color, isCompactLandscape() ? .45 : .9);
      targets.forEach((target) => {
        graphics.beginPath();
        graphics.moveTo(sourcePoint.x + 12, sourcePoint.y);
        graphics.lineTo(target.container.x - 12, target.container.y);
        graphics.strokePath();
      });
      this.managedObjects.push(graphics);
      this.scene.tweens.add({
        targets: graphics,
        alpha: 0,
        duration: 520,
        ease: 'Quad.Out',
        onComplete: () => {
          const index = this.managedObjects.indexOf(graphics);
          if (index >= 0) this.managedObjects.splice(index, 1);
          graphics.destroy();
        },
      });
    };

    switch (event.signatureId) {
      case 'GuardianBrace':
        event.targetIds.forEach((id) => {
          const ally = this.units.get(id);
          if (!ally) return;
          const link = this.scene.add.graphics().setDepth(166);
          link.lineStyle(5, 0x72bff5, 0.85);
          link.lineBetween(sourcePoint.x, sourcePoint.y, ally.container.x, ally.container.y - 24);
          FeedbackEffects.pulseRing(this.scene, ally.container.x, ally.container.y - 24, 0x72bff5, 60);
          this.managedObjects.push(link);
          this.scene.tweens.add({
            targets: link,
            alpha: 0,
            duration: 1100,
            onComplete: () => {
              const index = this.managedObjects.indexOf(link);
              if (index >= 0) this.managedObjects.splice(index, 1);
              link.destroy();
            },
          });
        });
        if (event.targetIds.length) addLabel('★★★ SHARED SHIELD', '#bce4ff', 1100);
        FeedbackEffects.pulseRing(this.scene, source.container.x, source.container.y, 0x72bff5, 46);
        FeedbackEffects.pulseRing(this.scene, source.container.x, source.container.y, 0xf6d675, 35);
        if (!event.targetIds.length) addLabel(signatureTierLabel(event.signatureId, event.star), '#bce4ff', event.star === 3 ? 1100 : 520);
        break;
      case 'AmbushStrike':
        drawTrails(0xfb7185, 6);
        targets.forEach((target) => FeedbackEffects.pulseRing(this.scene, target.container.x, target.container.y, 0xfb7185, 28));
        addLabel(event.star === 3 && targets.length > 1 ? '★★★ AMBUSH · CHAIN STRIKE' : signatureTierLabel(event.signatureId, event.star), '#ff91a1', event.star === 3 ? 1100 : 520);
        break;
      case 'FocusShot':
        drawTrails(0x8be2bd, 5);
        targets.forEach((target) => FeedbackEffects.pulseRing(this.scene, target.container.x, target.container.y, 0x8be2bd, 25));
        addLabel(signatureTierLabel(event.signatureId, event.star), '#b9f1d8');
        break;
      case 'ArcaneBloom': {
        const aura = this.scene.add.circle(
          source.container.x,
          source.container.y - 4,
          28,
          0x7e22ce,
          0.28,
        ).setStrokeStyle(3, 0xe9d5ff, 0.95).setDepth(160);
        const core = this.scene.add.circle(
          source.container.x,
          source.container.y - 4,
          8,
          0xf0abfc,
          0.9,
        ).setDepth(166);
        this.managedObjects.push(aura, core);

        this.scene.tweens.add({
          targets: aura,
          scaleX: 1.65,
          scaleY: 1.65,
          alpha: 0.06,
          duration: 820,
          ease: 'Sine.Out',
          onComplete: () => {
            const index = this.managedObjects.indexOf(aura);
            if (index >= 0) this.managedObjects.splice(index, 1);
            aura.destroy();
          },
        });
        this.scene.tweens.add({
          targets: core,
          scaleX: 1.8,
          scaleY: 1.8,
          alpha: 0,
          delay: 220,
          duration: 620,
          ease: 'Cubic.Out',
          onComplete: () => {
            const index = this.managedObjects.indexOf(core);
            if (index >= 0) this.managedObjects.splice(index, 1);
            core.destroy();
          },
        });

        const bloomLinks = this.scene.add.graphics().setDepth(164);
        bloomLinks.lineStyle(5, 0xc084fc, 0.78);
        targets.forEach((target) => {
          bloomLinks.beginPath();
          bloomLinks.moveTo(sourcePoint.x + 12, sourcePoint.y - 4);
          bloomLinks.lineTo(target.container.x - 10, target.container.y);
          bloomLinks.strokePath();
        });
        this.managedObjects.push(bloomLinks);
        this.scene.tweens.add({
          targets: bloomLinks,
          alpha: 0,
          delay: 300,
          duration: 620,
          ease: 'Quad.Out',
          onComplete: () => {
            const index = this.managedObjects.indexOf(bloomLinks);
            if (index >= 0) this.managedObjects.splice(index, 1);
            bloomLinks.destroy();
          },
        });

        targets.forEach((target, index) => {
          const disc = this.scene.add.circle(
            target.container.x,
            target.container.y,
            22 + index * 3,
            0x9333ea,
            0.36,
          ).setStrokeStyle(2, 0xf0abfc, 0.8).setDepth(158);
          this.managedObjects.push(disc);
          this.scene.tweens.add({
            targets: disc,
            scaleX: 2.35,
            scaleY: 2.35,
            alpha: 0,
            delay: 180,
            duration: 760,
            ease: 'Cubic.Out',
            onComplete: () => {
              const objectIndex = this.managedObjects.indexOf(disc);
              if (objectIndex >= 0) this.managedObjects.splice(objectIndex, 1);
              disc.destroy();
            },
          });
          FeedbackEffects.pulseRing(this.scene, target.container.x, target.container.y, 0xc084fc, 39 + index * 5);
          FeedbackEffects.pulseRing(this.scene, target.container.x, target.container.y, 0xf0abfc, 25 + index * 3);
        });

        addLabel(event.star === 3 ? '★★★ BLOOM → ECHO' : signatureTierLabel(event.signatureId, event.star), '#f3e8ff', 1300);

        if (event.star === 3 && targets.length > 0) {
          const echo = targets[targets.length - 1];
          this.scene.time.delayedCall(280, () => {
            if (!echo.container.active) return;
            const echoDisc = this.scene.add.circle(
              echo.container.x,
              echo.container.y,
              16,
              0xf6d675,
              0.35,
            ).setStrokeStyle(2, 0xfff1a8, 0.95).setDepth(170);
            this.managedObjects.push(echoDisc);
            this.scene.tweens.add({
              targets: echoDisc,
              scaleX: 2,
              scaleY: 2,
              alpha: 0,
              duration: 620,
              ease: 'Cubic.Out',
              onComplete: () => {
                const index = this.managedObjects.indexOf(echoDisc);
                if (index >= 0) this.managedObjects.splice(index, 1);
                echoDisc.destroy();
              },
            });
            FeedbackEffects.pulseRing(this.scene, echo.container.x, echo.container.y, 0xf6d675, 31);
            const echoText = this.scene.add.text(echo.container.x, echo.container.y - 42, 'ECHO', {
              fontFamily: 'Arial, sans-serif',
              fontSize: '11px',
              color: '#fff1a8',
              backgroundColor: '#3a2d12',
              padding: { x: 6, y: 3 },
              fontStyle: 'bold',
              stroke: '#11152b',
              strokeThickness: 2,
            }).setOrigin(0.5).setDepth(176);
            this.managedObjects.push(echoText);
            this.scene.tweens.add({
              targets: echoText,
              y: echoText.y - 10,
              alpha: 0,
              delay: 500,
              duration: 420,
              ease: 'Cubic.Out',
              onComplete: () => {
                const index = this.managedObjects.indexOf(echoText);
                if (index >= 0) this.managedObjects.splice(index, 1);
                echoText.destroy();
              },
            });
          });
        }
        break;
      }
      case 'IronRam':
        drawTrails(0x38bdf8, 7);
        targets.forEach((target) => FeedbackEffects.pulseRing(this.scene, target.container.x, target.container.y, 0x38bdf8, 34));
        this.scene.tweens.add({
          targets: source.container,
          x: source.container.x + 8,
          duration: 70,
          yoyo: true,
          ease: 'Quad.Out',
        });
        addLabel(signatureTierLabel(event.signatureId, event.star), '#bcecff');
        break;
      case 'TwinVolley':
        drawTrails(0xf472b6, 4);
        targets.forEach((target) => FeedbackEffects.pulseRing(this.scene, target.container.x, target.container.y, 0xf472b6, 22));
        addLabel(signatureTierLabel(event.signatureId, event.star), '#fbcfe8');
        break;
    }
  }
}
