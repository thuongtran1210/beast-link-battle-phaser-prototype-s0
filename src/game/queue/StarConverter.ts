import { RuleConfig } from '../config/RuleConfig';

export interface DeployedUnit { contentId: string; star: 1 | 2 | 3; instanceId?: string; }
export class StarConverter {
  /** Recruitment deliberately creates separate 1-star bodies; consolidation is a later roster choice. */
  recruit(contentId: string, count: number): DeployedUnit[] {
    return Array.from({ length: Math.max(0, count) }, () => ({ contentId, star: 1 as const }));
  }

  /** Historical conversion helper retained for pre-V14B.3 deterministic regressions. */
  highestAffordable(count: number): { cost: number; star: 1 | 2 | 3 } | null {
    if (count >= RuleConfig.starCosts.star3) return { cost: RuleConfig.starCosts.star3, star: 3 };
    if (count >= RuleConfig.starCosts.star2) return { cost: RuleConfig.starCosts.star2, star: 2 };
    if (count >= RuleConfig.starCosts.star1) return { cost: RuleConfig.starCosts.star1, star: 1 };
    return null;
  }
  bulk(contentId: string, count: number): DeployedUnit[] {
    const units: DeployedUnit[] = [];
    let remaining = count;
    while (true) { const next = this.highestAffordable(remaining); if (!next) return units; units.push({ contentId, star: next.star }); remaining -= next.cost; }
  }
}
