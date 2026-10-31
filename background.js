'use strict';
const MAX_HTML=2500000;
const requests=new Map();
chrome.action.onClicked.addListener(async tab=>{
  if(!tab.id||!/^https?:/.test(tab.url||''))return;
  try{
    // Inject on demand after the user clicks the action. This lets activeTab
    // provide temporary site access instead of requiring access to every site.
    await chrome.scripting.executeScript({target:{tabId:tab.id},files:['content.js']});
    await chrome.tabs.sendMessage(tab.id,{type:'NOVEL_TOGGLE'});
  }catch{/* Restricted pages and tabs opened before installation cannot be injected. */}
});
chrome.tabs.onRemoved.addListener(id=>{for(const [key,controller]of requests)if(key.startsWith(id+':')){controller.abort();requests.delete(key);}});
chrome.runtime.onMessage.addListener((message,sender,reply)=>{
  if(sender.id!==chrome.runtime.id||sender.frameId!==0||!sender.tab?.url)return;
  const key=sender.tab.id+':'+String(message?.requestId||'');
  if(message?.type==='NOVEL_CANCEL'){requests.get(key)?.abort();reply({ok:true});return;}
  if(message?.type!=='NOVEL_FETCH')return;
  (async()=>{
    let timer;
    try{
      const target=new URL(message.url),source=new URL(sender.tab.url);
      if(!['http:','https:'].includes(target.protocol)||target.origin!==source.origin||target.username||target.password)throw Error('仅允许读取当前站点的章节');
      if([...requests.keys()].some(k=>k.startsWith(sender.tab.id+':')))throw Error('已有章节正在读取，请稍后重试');
      const controller=new AbortController();requests.set(key,controller);timer=setTimeout(()=>controller.abort(),12000);
      const response=await fetch(target.href,{credentials:'include',redirect:'follow',signal:controller.signal,cache:'no-store'});
      if(!response.ok)throw Error([401,403,429].includes(response.status)?'原站返回 '+response.status+'，请在原站完成登录或安全验证后继续':'服务器返回 '+response.status);
      if(new URL(response.url).origin!==source.origin)throw Error('章节跳转到其他站点，已阻止');
      const type=response.headers.get('content-type')||'';
      if(type&&!/text\/html|application\/xhtml\+xml|text\/plain/i.test(type))throw Error('目标不是网页章节');
      if(+response.headers.get('content-length')>MAX_HTML)throw Error('章节页面过大');
      const reader=response.body.getReader(),chunks=[];let size=0;
      while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>MAX_HTML){await reader.cancel();throw Error('章节页面过大')}chunks.push(value);}
      const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}
      const head=new TextDecoder('windows-1252').decode(bytes.slice(0,8192));const charset=(type.match(/charset\s*=\s*["']?([\w-]+)/i)||head.match(/<meta[^>]+charset\s*=\s*["']?([\w-]+)/i))?.[1]||'utf-8';
      let decoder;try{decoder=new TextDecoder(charset)}catch{decoder=new TextDecoder('utf-8')}
      reply({ok:true,html:decoder.decode(bytes),url:response.url});
    }catch(e){reply({ok:false,error:e.name==='AbortError'?'加载超时或已取消，请在原站打开下一章':String(e.message||e)});}
    finally{clearTimeout(timer);requests.delete(key);}
  })();return true;
});
