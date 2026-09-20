export function loadAssets(manifest={}){
 const images={};const promises=[];
 for(const [key,src] of Object.entries(manifest)){const img=new Image();img.decoding="async";img.src=src;images[key]=img;promises.push(new Promise(resolve=>{img.onload=()=>resolve(true);img.onerror=()=>resolve(false)}))}
 return {images,ready:Promise.all(promises)};
}
export function drawImage(ctx,img,x,y,w,h,flip=false,alpha=1){if(!img?.naturalWidth)return false;ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);if(flip)ctx.scale(-1,1);ctx.drawImage(img,-w/2,-h,w,h);ctx.restore();return true}