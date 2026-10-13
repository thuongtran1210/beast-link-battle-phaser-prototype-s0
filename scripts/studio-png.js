import {inflateSync} from 'node:zlib';
function crc(bytes){let n=0xffffffff;for(const b of bytes){n^=b;for(let i=0;i<8;i++)n=(n>>>1)^((n&1)?0xedb88320:0);}return (n^0xffffffff)>>>0;}
/** Validate PNG dimensions, chunks/checksums and bounded decoded scanlines before saving. */
export function validateStudioPng(data,width,height){
 if(typeof data!=='string'||!/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(data))throw Error('Chỉ nhận PNG.');
 const bytes=Buffer.from(data.split(',')[1],'base64');
 if(bytes.length<33||bytes.length>1500000||bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a'||bytes.subarray(12,16).toString()!=='IHDR'||bytes.readUInt32BE(16)!==width||bytes.readUInt32BE(20)!==height)throw Error(`PNG phải là ${width}×${height}, tối đa 1,5 MB.`);
 if(bytes[24]!==8||![2,6].includes(bytes[25])||bytes[26]!==0||bytes[27]!==0||bytes[28]!==0)throw Error('PNG cần 8-bit RGB/RGBA, không interlace.');
 let offset=8,ended=false;const compressed=[];
 while(offset<bytes.length){if(offset+12>bytes.length)throw Error('PNG thiếu chunk.');const length=bytes.readUInt32BE(offset),end=offset+12+length;if(end>bytes.length)throw Error('PNG bị cắt.');const type=bytes.subarray(offset+4,offset+8).toString('ascii');
  if(crc(bytes.subarray(offset+4,end-4))!==bytes.readUInt32BE(end-4))throw Error('PNG checksum không hợp lệ.');
  if(type==='IDAT')compressed.push(bytes.subarray(offset+8,end-4));
  if(type==='IEND'){if(length!==0||end!==bytes.length)throw Error('PNG IEND không hợp lệ.');ended=true;}
  offset=end;
 }
 if(!ended||!compressed.length)throw Error('PNG thiếu dữ liệu ảnh.');
 const stride=width*(bytes[25]===6?4:3)+1,expected=height*stride,decoded=inflateSync(Buffer.concat(compressed),{maxOutputLength:expected});
 if(decoded.length!==expected)throw Error('PNG scanline không hợp lệ.');for(let y=0;y<height;y++)if(decoded[y*stride]>4)throw Error('PNG filter không hợp lệ.');
 return bytes;
}
