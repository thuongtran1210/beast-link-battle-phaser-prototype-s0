import { vietnameseText } from './Vietnamese';
export function vietnameseChecks():void {
  const expect=(ok:boolean,label:string)=>{if(!ok)throw new Error(`Vietnamese: ${label}`);};
  expect(vietnameseText('SNOWGUARD')==='SNOWGUARD','proper names do not match partial skill labels');
  expect(vietnameseText('WAVE 2 / 3')==='ĐỢT 2 / 3','dynamic wave counter');
  expect(vietnameseText('Choose 2 more Beasts')==='Chọn thêm 2 thú','dynamic deck instruction');
  expect(vietnameseText('GUARD · Shield frontline')==='KHIÊN · Khiên tiền tuyến','skill and effect');
  expect(vietnameseText('beast-a energy-e')==='beast-a energy-e','runtime identifiers untouched');
  const once=vietnameseText('Play');expect(vietnameseText(once)===once,'DOM observer translation is idempotent');
  expect(vietnameseText('Craft · 15 wood')==='Chế tạo · 15 Gỗ','craft cost');
}
