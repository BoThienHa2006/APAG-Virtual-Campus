import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
const load=p=>readFile(new URL(p,import.meta.url),'utf8');
test('seven verified-source campus records',async()=>{
 const data=JSON.parse(await load('../data/campuses.json'));
 assert.equal(data.length,7);assert.equal(new Set(data.map(x=>x.id)).size,7);
 for(const c of data){assert.ok(c.name&&c.address&&c.city&&c.type);assert.match(c.source,/^https:\/\/apag\.edu\.vn\//)}
});
test('website has controls and module paths',async()=>{
 const s=await load('../index.html');
 for(const id of ['app','campus','travel','map','dialog','tour','open-tour','close-tour'])assert.ok(s.includes('id="'+id+'"'),id);
 assert.ok(s.includes('src="./main.js"'));
});
test('Javascript syntax is valid',()=>{
 const r=spawnSync(process.execPath,['--check',new URL('../main.js',import.meta.url).pathname],{encoding:'utf8'});
 assert.equal(r.status,0,r.stderr);
});
test('3D core features retained',async()=>{
 const s=await load('../main.js');
 for(const k of ['function minimap(', 'function blocked(', 'function interact(', 'panoramaScene', 'camera.position.lerp'])assert.ok(s.includes(k),k);
});
