import { CAMP_DECOR, parseCamp, recordVillageStory, type CampState } from './CampState';
import type { VillageBlock, VillageCommandResult, VillageEvent, VillageProductionSnapshot } from './VillageActivity';
import { villageActivityStation, type VillageActivityKind } from './VillageCatalog';
import { rollVillageIncident } from './VillageIncidents';
import { gardenCycleSnapshot, type GardenCycleSnapshot } from './VillageGardenCycle';
import { carrierDuration, type GardenCarrier } from './VillageCarrier';
import { advanceProduction, advanceVillageLife, beginBoatSale, finishBoatSale, beginProduction, finishProduction, inventorySize, isProductionKind, productionBlock, reservedProductionSpace, VILLAGE_RECIPES, villageWorkRate, type ProductionKind } from './VillageEconomy';

export interface VillageStoragePort {
  save(state: CampState): boolean;
}

/** Owns production transactions and active-time checkpoints, without UI imports. */
export class VillageApplication {
  private checkpointSeconds = 0;
  private carrierRetry=0;
  private boatRetry=0;
  private readonly failures = new Map<ProductionKind, VillageBlock>();

  constructor(private readonly state: CampState, private readonly storage: VillageStoragePort, private readonly random = Math.random) {}

  production(kind: ProductionKind): VillageProductionSnapshot {
    const job = this.state.economy[kind];
    const recipe = VILLAGE_RECIPES[kind];
    const block = !this.state.residents.includes(recipe.worker)
      ? { code: 'no-worker' as const, message: 'Cần đón cư dân phụ trách từ chuyến thám hiểm' }
      : (job?.harvested||job?.readyOutput)
        ? {code:'waiting-pickup' as const,message:'Hàng tại trạm · Chờ Swiftwing lấy'}
      : job?.remaining === 0 && inventorySize(this.state) + reservedProductionSpace(this.state) > 100
        ? { code: 'storage-full' as const, message: 'Kho đầy · Sản phẩm đang chờ giao' }
        : productionBlock(this.state, kind) ?? this.failures.get(kind);
    return { kind, gardenStage:kind==='garden'?this.garden().stage:undefined, stationId: kind === 'anvil' ? 'forge' : kind, workerId: recipe.worker,
      jobId: job?.id, remaining: job?.remaining ?? 0, cost: job?.cost ?? 0,
      status: block ? 'blocked' : job ? job.remaining > 1e-6 ? 'working' : 'ready-output' : 'ready',
      block: block ? { ...block } : undefined };
  }

  begin(kind: ProductionKind): VillageCommandResult<number> {
    if(this.state.economy[kind]?.harvested||this.state.economy[kind]?.readyOutput)return {ok:false,block:{code:'waiting-pickup',message:'Hàng đang chờ lấy · Chưa làm lượt mới'}};
    const block = productionBlock(this.state, kind);
    if (block) return { ok: false, block };
    const candidate = parseCamp(this.state);
    beginProduction(candidate, kind);
    if (!this.persist(candidate)) return this.saveFailure(kind);
    const resumed = this.state.economy[kind] !== undefined;
    Object.assign(this.state, candidate);
    this.failures.delete(kind);
    return { ok: true, value: this.state.economy[kind]!.remaining, events: resumed ? [] : [{
      type: 'production-started', kind, stationId: kind === 'anvil' ? 'forge' : kind,
      workerId: VILLAGE_RECIPES[kind].worker, jobId: this.state.economy[kind]!.id,
    }] };
  }

  advance(kind: ProductionKind, seconds: number): void {
    advanceProduction(this.state, kind, seconds);
  }

  deliver(kind: ProductionKind): VillageCommandResult<void> {
    const c=this.carrier();if(c&&c.phase!=='return'&&(c.kind??'garden')===kind)return {ok:false,block:{code:'station-busy',message:'Swiftwing đã nhận kiện này'}};
    const candidate = parseCamp(this.state);
    const jobId = candidate.economy[kind]?.id;
    const quantity=kind==='garden'?(candidate.economy.garden?.quantity??3):VILLAGE_RECIPES[kind].quantity;
    if (!finishProduction(candidate, kind)) {
      const ready = this.state.economy[kind]?.remaining;
      return { ok: false, block: ready !== undefined && ready <= 1e-6
        ? { code: 'storage-full', message: 'Kho đầy · Sản phẩm đang chờ giao' }
        : { code: 'not-ready', message: 'Chưa có sản phẩm hoàn tất' } };
    }
    const recipe = VILLAGE_RECIPES[kind];
    const incident = rollVillageIncident(kind, candidate.economy.life.hungry.includes(recipe.worker), this.random());
    if (incident && !candidate.diary.includes(incident.diaryMeme)) candidate.diary.push(incident.diaryMeme);
    this.recordCompletion(candidate, kind);
    candidate.diary = candidate.diary.slice(-30);
    if (!this.persist(candidate)) return this.saveFailure(kind);
    Object.assign(this.state, candidate);
    this.failures.delete(kind);
    const event: VillageEvent = { type: 'production-delivered', kind,
      stationId: kind === 'anvil' ? 'forge' : kind, workerId: recipe.worker,
      jobId: jobId!, resource: recipe.output, quantity,
      incident: incident ? { ...incident, bonusReward: incident.bonusReward ? { ...incident.bonusReward } : undefined } : undefined };
    return { ok: true, value: undefined, events: [event] };
  }

  completeActivity(kind: VillageActivityKind): VillageCommandResult<void> {
    if(kind==='garden')return this.harvestGarden();
    if (isProductionKind(kind)) return this.stageOutput(kind);
    const candidate = parseCamp(this.state);
    const changed = this.recordCompletion(candidate, kind);
    if (changed && !this.persist(candidate)) return this.saveFailure();
    if (changed) Object.assign(this.state, candidate);
    return { ok: true, value: undefined, events: [{ type: 'activity-completed', kind }] };
  }

  garden(): GardenCycleSnapshot {
    const job=this.state.economy.garden;
    const snapshot=gardenCycleSnapshot(job?{jobId:job.id,remaining:job.remaining,totalSeconds:job.totalSeconds??30,quantity:job.quantity??3}:undefined);
    return snapshot.stage==='waiting-pickup'&&!job?.harvested?{...snapshot,stage:'harvesting'}:snapshot;
  }

  harvestGarden(): VillageCommandResult<void> {
    const candidate=parseCamp(this.state),job=candidate.economy.garden;
    if(!job||job.remaining>1e-6)return {ok:false,block:{code:'not-ready',message:'Cà rốt chưa thu hoạch được'}};
    if(job.harvested)return {ok:true,value:undefined,events:[]};
    job.remaining=0;job.harvested=true;
    if(!this.persist(candidate))return this.saveFailure('garden');
    Object.assign(this.state,candidate);this.failures.delete('garden');
    return {ok:true,value:undefined,events:[{type:'garden-harvested',jobId:job.id,quantity:job.quantity??3}]};
  }

  stageOutput(kind:ProductionKind):VillageCommandResult<void> {
    if(kind==='garden')return this.harvestGarden();
    const candidate=parseCamp(this.state),job=candidate.economy[kind];
    if(!job||job.remaining>1e-6)return {ok:false,block:{code:'not-ready',message:'Sản phẩm chưa làm xong'}};
    if(job.readyOutput)return {ok:true,value:undefined,events:[]};
    job.remaining=0;job.readyOutput=true;
    if(!this.persist(candidate))return this.saveFailure(kind);
    Object.assign(this.state,candidate);this.failures.delete(kind);
    return {ok:true,value:undefined,events:[{type:'production-staged',kind,jobId:job.id}]};
  }

  collectProduction(kind:ProductionKind):VillageCommandResult<void> {
    const job=this.state.economy[kind];
    if(!job?.harvested&&!job?.readyOutput)return {ok:false,block:{code:'not-ready',message:'Chưa có kiện chờ lấy'}};
    return this.deliver(kind);
  }
  collectGarden():VillageCommandResult<void> {return this.collectProduction('garden');}

  carrier():Readonly<GardenCarrier>|undefined {const c=this.state.economy.carrier;return c?{...c}:undefined;}

  advanceBoat(seconds:number):{saved:boolean;revenue:number} {
    if(!Number.isFinite(seconds)||seconds<=0||!this.state.residents.includes('beast-d'))return {saved:true,revenue:0};
    if(this.boatRetry>0){this.boatRetry=Math.max(0,this.boatRetry-seconds);return {saved:true,revenue:0};}
    const candidate=parseCamp(this.state);let revenue=0,transaction=false;
    if(!candidate.economy.boatSale){if(!beginBoatSale(candidate))return {saved:true,revenue:0};transaction=true;}
    else {candidate.economy.boatSale.remaining=Math.max(0,candidate.economy.boatSale.remaining-seconds);if(candidate.economy.boatSale.remaining===0){revenue=finishBoatSale(candidate);transaction=true;}}
    if(transaction&&!this.persist(candidate)){this.boatRetry=1;return {saved:false,revenue:0};}
    Object.assign(this.state,candidate);return {saved:true,revenue};
  }

  advanceCarrier(seconds:number):{saved:boolean;delivered:number;kind?:ProductionKind} {
    if(!Number.isFinite(seconds)||seconds<=0||!this.state.residents.includes('beast-f'))return {saved:true,delivered:0};
    if(this.carrierRetry>0){this.carrierRetry=Math.max(0,this.carrierRetry-seconds);return {saved:true,delivered:0};}
    const current=this.state.economy.carrier;
    const ready=(['garden','fishing','anvil'] as ProductionKind[]).filter(k=>this.state.economy[k]?.harvested||this.state.economy[k]?.readyOutput).sort((a,b)=>this.state.economy[a]!.id-this.state.economy[b]!.id);
    if(!current&&!ready.length)return {saved:true,delivered:0};
    const kind=current?.kind??(current?'garden':ready[0]),job=this.state.economy[kind];
    const candidate=parseCamp(this.state);
    let carrier=candidate.economy.carrier;
    if(!carrier){carrier={jobId:job!.id,kind,phase:'approach',elapsed:0,picked:false,placed:false};candidate.economy.carrier=carrier;}
    let delivered=0,transaction=!current;
    const duration=carrierDuration(carrier.phase,carrier.kind);
    carrier.elapsed=Math.min(duration,carrier.elapsed+seconds);
    if(carrier.phase==='pickup'&&!carrier.picked&&carrier.elapsed>=.375){carrier.picked=true;transaction=true;}
    if(carrier.phase==='place'&&!carrier.placed&&carrier.elapsed>=.5){carrier.placed=true;transaction=true;}
    if(carrier.elapsed>=duration-1e-8){
      transaction=true;
      if(carrier.phase==='return')delete candidate.economy.carrier;
      else if(carrier.phase==='place'){
        const batch=candidate.economy[kind];
        if(!batch||batch.id!==carrier.jobId||(!batch.harvested&&!batch.readyOutput)||!finishProduction(candidate,kind)){this.carrierRetry=1;return {saved:false,delivered:0};}
        delivered=kind==='garden'?(batch.quantity??3):VILLAGE_RECIPES[kind].quantity;this.recordCompletion(candidate,kind);if(kind!=='garden'){const incident=rollVillageIncident(kind,candidate.economy.life.hungry.includes(VILLAGE_RECIPES[kind].worker),this.random());if(incident&&!candidate.diary.includes(incident.diaryMeme))candidate.diary.push(incident.diaryMeme);candidate.diary=candidate.diary.slice(-30);}carrier.phase='return';carrier.elapsed=0;
      }else{carrier.phase=carrier.phase==='approach'?'pickup':carrier.phase==='pickup'?'carry':'place';carrier.elapsed=0;}
    }
    if(transaction&&!this.persist(candidate)){this.carrierRetry=1;return {saved:false,delivered:0};}
    Object.assign(this.state,candidate);
    return {saved:true,delivered,kind};
  }

  private recordCompletion(candidate: CampState, kind: VillageActivityKind): boolean {
    const station = villageActivityStation(kind);
    const storyId = station === 'forge' ? 'forge.toy-duck' : station === 'garden' ? 'garden.carrot-bite' : station === 'fishing' ? 'fishing.old-boot' : undefined;
    let changed = storyId ? recordVillageStory(candidate, storyId) : false;
    const decor = CAMP_DECOR.find(d => d.id === kind);
    if (decor && !candidate.diary.includes(decor.meme)) {
      candidate.diary.push(decor.meme);
      candidate.diary = candidate.diary.slice(-30);
      changed = true;
    }
    return changed;
  }

  workRate(residentId: string): number {
    return villageWorkRate(this.state, residentId);
  }

  advanceLife(seconds: number): { readonly days: number; readonly saved: boolean } {
    if (!Number.isFinite(seconds) || seconds <= 0) return { days: 0, saved: true };
    const days = advanceVillageLife(this.state, this.state.residents, seconds);
    this.checkpointSeconds += seconds;
    const saved = this.checkpointSeconds < 1 || this.checkpoint();
    return { days, saved };
  }

  checkpoint(): boolean {
    const saved = this.persist(this.state);
    // Failed storage retries on the next checkpoint, never on every RAF tick.
    this.checkpointSeconds = 0;
    return saved;
  }

  private persist(candidate: CampState): boolean {
    try { return this.storage.save(candidate); }
    catch { return false; }
  }

  private saveFailure(kind?: ProductionKind): VillageCommandResult<never> {
    const block: VillageBlock = { code: 'persistence-failed', message: 'Chưa lưu được sinh hoạt làng' };
    if (kind) this.failures.set(kind, block);
    return { ok: false, block };
  }
}
