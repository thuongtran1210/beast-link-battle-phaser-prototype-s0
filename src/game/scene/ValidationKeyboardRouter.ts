import Phaser from 'phaser';
import { isTestHarness } from '../config/RuntimeMode';
import { GamePhase } from '../state/GamePhase';
import type { PhaseController } from '../state/PhaseController';
import type { BattleQueue } from '../queue/BattleQueue';

export interface ValidationKeyboardCallbacks {
  setEnemyFixturePreset: (index: number) => void;
  cycleEnemyFixture: () => void;
  loadFormationPreset: (key: 'A' | 'B') => void;
  toggleShowcaseMode: () => void;
  toggleShowcasePause: () => void;
  toggleShowcaseCleanFrame: () => void;
  loadV15ACaptureFixture: () => void;
  startV15AHeroBattle: () => void;
}

export class ValidationKeyboardRouter {
  constructor(
    private readonly scene: Phaser.Scene,
    private readonly phaseController: PhaseController,
    private readonly battleQueue: BattleQueue,
    private readonly callbacks: ValidationKeyboardCallbacks,
  ) {}

  register(): void {
    const keyboard = this.scene.input.keyboard;
    if (!keyboard) return;

    if (isTestHarness()) {
      keyboard.on('keydown-F1', () => this.callbacks.setEnemyFixturePreset(0));
      keyboard.on('keydown-F2', () => this.callbacks.setEnemyFixturePreset(1));
      keyboard.on('keydown-F3', () => this.callbacks.setEnemyFixturePreset(2));
      keyboard.on('keydown-F4', () => this.callbacks.setEnemyFixturePreset(3));
    }

    keyboard.on('keydown-E', () => this.callbacks.cycleEnemyFixture());
    keyboard.on('keydown-ONE', () => this.callbacks.setEnemyFixturePreset(0));
    keyboard.on('keydown-TWO', () => this.callbacks.setEnemyFixturePreset(1));
    keyboard.on('keydown-THREE', () => this.callbacks.setEnemyFixturePreset(2));
    keyboard.on('keydown-A', () => this.callbacks.loadFormationPreset('A'));
    keyboard.on('keydown-B', () => this.callbacks.loadFormationPreset('B'));

    keyboard.on('keydown-S', () => {
      if (this.phaseController.phase === GamePhase.BeastRush) {
        if (this.battleQueue.entries().length === 0) {
          this.battleQueue.addBeastMatch('beast-a');
          this.battleQueue.addBeastMatch('beast-b');
          this.battleQueue.addBeastMatch('beast-c');
          this.battleQueue.addBeastMatch('beast-d');
        }
        this.phaseController.setPhase(GamePhase.EnergyRush);
      } else if (this.phaseController.phase === GamePhase.EnergyRush) {
        if (this.battleQueue.entries().length === 0) {
          this.battleQueue.addBeastMatch('beast-a');
          this.battleQueue.addBeastMatch('beast-b');
          this.battleQueue.addBeastMatch('beast-c');
          this.battleQueue.addBeastMatch('beast-d');
        }
        this.phaseController.setPhase(GamePhase.BattleSetup);
      }
    });

    // Portfolio capture controls
    // O = showcase UI, P = pause/resume Battle, C = clean-frame HUD toggle.
    keyboard.on('keydown-O', () => this.callbacks.toggleShowcaseMode());
    keyboard.on('keydown-P', () => this.callbacks.toggleShowcasePause());
    keyboard.on('keydown-C', () => this.callbacks.toggleShowcaseCleanFrame());
    keyboard.on('keydown-K', () => this.callbacks.loadV15ACaptureFixture());
    keyboard.on('keydown-L', () => this.callbacks.startV15AHeroBattle());
  }
}
