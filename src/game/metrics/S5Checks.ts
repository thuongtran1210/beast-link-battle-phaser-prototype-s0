import { SessionMetrics } from './SessionMetrics';
/** Historical metrics regression: sessions remain resettable without retaining obsolete P0 summary fields. */
export function runS5Checks():void{const m=new SessionMetrics();m.beastMatch();m.energyMatch();m.reset();if(m.snapshot.beastMatches!==0||m.snapshot.energyMatches!==0||m.snapshot.resultWinLose!==null)throw Error('S5 reset')}
