import { type BattleFormation, type FormationSlot, type FormationUnit } from '../battle/BattleFormation';

export type DragMode = 'idle' | 'draggingFromTray' | 'draggingDeployedUnit';

export interface DragState {
  mode: DragMode;
  draggedUnitId: string | null;
  sourceSlotId: string | null;
  hoverSlotId: string | null;
  hoverBench: boolean;
}

export type DropOutcome =
  | { type: 'placed'; unitId: string; slotId: string }
  | { type: 'moved'; unitId: string; fromSlotId: string; toSlotId: string }
  | { type: 'swapped'; unitIdA: string; unitIdB: string; slotA: string; slotB: string }
  | { type: 'benchSwap'; unitIn: string; unitOut: string; slotId: string }
  | { type: 'returnedToBench'; unitId: string; fromSlotId: string }
  | { type: 'cancelled'; unitId: string }
  | { type: 'selected'; unitId: string }
  | { type: 'deselected' }
  | { type: 'none' }
  | { type: 'rejected'; reason: string };

/**
 * Pure controller managing Battle Setup drag-and-drop & click interaction state.
 * Decoupled from Phaser rendering so all UX logic can be tested deterministically.
 */
export class BattleSetupInteractionController {
  private mode: DragMode = 'idle';
  private draggedUnitId: string | null = null;
  private sourceSlotId: string | null = null;
  private hoverSlotId: string | null = null;
  private hoverBench = false;
  private selectedUnitId: string | null = null;
  private hasEverDeployed = false;

  constructor(private readonly formation: BattleFormation) {
    if (this.formation.units.some((u) => u.slotId !== null)) {
      this.hasEverDeployed = true;
    }
  }

  get state(): DragState {
    return {
      mode: this.mode,
      draggedUnitId: this.draggedUnitId,
      sourceSlotId: this.sourceSlotId,
      hoverSlotId: this.hoverSlotId,
      hoverBench: this.hoverBench,
    };
  }

  get selectedId(): string | null {
    return this.selectedUnitId;
  }

  get isFirstDeploymentPending(): boolean {
    return !this.hasEverDeployed && this.getUnplacedUnits().length > 0;
  }

  getUnplacedUnits(): FormationUnit[] {
    return this.formation.units.filter((unit) => unit.slotId === null);
  }

  getDeployedUnits(): FormationUnit[] {
    return this.formation.units.filter((unit) => unit.slotId !== null);
  }

  isValidPlayerSlot(slotId: string): boolean {
    return this.formation.slots.some((slot) => slot.slotId === slotId);
  }

  getSlot(slotId: string): FormationSlot | undefined {
    return this.formation.getSlot(slotId);
  }

  getUnit(unitId: string): FormationUnit | undefined {
    return this.formation.getUnit(unitId);
  }

  startDragFromTray(unitId: string): boolean {
    const unit = this.formation.getUnit(unitId);
    if (!unit || unit.slotId !== null) return false;
    this.mode = 'draggingFromTray';
    this.draggedUnitId = unitId;
    this.sourceSlotId = null;
    this.hoverSlotId = null;
    this.hoverBench = false;
    this.selectedUnitId = null;
    return true;
  }

  startDragFromBoard(unitId: string, slotId: string): boolean {
    const unit = this.formation.getUnit(unitId);
    if (!unit || unit.slotId !== slotId) return false;
    this.mode = 'draggingDeployedUnit';
    this.draggedUnitId = unitId;
    this.sourceSlotId = slotId;
    this.hoverSlotId = null;
    this.hoverBench = false;
    this.selectedUnitId = null;
    return true;
  }

  updateHover(slotId: string | null, isOverBench: boolean): void {
    if (this.mode === 'idle') return;
    this.hoverSlotId = slotId && this.isValidPlayerSlot(slotId) ? slotId : null;
    this.hoverBench = isOverBench;
  }

  commitDrop(targetSlotId: string | null, isOverBench: boolean): DropOutcome {
    if (this.mode === 'idle' || !this.draggedUnitId) {
      return { type: 'rejected', reason: 'not dragging' };
    }

    const unitId = this.draggedUnitId;
    const currentMode = this.mode;
    const sourceSlot = this.sourceSlotId;

    // Reset drag state before applying change
    this.cancelDrag();

    // 1. Dropped on bench / tray
    if (isOverBench) {
      if (currentMode === 'draggingDeployedUnit' && sourceSlot) {
        this.formation.unplace(unitId);
        return { type: 'returnedToBench', unitId, fromSlotId: sourceSlot };
      }
      return { type: 'cancelled', unitId };
    }

    // 2. Dropped on a valid player board slot
    if (targetSlotId && this.isValidPlayerSlot(targetSlotId)) {
      const targetSlot = this.formation.getSlot(targetSlotId);
      if (!targetSlot) return { type: 'cancelled', unitId };

      // Empty destination slot
      if (targetSlot.unitId === null) {
        if (currentMode === 'draggingFromTray') {
          const success = this.formation.place(unitId, targetSlotId);
          if (success) {
            this.hasEverDeployed = true;
            return { type: 'placed', unitId, slotId: targetSlotId };
          }
        } else if (currentMode === 'draggingDeployedUnit' && sourceSlot) {
          if (targetSlotId === sourceSlot) {
            return { type: 'cancelled', unitId };
          }
          const success = this.formation.place(unitId, targetSlotId);
          if (success) {
            return { type: 'moved', unitId, fromSlotId: sourceSlot, toSlotId: targetSlotId };
          }
        }
      } else {
        // Occupied destination slot: deterministic SWAP policy
        const occupantId = targetSlot.unitId;
        if (occupantId === unitId) {
          return { type: 'cancelled', unitId };
        }

        if (currentMode === 'draggingDeployedUnit' && sourceSlot) {
          const success = this.formation.swap(unitId, occupantId);
          if (success) {
            return {
              type: 'swapped',
              unitIdA: unitId,
              unitIdB: occupantId,
              slotA: sourceSlot,
              slotB: targetSlotId,
            };
          }
        } else if (currentMode === 'draggingFromTray') {
          // Dragged from tray onto occupied board slot: bench unit replaces board unit, board unit goes to bench
          const success = this.formation.swap(unitId, occupantId);
          if (success) {
            this.hasEverDeployed = true;
            return {
              type: 'benchSwap',
              unitIn: unitId,
              unitOut: occupantId,
              slotId: targetSlotId,
            };
          }
        }
      }
    }

    // Dropped outside or invalid target: return without change
    return { type: 'cancelled', unitId };
  }

  cancelDrag(): void {
    this.mode = 'idle';
    this.draggedUnitId = null;
    this.sourceSlotId = null;
    this.hoverSlotId = null;
    this.hoverBench = false;
  }

  selectUnit(unitId: string | null): void {
    if (this.selectedUnitId === unitId) {
      this.selectedUnitId = null;
    } else {
      this.selectedUnitId = unitId;
    }
  }

  clickSlot(slotId: string): DropOutcome {
    if (!this.isValidPlayerSlot(slotId)) {
      return { type: 'rejected', reason: 'invalid slot' };
    }

    const slot = this.formation.getSlot(slotId);
    if (!slot) return { type: 'rejected', reason: 'slot not found' };

    // If a unit is already selected, this click acts as a destination placement / swap
    if (this.selectedUnitId) {
      const selectedUnit = this.formation.getUnit(this.selectedUnitId);
      if (!selectedUnit) {
        this.selectedUnitId = null;
        return { type: 'cancelled', unitId: '' };
      }

      const unitId = this.selectedUnitId;
      this.selectedUnitId = null;

      // Empty slot
      if (slot.unitId === null) {
        const wasPlaced = selectedUnit.slotId !== null;
        const fromSlot = selectedUnit.slotId;
        const success = this.formation.place(unitId, slotId);
        if (success) {
          this.hasEverDeployed = true;
          if (wasPlaced && fromSlot) {
            return { type: 'moved', unitId, fromSlotId: fromSlot, toSlotId: slotId };
          }
          return { type: 'placed', unitId, slotId };
        }
      } else {
        // Occupied slot
        if (slot.unitId === unitId) {
          return { type: 'deselected' };
        }
        const occupantId = slot.unitId;
        const fromSlot = selectedUnit.slotId;
        const success = this.formation.swap(unitId, occupantId);
        if (success) {
          this.hasEverDeployed = true;
          if (fromSlot) {
            return { type: 'swapped', unitIdA: unitId, unitIdB: occupantId, slotA: fromSlot, slotB: slotId };
          }
          return { type: 'benchSwap', unitIn: unitId, unitOut: occupantId, slotId };
        }
      }
      return { type: 'cancelled', unitId };
    }

    // No unit currently selected: click selects occupant if present
    if (slot.unitId !== null) {
      this.selectedUnitId = slot.unitId;
      return { type: 'selected', unitId: slot.unitId };
    }

    return { type: 'none' };
  }

  clickBench(): DropOutcome {
    if (this.selectedUnitId) {
      const selectedUnit = this.formation.getUnit(this.selectedUnitId);
      const unitId = this.selectedUnitId;
      this.selectedUnitId = null;
      if (selectedUnit && selectedUnit.slotId !== null) {
        const fromSlot = selectedUnit.slotId;
        this.formation.unplace(unitId);
        return { type: 'returnedToBench', unitId, fromSlotId: fromSlot };
      }
      return { type: 'deselected' };
    }
    return { type: 'none' };
  }

  reset(): void {
    this.cancelDrag();
    this.selectedUnitId = null;
  }
}
