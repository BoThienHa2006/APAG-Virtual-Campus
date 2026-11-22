/* Load Three.js with independent CDN fallbacks. A failed CDN must not leave a blank screen. */
const threeSources=[
 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js',
 'https://unpkg.com/three@0.160.1/build/three.module.js',
 'https://esm.sh/three@0.160.1?bundle',
 'https://cdn.skypack.dev/three@0.160.1'
];
let THREE;
try{THREE=await Promise.any(threeSources.map(url=>import(url)))}catch(error){console.error('Three.js CDNs unavailable',error);throw new Error('Không tải được thư viện 3D từ các nguồn dự phòng. Kiểm tra mạng và thử tải lại trang.')}
const $=id=>document.getElementById(id);
const campuses=await fetch('./data/campuses.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Không tải được danh sách cơ sở (HTTP '+r.status+')');return r.json()});
const scene=new THREE.Scene();scene.background=new THREE.Color('#91c3e4');scene.fog=new THREE.Fog('#91c3e4',60,145);
const mobileDevice=matchMedia('(max-width:850px),(pointer:coarse)').matches;
const params=new URLSearchParams(location.search);
const liteMode=mobileDevice||params.has('lite');
const camera=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,.1,250);
const renderer=new THREE.WebGLRenderer({antialias:!liteMode,powerPreference:liteMode?'low-power':'high-performance',alpha:false,depth:true});
renderer.setPixelRatio(liteMode?Math.min(devicePixelRatio,.85):Math.min(devicePixelRatio,1.5));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=!liteMode;
renderer.outputColorSpace=THREE.SRGBColorSpace;
$('app').appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xe5f3ff,0x5d8461,2));const sun=new THREE.DirectionalLight(0xfff0d4,2.4);sun.position.set(-22,42,25);sun.castShadow=!liteMode;sun.shadow.mapSize.set(liteMode?512:1024,liteMode?512:1024);sun.shadow.camera.left=-60;sun.shadow.camera.right=60;sun.shadow.camera.top=60;sun.shadow.camera.bottom=-60;scene.add(sun);
const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.85});const grass=mat('#579669'),stone=mat('#e7e0d0'),glass=mat('#86b7d4'),trunk=mat('#795335'),gold=mat('#e7c16e');let meshes=[],colliders=[],points=[],active=campuses[0],near=null;
function add(geo,m,x,y,z){const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=!liteMode;o.receiveShadow=!liteMode;scene.add(o);meshes.push(o);return o}
function cube(w,h,d,m,x,y,z){return add(new THREE.BoxGeometry(w,h,d),m,x,y,z)}
function tree(x,z){add(new THREE.CylinderGeometry(.2,.32,3,9),trunk,x,1.5,z);add(new THREE.IcosahedronGeometry(1.6,1),mat('#2e8056'),x,3.8,z)}
function building(x,z,w,h,d,color){colliders.push({x,z,w,d});cube(w,h,d,mat(color),x,h/2,z);cube(w+.8,.55,d+.8,stone,x,h+.25,z);for(let y=2;y<h-1;y+=2.7)for(let xx=x-w/2+1.6;xx<x+w/2-1;xx+=2.6)cube(1.25,1.35,.1,glass,xx,y,z+d/2+.07);cube(2.4,3,.12,mat('#365976'),x,1.5,z+d/2+.15)}

/* 23-storey architectural concept in the 3D world (not a photographic 3D scan).
   Blue glass wings, twin stepped towers, illuminated bands, connecting atrium
   and mast follow the supplied 2020 architectural perspective. */
const facadeCache=new Map();
function facadeMaterial(floors=23,columns=7){
 const key=floors+'-'+columns;if(facadeCache.has(key))return facadeCache.get(key);
 const canvas=document.createElement('canvas');canvas.width=liteMode?256:512;canvas.height=liteMode?512:1024;
 const g=canvas.getContext('2d');if(liteMode)g.scale(.5,.5);g.fillStyle='#10263f';g.fillRect(0,0,512,1024);
 const floorHeight=1024/floors,windowWidth=512/columns;
 for(let row=0;row<floors;row++)for(let col=0;col<columns;col++){
  const px=col*windowWidth,py=row*floorHeight,lit=(row*17+col*13)%9<3;
  g.fillStyle='#0c1b32';g.fillRect(px+1,py+1,windowWidth-2,floorHeight-2);
  g.fillStyle=lit?'#f0d698':((row+col)%5===0?'#bddbf2':'#7fa9d3');
  g.fillRect(px+windowWidth*.17,py+floorHeight*.24,windowWidth*.67,floorHeight*.51);
  g.fillStyle='#2d638e';g.fillRect(px+windowWidth*.46,py+floorHeight*.24,2,floorHeight*.51);
 }
 g.strokeStyle='#294a6c';g.lineWidth=3;
 for(let i=0;i<=floors;i++){const y=i*floorHeight;g.beginPath();g.moveTo(0,y);g.lineTo(512,y);g.stroke()}
 const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
 const material=new THREE.MeshStandardMaterial({map:tex,roughness:.35,metalness:.38,emissive:'#16334f',emissiveIntensity:.28});
 facadeCache.set(key,material);return material;
}
function academyBlock(x,z,w,h,d,floors,cols){
 const wall=mat('#182943'),roof=mat('#d5d6df'),front=facadeMaterial(floors,cols);
 colliders.push({x,z,w,d});
 const materials=[front,front,roof,wall,front,front];
 const mesh=add(new THREE.BoxGeometry(w,h,d),materials,x,h/2,z);
 mesh.castShadow=true;
 cube(w+.15,.24,d+.15,mat('#27476e'),x,h+.11,z);
 return mesh;
}
function academyTower(){
 const blue=mat('#5ec7f2'),dark=mat('#153c69'),white=mat('#d9e7f0'),lobbyGlass=mat('#82d2f3');
 // Four offset masses echoing the 23-storey concept. The two main towers
 // dominate the silhouette and low blue-glass wings frame the entrance.
 academyBlock(-6.1,-23.5,9.4,39,10.5,23,7);
 academyBlock(6,-23.5,9.4,36,10.5,22,7);
 academyBlock(-16.4,-26.5,11.5,17,11.5,10,8);
 academyBlock(16.5,-27,10.4,14.5,11,9,7);
 // Central void, glazed bridge and vertical curtain-wall strips.
 cube(4.2,20,7,mat('#1e4f78'),0,26,-24);
 cube(4.5,18,.35,blue,0,30,-18.1);
 cube(4.1,10,.45,lobbyGlass,0,15,-18.04);
 const lattice=mat('#3a99c3');
 for(let y=19;y<39;y+=4.2){
  const bar=cube(4.3,.09,.12,lattice,0,y,-17.86);bar.rotation.z=Math.PI/4;
 }
 // Highlighted glazed wings with crossed structural facade.
 for(const x of [-16.4,16.5]){
  const w=x<0?9.7:8.8,frontZ=x<0?-20.67:-21.45;
  cube(w,10,.22,lobbyGlass,x,10,frontZ);
  for(let i=0;i<5;i++){const zz=frontZ+.17,xx=x-w/2+(i+.5)*w/5;
   const cross1=cube(.095,10,.12,dark,xx,10,zz);cross1.rotation.z=.38;
   const cross2=cube(.095,10,.12,dark,xx,10,zz);cross2.rotation.z=-.38;
  }
 }
 // Transparent-lit ground lobby and entrance canopy.
 colliders.push({x:0,z:-20,w:28,d:7});
 cube(31,4,6,dark,0,2,-18.5);
 cube(29,3.15,.19,lobbyGlass,0,1.7,-14.92);
 for(let x=-13.5;x<14;x+=2.35)cube(.11,3.2,.24,dark,x,1.7,-14.78);
 cube(33,.45,7,blue,0,4.3,-17.1);
 cube(4.4,3,.17,white,0,1.55,-14.65);
 cube(.13,3,.2,dark,0,1.55,-14.53);
 // Courtyard lights and slender illuminated mast.
 const mast=add(new THREE.CylinderGeometry(.065,.1,16,8),blue,0,49,-24);
 mast.castShadow=false;
 add(new THREE.SphereGeometry(.38,10,8),gold,0,57,-24);
 const mark=add(new THREE.TorusGeometry(1.05,.13,8,24),gold,0,32,-17.7);
 mark.rotation.x=0;
 for(let i=0;i<8;i++){const a=i*Math.PI/4;
  const spoke=cube(.1,.8,.1,gold,Math.sin(a)*1.5,32+Math.cos(a)*1.5,-17.63);
  spoke.rotation.z=-a;
 }
 for(const [x,z] of [[-21,-20],[21,-21],[-10,-18],[10,-18]]){
  add(new THREE.SphereGeometry(.13,8,8),gold,x,16,z);
 }
 // Low plaza planters and guiding pavement to the entrance.
 cube(31,.1,28,mat('#c8d4d9'),0,.025,0);
 for(const x of [-16,16]){
  cube(5,.6,2,stone,x,.3,5);
  tree(x,7);
 }
}

function portal(x,z,title,description){const ring=add(new THREE.TorusGeometry(1.25,.14,12,40),gold,x,1.65,z);points.push({x,z,title,description,ring})}
function reset(){for(const o of meshes){scene.remove(o);o.geometry.dispose();}meshes=[];colliders=[];points=[]}
function world(id){const item=campuses.find(c=>c.id===id)||campuses[0];active=item;reset();const ground=add(new THREE.PlaneGeometry(180,180),grass,0,-.08,0);ground.rotation.x=-Math.PI/2;cube(10,.08,82,mat('#aab6b9'),0,0,0);cube(75,.08,7,mat('#b8bec1'),0,.01,5);const palette=[item.color,'#d8c7ac','#e0d3c4','#c8bea6','#ddd0bc'];if(item.id===campuses[0].id){academyTower();if(!liteMode){building(-27,18,11,7,12,palette[3]);building(27,18,11,8,12,palette[4]);}}else{building(0,-23,25,12,11,palette[0]);building(-25,-13,13,8,13,palette[1]);building(25,-13,13,9,13,palette[2]);building(-25,24,15,7,13,palette[3]);building(25,24,15,8,13,palette[4]);}for(let z=-38;z<40;z+=(liteMode?16:8)){tree(-10,z);tree(10,z)}for(let x=-36;x<38;x+=(liteMode?16:8)){tree(x,-42);tree(x,42)}cube(3,4,1,stone,-5,2,40);cube(3,4,1,stone,5,2,40);cube(13,.8,1,mat(item.color),0,4,40);portal(0,11,'Điểm giới thiệu cơ sở','Thông tin địa điểm được xác minh từ website chính thức. Hình ảnh công trình vẫn đang mô phỏng.');portal(-24,6,'Khu giảng đường mô phỏng','Đây là vị trí minh họa cho khu học tập; chưa xác minh vị trí thực tế.');portal(24,6,'Khu sinh hoạt mô phỏng','Đây là vị trí minh họa cho khu sinh hoạt sinh viên.');portal(0,-10,item.id===campuses[0].id?'Tòa nhà trung tâm – phối cảnh 23 tầng':'Tòa nhà trung tâm mô phỏng',item.id===campuses[0].id?'Mô hình khối 3D mô phỏng theo phối cảnh kiến trúc năm 2020: hai tháp, mặt dựng kính xanh và cột đỉnh. Không phải mô hình khảo sát hiện trạng.':'Kiến trúc hiện tại chỉ phục vụ kiểm thử hệ thống 3D.');player.position.set(0,0,item.id===campuses[0].id?30:20);vertical=0;jump=0;yaw=0;pitch=.27;zoom=item.id===campuses[0].id?34:12;overview=false;camera.position.set(0,13,item.id===campuses[0].id?64:32);camera.lookAt(0,12,-23);near=null;held.clear();$('campus').value=id;$('where').textContent='📍 '+item.name+' · '+item.city;$('address').textContent=item.type+' · '+item.address;$('source').href=item.source;closeDialog();closeTour();if($('photo-gallery'))$('photo-gallery').hidden=true}
const player=new THREE.Group();scene.add(player);function body(g,m,x,y,z){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;player.add(o);return o}const uniform=mat('#173e73'),skin=mat('#eebc8d'),pants=mat('#26384f');body(new THREE.CapsuleGeometry(.42,.8,4,10),uniform,0,1.5,0);body(new THREE.SphereGeometry(.34,16,12),skin,0,2.42,0);body(new THREE.BoxGeometry(.32,.82,.34),pants,-.22,.45,0);body(new THREE.BoxGeometry(.32,.82,.34),pants,.22,.45,0);body(new THREE.BoxGeometry(.25,.8,.32),uniform,-.56,1.5,0);body(new THREE.BoxGeometry(.25,.8,.32),uniform,.56,1.5,0);
let yaw=0,pitch=.43,zoom=12,vertical=0,jump=0,overview=false;const pointers=new Map();let lastPinch=0;const held=new Set();const mapKeys={w:'forward',arrowup:'forward',s:'back',arrowdown:'back',a:'left',arrowleft:'left',d:'right',arrowright:'right',shift:'sprint',' ':'jump',e:'interact'};
function interact(){if(!near||!$('dialog').hidden||!$('tour').hidden)return;$('poi-title').textContent=near.title;$('poi-description').textContent=near.description+' Địa chỉ: '+active.address;$('open-tour').disabled=!active.panorama;$('open-tour').textContent=active.panorama?'Xem ảnh 360°':'Chưa có ảnh 360°';$('dialog').hidden=false;held.clear()}
function closeDialog(){$('dialog').hidden=true}function closeTour(){$('tour').hidden=true;if(renderer.domElement.parentElement!==$('app'))$('app').appendChild(renderer.domElement);if(panoramaMesh){panoramaScene.remove(panoramaMesh);panoramaMesh.geometry.dispose();panoramaMesh.material.map?.dispose();panoramaMesh.material.dispose();panoramaMesh=null}}
addEventListener('keydown',e=>{if(e.key==='Escape'){closeTour();closeDialog();return}if(document.activeElement?.tagName==='SELECT')return;const k=mapKeys[e.key.toLowerCase()];if(k){e.preventDefault();if(k==='jump'&&!e.repeat&&jump===0)vertical=8;if(k==='interact'&&!e.repeat)interact();held.add(k)}});addEventListener('keyup',e=>{const k=mapKeys[e.key.toLowerCase()];if(k)held.delete(k)});addEventListener('blur',()=>held.clear());for(const b of document.querySelectorAll('[data-k]')){const k=b.dataset.k;b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);if(k==='jump'&&jump===0)vertical=8;if(k==='interact')interact();held.add(k)});for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>held.delete(k))}
/* Virtual joystick with analog magnitude, multi-touch safe independent pointer */
const analog={x:0,y:0};const stick=$('joystick'),ring=stick.querySelector('.stick-ring'),knob=$('stick-knob');
let stickPointer=null;
function updateStick(clientX,clientY){
 const box=ring.getBoundingClientRect(),cx=box.left+box.width/2,cy=box.top+box.height/2;
 const radius=box.width*.32,dx=clientX-cx,dy=clientY-cy,length=Math.hypot(dx,dy),scale=length>radius?radius/length:1;
 const x=dx*scale,y=dy*scale;analog.x=Math.abs(x/radius)<.1?0:x/radius;analog.y=Math.abs(y/radius)<.1?0:y/radius;
 knob.style.transform='translate(calc(-50% + '+x+'px),calc(-50% + '+y+'px))';
}
function releaseStick(e){if(stickPointer===null||e.pointerId!==stickPointer)return;stickPointer=null;analog.x=0;analog.y=0;knob.style.transform='translate(-50%,-50%)'}
ring.addEventListener('pointerdown',e=>{e.preventDefault();if(stickPointer!==null)return;stickPointer=e.pointerId;ring.setPointerCapture(e.pointerId);updateStick(e.clientX,e.clientY)});
ring.addEventListener('pointermove',e=>{if(e.pointerId!==stickPointer)return;e.preventDefault();updateStick(e.clientX,e.clientY)});
for(const event of ['pointerup','pointercancel','lostpointercapture'])ring.addEventListener(event,releaseStick);
function setControlMode(mode){document.body.classList.toggle('mode-dpad',mode==='dpad');releaseJoystick();$('mode-toggle').textContent=mode==='dpad'?'✥ D-pad':'🎮 Joystick';try{localStorage.setItem('apag_control_mode',mode)}catch{}}
function releaseJoystick(){stickPointer=null;analog.x=0;analog.y=0;knob.style.transform='translate(-50%,-50%)'}
$('mode-toggle').onclick=()=>setControlMode(document.body.classList.contains('mode-dpad')?'joystick':'dpad');
$('side-toggle').onclick=()=>{document.body.classList.toggle('controls-flipped');try{localStorage.setItem('apag_control_side',document.body.classList.contains('controls-flipped')?'right':'left')}catch{}};
try{setControlMode(localStorage.getItem('apag_control_mode')||'joystick');if(localStorage.getItem('apag_control_side')==='right')document.body.classList.add('controls-flipped')}catch{setControlMode('joystick')}
addEventListener('blur',releaseJoystick);

renderer.domElement.style.touchAction='none';
const setZoom=value=>{overview=false;zoom=THREE.MathUtils.clamp(value,4,80)};
const adjustPitch=delta=>{overview=false;pitch=THREE.MathUtils.clamp(pitch+delta,-.18,1.35)};
renderer.domElement.addEventListener('pointerdown',e=>{renderer.domElement.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});lastPinch=0});
renderer.domElement.addEventListener('pointermove',e=>{
 if(!pointers.has(e.pointerId))return;
 const old=pointers.get(e.pointerId);const dx=e.clientX-old.x,dy=e.clientY-old.y;
 pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(pointers.size===1){overview=false;yaw-=dx*.006;adjustPitch(dy*.005)}
 else if(pointers.size===2){const [a,b]=[...pointers.values()];const dist=Math.hypot(a.x-b.x,a.y-b.y);if(lastPinch>0)setZoom(zoom*lastPinch/Math.max(1,dist));lastPinch=dist}
});
for(const ev of ['pointerup','pointercancel','lostpointercapture'])renderer.domElement.addEventListener(ev,e=>{pointers.delete(e.pointerId);lastPinch=0});
renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();setZoom(zoom+Math.sign(e.deltaY)*(zoom*.1))},{passive:false});
$('zoom-in').onclick=()=>setZoom(zoom*.8);
$('zoom-out').onclick=()=>setZoom(zoom*1.25);
$('pitch-up').onclick=()=>adjustPitch(.15);
$('pitch-down').onclick=()=>adjustPitch(-.15);
$('overview').onclick=()=>{closeDialog();closeTour();overview=!overview;if(overview)held.clear()};
$('campus').replaceChildren(...campuses.map(c=>{const o=document.createElement('option');o.value=c.id;o.textContent=c.name+' · '+c.city;return o}));$('travel').onclick=()=>world($('campus').value);$('collapse').onclick=()=>$('panel').classList.toggle('collapsed');$('close-dialog').onclick=closeDialog;$('close-tour').onclick=closeTour;
const panoramaScene=new THREE.Scene(),panoramaCamera=new THREE.PerspectiveCamera(75,innerWidth/innerHeight,.1,500);let panoramaMesh=null,panYaw=0,panPitch=0,panDrag=false,panX=0,panY=0;
$('open-tour').onclick=()=>{if(!active.panorama)return;const texture=new THREE.TextureLoader().load(active.panorama,undefined,undefined,()=>{alert('Không tải được ảnh 360°');closeTour()});texture.colorSpace=THREE.SRGBColorSpace;panoramaMesh=new THREE.Mesh(new THREE.SphereGeometry(100,48,32),new THREE.MeshBasicMaterial({map:texture,side:THREE.BackSide}));panoramaScene.add(panoramaMesh);$('tour').hidden=false;$('tour').appendChild(renderer.domElement);closeDialog()};$('tour').addEventListener('pointerdown',e=>{if(e.target.tagName==='BUTTON')return;panDrag=true;panX=e.clientX;panY=e.clientY});addEventListener('pointerup',()=>panDrag=false);$('tour').addEventListener('pointermove',e=>{if(!panDrag)return;panYaw+=(e.clientX-panX)*.004;panPitch=THREE.MathUtils.clamp(panPitch+(e.clientY-panY)*.004,-1.45,1.45);panX=e.clientX;panY=e.clientY});
$('home').onclick=()=>{closeDialog();closeTour();player.position.set(0,0,active.id===campuses[0].id?30:20);vertical=0;jump=0;yaw=0;pitch=.27;zoom=active.id===campuses[0].id?34:12;overview=false;camera.position.set(0,13,active.id===campuses[0].id?64:32);held.clear()};
/* Interactive 2D image board located near the main simulated building */
const photoBoard=$('photo-board'),photoGallery=$('photo-gallery');
const photoPoint=new THREE.Vector3(27,5,-8);
function openPhotos(){if(active!==campuses[0])return;closeDialog();held.clear();releaseJoystick();photoGallery.hidden=false;photoBoard.hidden=true}
function closePhotos(){photoGallery.hidden=true}
photoBoard.addEventListener('click',openPhotos);
photoBoard.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openPhotos()}});
$('close-photos').onclick=closePhotos;
$('photos-button').onclick=openPhotos;
addEventListener('keydown',e=>{if(e.key==='Escape')closePhotos()});
function updatePhotoBoard(){
 if(active!==campuses[0]||!photoGallery.hidden||!$('tour').hidden){photoBoard.hidden=true;return}
 const pos=photoPoint.clone().project(camera);
 if(pos.z<=-1||pos.z>=1||Math.abs(pos.x)>1.2||Math.abs(pos.y)>1.2){photoBoard.hidden=true;return}
 photoBoard.hidden=false;
 const dist=camera.position.distanceTo(photoPoint),size=THREE.MathUtils.clamp(470/Math.max(dist,4)*10,96,235);
 photoBoard.style.width=(innerWidth<700?Math.min(size,155):size)+'px';
 photoBoard.style.left=((pos.x+1)*.5*innerWidth)+'px';
 photoBoard.style.top=((-pos.y+1)*.5*innerHeight)+'px';
}
const mc=$('map').getContext('2d');function minimap(){mc.fillStyle='#3d704f';mc.fillRect(0,0,180,180);mc.fillStyle='#b5bfc2';mc.fillRect(82,0,16,180);mc.fillRect(0,80,180,14);mc.fillStyle='#d5c5ac';for(const c of colliders)mc.fillRect(90+(c.x-c.w/2)*1.8,90+(c.z-c.d/2)*1.8,c.w*1.8,c.d*1.8);mc.fillStyle='#f6cb71';for(const p of points){mc.beginPath();mc.arc(90+p.x*1.8,90+p.z*1.8,4,0,Math.PI*2);mc.fill()}mc.save();mc.translate(90+player.position.x*1.8,90+player.position.z*1.8);mc.rotate(-player.rotation.y);mc.fillStyle='#4ce1ff';mc.beginPath();mc.moveTo(0,-8);mc.lineTo(-6,7);mc.lineTo(6,7);mc.fill();mc.restore()}
function blocked(x,z){return colliders.some(c=>Math.abs(x-c.x)<c.w/2+.55&&Math.abs(z-c.z)<c.d/2+.55)}const clock=new THREE.Clock();let previousRender=0;function frame(timestamp=0){requestAnimationFrame(frame);if(liteMode&&timestamp-previousRender<31)return;previousRender=timestamp;const dt=Math.min(clock.getDelta(),.05);if(!$('tour').hidden){panoramaCamera.aspect=innerWidth/innerHeight;panoramaCamera.updateProjectionMatrix();panoramaCamera.lookAt(Math.sin(panYaw)*Math.cos(panPitch),-Math.sin(panPitch),-Math.cos(panYaw)*Math.cos(panPitch));renderer.render(panoramaScene,panoramaCamera);return}const paused=!$('dialog').hidden||overview;const dx=paused?0:THREE.MathUtils.clamp(Number(held.has('right'))-Number(held.has('left'))+analog.x,-1,1),dz=paused?0:THREE.MathUtils.clamp(Number(held.has('back'))-Number(held.has('forward'))+analog.y,-1,1);if(dx||dz){const l=Math.hypot(dx,dz),sx=dx/Math.max(1,l),sz=dz/Math.max(1,l),vx=Math.cos(yaw)*sx+Math.sin(yaw)*sz,vz=-Math.sin(yaw)*sx+Math.cos(yaw)*sz,speed=held.has('sprint')?11:6;const nx=THREE.MathUtils.clamp(player.position.x+vx*dt*speed,-40,40),nz=THREE.MathUtils.clamp(player.position.z+vz*dt*speed,-44,44);if(!blocked(nx,player.position.z))player.position.x=nx;if(!blocked(player.position.x,nz))player.position.z=nz;player.rotation.y=Math.atan2(-vx,-vz)}vertical-=20*dt;jump=Math.max(0,jump+vertical*dt);if(jump===0)vertical=0;player.position.y=jump;const focus=overview?new THREE.Vector3(0,active.id===campuses[0].id?17:4,active.id===campuses[0].id?-20:-5):player.position.clone().add(new THREE.Vector3(0,1.9,0));
const targetCam=overview?new THREE.Vector3(62,68,78):focus.clone().add(new THREE.Vector3(Math.sin(yaw)*Math.cos(pitch)*zoom,Math.sin(pitch)*zoom,Math.cos(yaw)*Math.cos(pitch)*zoom));
if(!overview){targetCam.y=Math.max(1.25,targetCam.y);for(let i=0;i<24&&blocked(targetCam.x,targetCam.z)&&targetCam.y<14;i++){targetCam.x=THREE.MathUtils.lerp(targetCam.x,focus.x,.16);targetCam.z=THREE.MathUtils.lerp(targetCam.z,focus.z,.16);targetCam.y=THREE.MathUtils.lerp(targetCam.y,focus.y+3,.16)}}
camera.position.lerp(targetCam,Math.min(1,dt*8));camera.lookAt(focus);updatePhotoBoard();for(const p of points)p.ring.rotation.y+=dt*.7;near=points.find(p=>Math.hypot(player.position.x-p.x,player.position.z-p.z)<2.8)||null;$('prompt').textContent=near?'ⓔ Nhấn E: '+near.title:'Đến gần vòng sáng rồi nhấn E';minimap();renderer.render(scene,camera)}
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});world(campuses[0].id);frame();document.dispatchEvent(new Event('apag-ready'));if(new URLSearchParams(location.search).has('photos'))openPhotos();