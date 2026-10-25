import {readFile,readdir,writeFile,mkdir} from 'node:fs/promises';
import {deflateRawSync,inflateRawSync} from 'node:zlib';
import path from 'node:path';
const table=new Uint32Array(256);
for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;table[n]=c>>>0;}
function crc32(bytes){let crc=0xffffffff;for(const byte of bytes)crc=table[(crc^byte)&255]^(crc>>>8);return (crc^0xffffffff)>>>0;}
export async function zipFiles(entries){
 if(entries.length>65535)throw new Error('ZIP64 is required for this file count.');
 const chunks=[],central=[];let offset=0;
 for(const entry of entries){
  const name=Buffer.from(entry.name.replaceAll('\\','/'));
  const bytes=entry.bytes?Buffer.from(entry.bytes):await readFile(entry.file);
  const compressed=deflateRawSync(bytes,{level:6});
  const method=compressed.length<bytes.length?8:0;
  const data=method?compressed:bytes;
  const crc=crc32(bytes);
  const header=Buffer.alloc(30);header.writeUInt32LE(0x04034b50);header.writeUInt16LE(20,4);header.writeUInt16LE(0x800,6);header.writeUInt16LE(method,8);header.writeUInt16LE(33,12);header.writeUInt32LE(crc,14);header.writeUInt32LE(data.length,18);header.writeUInt32LE(bytes.length,22);header.writeUInt16LE(name.length,26);
  chunks.push(header,name,data);
  const directory=Buffer.alloc(46);directory.writeUInt32LE(0x02014b50);directory.writeUInt16LE(20,4);directory.writeUInt16LE(20,6);directory.writeUInt16LE(0x800,8);directory.writeUInt16LE(method,10);directory.writeUInt16LE(33,14);directory.writeUInt32LE(crc,16);directory.writeUInt32LE(data.length,20);directory.writeUInt32LE(bytes.length,24);directory.writeUInt16LE(name.length,28);directory.writeUInt32LE(offset,42);central.push(directory,name);
  offset+=header.length+name.length+data.length;
  if(offset>0xffffffff)throw new Error('ZIP64 is required for this archive size.');
 }
 const centralSize=central.reduce((sum,b)=>sum+b.length,0),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(entries.length,8);end.writeUInt16LE(entries.length,10);end.writeUInt32LE(centralSize,12);end.writeUInt32LE(offset,16);
 return Buffer.concat([...chunks,...central,end]);
}
export async function directoryEntries(dir,prefix='',exclude=()=>false){
 const files=[];
 for(const entry of await readdir(dir,{withFileTypes:true})){
  const file=path.join(dir,entry.name),name=path.posix.join(prefix,entry.name);
  if(exclude(entry.name,name))continue;
  if(entry.isDirectory())files.push(...await directoryEntries(file,name,exclude));
  else files.push({name,file});
 }
 return files;
}
export async function extractSnapshot(archive,destination){
 const bytes=await readFile(archive);let end=bytes.length-22;
 while(end>=0&&bytes.readUInt32LE(end)!==0x06054b50)end--;
 if(end<0)throw new Error('ZIP end record missing.');
 const count=bytes.readUInt16LE(end+10);let pointer=bytes.readUInt32LE(end+16);
 for(let n=0;n<count;n++){
  if(bytes.readUInt32LE(pointer)!==0x02014b50)throw new Error('Invalid central directory.');
  const method=bytes.readUInt16LE(pointer+10),crc=bytes.readUInt32LE(pointer+16),compressedSize=bytes.readUInt32LE(pointer+20),size=bytes.readUInt32LE(pointer+24),nameLength=bytes.readUInt16LE(pointer+28),extraLength=bytes.readUInt16LE(pointer+30),commentLength=bytes.readUInt16LE(pointer+32),localOffset=bytes.readUInt32LE(pointer+42);
  const name=bytes.subarray(pointer+46,pointer+46+nameLength).toString('utf8').replace(/^\/+/, '');pointer+=46+nameLength+extraLength+commentLength;
  if(!name.startsWith('wordpress/')||name.endsWith('/'))continue;
  const target=path.resolve(destination,name.slice('wordpress/'.length));
  if(!target.startsWith(path.resolve(destination)+path.sep))throw new Error('Unsafe ZIP path.');
  const start=localOffset+30+bytes.readUInt16LE(localOffset+26)+bytes.readUInt16LE(localOffset+28);
  const compressed=bytes.subarray(start,start+compressedSize);
  const content=method===0?compressed:method===8?inflateRawSync(compressed):null;
  if(!content||content.length!==size||crc32(content)!==crc)throw new Error('Invalid ZIP entry: '+name);
  await mkdir(path.dirname(target),{recursive:true});await writeFile(target,content);
 }
 return count;
}
