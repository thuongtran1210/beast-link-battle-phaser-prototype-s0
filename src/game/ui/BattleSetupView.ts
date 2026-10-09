import Phaser from 'phaser';
import { isCompactLandscape } from './layout/MobilePresentation';
import { type BattleFormation, type FormationSlot, type FormationUnit } from '../battle/BattleFormation';
import type { EnemyArchetype, EnemyFixture } from '../battle/AutonomousBattleModel';
import { HudTokens } from './layout/HudTokens';
import { createIconImage, createRoleIconImage } from './icons/IconFactory';
import { createEnemyArchetypeIcon } from './icons/EnemyIconFactory';
import { beastDisplayName } from './icons/UnitIconRegistry';
import { FeedbackEffects } from './feedback/FeedbackEffects';
import { BattleSetupInteractionController, type DropOutcome } from './BattleSetupInteractionController';
import type { RunRoster } from '../run/RunRoster';
import { ACTIVE_SQUAD_LIMIT, activeSquadPresentation, reserveTargetAffordance } from './ActiveSquadPresentation';
import { emptyFormationSlotLabel, enemyBoardCardLabel, formationBoardSummary } from './BattleSetupPresentation';
import type { EnergyQueueEntry } from '../energy/EnergyQueue';
import { BattleStarUpgradePreviewRenderer } from './battle/BattleStarUpgradePreviewRenderer';
import { BattleSetupRightCTARenderer } from './battle/BattleSetupRightCTARenderer';
import { BattleDeploymentTrayRenderer } from './battle/BattleDeploymentTrayRenderer';
import { createPlayerBattleLayout, playerSlotPosition, enemySlotPosition } from './BattleFieldLayout';
import { BattleCharacterView } from './art/BattleCharacterView';
import { EnemyCharacterView } from './art/EnemyCharacterView';
import { mobileSetupSlot } from './layout/MobileSetupLayout';

export interface BattleSetupLayoutMetrics {
  panelX: number;
  storedEnergyY: number;
  unplacedHeadingY: number;
  listStartY: number;
  listMaxVisibleCount: number;
  startBattleY: number;
  viewportHeight: number;
}

interface SlotVisualTarget {
  slotId: string;
  row: FormationSlot['row'];
  column: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * P1-V13A.2 Landscape Battle Setup View.
 * Restructured layout:
 * - Top: Level & threat info, presets, stored energy, validation tools
 * - Center Left: Player Formation Board (MY FORMATION)
 * - Center Right: Enemy Formation Board (ENEMY FORMATION)
 * - Bottom: Player Beast Deployment Tray (YOUR BEASTS — DRAG TO DEPLOY) & Start Battle CTA
 */
export class BattleSetupView {
  private readonly objects: Phaser.GameObjects.GameObject[] = [];
  private readonly setupCharacters: BattleCharacterView[] = [];
  private readonly controller: BattleSetupInteractionController;
  private readonly playerSlotVisuals: SlotVisualTarget[] = [];
  private readonly starUpgradePreviewRenderer: BattleStarUpgradePreviewRenderer;
  private readonly rightCTARenderer: BattleSetupRightCTARenderer;
  private readonly deploymentTrayRenderer: BattleDeploymentTrayRenderer;
  private dragGhost?: Phaser.GameObjects.Container;
  private hoverPreviewContainer?: Phaser.GameObjects.Container;
  private readonly dragAffordanceObjects: Phaser.GameObjects.GameObject[] = [];
  private pointerMoveHandler?: (pointer: Phaser.Input.Pointer) => void;
  private pointerUpHandler?: (pointer: Phaser.Input.Pointer) => void;
  private enemyTool: EnemyArchetype | 'Erase' = 'Frontliner';
  private trayBounds = { x: 24, y: 495, width: 956, height: 210 };

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly formation: BattleFormation,
    private readonly enemies: ReadonlyArray<EnemyFixture>,
    private readonly storedEnergy: () => ReadonlyArray<EnergyQueueEntry> | string,
    private readonly startBattle: () => void,
    private readonly onArrangementChanged: () => void,
    private readonly fixtureName?: string,
    private readonly onCycleFixture?: () => void,
    private readonly threatSummary?: string,
    private readonly activePresetKey?: 'A' | 'B',
    private readonly onSelectPresetA?: () => void,
    private readonly onSelectPresetB?: () => void,
    private readonly onEnemyBoardEdit?: (tool: EnemyArchetype | 'Erase', row: FormationSlot['row'], column: number) => void,
    private readonly runRoster?: RunRoster,
    private readonly onConsolidate?: (selectedUnitId: string) => string | undefined,
    private readonly shardPool?: import('../run/RunLinkShardPool').RunLinkShardPool,
    private readonly onBuySlot?: () => void,
  ) {
    if (isCompactLandscape() && !onEnemyBoardEdit) { this.trayBounds.y = 500; this.trayBounds.height = 205; }
    this.controller = new BattleSetupInteractionController(this.formation, (unitId) => this.runRoster?.canDeploy(unitId) ?? true, () => this.runRoster?.squadLimit ?? ACTIVE_SQUAD_LIMIT);
    this.starUpgradePreviewRenderer = new BattleStarUpgradePreviewRenderer(
      this.scene,
      this.formation,
      this.objects,
      this.runRoster,
      this.shardPool,
    );
    this.rightCTARenderer = new BattleSetupRightCTARenderer(
      this.scene,
      this.objects,
      this.storedEnergy,
      this.startBattle,
      this.shardPool,
      () => this.runRoster?.squadLimit ?? ACTIVE_SQUAD_LIMIT,
      this.onBuySlot,
    );
    this.deploymentTrayRenderer = new BattleDeploymentTrayRenderer(
      this.scene,
      this.formation,
      this.controller,
      this.objects,
      this.trayBounds,
      this.runRoster,
      this.shardPool,
      this.onConsolidate,
      this.onArrangementChanged,
      () => this.render(),
      (unitId, fromSlotId, pointer) => this.startDrag(unitId, fromSlotId, pointer),
    );
  }

  static computeLayout(viewportHeight = 720): BattleSetupLayoutMetrics {
    const panelX = 998;
    const storedEnergyY = 495;
    const unplacedHeadingY = 495;
    const listStartY = 540;
    const startBattleY = Math.min(625, viewportHeight - 80);
    return {
      panelX,
      storedEnergyY,
      unplacedHeadingY,
      listStartY,
      listMaxVisibleCount: 6,
      startBattleY,
      viewportHeight,
    };
  }

  getUnplacedUnits(): FormationUnit[] {
    return this.controller.getUnplacedUnits();
  }

  render(): void {
    this.destroy();
    this.playerSlotVisuals.length = 0;

    const viewportW = this.scene.scale.width || 1280;
    const viewportH = this.scene.scale.height || 720;
    const layoutMetrics = BattleSetupView.computeLayout(viewportH);
    if (isCompactLandscape() && !this.onEnemyBoardEdit) {
      layoutMetrics.panelX = viewportW - 282;
      this.trayBounds.x = 132; // Leave the DOM pause button a clear lower-left pocket.
      this.trayBounds.width = viewportW - 432;
    }

    this.renderHeader();
    this.renderBattleField();
    this.renderDeploymentTray();
    if (!isCompactLandscape()) this.renderStarUpgradePreview();
    this.renderRightCTA(layoutMetrics);
    this.setupGlobalPointerListeners();
  }

  destroy(): void {
    this.setupCharacters.splice(0).forEach(character=>character.dispose());
    if (this.pointerMoveHandler) {
      this.scene.input.off('pointermove', this.pointerMoveHandler);
      this.pointerMoveHandler = undefined;
    }
    if (this.pointerUpHandler) {
      this.scene.input.off('pointerup', this.pointerUpHandler);
      this.pointerUpHandler = undefined;
    }
    if (this.dragGhost) {
      this.dragGhost.destroy();
      this.dragGhost = undefined;
    }
    if (this.hoverPreviewContainer) {
      this.hoverPreviewContainer.destroy();
      this.hoverPreviewContainer = undefined;
    }
    this.dragAffordanceObjects.splice(0).forEach((object) => object.destroy());
    if (this.scene.tweens) {
      this.scene.tweens.killTweensOf(this.objects);
    }
    this.objects.splice(0).forEach((object) => object.destroy());
  }

  private renderHeader(): void {
    // Player-facing Wave/Threat belongs exclusively to GameTopHUD. Keep harness controls below it.
    if (!this.onEnemyBoardEdit) return;
    // Wave is primary; phase/navigation is intentionally secondary.
    this.text(26, 78, 'TEST HARNESS', 9, '#64748b', 'bold');

    // 2. Level title / Threat info
    const levelLabel = this.text(
      460,
      78,
      this.onCycleFixture ? '[E] CYCLE FIXTURE' : 'BATTLE SETUP',
      12,
      HudTokens.colors.textGold,
      'bold',
    );
    if (this.onCycleFixture) {
      levelLabel.setInteractive({ useHandCursor: true });
      levelLabel.on('pointerup', () => this.onCycleFixture!());
    }

    if (this.threatSummary) {
      this.text(460, 92, '[DEBUG CONTROLS]', 8, '#64748b', 'bold');
    }

    // 3. Formation Presets Quick Select
    if (this.onSelectPresetA && this.onSelectPresetB) {
      this.text(780, 78, 'PRESET:', 9, HudTokens.colors.textMuted, 'bold');
      const presetALabel = this.text(
        834,
        78,
        `[A] Response A`,
        10,
        this.activePresetKey === 'A' ? '#22c55e' : '#94a3b8',
        'bold',
        this.activePresetKey === 'A' ? '#14532d' : '#1e293b',
        { x: 6, y: 3 },
      );
      presetALabel.setInteractive({ useHandCursor: true }).on('pointerup', () => this.onSelectPresetA!());

      const presetBLabel = this.text(
        940,
        78,
        `[B] Response B`,
        10,
        this.activePresetKey === 'B' ? '#22c55e' : '#94a3b8',
        'bold',
        this.activePresetKey === 'B' ? '#14532d' : '#1e293b',
        { x: 6, y: 3 },
      );
      presetBLabel.setInteractive({ useHandCursor: true }).on('pointerup', () => this.onSelectPresetB!());
    }

    // 4. Enemy validation tools
    {
      this.text(780, 92, 'ENEMY TOOLS:', 8, HudTokens.colors.textMuted, 'bold');
      (['Frontliner', 'Diver', 'Ranged', 'Erase'] as const).forEach((tool, index) => {
        const short = tool === 'Frontliner' ? 'FRONT' : tool === 'Ranged' ? 'RANGE' : tool.toUpperCase();
        const active = this.enemyTool === tool;
        const label = this.text(
          856 + index * 48,
          92,
          short,
          8,
          active ? '#fbbf24' : '#94a3b8',
          active ? 'bold' : '',
          active ? '#78350f' : '#1e293b',
          { x: 5, y: 2 },
        );
        label.setInteractive({ useHandCursor: true }).on('pointerup', () => {
          this.enemyTool = tool;
          this.render();
        });
      });
    }
  }

  private renderBattleField(): void {
    if (isCompactLandscape() && !this.onEnemyBoardEdit) { this.renderMobileBattleField(); return; }
    const arenaX = 24;
    const arenaY = 72;
    const arenaW = 1230;
    const arenaH = 412;

    // Arena boundary card
    const arenaBg = this.scene.add
      .rectangle(arenaX + arenaW / 2, arenaY + arenaH / 2, arenaW, arenaH, 0x0b1120, 0.7)
      .setStrokeStyle(1.5, 0x1e293b);
    this.objects.push(arenaBg);

    const dividerX = 640;
    const topLaneY = 142;
    const laneGap = 56;
    const slotW = isCompactLandscape() ? 140 : 104;
    const slotH = 52;
    const depthGap = isCompactLandscape() ? 154 : 122;

    // Center divider
    const divider = this.scene.add.rectangle(dividerX, arenaY + arenaH / 2 + 10, 2, arenaH - 50, 0x334155, 0.8);
    this.objects.push(divider);

    // A compact clash marker preserves side orientation without competing with either board header.
    const clash = this.text(dividerX, topLaneY - 40, '⚔', 16, '#94a3b8', 'bold').setOrigin(0.5);
    this.objects.push(clash);

    // Board headers. Squad capacity is separate from the 3 × 6 position grid.
    const squad = this.squadPresentation();
    const playerHeading = this.text(dividerX - 170, topLaneY - 58, '◀ YOUR SQUAD', 12, '#38bdf8', 'bold').setOrigin(0.5);
    const enemyHeading = this.text(dividerX + 180, topLaneY - 58, 'ENEMY THREAT ▶', 12, '#f87171', 'bold').setOrigin(0.5);
    const squadTitle = this.text(dividerX - 170, topLaneY - 42, formationBoardSummary(squad.activeCount, 18, this.runRoster?.squadLimit ?? ACTIVE_SQUAD_LIMIT), 9, squad.isFull ? '#fbbf24' : '#7dd3fc', 'bold').setOrigin(0.5);
    this.objects.push(playerHeading, enemyHeading, squadTitle);

    // Row labels
    const playerFrontX = dividerX - 80;
    const playerMidX = playerFrontX - depthGap;
    const playerBackX = playerMidX - depthGap;

    const enemyFrontX = dividerX + 80;
    const enemyMidX = enemyFrontX + depthGap;
    const enemyBackX = enemyMidX + depthGap;

    this.text(playerBackX, topLaneY - 18, 'BACK', 10, '#64748b', 'bold').setOrigin(0.5);
    this.text(playerMidX, topLaneY - 18, 'MID', 10, '#64748b', 'bold').setOrigin(0.5);
    this.text(playerFrontX, topLaneY - 18, 'FRONT', 10, '#38bdf8', 'bold').setOrigin(0.5);

    this.text(enemyFrontX, topLaneY - 18, 'FRONT', 10, '#ef4444', 'bold').setOrigin(0.5);
    this.text(enemyMidX, topLaneY - 18, 'MID', 10, '#64748b', 'bold').setOrigin(0.5);
    this.text(enemyBackX, topLaneY - 18, 'BACK', 10, '#64748b', 'bold').setOrigin(0.5);

    // 6 Lanes L1..L6
    for (let column = 1; column <= 6; column += 1) {
      const laneY = topLaneY + (column - 1) * laneGap;
      this.text(playerBackX - slotW / 2 - 14, laneY, `L${column}`, 9, '#64748b', 'bold').setOrigin(0.5);

      // Player slots: Back, Mid, Front
      const playerRows: Array<{ row: FormationSlot['row']; x: number }> = [
        { row: 'Back', x: playerBackX },
        { row: 'Mid', x: playerMidX },
        { row: 'Front', x: playerFrontX },
      ];

      playerRows.forEach(({ row, x }) => {
        const slotId = `${row.toLowerCase()}-${column}`;
        this.playerSlotVisuals.push({
          slotId,
          row,
          column,
          x,
          y: laneY,
          width: slotW,
          height: slotH,
        });

        this.renderPlayerSlot(slotId, row, column, x, laneY, slotW, slotH);
      });

      // Enemy slots: Front, Mid, Back
      const enemyRows: Array<{ row: FormationSlot['row']; x: number }> = [
        { row: 'Front', x: enemyFrontX },
        { row: 'Mid', x: enemyMidX },
        { row: 'Back', x: enemyBackX },
      ];

      enemyRows.forEach(({ row, x }) => {
        const slot = this.scene.add
          .rectangle(x, laneY, slotW, slotH, 0x252b2a, 0.6)
          .setStrokeStyle(1.5, 0x856d68, 0.45);
        this.objects.push(slot);

        if (this.onEnemyBoardEdit) {
          slot.setInteractive({ useHandCursor: true }).on('pointerup', () => {
            this.onEnemyBoardEdit!(this.enemyTool, row, column);
          });
        }
      });
    }

    // Render enemy units
    this.enemies.forEach((enemy) => {
      const rowX = enemy.row === 'Front' ? enemyFrontX : enemy.row === 'Mid' ? enemyMidX : enemyBackX;
      const posY = topLaneY + (enemy.column - 1) * laneGap;
      const archetype = enemy.archetype ?? 'Frontliner';
      const strokeColor = archetype === 'Diver' ? 0x776d7b : archetype === 'Ranged' ? 0x627b79 : 0x856d68;

      const body = this.scene.add
        .rectangle(rowX, posY, slotW - 4, slotH - 6, 0x2b2030, 0.98)
        .setStrokeStyle(1.5, strokeColor);

      const icon = createEnemyArchetypeIcon(this.scene, archetype, rowX - 16, posY - 1, 27);
      const label = this.text(
        rowX + 14,
        posY - 1,
        enemyBoardCardLabel(archetype, enemy.maxHp, enemy.damage),
        7,
        '#fff4f2',
        'bold',
      ).setOrigin(0.5);
      this.objects.push(body, icon, label);
    });

    // First-time instructional arrow cue (disappears after first placement)
    if (this.controller.isFirstDeploymentPending) {
      const cueY = 468;
      const cue = this.text(
        dividerX - 170,
        cueY,
        '▲ DRAG YOUR BEASTS INTO FORMATION ▲',
        11,
        '#38bdf8',
        'bold',
      ).setOrigin(0.5);
      this.objects.push(cue);

      if (this.scene.tweens) {
        this.scene.tweens.add({
          targets: cue,
          y: cueY - 6,
          duration: 600,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.InOut',
        });
      }
    }
  }

  private renderMobileBattleField(): void {
    const squad = this.squadPresentation();
    const layout=createPlayerBattleLayout(this.scene.scale.width,this.scene.scale.height,true);
    if(this.scene.textures.exists('owner-camp-battle')) {
      const background=this.scene.add.image(this.scene.scale.width/2,this.scene.scale.height/2,'owner-camp-battle').setDepth(-10);
      background.setScale(Math.max(this.scene.scale.width/background.width,this.scene.scale.height/background.height));
      this.objects.push(background);
    }
    const heading=this.text(36,76,`Đội hình ${squad.activeCount}/${squad.limit} · Chạm thú rồi chạm vị trí`,18,'#fff3d7','bold');
    heading.setBackgroundColor('#29372ddd').setPadding(10,6);
    this.text(this.scene.scale.width-36,76,`Địch: ${this.enemies.length}`,18,'#fff3d7','bold').setOrigin(1,0).setBackgroundColor('#29372ddd').setPadding(10,6);
    for(const row of ['Back','Mid','Front'] as const) {
      this.text(playerSlotPosition(layout,row,1).x,132,row.toUpperCase(),14,'#fff3d7','bold').setOrigin(.5).setBackgroundColor('#29372dbb').setPadding(6,3);
    }
    for (let lane = 1; lane <= 6; lane++) {
      const laneY=playerSlotPosition(layout,'Front',lane).y;
      this.text(playerSlotPosition(layout,'Back',lane).x-66,laneY,`${lane}`,13,'#fff3d7','bold').setOrigin(.5);
      for (const row of ['Front', 'Mid', 'Back'] as const) {
        const pos = mobileSetupSlot(row,lane,this.scene.scale.width);
        const slotId = `${row.toLowerCase()}-${lane}`;
        this.playerSlotVisuals.push({ slotId, row, column: lane, ...pos });
        this.renderPlayerSlot(slotId, row, lane, pos.x, pos.y, pos.width, pos.height);
      }
    }
    this.enemies.forEach(enemy=>{
      const pos=enemySlotPosition(layout,enemy.row,enemy.column);
      const character=new EnemyCharacterView(this.scene,enemy.archetype??'Frontliner',true);
      character.root.setPosition(pos.x,pos.y).setDepth(100+pos.y/10);
      this.objects.push(character.root);
      const hp=this.scene.add.rectangle(pos.x,pos.y+character.hpAnchorY,46,4,0xf17383).setDepth(200);
      this.objects.push(hp);
    });
  }

  private renderPlayerSlot(
    slotId: string,
    row: FormationSlot['row'],
    column: number,
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    const formationSlot = this.formation.getSlot(slotId);
    const occupantUnit = formationSlot?.unitId ? this.formation.getUnit(formationSlot.unitId) : undefined;
    const isSelected = occupantUnit && occupantUnit.unitId === this.controller.selectedId;
    const onBattlefield=isCompactLandscape()&&!this.onEnemyBoardEdit;

    if (occupantUnit) {
      // Occupied Player Slot
      const body = this.scene.add
        .rectangle(x, y, width - 6, height - 6, 0x1e293b, onBattlefield?0:0.96)
        .setStrokeStyle(onBattlefield?0:isSelected ? 3 : 1.5, isSelected ? 0xc8b58a : 0x48514e);
      this.objects.push(body);

      const large = height >= 90;
      if(onBattlefield) {
        const marker=this.scene.add.ellipse(x,y+5,78,22,0x344838,.3).setStrokeStyle(isSelected?3:1,isSelected?0xffdf83:0xf2e2b2,isSelected?1:.45);
        const character=new BattleCharacterView(this.scene,occupantUnit.beastId,true);
        this.setupCharacters.push(character);
        // Idle motion owns the root's local y/scale. Position its parent on the
        // field, just as BattleUnitVisualManager does during combat.
        const anchor=this.scene.add.container(x,y,[character.root]).setDepth(100+y/10);
        this.objects.push(marker,anchor);
        const roster=this.runRoster?.get(occupantUnit.unitId);
        const ratio=roster ? roster.currentHp/Math.max(1,roster.maxHp):1;
        this.objects.push(this.scene.add.rectangle(x-23,y+character.hpAnchorY,46*ratio,4,0x56cc83).setOrigin(0,.5).setDepth(200));
      } else {
        this.objects.push(createIconImage(this.scene, occupantUnit.beastId, x - 15, y - 8, large ? 60 : 36));
      }

      const roleBadge = createRoleIconImage(this.scene, occupantUnit.role, x + 16, y - 10, 16);
      roleBadge.setVisible(!onBattlefield);
      this.objects.push(roleBadge);

      const stars = '★'.repeat(occupantUnit.star);
      const starLabel = this.text(x + (large ? 34 : 16), y + 6, stars, large ? 13 : 9, HudTokens.colors.textGold, 'bold').setOrigin(0.5);
      if(onBattlefield) starLabel.setPosition(x,y+12).setFontSize(12).setDepth(201);
      this.objects.push(starLabel);

      const rosterUnit = this.runRoster?.get(occupantUnit.unitId);
      const hpLabel = this.text(
        x,
        y + (large ? 34 : 16),
        rosterUnit ? `${rosterUnit.currentHp}/${rosterUnit.maxHp} HP` : 'HP',
        large ? 13 : 7,
        HudTokens.colors.textMuted,
        'bold',
      ).setOrigin(0.5);
      hpLabel.setVisible(!onBattlefield);
      this.objects.push(hpLabel);

      if (isSelected && this.scene.tweens) {
        this.scene.tweens.add({
          targets: body,
          scaleX: 1.05,
          scaleY: 1.05,
          duration: 400,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.InOut',
        });
      }

      // Drag and Click Interaction for deployed unit
      const hitArea = this.scene.add
        .rectangle(x, y, width, height, 0xffffff, 0.0001)
        .setInteractive({ useHandCursor: true });
      this.objects.push(hitArea);

      hitArea.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        this.startDrag(occupantUnit.unitId, slotId, pointer);
      });

      hitArea.on('pointerup', () => {
        // If not dragged, treat as click selection/swap
        if (this.controller.state.mode === 'idle') {
          const outcome = this.controller.clickSlot(slotId);
          this.handleOutcome(outcome, x, y);
        }
      });
      return;
    }

    // Empty Player Slot: a tactical position, not an additional squad slot.
    const squad = this.squadPresentation();
    const isDragging = this.controller.state.mode !== 'idle';
    const blockedByFullSquad = reserveTargetAffordance(squad.activeCount, false, this.controller.state.mode === 'draggingFromTray', this.runRoster?.squadLimit ?? ACTIVE_SQUAD_LIMIT) === 'blocked';
    const emptySlot = this.scene.add
      .rectangle(x, y, width, height, 0x6c7b59, onBattlefield?0:blockedByFullSquad ? 0.06 : 0.14)
      .setStrokeStyle(onBattlefield?0:1, 0x98a58b, isDragging || this.controller.selectedId ? .65 : .18);
    if(onBattlefield) this.objects.push(this.scene.add.ellipse(x,y,66,20,0x344838,.12).setStrokeStyle(1,0xffedc0,isDragging||Boolean(this.controller.selectedId)? .8:.35));
    const slotLabel = onBattlefield ? (blockedByFullSquad?'':'+') : emptyFormationSlotLabel(isDragging, blockedByFullSquad);
    const footprint = slotLabel
      ? this.text(x, y, slotLabel, blockedByFullSquad ? 7 : 8, blockedByFullSquad ? '#64748b' : '#7dd3fc', 'bold').setOrigin(0.5).setAlpha(0.8)
      : undefined;
    this.objects.push(emptySlot);
    if (footprint) this.objects.push(footprint);

    // Subtle first-time pulse on frontline empty slot
    if (this.controller.isFirstDeploymentPending && row === 'Front' && column === 3 && this.scene.tweens) {
      this.scene.tweens.add({
        targets: footprint ? [emptySlot, footprint] : [emptySlot],
        alpha: 0.9,
        duration: 700,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut',
      });
    }

    const hitArea = this.scene.add
      .rectangle(x, y, width, height, 0xffffff, 0.0001)
      .setInteractive({ useHandCursor: true });
    this.objects.push(hitArea);

    hitArea.on('pointerup', () => {
      if (this.controller.state.mode === 'idle') {
        const outcome = this.controller.clickSlot(slotId);
        this.handleOutcome(outcome, x, y);
      }
    });
  }

  private renderDeploymentTray(): void {
    this.deploymentTrayRenderer.render();
  }

  private renderRightCTA(layout: BattleSetupLayoutMetrics): void {
    const squad = this.squadPresentation();
    this.rightCTARenderer.render(layout, squad);
  }

  private startDrag(unitId: string, fromSlotId: string | null, pointer: Phaser.Input.Pointer): void {
    const started = fromSlotId
      ? this.controller.startDragFromBoard(unitId, fromSlotId)
      : this.controller.startDragFromTray(unitId);

    if (!started) return;

    const unit = this.formation.getUnit(unitId);
    if (!unit) return;

    // Create Drag Ghost
    this.createDragGhost(unit, pointer.x, pointer.y);
    this.showDragCapacityAffordances();
  }

  private createDragGhost(unit: FormationUnit, startX: number, startY: number): void {
    if (this.dragGhost) {
      this.dragGhost.destroy();
    }

    const container = this.scene.add.container(startX, startY);
    container.setDepth(200);

    const bg = this.scene.add
      .rectangle(0, 0, 80, 72, 0x0f172a, 0.95)
      .setStrokeStyle(2, 0x38bdf8, 1);

    const icon = createIconImage(this.scene, unit.beastId, -16, -6, 36);
    const roleIcon = createRoleIconImage(this.scene, unit.role, 20, -18, 18);
    const stars = this.text(20, 2, '★'.repeat(unit.star), 10, HudTokens.colors.textGold, 'bold').setOrigin(0.5);
    const name = this.text(0, 20, beastDisplayName(unit.beastId), 8, '#ffffff', 'bold').setOrigin(0.5);

    container.add([bg, icon, roleIcon, stars, name]);
    container.setScale(1.1);

    this.dragGhost = container;
  }

  private setupGlobalPointerListeners(): void {
    this.pointerMoveHandler = (pointer: Phaser.Input.Pointer) => {
      if (this.controller.state.mode === 'idle' || !this.dragGhost) return;

      this.dragGhost.setPosition(pointer.x, pointer.y);

      // Check slot collision
      const hoveredSlot = this.playerSlotVisuals.find((slot) => {
        return (
          pointer.x >= slot.x - slot.width / 2 &&
          pointer.x <= slot.x + slot.width / 2 &&
          pointer.y >= slot.y - slot.height / 2 &&
          pointer.y <= slot.y + slot.height / 2
        );
      });

      const isOverBench =
        pointer.x >= this.trayBounds.x &&
        pointer.x <= this.trayBounds.x + this.trayBounds.width &&
        pointer.y >= this.trayBounds.y &&
        pointer.y <= this.trayBounds.y + this.trayBounds.height;

      this.controller.updateHover(hoveredSlot ? hoveredSlot.slotId : null, isOverBench);
      this.updateHoverPreview(hoveredSlot);
    };

    this.pointerUpHandler = () => {
      if (this.controller.state.mode === 'idle') return;

      const targetSlot = this.controller.state.hoverSlotId;
      const isOverBench = this.controller.state.hoverBench;
      const outcome = this.controller.commitDrop(targetSlot, isOverBench);

      this.cleanupDragVisuals();

      const slotTarget = targetSlot ? this.playerSlotVisuals.find((s) => s.slotId === targetSlot) : undefined;
      this.handleOutcome(outcome, slotTarget?.x, slotTarget?.y);
    };

    this.scene.input.on('pointermove', this.pointerMoveHandler);
    this.scene.input.on('pointerup', this.pointerUpHandler);
  }

  private updateHoverPreview(target?: SlotVisualTarget): void {
    if (this.hoverPreviewContainer) {
      this.hoverPreviewContainer.destroy();
      this.hoverPreviewContainer = undefined;
    }

    if (!target) return;

    const unitId = this.controller.state.draggedUnitId;
    if (!unitId) return;
    const unit = this.formation.getUnit(unitId);
    if (!unit) return;

    const slot = this.formation.getSlot(target.slotId);
    const isOccupied = Boolean(slot?.unitId && slot.unitId !== unitId);
    const squad = this.squadPresentation();
    const affordance = reserveTargetAffordance(squad.activeCount, isOccupied, this.controller.state.mode === 'draggingFromTray', this.runRoster?.squadLimit ?? ACTIVE_SQUAD_LIMIT);

    const container = this.scene.add.container(target.x, target.y);
    container.setDepth(150);

    const previewBg = this.scene.add
      .rectangle(0, 0, target.width - 6, target.height - 6, affordance === 'swap' ? 0xd97706 : affordance === 'blocked' ? 0x334155 : 0x0284c7, affordance === 'blocked' ? 0.35 : 0.45)
      .setStrokeStyle(2, affordance === 'swap' ? 0xfbbf24 : affordance === 'blocked' ? 0x64748b : 0x38bdf8, 0.9);

    if (affordance === 'swap') {
      const swapText = this.text(0, 0, '⇄ SWAP', 11, '#fef08a', 'bold').setOrigin(0.5);
      container.add([previewBg, swapText]);
    } else if (affordance === 'blocked') {
      const blockedText = this.text(0, 0, 'SQUAD FULL', 8, '#94a3b8', 'bold').setOrigin(0.5);
      container.add([previewBg, blockedText]);
    } else {
      const previewIcon = createIconImage(this.scene, unit.beastId, 0, 0, 32).setAlpha(0.65);
      container.add([previewBg, previewIcon]);
    }

    this.hoverPreviewContainer = container;
  }

  private highlightValidTargetCells(highlight: boolean): void {
    this.playerSlotVisuals.forEach((slotTarget) => {
      const slot = this.formation.getSlot(slotTarget.slotId);
      if (slot && slot.unitId === null) {
        // Soft border illumination
      }
    });
  }

  private cleanupDragVisuals(): void {
    if (this.dragGhost) {
      this.dragGhost.destroy();
      this.dragGhost = undefined;
    }
    if (this.hoverPreviewContainer) {
      this.hoverPreviewContainer.destroy();
      this.hoverPreviewContainer = undefined;
    }
    this.dragAffordanceObjects.splice(0).forEach((object) => object.destroy());
    this.highlightValidTargetCells(false);
  }

  private handleOutcome(outcome: DropOutcome, x?: number, y?: number): void {
    switch (outcome.type) {
      case 'placed':
        this.onArrangementChanged();
        if (x !== undefined && y !== undefined) {
          FeedbackEffects.pulseRing(this.scene, x, y, 0x38bdf8, 32);
          FeedbackEffects.floatText(this.scene, x, y - 20, 'SNAP DEPLOY', '#22c55e', '11px', 450);
        }
        this.render();
        break;

      case 'moved':
        this.onArrangementChanged();
        if (x !== undefined && y !== undefined) {
          FeedbackEffects.pulseRing(this.scene, x, y, 0x38bdf8, 30);
          FeedbackEffects.floatText(this.scene, x, y - 20, 'MOVED', '#38bdf8', '11px', 450);
        }
        this.render();
        break;

      case 'swapped':
      case 'benchSwap':
        this.onArrangementChanged();
        if (x !== undefined && y !== undefined) {
          FeedbackEffects.pulseRing(this.scene, x, y, 0xfbbf24, 34);
          FeedbackEffects.floatText(this.scene, x, y - 20, '⇄ SWAPPED', '#fbbf24', '11px', 450);
        }
        this.render();
        break;

      case 'returnedToBench':
        this.onArrangementChanged();
        FeedbackEffects.floatText(this.scene, this.trayBounds.x + 200, this.trayBounds.y + 40, 'RETURNED TO BENCH', '#94a3b8', '11px', 450);
        this.render();
        break;

      case 'rejected':
        FeedbackEffects.floatText(
          this.scene,
          x ?? 360,
          (y ?? 170) - 20,
          outcome.reason === 'Active Squad full' ? 'SQUAD FULL — 4 / 4' : outcome.reason.toUpperCase(),
          '#fbbf24',
          '11px',
          750,
        );
        this.render();
        break;

      case 'selected':
      case 'deselected':
        this.render();
        break;

      case 'cancelled':
      default:
        this.render();
        break;
    }
  }

  private text(
    x: number,
    y: number,
    value: string,
    size: number,
    color: string,
    style = '',
    backgroundColor?: string,
    padding?: { x: number; y: number },
  ): Phaser.GameObjects.Text {
    const text = this.scene.add.text(x, y, value, {
      fontFamily: HudTokens.fonts.family,
      fontSize: `${size}px`,
      color,
      fontStyle: style,
      backgroundColor,
      padding,
      lineSpacing: 3,
    });
    this.objects.push(text);
    return text;
  }

  private renderStarUpgradePreview(): void {
    this.starUpgradePreviewRenderer.render(this.controller.selectedId);
  }

  private squadPresentation() {
    const units = this.formation.units;
    const isLiving = (unit: FormationUnit) => this.runRoster?.canDeploy(unit.unitId) ?? true;
    return activeSquadPresentation(
      units.filter((unit) => unit.slotId !== null && isLiving(unit)).length,
      units.filter((unit) => unit.slotId === null && isLiving(unit)).length,
      units.filter((unit) => unit.slotId === null && !isLiving(unit)).length,
      this.runRoster?.squadLimit ?? ACTIVE_SQUAD_LIMIT,
    );
  }

  /** Temporary drag affordances avoid rebuilding the view (which would cancel the drag). */
  private showDragCapacityAffordances(): void {
    this.dragAffordanceObjects.splice(0).forEach((object) => object.destroy());
    if (this.controller.state.mode !== 'draggingFromTray') return;

    const squad = this.squadPresentation();
    this.playerSlotVisuals.forEach((target) => {
      const slot = this.formation.getSlot(target.slotId);
      const affordance = reserveTargetAffordance(squad.activeCount, Boolean(slot?.unitId), true, this.runRoster?.squadLimit ?? ACTIVE_SQUAD_LIMIT);
      if (affordance === 'place') {
        const glow = this.scene.add.rectangle(target.x, target.y, target.width - 4, target.height - 4, 0x0284c7, 0.12).setStrokeStyle(1.5, 0x38bdf8, 0.7);
        glow.setDepth(120);
        this.dragAffordanceObjects.push(glow);
      } else if (affordance === 'blocked') {
        const dim = this.scene.add.rectangle(target.x, target.y, target.width - 4, target.height - 4, 0x0f172a, 0.45).setStrokeStyle(1.5, 0x475569, 0.8);
        const lock = this.text(target.x, target.y, 'LOCK', 7, '#94a3b8', 'bold').setOrigin(0.5);
        dim.setDepth(120); lock.setDepth(121);
        this.dragAffordanceObjects.push(dim, lock);
      } else {
        const swap = this.text(target.x, target.y - target.height / 2 + 7, '⇄ SWAP', 7, '#fef08a', 'bold', '#78350f', { x: 3, y: 1 }).setOrigin(0.5);
        swap.setDepth(121);
        this.dragAffordanceObjects.push(swap);
      }
    });
  }
}

function roleTextColor(role: FormationUnit['role']): string {
  if (role === 'Tanker') return '#d3bf8c';
  if (role === 'Assassin') return '#c89b84';
  if (role === 'Ranger') return '#a8bda0';
  return '#b7a7c4';
}
