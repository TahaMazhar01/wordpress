import {readFile,writeFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {randomBytes} from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..');
export async function phpJob(code,name='task'){
 const file=path.join(root,'runtime',`${name}-${randomBytes(4).toString('hex')}.php-job`);
 await writeFile(file,code);
 const deadline=Date.now()+180000;
 while(Date.now()<deadline){
  const result=await stat(file+'.result.json').catch(()=>null);
  if(result){const response=JSON.parse(await readFile(file+'.result.json','utf8'));if(response.error||response.exitCode)throw new Error(response.error||response.errors||response.text);return response;}
  await new Promise(resolve=>setTimeout(resolve,250));
 }
 throw new Error('The local PHP task timed out. Ensure npm start is running.');
}
export {root};
