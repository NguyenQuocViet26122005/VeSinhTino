import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {commonPrices,factoryPrices,glassPrices,services} from '../src/data/site.ts';
const base=path.resolve('dist');
const pages=JSON.parse(await fs.readFile('src/data/source/pages.json','utf8'));
const all=[];async function walk(dir){for(const e of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())await walk(p);else if(e.name.endsWith('.html'))all.push(p);}}await walk(base);
const exists=async p=>{try{await fs.access(p);return true;}catch{return false;}};
for(const p of pages)assert(await exists(path.join(base,new URL(p.url).pathname,'index.html')),'Missing original route '+p.url);
let links=0,images=0;
for(const file of all){const html=await fs.readFile(file,'utf8');assert(!html.includes('\uFFFD'),'Encoding error '+file);assert.equal((html.match(/<h1[ >]/g)||[]).length,1,'Expected one h1 '+file);for(const m of html.matchAll(/(?:href|src)="(\/[^"#?]*)(?:[^\"]*)"/g)){let target=decodeURIComponent(m[1]);if(target.startsWith('//'))continue;const local=path.join(base,target);assert(await exists(local)||await exists(path.join(local,'index.html')),'Missing asset/link '+target+' in '+file);links++;}for(const m of html.matchAll(/<img\b[^>]*>/g)){assert(/\balt=/.test(m[0]),'Missing image alt '+file);images++;}}
const normalize=s=>s.toLowerCase().replaceAll('²','2').replace(/[–—]/g,'-').replace(/\s+/g,'');
const prices=[...commonPrices,...factoryPrices,...glassPrices];
for(const row of prices){const original=pages.find(p=>p.url===row.source);assert(original,'Missing source '+row.source);const source=normalize(original.text);assert(source.includes(normalize(row.price)),'Price does not occur in source '+row.name);assert(source.includes(normalize(row.unit)),'Unit does not occur in source '+row.name);}
const pricePage=await fs.readFile(path.join(base,'bang-gia/index.html'),'utf8');for(const row of prices)assert(pricePage.includes('>'+row.price+'</td>'),'Missing published price '+row.name);
for(const s of services){const html=await fs.readFile(path.join(base,s.slug,'index.html'),'utf8');for(const row of s.prices)assert(html.includes('>'+row.price+'</td>'),'Missing service price '+s.name);}
const report={passed:true,pages:all.length,preservedRoutes:pages.length,prices:prices.length,internalReferences:links,imageElements:images,checkedAt:new Date().toISOString()};await fs.mkdir('qa',{recursive:true});await fs.writeFile('qa/verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
