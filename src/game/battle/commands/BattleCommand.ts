/**
 * Battle Command Protocol (Input DTOs).
 * All player or agent interventions into combat are encapsulated as typed,
 * serializable commands that can be timestamped by tick number.
 */

export type BattleCommandKind =
  | 'CastTacticalEnergy'
  | 'Surrender';

export interface BaseBattleCommand {
  type: BattleCommandKind;
  /** Simulation tick when command was issued */
  tick: number;
  /** Team issuing the command ('TeamA' or 'TeamB') */
  teamId?: string;
}

export interface CastTacticalEnergyCommand extends BaseBattleCommand {
  type: 'CastTacticalEnergy';
  energyId: string;
  targetEntityId?: string;
}

export interface SurrenderCommand extends BaseBattleCommand {
  type: 'Surrender';
}

export type BattleCommand = CastTacticalEnergyCommand | SurrenderCommand;

export function isCastTacticalEnergyCommand(
  cmd: BattleCommand,
): cmd is CastTacticalEnergyCommand {
  return cmd.type === 'CastTacticalEnergy';
}
