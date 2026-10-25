import { mkdir, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const files = [
 ['vendor/elementor.zip','https://downloads.wordpress.org/plugin/elementor.latest-stable.zip'],
 ['vendor/redux-framework.zip','https://downloads.wordpress.org/plugin/redux-framework.latest-stable.zip'],
 ['assets/welding-hero.jpg','https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1920&q=82'],
 ['assets/workshop.jpg','https://images.unsplash.com/photo-1455165814004-1126a7199f9b?auto=format&fit=crop&w=1200&q=80'],
 ['assets/fabrication.jpg','https://images.unsplash.com/photo-1598302936625-6075fbd98dd7?auto=format&fit=crop&w=1200&q=80'],
 ['assets/craft.jpg','https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1200&q=80'],
 ['assets/structure.jpg','https://images.unsplash.com/uploads/14123892966835548e7bd/14369636?auto=format&fit=crop&w=1400&q=80'],
 ['assets/framework.jpg','https://images.unsplash.com/photo-1509024368907-57294758cfc5?auto=format&fit=crop&w=1200&q=80'],
];
for (const [name,url] of files) {
 const target=path.join(root,name);
 if ((await stat(target).catch(()=>null))?.size > 1000) { console.log(`Already downloaded: ${name}`); continue; }
 await mkdir(path.dirname(target),{recursive:true});
 const response=await fetch(url,{signal:AbortSignal.timeout(120000)});
 if(!response.ok) throw new Error(`${name}: HTTP ${response.status}`);
 const bytes=Buffer.from(await response.arrayBuffer());
 await writeFile(target,bytes); console.log(`${name}: ${bytes.length} bytes`);
}
