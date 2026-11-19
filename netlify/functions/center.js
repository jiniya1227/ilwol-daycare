const E=require('../../center-engine.js');
const config=require('../../center-config.json');;
exports.handler=async(event)=>{
 const d=await E.syncRate(config);
 const allowed=new Set(['index.html','about.html','program.html','guide.html','contact.html','llms.txt']);
 const route=(event.path||'').split('/').filter(Boolean).pop();
 const requested=event.queryStringParameters?.page||route;
 const page=allowed.has(requested)?requested:'index.html';
 let text=page==='llms.txt'?E.buildLlms(E.derive(d)):E.buildPage(d,{page,synced:true});
 if(page!=='llms.txt'){
  const tags=text.match(/<meta\b[^>]*>|<link\b[^>]*>/g)||[];
  const selected=tags.filter(x=>/property="og:|name="(?:description|robots|viewport|twitter:)|rel="canonical"/.test(x));
  for(const tag of selected)text=text.replace(tag,'');
  const early=selected.map(x=>x.includes('property="og:image"')?x.replace(/content="[^"]*"/,'content="https://ilwol-daycare.netlify.app/share-ilwol-sage-20261119.png"'):x).join('\n');
  text=text.replace('<meta charset="utf-8">','<meta charset="utf-8">\n'+early);
 }
 return {statusCode:200,headers:{'Content-Type':page==='llms.txt'?'text/plain; charset=utf-8':'text/html; charset=utf-8','Cache-Control':'no-store'},body:text};
 };