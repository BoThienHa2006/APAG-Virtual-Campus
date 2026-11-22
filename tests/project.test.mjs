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
 assert.ok(s.includes('20261122-loader-repair-54'));
});
test('Javascript syntax is valid',()=>{
 const r=spawnSync(process.execPath,['--check',new URL('../main.js',import.meta.url).pathname],{encoding:'utf8'});
 assert.equal(r.status,0,r.stderr);
});
test('3D core features retained',async()=>{
 const s=await load('../main.js');
 for(const k of ['function minimap(', 'function blocked(', 'function interact(', 'panoramaScene', 'camera.position.lerp'])assert.ok(s.includes(k),k);
});

test('mobile 2D photos and joystick are wired',async()=>{
 const html=await load('../index.html'),js=await load('../main.js');
 for(const id of ['joystick','mode-toggle','photo-board','photo-gallery','photos-button','close-photos'])assert.ok(html.includes('id="'+id+'"'),id);
 for(const key of ['function updatePhotoBoard(', 'function openPhotos(', 'function setControlMode('])assert.ok(js.includes(key),key);
});

test('23-storey academy geometry replaces old red Hanoi center',async()=>{
 const js=await load('../main.js');const html=await load('../index.html');
 for(const key of ['function academyTower(', 'academyBlock(-6.1,-23.5,9.4,39,10.5,23,7)', 'academyTower();', 'if(item.id===campuses[0].id)', 'new THREE.CylinderGeometry(.065,.1,16,8)'])assert.ok(js.includes(key),key);
 assert.ok(html.includes('APAG VIRTUAL CAMPUS 5.4'));
});

test('mobile lite performance safeguards',async()=>{const s=await load('../main.js');for(const k of ['const liteMode=mobileDevice','renderer.shadowMap.enabled=!liteMode','if(liteMode&&timestamp-previousRender<31)return'])assert.ok(s.includes(k),k)});

test('startup reports failures and retries 3D sources',async()=>{const html=await load('../index.html'),js=await load('../main.js');for(const key of ['id="startup"','window.apagFail','startup-retry','apag-ready'])assert.ok(html.includes(key),key);for(const key of ['Promise.any(threeSources.map','unpkg.com/three','esm.sh/three','cdn.jsdelivr.net'])assert.ok(js.includes(key),key)});
