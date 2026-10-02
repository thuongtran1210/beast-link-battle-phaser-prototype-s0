import { RuleConfig } from '../config/RuleConfig';
export interface EnergyGauge { current:number; max:number; ready:boolean; }
export class EnergySystem { private current=0; get gauge():EnergyGauge{return {current:this.current,max:RuleConfig.energyMax,ready:this.current===RuleConfig.energyMax}} gainValidMatch():EnergyGauge{this.current=Math.min(RuleConfig.energyMax,this.current+RuleConfig.energyPerMatch);return this.gauge} cast():boolean{if(!this.gauge.ready)return false;this.current=0;return true} reset():void{this.current=0} }
