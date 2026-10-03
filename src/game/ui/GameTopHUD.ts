import Phaser from 'phaser';
import { GamePhase } from '../state/GamePhase';
import { HudTokens } from './layout/HudTokens';

/** Shared GAME HUD. No showcase or alternate presentation state exists. */
export class GameTopHUD {
  private readonly objects: Phaser.GameObjects.GameObject[] = [];
  private readonly phases = new Map<GamePhase, Phaser.GameObjects.Text>();
  private phase!: Phaser.GameObjects.Text; private beasts!: Phaser.GameObjects.Text; private energy!: Phaser.GameObjects.Text;
  constructor(private readonly scene: Phaser.Scene) { const w = scene.scale.width; this.objects.push(scene.add.rectangle(w / 2, 35, w, 70, HudTokens.colors.bgSurfaceDark, .96)); this.objects.push(scene.add.text(20, 14, 'BEAST LINK BATTLE', { fontFamily: HudTokens.fonts.family, fontSize: '17px', color: '#fff', fontStyle: 'bold' })); this.phase = scene.add.text(20, 43, 'BEAST RUSH', { fontFamily: HudTokens.fonts.family, fontSize: '10px', color: HudTokens.colors.textGold, fontStyle: 'bold' }); this.objects.push(this.phase); ([['BeastRush','BEAST'],['EnergyRush','ENERGY'],['BattleSetup','SETUP'],['Battle','BATTLE'],['Result','RESULT']] as Array<[GamePhase,string]>).forEach(([p,l],i) => { const text = scene.add.text(w / 2 - 164 + i * 82, 35, l, { fontFamily: HudTokens.fonts.family, fontSize: '10px', color: HudTokens.colors.textMuted, fontStyle: 'bold' }).setOrigin(.5); this.phases.set(p,text); this.objects.push(text); }); this.beasts = scene.add.text(w - 180, 29, 'BEASTS 0', { fontFamily: HudTokens.fonts.family, fontSize: '11px', color: HudTokens.colors.textBlue, fontStyle: 'bold' }); this.energy = scene.add.text(w - 82, 29, 'ENERGY 0', { fontFamily: HudTokens.fonts.family, fontSize: '11px', color: HudTokens.colors.textGold, fontStyle: 'bold' }); this.objects.push(this.beasts,this.energy); }
  update(p: GamePhase, beasts: number, energy: number): void { this.phase.setText(p.replace(/([A-Z])/g, ' $1').trim().toUpperCase()); this.beasts.setText(`BEASTS ${beasts}`); this.energy.setText(`ENERGY ${energy}`); for (const [key,text] of this.phases) text.setColor(key === p ? '#fbbf24' : HudTokens.colors.textMuted); }
  setVisible(v: boolean): void { this.objects.forEach((o) => (o as unknown as Phaser.GameObjects.Components.Visible).setVisible(v)); }
  destroy(): void { this.objects.splice(0).forEach((o) => o.destroy()); }
}
