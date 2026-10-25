import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
const sharp=(await import(process.argv[2]||'sharp')).default;
const root=path.resolve(import.meta.dirname,'..');
for(const variant of ['dark','light'])await sharp(await readFile(path.join(root,`theme/assets/logo-${variant}.svg`))).resize(1260,300).png().toFile(path.join(root,`dist/forgeline-logo-${variant}.png`));
await sharp(await readFile(path.join(root,'theme/assets/mark.svg'))).resize(512,512).png().toFile(path.join(root,'dist/forgeline-mark.png'));
console.log('Rendered transparent PNG logo variants and square mark.');
