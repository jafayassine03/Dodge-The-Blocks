const game=document.getElementById("game");
const player=document.getElementById("player");
const startBtn=document.getElementById("startBtn");
const restartBtn=document.getElementById("restartBtn");
const menu=document.getElementById("menu");
const pauseMenu=document.getElementById("pause");
const gameOver=document.getElementById("gameOver");
const crosshair=document.getElementById("crosshair");

const healthText=document.getElementById("health");
const scoreText=document.getElementById("score");
const waveText=document.getElementById("wave");
const coinText=document.getElementById("coins");
const staminaText=document.getElementById("stamina");
const waveBanner=document.getElementById("waveText");
const finalScore=document.getElementById("finalScore");

let playerX=window.innerWidth/2;
let playerY=window.innerHeight/2;
let playerSize=40;

let health=5;
let score=0;
let wave=1;
let coins=0;
let stamina=100;

let running=false;
let paused=false;

let speed=4;
let sprintSpeed=7;

const keys={};

function updateHUD(){
healthText.textContent=health;
scoreText.textContent=score;
waveText.textContent=wave;
coinText.textContent=coins;
staminaText.textContent=Math.floor(stamina);
}

function updatePlayer(){
player.style.left=playerX+"px";
player.style.top=playerY+"px";
}

function showWave(text){
waveBanner.textContent=text;
waveBanner.style.opacity=1;
setTimeout(()=>{
waveBanner.style.opacity=0;
},1800);
}

document.addEventListener("keydown",e=>{
keys[e.key.toLowerCase()]=true;

if(e.key.toLowerCase()==="p"&&running){
paused=!paused;
pauseMenu.classList.toggle("hidden",!paused);
}
});

document.addEventListener("keyup",e=>{
keys[e.key.toLowerCase()]=false;
});

document.addEventListener("mousemove",e=>{
crosshair.style.left=e.clientX+"px";
crosshair.style.top=e.clientY+"px";
});

function movePlayer(){

if(paused||!running)return;

let currentSpeed=speed;

if((keys["shift"])&&stamina>0){
currentSpeed=sprintSpeed;
stamina-=0.8;
}else{
stamina+=0.4;
}

if(stamina<0)stamina=0;
if(stamina>100)stamina=100;

if(keys["w"]||keys["arrowup"])playerY-=currentSpeed;
if(keys["s"]||keys["arrowdown"])playerY+=currentSpeed;
if(keys["a"]||keys["arrowleft"])playerX-=currentSpeed;
if(keys["d"]||keys["arrowright"])playerX+=currentSpeed;

if(playerX<playerSize/2)playerX=playerSize/2;
if(playerY<playerSize/2)playerY=playerSize/2;
if(playerX>window.innerWidth-playerSize/2)playerX=window.innerWidth-playerSize/2;
if(playerY>window.innerHeight-playerSize/2)playerY=window.innerHeight-playerSize/2;

updatePlayer();
updateHUD();
}

function gameLoop(){

if(running&&!paused){
movePlayer();
}

requestAnimationFrame(gameLoop);
}

startBtn.onclick=()=>{
menu.classList.add("hidden");
running=true;
showWave("Wave 1");
};

restartBtn.onclick=()=>{
location.reload();
};

window.addEventListener("resize",()=>{
if(playerX>window.innerWidth-playerSize/2)playerX=window.innerWidth-playerSize/2;
if(playerY>window.innerHeight-playerSize/2)playerY=window.innerHeight-playerSize/2;
updatePlayer();
});

updateHUD();
updatePlayer();
gameLoop();
const zombies=[];
const bullets=[];
const coinsList=[];

function spawnZombie(){

if(!running)return;

const z=document.createElement("div");
z.className="zombie";

const type=Math.random();

let hp=1;
let speed=1.2;
let size=40;

if(type>.82){
z.classList.add("fast");
speed=2.4;
}

if(type>.94){
z.classList.remove("fast");
z.classList.add("tank");
hp=4;
speed=.7;
size=60;
}

let x,y;

if(Math.random()<.5){
x=Math.random()*window.innerWidth;
y=Math.random()<.5?-80:window.innerHeight+80;
}else{
x=Math.random()<.5?-80:window.innerWidth+80;
y=Math.random()*window.innerHeight;
}

z.style.width=size+"px";
z.style.height=size+"px";
z.style.left=x+"px";
z.style.top=y+"px";

game.appendChild(z);

zombies.push({
el:z,
x,
y,
size,
speed,
hp,
hit:0
});
}

function shoot(e){

if(!running||paused)return;

const b=document.createElement("div");
b.className="bullet";

const angle=Math.atan2(e.clientY-playerY,e.clientX-playerX);

game.appendChild(b);

bullets.push({
el:b,
x:playerX,
y:playerY,
dx:Math.cos(angle)*12,
dy:Math.sin(angle)*12
});
}

document.addEventListener("mousedown",shoot);

function moveBullets(){

for(let i=bullets.length-1;i>=0;i--){

const b=bullets[i];

b.x+=b.dx;
b.y+=b.dy;

b.el.style.left=b.x+"px";
b.el.style.top=b.y+"px";

if(
b.x<-50||
b.x>window.innerWidth+50||
b.y<-50||
b.y>window.innerHeight+50
){
b.el.remove();
bullets.splice(i,1);
}

}
}

function moveZombies(){

for(let i=zombies.length-1;i>=0;i--){

const z=zombies[i];

const angle=Math.atan2(playerY-z.y,playerX-z.x);

z.x+=Math.cos(angle)*z.speed;
z.y+=Math.sin(angle)*z.speed;

z.el.style.left=z.x+"px";
z.el.style.top=z.y+"px";

const dist=Math.hypot(playerX-z.x,playerY-z.y);

if(dist<(playerSize+z.size)/2&&Date.now()-z.hit>700){

z.hit=Date.now();

health--;

player.classList.add("damage");

setTimeout(()=>{
player.classList.remove("damage");
},250);

updateHUD();

if(health<=0){
running=false;
gameOver.classList.remove("hidden");
finalScore.textContent=score;
}

}

}

}

function checkHits(){

for(let i=bullets.length-1;i>=0;i--){

const b=bullets[i];

for(let j=zombies.length-1;j>=0;j--){

const z=zombies[j];

const d=Math.hypot(b.x-z.x,b.y-z.y);

if(d<(z.size/2)+5){

z.hp--;

b.el.remove();
bullets.splice(i,1);

if(z.hp<=0){

score+=10;
coins++;
updateHUD();

z.el.remove();
zombies.splice(j,1);

}

break;

}

}

}

}

setInterval(()=>{
if(running&&!paused){
spawnZombie();
}
},1400);
function updateCoins(){

for(let i=coinsList.length-1;i>=0;i--){

const c=coinsList[i];

const d=Math.hypot(playerX-c.x,playerY-c.y);

if(d<30){
coins++;
coinText.textContent=coins;
c.el.remove();
coinsList.splice(i,1);
}

}

}

function createParticles(x,y){

for(let i=0;i<10;i++){

const p=document.createElement("div");
p.className="particle";

game.appendChild(p);

let px=x;
let py=y;

const dx=(Math.random()-.5)*8;
const dy=(Math.random()-.5)*8;

p.style.left=px+"px";
p.style.top=py+"px";

let life=30;

const anim=setInterval(()=>{

px+=dx;
py+=dy;
life--;

p.style.left=px+"px";
p.style.top=py+"px";
p.style.opacity=life/30;

if(life<=0){
clearInterval(anim);
p.remove();
}

},16);

}

}

const oldCheckHits=checkHits;

checkHits=function(){

for(let i=bullets.length-1;i>=0;i--){

const b=bullets[i];

for(let j=zombies.length-1;j>=0;j--){

const z=zombies[j];

const d=Math.hypot(b.x-z.x,b.y-z.y);

if(d<(z.size/2)+5){

z.hp--;

b.el.remove();
bullets.splice(i,1);

if(z.hp<=0){

createParticles(z.x,z.y);

if(Math.random()<0.6){

const coin=document.createElement("div");
coin.className="coin";
coin.style.left=z.x+"px";
coin.style.top=z.y+"px";
game.appendChild(coin);

coinsList.push({
el:coin,
x:z.x,
y:z.y
});

}

score+=10;

if(score%100===0){
wave++;
waveText.textContent=wave;
showWave("Wave "+wave);
}

updateHUD();

z.el.remove();
zombies.splice(j,1);

}

break;

}

}

}

};

function updateGame(){

if(!running||paused){
requestAnimationFrame(updateGame);
return;
}

movePlayer();
moveBullets();
moveZombies();
checkHits();
updateCoins();

requestAnimationFrame(updateGame);

}

updateGame();