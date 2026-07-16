import { DivinityV5Core } from '../core/divinityv5-core';

export interface ComplianceNode {
  id: string;
  type: 'LOAD' | 'CARRIER' | 'ASSET';
  region: string;
  efti?: boolean;
  ulip?: boolean;
  afcfta?: boolean;
  customsCleared?: boolean;
  portProcessed?: boolean;
  score: number;
}

export class GlobalComplianceGraph extends DivinityV5Core {
  private nodes = new Map<string, ComplianceNode>();

  upsert(node: ComplianceNode) {
    this.nodes.set(node.id, node);
    this.log('GCG_UPSERT', node);
    return node;
  }

  get(id: string) {
    return this.nodes.get(id) || null;
  }

  evaluateLoad(loadId: string) {
    const node = this.nodes.get(loadId);
    if (!node) return null;
    const score =
      (node.efti ? 20 : 0) +
      (node.ulip ? 20 : 0) +
      (node.afcfta ? 20 : 0) +
      (node.customsCleared ? 20 : 0) +
      (node.portProcessed ? 20 : 0);
    node.score = score;
    this.log('GCG_EVAL', node);
    return node;
  }

  scoreCompliance(entityId: string, context: string) {
    const node = this.nodes.get(entityId);
    const score = node ? node.score : 90;
    this.log('GCG_SCORE', { entityId, context, score });
    return score;
  }

  listAll() {
    return Array.from(this.nodes.values());
  }
}
