import Phaser from "phaser";
export function makeArt(scene:Phaser.Scene){
 const g=scene.add.graphics();
 const make=(key:string,w:number,h:number,draw:(g:Phaser.GameObjects.Graphics)=>void)=>{
  g.clear();draw(g);g.generateTexture(key,w,h);
 };
 make("king",64,80,g=>{g.fillStyle(0x6b3826);g.fillRect(23,7,18,18);g.fillStyle(0xf1c59b);g.fillCircle(32,20,11);g.fillStyle(0xd6b33f);g.fillRect(18,5,28,7);g.fillStyle(0x244a74);g.fillRect(19,31,27,37);g.fillStyle(0x8c2d2d);g.fillRect(25,39,15,26);g.fillStyle(0xe0d8c8);g.fillRect(12,35,9,28);g.fillRect(43,35,9,28);g.fillStyle(0x3a2a20);g.fillRect(22,66,9,14);g.fillRect(34,66,9,14)});
 make("farmer",52,72,g=>{g.fillStyle(0xc78c3b);g.fillRect(10,5,32,6);g.fillStyle(0xe7b58d);g.fillCircle(26,19,9);g.fillStyle(0x6b4a2e);g.fillRect(14,30,24,28);g.fillStyle(0x4b6d36);g.fillRect(12,34,7,20);g.fillRect(33,34,7,20);g.fillStyle(0x3b2a21);g.fillRect(17,56,8,16);g.fillRect(28,56,8,16)});
 make("guard",56,78,g=>{g.fillStyle(0x2d3440);g.fillRect(18,7,20,20);g.fillStyle(0xd8b08d);g.fillCircle(28,20,9);g.fillStyle(0xc4cbd0);g.fillRect(13,29,30,36);g.fillStyle(0x6c7b87);g.fillRect(6,33,10,27);g.fillStyle(0x8b6a43);g.fillRect(41,30,6,43);g.fillStyle(0xddd7c9);g.fillRect(12,63,12,15);g.fillRect(31,63,12,15)});
 make("enemy",54,72,g=>{g.fillStyle(0x241f2a);g.fillCircle(27,18,12);g.fillStyle(0x6b2635);g.fillTriangle(17,11,21,0,25,12);g.fillTriangle(30,12,34,0,38,11);g.fillStyle(0x111018);g.fillRect(14,29,27,31);g.fillStyle(0xa02d35);g.fillRect(18,35,19,6);g.fillStyle(0x15141c);g.fillRect(10,59,13,13);g.fillRect(31,59,13,13)});
 make("coin",24,24,g=>{g.fillStyle(0xf3c74d);g.fillCircle(12,12,10);g.lineStyle(2,0x8c6115);g.strokeCircle(12,12,8);g.fillStyle(0xffe69a);g.fillRect(9,5,3,12)});
 make("castle",150,150,g=>{g.fillStyle(0x75685d);g.fillRect(16,30,38,120);g.fillRect(96,30,38,120);g.fillStyle(0x4b2e24);g.fillTriangle(15,30,35,4,55,30);g.fillTriangle(95,30,115,4,135,30);g.fillStyle(0x4c3f37);g.fillRect(30,55,90,95);g.fillStyle(0x8d7d6e);g.fillRect(54,70,42,80);g.fillStyle(0x251b19);g.fillRect(68,112,14,38);g.fillStyle(0xd0a63e);g.fillRect(69,18,4,22)});
 make("farm",120,90,g=>{g.fillStyle(0x6f432b);g.fillRect(8,38,104,52);g.fillStyle(0x8d3e2c);g.fillTriangle(4,40,60,6,116,40);g.fillStyle(0x4d2e22);g.fillRect(47,57,26,33);g.fillStyle(0x6e9a43);for(let i=0;i<6;i++)g.fillRect(13+i*17,48,3,28)});
 make("gate",120,100,g=>{g.fillStyle(0x7b7369);g.fillRect(8,8,25,92);g.fillRect(87,8,25,92);g.fillStyle(0x4e4945);g.fillRect(28,25,64,75);g.fillStyle(0x3b2b24);g.fillRect(41,44,38,56);g.fillStyle(0xa57b38);g.fillRect(52,17,15,8)});
 g.destroy();
}