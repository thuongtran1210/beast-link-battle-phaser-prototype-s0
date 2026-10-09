import { createPlayerBattleLayout, playerSlotPosition } from '../BattleFieldLayout';
/** Setup markers share the exact Battle spawn anchors. */
export function mobileSetupSlot(row: 'Front' | 'Mid' | 'Back', lane: number, viewportWidth = 1280) {
  return {...playerSlotPosition(createPlayerBattleLayout(viewportWidth,720,true),row,lane),width:92,height:48};
}
