import {mkdir,readFile,writeFile,cp,readdir,stat} from 'node:fs/promises';
import path from 'node:path';
import {ZipWriter,ZipReader,Uint8ArrayWriter,Uint8ArrayReader} from '@zip.js/zip.js';
import {site} from './content.mjs';
const root=path.resolve(import.meta.dirname,'..');
export async function zipDirectory(source,prefix=''){
 const writer=new ZipWriter(new Uint8ArrayWriter(),{useWebWorkers:false});
 async function walk(dir,relative=''){for(const entry of await readdir(dir,{withFileTypes:true})){const rel=path.posix.join(relative,entry.name);const file=path.join(dir,entry.name);if(entry.isDirectory())await walk(file,rel);else await writer.add(path.posix.join(prefix,rel),new Uint8ArrayReader(new Uint8Array(await readFile(file))));}}
 await walk(source);return writer.close();
}
await mkdir(path.join(root,'dist'),{recursive:true});
await mkdir(path.join(root,'plugin/seed/assets'),{recursive:true});
await cp(path.join(root,'assets'),path.join(root,'plugin/seed/assets'),{recursive:true});
await writeFile(path.join(root,'plugin/seed/content.json'),JSON.stringify(site,null,2));
await writeFile(path.join(root,'dist/source-content.json'),JSON.stringify(site,null,2));
// Actual importable Elementor JSON files are exported from the saved database
// by export.mjs after the site has been built and verified.
// Original identity: an abstract F cut from three steel flanges.
for(const [variant,ink] of [['dark','#171c1e'],['light','#ffffff']]){
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="420" height="100" viewBox="0 0 420 100" role="img" aria-label="ForgeLine Steel"><g fill="#f17432"><path d="M5 8h70L63 27H22z"/><path d="M16 39h45L49 58H5z"/><path d="M5 68h28L20 92H5z"/></g><g fill="${ink}" font-family="Arial, sans-serif"><text x="91" y="54" font-size="42" font-weight="800" letter-spacing="-2">FORGELINE</text><text x="94" y="81" font-size="15" font-weight="600" letter-spacing="10">STEEL</text></g></svg>`;
 await writeFile(path.join(root,`theme/assets/logo-${variant}.svg`),svg);
}
await writeFile(path.join(root,'theme/assets/mark.svg'),'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#171c1e"/><g fill="#f17432"><path d="M18 14h67L73 32H35z"/><path d="M27 43h44L59 61H16z"/><path d="M16 71h27L31 91H16z"/></g></svg>');
const original=!!(await stat(path.join(root,'original-package/hubsteel.zip')).catch(()=>null));
const parent=await readFile(path.join(root,original?'original-package/hubsteel.zip':'../Hubsteel_FullPackage/Theme Install/hubsteel.zip'));
const reader=new ZipReader(new Uint8ArrayReader(new Uint8Array(parent)));
const entries=await reader.getEntries();
for(const [source,target] of [['hubsteel/assets/fonts/satoshi/Satoshi-Regular.woff2','satoshi-regular.woff2'],['hubsteel/assets/fonts/satoshi/Satoshi-Bold.woff2','satoshi-bold.woff2'],['hubsteel/assets/fonts/clashgrotesk/ClashGrotesk-Semibold.woff2','clash-semibold.woff2']]){
 const entry=entries.find(e=>e.filename===source);if(!entry)throw new Error(`Missing bundled font: ${source}`);
 await writeFile(path.join(root,'theme/assets',target),await entry.getData(new Uint8ArrayWriter()));
}
await reader.close();
await writeFile(path.join(root,'dist/forgeline-steel-child.zip'),await zipDirectory(path.join(root,'theme'),'forgeline-steel'));
await writeFile(path.join(root,'dist/forgeline-site-tools.zip'),await zipDirectory(path.join(root,'plugin'),'forgeline-site'));
await cp(path.join(root,'theme/assets/logo-dark.svg'),path.join(root,'dist/forgeline-logo-dark.svg'));
await cp(path.join(root,'theme/assets/logo-light.svg'),path.join(root,'dist/forgeline-logo-light.svg'));
console.log(`Built ${site.pages.length} editable pages, ${site.templates.length} shared templates, child theme, site-tools plugin, and SVG identity.`);
