import Phaser from "phaser";

function rect(g:Phaser.GameObjects.Graphics,c:number,x:number,y:number,w:number,h:number){g.fillStyle(c,1);g.fillRect(x,y,w,h)}
function actor(scene:Phaser.Scene,key:string,colors:number[],frame:number,role:string){
 const g=scene.add.graphics();g.clear();const sway=frame%2?2:0;
 rect(g,0x000000,10+sway,51,22,27);rect(g,colors[2],14+sway,48,14,23);rect(g,colors[1],15+sway,26,18,24);
 g.fillStyle(colors[0],1);g.fillCircle(24+sway,18,10);
 rect(g,0x5a3b24,8+sway,6,32,7);
 if(role==="king"){rect(g,0xd8b43d,10+sway,3,28,5);rect(g,0x244a74,13+sway,31,22,19);rect(g,0xe8d6bd,7+sway,30,7,18);rect(g,0xe8d6bd,34+sway,30,7,18)}
 if(role==="guard"){rect(g,0x98a2aa,11+sway,25,26,28);rect(g,0x68737e,2+sway,29,9,25);rect(g,0xe6ddd0,35+sway,28,4,34)}
 if(role==="archer"){rect(g,0x5a3c29,11+sway,26,26,27);g.lineStyle(2,0xd5c28e);g.arc(39+sway,36,13,-1.1,1.1)}
 if(role==="farmer"){rect(g,0x6b4c2f,11+sway,26,26,27);rect(g,0x6d943c,16+sway,32,6,15)}
 g.generateTexture(key+"_"+frame,48,80);g.destroy();
}
export function makeArt(scene:Phaser.Scene){
 for(let i=0;i<4;i++){actor(scene,"king",[0xe9c39b,0xf0d4b5,0x3f2d24],i,"king");actor(scene,"farmer",[0xe4bc96,0x9a6b45,0x3f3028],i,"farmer");actor(scene,"guard",[0xe0bb98,0x303946,0x20242c],i,"guard");actor(scene,"archer",[0xe2bb95,0x6a5038,0x3b302a],i,"archer");actor(scene,"villager",[0xe4bd99,0x6c563a,0x403229],i,"villager")}
 const g=scene.add.graphics();
 const tex=(key:string,w:number,h:number,draw:(g:Phaser.GameObjects.Graphics)=>void)=>{g.clear();draw(g);g.generateTexture(key,w,h)};
 tex("enemy",54,76,g=>{g.fillStyle(0x15121b);g.fillTriangle(8,18,17,2,25,17);g.fillTriangle(28,17,38,2,46,19);g.fillEllipse(27,39,38,42);g.fillStyle(0x9b2c36);g.fillRect(17,31,20,5);g.fillStyle(0x2c2430);g.fillRect(12,57,13,18);g.fillRect(29,57,13,18)});
 tex("brute",76,82,g=>{g.fillStyle(0x2b202a);g.fillCircle(38,23,20);g.fillStyle(0x7b2935);g.fillRect(18,41,40,31);g.fillStyle(0x3a2a33);g.fillRect(10,50,10,28);g.fillRect(56,50,10,28);g.fillStyle(0xb04a48);g.fillRect(30,18,6,4);g.fillRect(46,18,6,4)});
 tex("horse",92,55,g=>{g.fillStyle(0x8c5738);g.fillEllipse(42,28,66,32);g.fillEllipse(71,12,25,26);g.fillTriangle(75,4,82,0,85,12);g.fillStyle(0x2f2521);g.fillRect(18,42,7,13);g.fillRect(65,42,7,13);g.fillRect(79,42,7,13)});
 tex("cow",96,54,g=>{g.fillStyle(0xe2d7be);g.fillEllipse(42,27,68,31);g.fillStyle(0x5a4235);g.fillCircle(24,22,8);g.fillCircle(50,18,9);g.fillEllipse(78,25,20,15);g.fillStyle(0x3a2d28);g.fillRect(19,42,7,12);g.fillRect(63,42,7,12)});
 tex("sheep",82,52,g=>{g.fillStyle(0xf0eadc);g.fillCircle(32,27,19);g.fillCircle(49,23,16);g.fillStyle(0x3b3432);g.fillCircle(65,25,8);g.fillRect(22,40,5,12);g.fillRect(49,40,5,12)});
 tex("deer",86,58,g=>{g.fillStyle(0x9d7147);g.fillEllipse(40,30,57,24);g.fillEllipse(65,18,18,24);g.fillStyle(0x5d432f);g.fillRect(21,43,5,15);g.fillRect(56,43,5,15);g.lineStyle(2,0x8a6a49);g.lineBetween(67,5,62,0);g.lineBetween(67,7,73,0)});
 tex("tree",86,120,g=>{g.fillStyle(0x593c26);g.fillRect(38,62,14,58);g.fillStyle(0x173b2e);g.fillCircle(29,53,29);g.fillStyle(0x225943);g.fillCircle(57,42,29);g.fillStyle(0x2e6d48);g.fillCircle(41,29,25);g.fillStyle(0x3e8452);g.fillCircle(19,44,18)});
 tex("rock",60,42,g=>{g.fillStyle(0x6e716f);g.fillTriangle(4,40,16,13,32,5);g.fillTriangle(32,5,54,14,58,40);g.fillStyle(0x969791);g.fillTriangle(13,32,29,11,40,18);});
 tex("coin",28,28,g=>{g.fillStyle(0xe4b83f);g.fillCircle(14,14,12);g.lineStyle(2,0x805d1a);g.strokeCircle(14,14,9);g.fillStyle(0xffe9a3);g.fillRect(11,7,4,14)});
 tex("castle1",180,170,g=>{g.fillStyle(0x6c625b);g.fillRect(18,35,45,135);g.fillRect(117,35,45,135);g.fillTriangle(10,35,40,6,71,35);g.fillTriangle(109,35,140,6,171,35);g.fillStyle(0x4b3e38);g.fillRect(45,70,90,100);g.fillStyle(0x8c8178);g.fillRect(62,85,56,85);g.fillStyle(0x281f1b);g.fillRect(82,129,17,41);g.fillStyle(0xd8b24a);g.fillRect(86,20,5,36)});
 tex("castle2",200,185,g=>{g.fillStyle(0x80756d);g.fillRect(12,28,50,157);g.fillRect(138,28,50,157);g.fillTriangle(8,29,37,2,67,29);g.fillTriangle(133,29,163,2,193,29);g.fillStyle(0x59504a);g.fillRect(50,58,100,127);g.fillStyle(0xa79c91);g.fillRect(66,73,68,112);g.fillStyle(0x2b211d);g.fillRect(91,139,18,46);g.fillStyle(0xdcc15e);g.fillRect(97,9,6,49);g.fillRect(54,38,92,6)});
 tex("farm",138,98,g=>{g.fillStyle(0x74462f);g.fillRect(7,39,124,59);g.fillStyle(0x974c35);g.fillTriangle(1,41,69,4,137,41);g.fillStyle(0x4a2f25);g.fillRect(56,58,28,40);g.fillStyle(0x5e8e3c);for(let x=13;x<125;x+=19)g.fillRect(x,49,4,37)});
 tex("barn",145,112,g=>{g.fillStyle(0x7b3c2d);g.fillRect(8,37,129,75);g.fillStyle(0x512b25);g.fillTriangle(3,38,72,3,142,38);g.fillStyle(0x452a23);g.fillRect(48,60,49,52);g.lineStyle(4,0xb9a06e);g.lineBetween(51,63,94,106);g.lineBetween(94,63,51,106);g.fillStyle(0xd6a43d);g.fillRect(116,14,4,27)});
 tex("tower",92,132,g=>{g.fillStyle(0x756b64);g.fillRect(15,10,62,122);g.fillStyle(0x4a3b35);g.fillRect(28,55,36,77);g.fillStyle(0x9b8f82);g.fillRect(10,4,72,12);g.fillStyle(0x463831);g.fillTriangle(4,4,45,-16,86,4);g.fillStyle(0xd7b34b);g.fillRect(44,0,4,31)});
 tex("wall",64,84,g=>{g.fillStyle(0x6f655e);g.fillRect(3,8,58,76);g.fillStyle(0x847970);for(let y=15;y<84;y+=16)for(let x=8;x<58;x+=18)g.fillRect(x,y,13,10)});
 tex("blacksmith",128,96,g=>{g.fillStyle(0x44454a);g.fillRect(8,35,112,61);g.fillStyle(0x6a4b35);g.fillTriangle(4,35,64,3,124,35);g.fillStyle(0xb67838);g.fillRect(74,52,15,44);g.fillStyle(0x292b31);g.fillRect(20,53,29,43);g.fillStyle(0xf0b454);g.fillCircle(95,55,7)});
 tex("training",135,93,g=>{g.fillStyle(0x6b4a31);g.fillRect(7,40,121,53);g.fillStyle(0x4a3427);g.fillTriangle(1,40,67,6,133,40);g.fillStyle(0x91713f);g.fillRect(23,52,88,7);g.fillStyle(0x3b3129);g.fillRect(67,59,8,34)});
 tex("cannon",100,72,g=>{g.fillStyle(0x4b4a4a);g.fillRect(17,42,66,18);g.fillStyle(0x6b6a68);g.fillCircle(84,50,13);g.fillRect(29,27,42,10);g.fillStyle(0x24242a);g.fillCircle(40,55,8);g.fillCircle(68,55,8)});
 tex("crop0",22,16,g=>{g.fillStyle(0x67482f);for(let x=2;x<20;x+=5)g.fillRect(x,7,2,5)});
 tex("crop1",22,22,g=>{g.fillStyle(0x3a762f);for(let x=3;x<19;x+=5){g.fillRect(x,7,2,13);g.fillRect(x-2,7,6,3)}});
 tex("crop2",22,26,g=>{g.fillStyle(0x7c9b38);for(let x=2;x<20;x+=5){g.fillRect(x,5,3,20);g.fillStyle(0xc6ad49);g.fillRect(x+3,6,3,17);g.fillStyle(0x7c9b38)}});
 tex("crop3",24,28,g=>{g.fillStyle(0xd9ba4b);for(let x=2;x<22;x+=6)g.fillRect(x,4,4,24);g.fillStyle(0x759a3b);g.fillRect(0,20,24,5)});
 g.destroy();
}