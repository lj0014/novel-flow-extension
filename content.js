(() => {
'use strict';
if (window.__novelFlowLoaded) return;
window.__novelFlowLoaded = true;
const RULES = [
  {domain:/(^|\.)ongwu\.com$/,content:'#content, #chaptercontent, #read-content, #txt, .chapter-content, .read-content, .content, article',title:'#chaptername, .bookname h1, .chapter-title, h1',next:'#next, #next_url, #pb_next, #next_chapter, #next-chapter, #page-next, .next, .nextpage, .url_next, a[rel=next], .bottem1 a, .bottem2 a'},
  // piquge.com: support common legacy/new chapter container and navigation variants.
  {domain:/(^|\.)piquge\.com$/,content:'#chaptercontent, #content, #read-content, .chapter-content, .read-content, .content, #nr1',title:'.bookname h1, .content h1, .chapter-title, h1',next:'#next_url, #next, a.next, a.nextpage, .bottem1 a, .page_chapter a, a[rel=next]'},
  {domain:/qidian\.com$/,content:'#chapterContent, .read-content, .main-text-wrap',title:'.j_chapterName, .text-head h3',next:'.j_chapterNext, #j_chapterNext'},
  {domain:/jjwxc\.net$/,content:'.noveltext, #oneboolt, .readsmall',title:'h2',next:'a[href*="chapterid="]'},
  {domain:/zongheng\.com$/,content:'.content, .reader_box .content',title:'.title_txt, h1',next:'.nextchapter, .next'},
  {domain:/17k\.com$/,content:'.p, .readAreaBox .p, .read-content',title:'h1',next:'.next'},
  {domain:/fanqienovel\.com$/,content:'.muye-reader-content, .reader-content',title:'h1',next:'.next'},
  {domain:/shuqi\.com$/,content:'.read-content, .chapter-content',title:'h1',next:'.next'}
];
// Mirrors often use the same novel CMS under another domain. These DOM
// signatures come from the default readers of Jieqi, PTCMS, YGBOOK,
// KYXSCMS, Xiaohuanxiong NovelCMS, novel-plus, WMCMS, MCCMS, Shipsay,
// YiDu, EnovelCMS and common Biquge/Kuaiyan template families.
const TEMPLATES = [
  {signals:['meta[name="generator"][content*="jieqi"]','#headlink #linkleft','#footlink'],content:'#content, .contentbox',title:'#title, .readtitle, h1',next:'#footlink a:last-child, #linkright a:nth-of-type(3), #next_url, a[rel=next]'},
  {signals:['body.readpage .readbox','.readbox #chaptercontent','.frame-operate .frame-btn'],content:'#chaptercontent, .readbox .content, .readbox article .content',title:'.readbox .title h1, .title h1, h1',next:'.frame-btn a[title*="下一章"], .operate li.last a, a[title*="下一章"], a[rel=next]'},
  {signals:['#j_readMainWrap','#j_chapterBox','.j_readContent','.page-read-content','.read-load-next','#readContent'],content:'.j_readContent, .read-section.jsChapterWrapper, #chapterContent .jsChapterWrapper, .jsChapterWrapper, #chaptercontent, .read-content',title:'.j_chapterName, #chapterTitle, .read-section h3, .jsChapterWrapper h3, .chapter-title h1, h1',next:'#j_chapterNext, .chapter-control a[title*="下一章"], .read-load-next a[title*="下一章"], .read-prog-next, a[title*="下一章"], a[rel=next]'},
  {signals:['#readcontent','#showReading','#contentRaw','.nextPageBox'],content:'#showReading, #contentRaw, #chaptercontent.Readarea, #readcontent .readBox, #readcontent .txtwrap',title:'.book_title h1, .chapter-title h1, .read-nav h1, h1',next:'.nextPageBox a.next, .nextPageBox a:last-child, .read-nav a[title*="下一章"], a[title*="下一章"], a[rel=next]'},
  {signals:['.pt-reader .content','.content_btn','.loadnextpage','#BookText'],content:'#BookText, .pt-reader #BookText, .pt-reader .content, .content_read #content',title:'.pt-reader .content .title, .content .title, .bookname h1, h1',next:'.content_btn a:last-of-type, .loadnextpage button[data-nextpage], a[title*="下一章"], a[rel=next]'},
  {signals:['script[src*="mccms/base"]','.mccms_comment_list','meta[name="generator"][content*="mccms"]'],content:'.chapter-content, .chaptercontent, #content, article',title:'.chapter-title, .bookname h1, h1',next:'.nextPage a, .next, a[title*="下一章"], a[rel=next]'},
  {signals:['.box_con .bookname','.bottem1','.bottem2','.book_con h1'],content:'#content, #chaptercontent, .book_content',title:'.bookname h1, .book_con h1, .content h1, h1',next:'#pb_next, #next_url, #next, .bottem1 a:last-child, .bottem2 a:last-child'},
  {signals:['#chaptercontent','#nr1','.pagedown'],content:'#chaptercontent, #nr1, #content',title:'#chaptertitle, #title, .content h1, h1',next:'#next_url, #pb_next, .pagedown a:last-child, a[rel=next]'},
  {signals:['#txt','.txt_cont','.reader-main .content','#chaptername'],content:'#txt, .txt_cont, .reader-main #content, .reader-main .content, #content',title:'#chaptername, #neirong h1, .reader-main h1, .content h1, .chapter-title',next:'#next_url, #pb_next, .section3 a:last-child, .page_chapter a:last-child, a[rel=next]'},
  {signals:['#BookText','#BookContent','.novelbody','.yd_text2'],content:'#BookText, #BookContent, .novelbody, .yd_text2, #contentbox, .contentbox',title:'.readtitle, #chaptertitle, .chapter-title, h1, h2',next:'#next_url, #pb_next, .section3 a:last-child, a[rel=next]'},
  // Kuaiyan/Booksky transcoded readers expose prose as .art_cnt without a
  // #BookText wrapper. The dedicated controls let us skip recommendation and
  // author-note paragraphs appended to the article body.
  {signals:['.art_fm .art_cnt','.art_ctrl#chapterinfo','.readPager.btn-group'],content:'.art_fm .art_cnt, .art_cnt',title:'.art_fm .title h1, .readTitle, h1',next:'.art_ctrl#chapterinfo a:last-child, .readPager a:last-child, a[rel=next]'},
  // Shipsay CMS default reader. Its IDs are stable across its shipped themes.
  {signals:['#article.content','#next_url','#info_url'],content:'#article.content, article#article.content',title:'.style_h1, #article h1, h1',next:'#next_url'},
  // YiDu Novel / Jieqi-derived PC and WAP readers.
  {signals:['.mainContenr#content','strong.jieqi_title','.backs a.next','.top3'],content:'.mainContenr#content, .mainContenr, #content',title:'strong.jieqi_title, .bookInfo h1, h1',next:'.backs a.next, .top3 a:last-child, a[rel=next]'},
  // EnovelCMS renders the body dynamically and only adds chapter navigation
  // when another chapter exists. #fullContent is preferred over its preview.
  {signals:['article#chapterContent.chapter-content','#contentBody','#fullContent'],content:'#fullContent, #contentBody, article#chapterContent .content-body',title:'.chapter-title, h1',next:'a[rel=next], .chapter-nav a[title*="下一章"], a[title*="下一章"]'}
];
const SELECTORS = ['#content','#chaptercontent','#chapterContent','#read-content','#readContent','#txtContent','#txt','#BookText','#BookContent','#nr1','#booktxt','#articlecontent','#contentbox','#chapterbody','#article.content','.mainContenr#content','#fullContent','#contentBody','.j_readContent','.jsChapterWrapper','#showReading','#contentRaw','.art_fm .art_cnt','.art_cnt','.chapter-content','.chaptercontent','.read-content','.reader-content','.novel-content','.book_content','.article-content','[itemprop="articleBody"]','[property="articleBody"]','.novelbody','.txt_cont','.yd_text2','.contentbox','.readbox .content','.pt-reader .content','.content','.txt','.readarea','article','pre'];
const defaults={theme:'paper',fontSize:20,lineHeight:1.95,width:820,speed:2,auto:false,customSelector:'',customSelectors:{}};
let settings={...defaults}, host=null, shadow=null, main=null, chapters=[], loading=false, observer=null, onScroll=null, timer=null, saveTimer=null, keyHandler=null, currentURL=location.href;
let sessionToken=0, requestController=null, activeRequestId=null, autoBlocked=false, lastLoadTime=0, preloadTimer=null;
let originalScrollStyles=null, elapsedSeconds=0, lastReadingTick=0, visibilityHandler=null;
let routeTimer=null, manualPauseHandler=null, pageHideHandler=null, lastSaveTime=0, lastFooterUpdate=0, opening=false, loadedPages=0;
const $$=(sel,root=document)=>{try{return [...root.querySelectorAll(sel)]}catch{return []}};
const one=(sel,root=document)=>{try{return root.querySelector(sel)}catch{return null}};
const clean=s=>(s||'').replace(/[\u00a0\u200b\ufeff]/g,' ').replace(/\s+/g,' ').trim();
const textLength=el=>clean(el?.textContent).length;
const siteRule=()=>RULES.find(r=>r.domain.test(location.hostname));
function templateRule(doc){
  let best=null,bestScore=0;
  for(const template of TEMPLATES){
    const score=template.signals.reduce((n,s)=>n+(one(s,doc)?1:0),0);
    if(score>bestScore){best=template;bestScore=score}
  }
  return best;
}
const ruleFor=doc=>siteRule()||templateRule(doc);
const customSelectorFor=()=>settings.customSelectors?.[location.hostname]||settings.customSelector||'';
function getTitle(doc) {const rule=ruleFor(doc),candidates=$$([rule?.title,'#title','#chaptername','#chaptertitle','#chapterTitle','.j_chapterName','.bookname h1','.book_title h1','.chapter-title','.jsChapterWrapper h3','h1','h2'].filter(Boolean).join(','),doc);const chapter=candidates.find(e=>/第.{0,16}[章节節回卷]|序章|楔子|番外/.test(clean(e.textContent)));return clean(chapter?.textContent||candidates.find(e=>!/^(笔趣阁|快眼看书|首页|目[录錄])$/.test(clean(e.textContent)))?.textContent||doc.title?.replace(/[-_|].*$/,'')||'小说章节').slice(0,140)}
function chooseContent(doc){
  const rule=ruleFor(doc);
  const sels=[customSelectorFor(),rule?.content,...SELECTORS].filter(Boolean);
  const found=[]; const seen=new Set();
  // Rank ALL matching candidates instead of returning the first match. Some sites
  // reuse #content/.content for page chrome and place the actual chapter elsewhere.
  for(const [priority,sel] of sels.entries()) for(const el of $$(sel,doc)){
    if(seen.has(el))continue;seen.add(el);
    const n=textLength(el);if(n<120)continue;
    const linkChars=$$('a',el).reduce((sum,a)=>sum+textLength(a),0);
    const density=1-Math.min(linkChars/Math.max(n,1),.95);
    const paras=$$('p,br',el).length;
    const style=el.getAttribute('style')||'';
    const hidden=el.matches('[hidden],[aria-hidden="true"]')||/display\s*:\s*none|visibility\s*:\s*hidden/i.test(style);
    const score=Math.min(n,25000)*density+Math.min(paras,150)*20+Math.max(0,350-priority*35)-(hidden?50000:0);
    found.push({el,score});
  }
  if(found.length)return found.sort((a,b)=>b.score-a.score)[0].el;
  const candidates=$$('main, section, div, article',doc).filter(el=>textLength(el)>300);
  const rank=el=>{const n=textLength(el);const links=$$('a',el).reduce((sum,a)=>sum+textLength(a),0);const paragraphs=$$('p,br',el).length;const children=el.children.length;return Math.min(n,30000)*(1-Math.min(links/Math.max(n,1),.95)) + Math.min(paragraphs,150)*35 - Math.max(children-70,0)*50};
  return candidates.sort((a,b)=>rank(b)-rank(a))[0]||one('main',doc)||doc.body;
}
function paragraphs(el,chapterTitle=''){
  if(!el)return [];const clone=el.cloneNode(true),normalizedTitle=clean(baseChapterTitle(chapterTitle)).replace(/\s/g,'');
  $$('script,style,noscript,template,iframe,object,embed,form,button,input,select,textarea,svg,canvas,video,audio,nav,aside,footer,header,ins,.ads,.ad,.advertisement,.ad-container,.google-auto-placed,[class*="advert"],[id*="advert"],.chapter-control,.author-say,.author_say,.read-notice,.review,.comment,.comments,.readsmall,.noveltext table,.bottem1,.bottem2,.bottom1,.bottom2,.page_chapter,.pagination,.pager,.chapter-nav,.content_nav,.read-btn,.readbtn,.readpage,.chapterlist,.recommend,.recommendation,.tuijian,.tag_news,.like,.readbottom,.report,.ad_content,.adsbygoogle,#chapterinfo,.art_ctrl,.art_cnt>.desc,#contenttips,[hidden],[aria-hidden="true"]',clone).forEach(x=>x.remove());
  for(const node of $$('*',clone)){
    const style=node.getAttribute('style')||'';
    if(/display\s*:\s*none|visibility\s*:\s*hidden|opacity\s*:\s*0(?:[;\s]|$)/i.test(style))node.remove();
  }
  const elements=$$('p',clone);
  let lines=[];
  if(elements.length>=4 && elements.reduce((s,e)=>s+textLength(e),0)>250){lines=elements.map(e=>clean(e.textContent))}
  else {
    clone.querySelectorAll('br').forEach(br=>br.replaceWith(clone.ownerDocument.createTextNode('\n')));
    clone.querySelectorAll('p,div,section,li,blockquote').forEach(node=>node.append('\n'));
    lines=(clone.innerText || clone.textContent || '').split(/\n+/).map(clean);
  }
  const noise=s=>{
    const compact=clean(s).replace(/\s/g,'');
    if(normalizedTitle&&compact===normalizedTitle)return true;
    return /^[<>«»‹›←→\s]*(?:上一[章节页節頁]|下一[章节页節頁]|返回目录|章节目录|加入书签|保存书签|投推荐票|手机阅读|点击下载|本章完|返回顶部|广告)[\s»>：:！!。←→]*$/.test(s)
      ||/^(?:作者有话说|显示所有文的作话|推荐阅读)$/.test(compact)
      ||/(?:快眼看书(?:booksky)?|笔趣阁).{0,24}(?:转码|原网页|资源搜索)/i.test(s)
      ||/(?:本站仅提供资源搜索服务|不存放任何实质内容|源资源删除后本站的链接)/i.test(s)
      ||(s.length<180&&/(?:记住本站|牢记本站|收藏本站|天才一秒记住|一秒记住|最快更新|最新网址|手机用户请|笔趣阁\s*https?:)/.test(s)&&/本站|本书|本页|域名|网址|https?:|www\.|笔趣阁|快眼/.test(s))
      ||/^[（(【]?\s*(?:本章|内容|本页|本頁)(?:未完|尚未完|还未完)[^。！？]{0,65}(?:下一[页頁]|继续阅读|繼續閱讀)[\s。.!！》〉)）】…]*$/.test(s);
  };
  const output=[];let chars=0;
  for(const line of lines){
    if(/^(?:作者有话说|显示所有文的作话|推荐阅读)$/.test(clean(line).replace(/\s/g,'')))break;
    if(line.length<2||noise(line))continue;
    if(chars+line.length>400000||output.length>=3000)break;
    output.push(line);chars+=line.length;
  }
  return output;
}
function canonical(url){try{const u=new URL(url);u.hash='';for(const k of [...u.searchParams.keys()])if(/^(utm_.+|spm|from|source|ref|_t|timestamp|fbclid|gclid)$/i.test(k))u.searchParams.delete(k);u.searchParams.sort();return u.href}catch{return ''}}
function isCatalogURL(url){
  const path=url.pathname.replace(/\/+/g,'/');
  return /\/(?:index|list|catalog|mulu|directory|chapterlist|menu)(?:\.(?:html?|php|aspx?))?\/?$/i.test(path)
    || /\/(?:book|novel)\/\d+\/?$/i.test(path)
    || /\/chapter\/\d+\/0\.html$/i.test(path);
}
function pageInfo(title,url){
  const text=clean(title);
  const pair=text.match(/第?\s*(\d+)\s*[页頁]?\s*[/／]\s*(?:共)?\s*(\d+)\s*[页頁]?/);
  if(pair&&+pair[1]>0&&+pair[2]>=+pair[1]&&+pair[2]<=1000)return {current:+pair[1],total:+pair[2]};
  const chapterPair=text.match(/第.{0,24}[（(【]\s*(\d+)\s*[/／]\s*(\d+)\s*[）)】]/);
  if(chapterPair&&+chapterPair[1]>0&&+chapterPair[2]>=+chapterPair[1]&&+chapterPair[2]<=1000)return {current:+chapterPair[1],total:+chapterPair[2]};
  const single=text.match(/第\s*(\d+)\s*[页頁]/);if(single)return {current:+single[1],total:null};
  try{const u=new URL(url),m=u.pathname.match(/^(.*\d)[_-](\d+)(\.(?:s?html?))$/i);if(m)return {current:+m[2],total:null}}catch{}
  return null;
}
function isPageContinuation(base,href,title){
  const info=pageInfo(title,base);
  if(!info?.current)return false;
  let current,next;
  try{current=new URL(base);next=new URL(href,base)}catch{return false}
  if(current.origin!==next.origin)return false;
  if(current.pathname===next.pathname){
    for(const key of ['page','p','pn','pageno','page_no','pageIndex']){
      const value=Number(next.searchParams.get(key));
      if(Number.isInteger(value)&&value>0&&(value===info.current+1||value===info.current))return true;
    }
  }
  const currentPath=current.pathname.replace(/\/+$/,''),nextPath=next.pathname.replace(/\/+$/,'');
  const stripPageSuffix=path=>path.replace(/([_-])\d+(\.[a-z0-9]+)$/i,'$2');
  const nextSuffix=nextPath.match(/^(.*[_-])(\d+)(\.[a-z0-9]+)$/i);
  if(nextSuffix&&stripPageSuffix(currentPath)===stripPageSuffix(nextPath)){
    const nextPage=+nextSuffix[2];
    return nextPage===info.current+1||nextPage===info.current;
  }
  const currentName=currentPath.split('/').pop()||'',nextName=nextPath.split('/').pop()||'';
  const currentNumber=currentName.match(/^(\d+)\.([a-z0-9]+)$/i),nextNumber=nextName.match(/^(\d+)\.([a-z0-9]+)$/i);
  if(currentNumber&&nextNumber&&currentPath.slice(0,-currentName.length)===nextPath.slice(0,-nextName.length)){
    return (+currentNumber[1]===info.current||+currentNumber[1]===0)&&(+nextNumber[1]===info.current+1||+nextNumber[1]===info.current);
  }
  return false;
}
function navigationHref(a){
  for(const name of ['href','data-href','data-url','data-next-url','data-next','data-nurl']){const raw=a.getAttribute(name);if(raw&&!/^\s*(?:#|javascript:|data:)/i.test(raw))return raw}
  const code=(a.getAttribute('onclick')||'').trim();
  const m=code.match(/^(?:(?:window\.)?location(?:\.href)?\s*=\s*(['"])([^'"\\]+)\1|(?:window\.)?location\.(?:assign|replace)\(\s*(['"])([^'"\\]+)\3\s*\))\s*;?\s*(?:return\s+false\s*;?)?$/);
  if(m?.[2]||m?.[4])return m[2]||m[4];
  for(const match of code.matchAll(/["']((?:\/|\.{1,2}\/|https?:\/\/|\?)[^"']+)["']/g)){
    const candidate=match[1];
    if(/[\/.]|\?/.test(candidate)&&!/^(?:\d+|true|false|null)$/i.test(candidate))return candidate;
  }
  return '';
}
function isUsableInlineButton(button){
  if(!button||button.disabled||button.matches('[disabled],[aria-disabled="true"],.disabled')||button.closest('[hidden],[aria-hidden="true"],.disabled'))return false;
  if(typeof button.getClientRects==='function'&&button.getClientRects().length===0)return false;
  return true;
}
function findInlineButton(doc=document){
  return $$('.loadnextpage button[data-nextpage],button[data-nextpage],[data-nextpage][role="button"]',doc).find(isUsableInlineButton)||null;
}
function derivedNextHrefs(doc,base){
  const urls=[];
  const add=value=>{const raw=clean(value);if(raw&&!/^\s*(?:#|javascript:|data:|mailto:|tel:)/i.test(raw))urls.push(raw)};
  for(const el of $$('[data-nurl],[data-next-url],[data-next]',doc).slice(0,40))add(el.getAttribute('data-nurl')||el.getAttribute('data-next-url')||el.getAttribute('data-next'));
  const scripts=$$('script:not([src])',doc).slice(0,40).map(s=>s.textContent||'').join('\n').slice(0,180000);
  for(const re of [
    /\b(?:next_page|nextpage|nextUrl|next_url|nextChapterUrl|next_chapter_url|nextChapter)\s*[:=]\s*(["'])([^"']+)\1/gi,
    /\b(?:window\.)?location(?:\.href)?\s*=\s*(["'])([^"']+)\1/gi
  ])for(const match of scripts.matchAll(re))add(match[2]);
  const current=new URL(base);
  for(const input of $$('input[id*="next" i],input[name*="next" i]',doc).slice(0,20)){
    const id=clean(input.value);
    if(!/^\d+$/.test(id)||+id<=0)continue;
    const m=current.pathname.match(/^(.*?)(\d+)(\.[a-z0-9]+)?$/i);
    if(!m||m[2]===id)continue;
    const candidate=new URL(current.href);candidate.pathname=m[1]+id+(m[3]||'');urls.push(candidate.href);
  }
  for(const link of $$('link[rel="prefetch"][href]',doc).slice(0,20)){
    const href=link.getAttribute('href')||'';
    try{
      const u=new URL(href,base);
      if(/chapter|read|book/i.test(u.pathname)||/\.(?:s?html?|xhtml)$/i.test(u.pathname))add(href);
    }catch{}
  }
  return urls;
}
function nextLink(doc,base){
  const rule=ruleFor(doc),current=new URL(base),candidates=new Map();
  const addUrl=(href,bonus,kindHint)=>{
    if(!href)return;
    let u;try{u=new URL(href,base)}catch{return}
    if(!/^https?:$/.test(u.protocol)||u.username||u.password||u.origin!==current.origin||canonical(u.href)===canonical(base))return;
    if(isCatalogURL(u))return;
    u.hash='';
    const score=bonus+(kindHint==='page'?20:0);
    const key='url:'+u.href;
    if(!candidates.has(key)||candidates.get(key).score<score)candidates.set(key,{url:u.href,score,kind:kindHint||'chapter'});
  };
  const add=(a,bonus,kindHint)=>{
    const alt=$$('img[alt]',a).map(img=>img.alt).join(' ');
    const label=clean((a.textContent||a.value||'')+' '+alt+' '+(a.getAttribute('aria-label')||'')+' '+(a.title||'')).replace(/\s/g,'');
    if(a.matches('[disabled],[aria-disabled="true"],.disabled')||a.closest('[hidden],[aria-hidden="true"],.recommend,.tuijian,.like'))return;
    if(/上[一章页節頁]|前[一章页]|目[录錄]|书架|書架|首页|首頁|返回|书签|書籤/.test(label))return;
    const href=navigationHref(a);if(!href)return;
    let u;try{u=new URL(href,base)}catch{return}
    if(!/^https?:$/.test(u.protocol)||u.username||u.password||u.origin!==current.origin||canonical(u.href)===canonical(base))return;
    if(isCatalogURL(u))return;
    u.hash='';
    const page=/下(?:一|1)?[页頁]|next\s*page/i.test(label),chapter=/下(?:一)?[章节回節篇]|後一[章節]|后一[章节]|next\s*chapter/i.test(label);
    const identity=(a.id+' '+(a.className||'')).toLowerCase();
    const inferredPage=isPageContinuation(base,u.href,getTitle(doc));
    const kind=page?'page':chapter?'chapter':kindHint==='page'?'page':inferredPage?'page':'chapter';
    const score=bonus+(page?320:chapter?180:kindHint==='page'?260:inferredPage?240:70);
    const key='node:'+(a.id||'')+':'+u.href;
    if(!candidates.has(key)||candidates.get(key).score<score)candidates.set(key,{url:u.href,score,kind});
  };
  const selectors=[rule?.next,'a[rel="next"],a[data-nurl],#next_url,#next,#pb_next,#linkNext,#nextChapter,#chapter_next,#next_chapter,#next-chapter,#page-next,#j_chapterNext,.url_next,.nextpage,.nextchapter,.next-page,.next-chapter,.backs a.next,.section3 a:last-child,.bottem1 a:last-child,.bottem2 a:last-child,.pagedown a:last-child,.frame-btn a[title*="下一章"],.operate li.last a,.pt-reader a[title*="下一章"],.chapter-control a[title*="下一章"],.nextPageBox a.next'].filter(Boolean);
  for(const sel of selectors)for(const a of $$(sel,doc).slice(0,40)){
    const strong=a.rel==='next'||/(?:#(?:next_url|next|pb_next|linkNext|nextChapter|chapter_next|next_chapter|next-chapter|page-next|j_chapterNext)|\.(?:nextpage|nextchapter|next-page|next-chapter|url_next)|\[data-nurl\])/i.test(sel);
    const pageControl=/(?:nextpage|page-next|pagedown|data-nextpage)/i.test(a.id+' '+(a.className||'')+' '+a.outerHTML.slice(0,300));
    add(a,strong?180:60,pageControl?'page':null);
  }
  for(const a of $$('a[href],a[data-href],a[data-url],a[data-nurl],a[data-next-url],a[data-next],a[onclick],button[data-url],button[data-href],button[data-nurl],button[data-next-url],button[data-next],button[onclick]',doc).slice(0,4000)){
    const alt=$$('img[alt]',a).map(img=>img.alt).join(' ');
    if(/下(?:一|1)?[章页頁節回篇]|後一[章節]|后一[章节]|next\s*(?:chapter|page)/i.test(clean(a.textContent+' '+alt+' '+a.title+' '+a.getAttribute('aria-label'))))add(a,90);
  }
  for(const href of derivedNextHrefs(doc,base))addUrl(href,120,'chapter');
  if(doc===document){
    const inline=findInlineButton(doc);
    if(inline)candidates.set('inline:'+inline.outerHTML.slice(0,300),{url:null,score:450,kind:'inline'});
  }
  const sorted=[...candidates.values()].sort((a,b)=>b.score-a.score),best=sorted[0]||null;
  const info=pageInfo(getTitle(doc),base);
  if(info?.total&&info.current<info.total&&!['page','inline'].includes(best?.kind))return {url:null,kind:null,warning:'本章标题显示仍有分页，但没有找到可靠的下一页，已停止以避免跳过正文。请在原站继续。'};
  return best;
}
function parsePage(doc,url){
  const pageTitle=doc.title||one('title',doc)?.textContent||'';
  const brief=clean(doc.body?.textContent||doc.textContent||'').slice(0,1500);
  if(/请稍候|Just a moment|安全验证|人机验证|Attention Required/i.test(pageTitle)||one('#challenge-form,[data-cf-beacon]',doc)&&/正在进行安全验证|Verify you are human/i.test(brief))throw Error('原站要求安全验证，请点击下方「在原站打开下一章」处理后重新开启阅流');
  const paywallText=/订阅本章|购买本章|解锁本章|此章节为VIP章节|需登录后购买阅读|登录后购买|这是VIP章节|需要订阅后才能阅读|本章为付费章节/i;
  const weakLoginText=/请先登录|登录后(?:继续)?阅读/i;
  const blockingPaywallText=/此章节为VIP章节|需登录后购买阅读|登录后购买|这是VIP章节|需要订阅后才能阅读|订阅本章|购买本章|解锁本章|本章为付费章节|请先登录/i;
  const paywallNode=$$('.paywall,.vip-limit,.vip-limit-wrap,.vip-chapter,.subscribe-box,.subscribe-btn-wrap,.purchase-box,.pay-content,.login-paywall,[data-paywall="true"]',doc).find(e=>{
    const style=e.getAttribute('style')||'';
    return !e.matches('[hidden],[aria-hidden="true"]')&&!/display\s*:\s*none|visibility\s*:\s*hidden/i.test(style)&&blockingPaywallText.test(e.textContent||'');
  });
  if(paywallText.test(brief)||paywallNode)throw Error('原站要求登录或订阅，请在原站完成后继续');
  const content=chooseContent(doc);if(!content)return {title:getTitle(doc),lines:[],next:null,nextKind:null,nextWarning:'',url};
  const title=getTitle(doc),lines=paragraphs(content,title),text=lines.join('');
  if(paywallText.test(text)||(text.length<120&&weakLoginText.test(`${brief} ${text}`)))throw Error('原站要求登录或订阅，请在原站完成后继续');
  const next=nextLink(doc,url);
  return {title,lines,next:next?.url||null,nextKind:next?.kind||null,nextWarning:next?.warning||'',url};
}
function materializeInlineBodies(doc){
  const decoder=new TextDecoder('utf-8');
  for(const script of $$('script:not([src])',doc).slice(0,800)){
    const code=script.textContent||'';
    if(!/document\.(?:write|writeln)|qsbs\.bb|atob\s*\(/i.test(code))continue;
    let html='';
    for(const match of code.matchAll(/(?:qsbs\.)?bb\s*\(\s*(['"])([A-Za-z0-9+/=\s]{16,})\1\s*\)/g)){
      try{
        const binary=atob(match[2].replace(/\s/g,''));
        const bytes=Uint8Array.from(binary,char=>char.charCodeAt(0));
        html+=decoder.decode(bytes);
      }catch{}
    }
    if(!html)continue;
    const owner=doc.ownerDocument||document;
    const holder=owner.createElement('span');
    holder.innerHTML=html;
    for(const node of [...holder.childNodes])script.before(node);
  }
}
function parseFetchedHTML(html){const template=document.createElement('template');template.innerHTML=html;const doc=template.content;doc.title=one('title',doc)?.textContent||'';materializeInlineBodies(doc);return doc;}
async function readHTMLResponse(response){
  if(!response.ok)throw Error([401,403,429].includes(response.status)?'原站返回 '+response.status+'，可能需要登录、安全验证或稍后重试；请在原站打开下一章':'服务器返回 '+response.status);
  const type=response.headers.get('content-type')||'';
  if(type&&!/text\/html|application\/xhtml\+xml|text\/plain/i.test(type))throw Error('下一章链接不是网页正文');
  if(+response.headers.get('content-length')>2500000)throw Error('章节页面过大');
  if(!response.body)throw Error('章节页面没有可读取的正文');
  const reader=response.body.getReader(),chunks=[];let size=0;
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>2500000){await reader.cancel();throw Error('章节页面过大')}chunks.push(value);}
  const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}
  const head=new TextDecoder('windows-1252').decode(bytes.slice(0,8192));const charset=(type.match(/charset\s*=\s*["']?([\w-]+)/i)||head.match(/<meta[^>]+charset\s*=\s*["']?([\w-]+)/i))?.[1]||'utf-8';
  let decoder;try{decoder=new TextDecoder(charset)}catch{decoder=new TextDecoder('utf-8')}
  return {ok:true,html:decoder.decode(bytes),url:response.url};
}
async function fetchChapter(url,token){
  const u=new URL(url);if(u.origin!==location.origin||!/^https?:$/.test(u.protocol)||u.username||u.password)throw Error('仅允许读取当前站点的章节');
  const controller=new AbortController();let requestId=null;requestController=controller;const timeout=setTimeout(()=>controller.abort(),12000);
  try{
    let response;
    try{response=await fetch(u.href,{credentials:'same-origin',mode:'same-origin',redirect:'follow',signal:controller.signal,cache:'no-store'});}
    catch(e){
      if(controller.signal.aborted)throw Error('加载超时或已取消，请重试或打开原站下一章');
      if(token!==sessionToken)throw Error('阅读已关闭');
      requestId='nf-'+Date.now()+'-'+token;activeRequestId=requestId;
      let abortListener;const cancelled=new Promise((_,reject)=>{abortListener=()=>{chrome.runtime.sendMessage({type:'NOVEL_CANCEL',requestId}).catch(()=>{});reject(Error('加载超时或已取消，请在原站打开下一章'));};controller.signal.addEventListener('abort',abortListener,{once:true});});
      let result;try{result=await Promise.race([chrome.runtime.sendMessage({type:'NOVEL_FETCH',url:u.href,requestId}),cancelled]);}finally{controller.signal.removeEventListener('abort',abortListener);}
      if(controller.signal.aborted)throw Error('加载已取消');
      if(!result?.ok)throw Error(result?.error||'网络请求失败，请在原站打开下一章');return result;
    }
    if(new URL(response.url).origin!==location.origin)throw Error('下一章跳转到其他站点，已停止');
    return await readHTMLResponse(response);
  }catch(e){if(controller.signal.aborted)throw Error('加载超时或已取消，请重试或打开原站下一章');throw e;}
  finally{clearTimeout(timeout);if(requestController===controller)requestController=null;if(activeRequestId===requestId)activeRequestId=null;}
}
function el(tag,cls,text){let n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n}
const CSS=`
:host{all:initial;color-scheme:light}*{box-sizing:border-box}#screen{position:fixed;inset:0;z-index:2147483646;overflow-y:auto;overflow-x:hidden;scrollbar-gutter:auto;background:var(--bg);color:var(--fg);font-family:ui-serif,"Songti SC","Noto Serif CJK SC","Microsoft YaHei",serif;scroll-behavior:auto}#screen[data-theme=paper]{--bg:#f7f2e9;--fg:#3e352e;--panel:#eee7da;--edge:#dbd1bf}#screen[data-theme=green]{--bg:#deecd9;--fg:#2d4435;--panel:#cfe1c8;--edge:#b5cdb2}#screen[data-theme=dark]{--bg:#1c2025;--fg:#d6d4cc;--panel:#303740;--edge:#45505b}#toolbar{position:sticky;top:0;display:flex;align-items:center;gap:10px;background:var(--bg);border-bottom:1px solid var(--edge);padding:12px 18px;z-index:5;font-family:system-ui,sans-serif;font-size:13px;box-shadow:0 1px 8px #00000009}button,input,select{font-family:inherit;font-size:13px}button{background:var(--panel);color:var(--fg);border:1px solid var(--edge);border-radius:8px;padding:7px 11px;cursor:pointer}button:hover{filter:brightness(.96)}#brand{font-weight:750;letter-spacing:1px;font-size:16px;white-space:nowrap}#spacer{flex:1}#settings{display:flex;align-items:center;gap:10px;flex-wrap:wrap}label{display:inline-flex;align-items:center;gap:5px;white-space:nowrap}input[type=range]{width:75px;accent-color:#7c946e}select{background:var(--panel);color:var(--fg);border:1px solid var(--edge);border-radius:7px;padding:6px}#reading{width:min(calc(100% - 44px),var(--width));margin:55px auto 100px}section.chapter{margin-bottom:68px;scroll-margin-top:92px}h1{font-size:1.35em;text-align:center;font-weight:650;margin:0 0 42px;line-height:1.5}p{font-size:var(--fontsize);line-height:var(--lineheight);text-indent:2em;letter-spacing:.025em;margin:0 0 .75em;overflow-wrap:anywhere}#status{text-align:center;font:13px system-ui,sans-serif;opacity:.65;padding:25px 0 60px}#reading-footer{position:fixed;left:0;right:0;bottom:0;z-index:7;display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 24px 12px;background:var(--bg);border-top:1px solid var(--edge);color:var(--fg);font:12px system-ui,sans-serif;white-space:nowrap}#reading-footer .chapter-name{overflow:hidden;text-overflow:ellipsis;flex:1;text-align:center;max-width:55%}#progress-track{position:absolute;left:0;right:0;bottom:0;height:3px;background:var(--edge)}#progress{height:100%;background:#839d72;width:0;transition:width .1s linear}#toast{position:fixed;bottom:22px;left:50%;transform:translateX(-50%);background:var(--panel);border:1px solid var(--edge);padding:9px 16px;border-radius:10px;font:13px system-ui,sans-serif;z-index:8;max-width:80%;text-align:center}#toast:empty{display:none}@media(max-width:760px){#toolbar{gap:6px;padding:9px 10px;flex-wrap:wrap}#brand{display:none}#settings{order:2;width:100%;justify-content:space-between}#reading{margin:30px auto 80px;width:calc(100% - 36px)}#reading-footer{padding:9px 12px 11px;font-size:11px;gap:6px}#reading-footer .chapter-name{max-width:48%}}`;
function setStyles(){if(!main)return;main.dataset.theme=settings.theme;main.style.setProperty('--fontsize',settings.fontSize+'px');main.style.setProperty('--lineheight',settings.lineHeight);main.style.setProperty('--width',settings.width+'px')}
function store(){chrome.storage.local.set({novelFlowSettings:settings})}
function toast(s){const n=shadow?.getElementById('toast');if(!n)return;n.textContent=s;setTimeout(()=>{if(n.textContent===s)n.textContent=''},3500)}
function addButton(parent,label,cb){let b=el('button','',label);b.addEventListener('click',cb);parent.append(b);return b}
function slider(parent,label,min,max,step,key,suffix=''){let wrap=el('label');let txt=el('span','',label);let input=el('input');input.type='range';input.min=min;input.max=max;input.step=step;input.value=settings[key];let value=el('span','',settings[key]+suffix);input.addEventListener('input',()=>{settings[key]=+input.value;value.textContent=input.value+suffix;setStyles();store()});wrap.append(txt,input,value);parent.append(wrap)}
function lockOriginalPage(){
  const html=document.documentElement, body=document.body;
  originalScrollStyles={html:html.style.getPropertyValue('overflow'),htmlPriority:html.style.getPropertyPriority('overflow'),body:body?.style.getPropertyValue('overflow'),bodyPriority:body?.style.getPropertyPriority('overflow')};
  html.style.setProperty('overflow','hidden','important');
  body?.style.setProperty('overflow','hidden','important');
}
function restoreOriginalPage(){
 if(!originalScrollStyles)return;
 const {html,htmlPriority,body,bodyPriority}=originalScrollStyles;
 if(html)document.documentElement.style.setProperty('overflow',html,htmlPriority);else document.documentElement.style.removeProperty('overflow');
 if(document.body){if(body)document.body.style.setProperty('overflow',body,bodyPriority);else document.body.style.removeProperty('overflow')}
 originalScrollStyles=null;
}
function activeChapterInfo(){
 const secs=$$('section.chapter',shadow);if(!secs.length||!main)return null;
 // All metrics are relative to the scroll container, not the original page.
 const marker=main.scrollTop+main.clientHeight*.35;let idx=0;
 for(let i=0;i<secs.length;i++){if(secs[i].offsetTop<=marker)idx=i;else break}
 const sec=secs[idx],start=sec.offsetTop,end=sec.offsetTop+sec.offsetHeight;
 const fraction=Math.max(0,Math.min(1,(marker-start)/Math.max(end-start,1)));
 return {index:idx,title:chapters[idx]?.title||'当前章节',percent:Math.round(fraction*100),url:chapters[idx]?.url};
}
function updateReadingFooter(){
 if(!main||!shadow)return;const info=activeChapterInfo();if(!info)return;
 const duration=shadow.getElementById('reading-duration');const chapter=shadow.getElementById('reading-chapter');const progress=shadow.getElementById('reading-percent');
 const h=Math.floor(elapsedSeconds/3600),m=Math.floor(elapsedSeconds%3600/60),sec=elapsedSeconds%60;
 duration.textContent='阅读 '+(h?h+'时':'')+m+'分'+String(sec).padStart(2,'0')+'秒';
 const match=info.title.match(/第\s*[0-9零〇一二三四五六七八九十百千万两]+\s*[章回节]/);
 chapter.textContent=(match?match[0]:'已加载第'+(info.index+1)+'章')+' · '+info.title;chapter.title=info.title;
 progress.textContent='本章 '+info.percent+'%';shadow.getElementById('progress').style.width=info.percent+'%';
}
function startReadingClock(){
 elapsedSeconds=0;lastReadingTick=Date.now();
 const tick=()=>{const now=Date.now();if(!document.hidden && document.hasFocus())elapsedSeconds+=Math.min(Math.floor((now-lastReadingTick)/1000),2);lastReadingTick=now;updateReadingFooter()};
 timer=setInterval(tick,1000);visibilityHandler=()=>{lastReadingTick=Date.now()};
 document.addEventListener('visibilitychange',visibilityHandler);window.addEventListener('focus',visibilityHandler);
}
function pauseAuto(save=true){settings.auto=false;cancelAnimationFrame(frame);const auto=one('#auto-scroll',shadow);if(auto)auto.textContent='▶ 自动滚动';if(save)store()}
function setup(){
 lockOriginalPage();
 host=el('div');host.id='novelflow-host';document.documentElement.append(host);shadow=host.attachShadow({mode:'open'});
 shadow.append(el('style','',''));shadow.querySelector('style').textContent=CSS;
 main=el('div');main.id='screen';main.tabIndex=-1;const toolbar=el('div');toolbar.id='toolbar';toolbar.append(el('span','', ''));toolbar.lastChild.id='brand';toolbar.lastChild.textContent='阅流 · 阅读';
 const settingsBox=el('div');settingsBox.id='settings';const theme=el('select');[['paper','纸张'],['green','护眼绿'],['dark','深色']].forEach(([v,t])=>{let opt=el('option','',t);opt.value=v;theme.append(opt)});theme.value=settings.theme;theme.addEventListener('change',()=>{settings.theme=theme.value;setStyles();store()});let themeLabel=el('label','', '主题 ');themeLabel.append(theme);settingsBox.append(themeLabel);
 slider(settingsBox,'字号',15,32,1,'fontSize','px');slider(settingsBox,'行距',1.4,2.6,.1,'lineHeight');slider(settingsBox,'宽度',550,1200,50,'width','px');slider(settingsBox,'速度',1,8,1,'speed');toolbar.append(settingsBox);
 const spacer=el('span');spacer.id='spacer';toolbar.append(spacer);
 const autoplay=addButton(toolbar,settings.auto?'⏸ 停止滚动':'▶ 自动滚动',()=>{settings.auto=!settings.auto;autoplay.textContent=settings.auto?'⏸ 停止滚动':'▶ 自动滚动';store();animate()});autoplay.id='auto-scroll';
  addButton(toolbar,'站点适配',()=>{const value=prompt('填写当前网站（'+location.hostname+'）的正文 CSS 选择器，例如 #content 或 .chapter-content。留空恢复智能识别：',customSelectorFor());if(value===null)return;const selector=value.trim().slice(0,180);if(selector){try{document.querySelector(selector)}catch{alert('阅流：CSS 选择器语法无效，请检查括号、引号或伪类。');return}}const selectors={...(settings.customSelectors||{})};if(selector)selectors[location.hostname]=selector;else delete selectors[location.hostname];if(Object.keys(selectors).length>100)delete selectors[Object.keys(selectors)[0]];settings.customSelectors=selectors;settings.customSelector='';store();toast('已保存当前网站规则。退出阅读模式后重新进入生效');});const nextButton=addButton(toolbar,'下一章',()=>loadNext(true));nextButton.id='next-chapter-button';addButton(toolbar,'退出 ✕',close);main.append(toolbar);
 const reading=el('article');reading.id='reading';main.append(reading);let status=el('div');status.id='status';status.textContent='滑动到底部，自动载入下一章';reading.append(status);let footer=el('div');footer.id='reading-footer';let duration=el('span');duration.id='reading-duration';let currentChapter=el('span','chapter-name');currentChapter.id='reading-chapter';let chapterPercent=el('span');chapterPercent.id='reading-percent';let progressTrack=el('div');progressTrack.id='progress-track';let progress=el('div');progress.id='progress';progressTrack.append(progress);footer.append(duration,currentChapter,chapterPercent,progressTrack);main.append(footer);let toastBox=el('div');toastBox.id='toast';main.append(toastBox);shadow.append(main);startReadingClock();
  onScroll=()=>{const now=performance.now();if(now-lastFooterUpdate>=100){lastFooterUpdate=now;updateReadingFooter()}scheduleSave();scheduleAutoNext()};
  main.addEventListener('scroll',onScroll,{passive:true});
  manualPauseHandler=()=>pauseAuto();main.addEventListener('wheel',manualPauseHandler,{passive:true});main.addEventListener('touchstart',manualPauseHandler,{passive:true});
  keyHandler=e=>{if(!host)return;if(e.key==='Escape'){close();return}if(['INPUT','TEXTAREA','SELECT'].includes(e.target?.tagName))return;if(e.key===' '){e.preventDefault();settings.auto=!settings.auto;const auto=one('#auto-scroll',shadow);if(auto)auto.textContent=settings.auto?'⏸ 停止滚动':'▶ 自动滚动';store();animate();return}if(['PageDown','ArrowDown','PageUp','ArrowUp','Home','End'].includes(e.key)){pauseAuto();e.preventDefault();if(e.key==='Home')main.scrollTo({top:0,behavior:'smooth'});else if(e.key==='End')main.scrollTo({top:main.scrollHeight,behavior:'smooth'});else main.scrollBy({top:main.clientHeight*(['PageDown','ArrowDown'].includes(e.key) ? .8 : -.8),behavior:'smooth'})}};
  document.addEventListener('keydown',keyHandler,true);
  pageHideHandler=()=>flushProgress();window.addEventListener('pagehide',pageHideHandler,{passive:true});
  routeTimer=setInterval(()=>{if(host&&location.href!==currentURL)close()},700);
  setStyles();
}
function baseChapterTitle(title){return clean(title).replace(/[（(【]?\s*(?:\d+\s*[/／]\s*\d+|(?:第\s*)?\d+\s*(?:[页頁](?:\s*[/／]\s*(?:共)?\s*\d+\s*[页頁]?)?|[/／]\s*(?:共)?\s*\d+\s*[页頁]?))\s*[）)】]?\s*$/,'').replace(/\s/g,'')}
const chapterSeen=url=>chapters.some(c=>(c.urls||[c.url]).some(u=>canonical(u)===canonical(url)));
function appendChapter(ch){
  const previous=chapters.at(-1),continuation=['page','inline'].includes(previous?.nextKind)&&baseChapterTitle(previous.title)===baseChapterTitle(ch.title);
  // Inline AJAX pagination keeps the same URL while replacing the body. Treat
  // that as a continuation before applying the cross-chapter URL loop guard.
  if(!ch.lines.length||chapterSeen(ch.url)&&!continuation)return null;
  let section,firstNew;
  if(continuation){
    section=$$('section.chapter',shadow).at(-1);firstNew=el('p','',ch.lines[0]);section.append(firstNew);
    for(const line of ch.lines.slice(1))section.append(el('p','',line));
    previous.lines.push(...ch.lines);previous.urls=[...(previous.urls||[previous.url]),ch.url];previous.next=ch.next;previous.nextKind=ch.nextKind;previous.nextWarning=ch.nextWarning;
  }else{
    section=el('section','chapter');section.dataset.url=ch.url;section.append(el('h1','',ch.title));firstNew=section;
    for(const line of ch.lines)section.append(el('p','',line));
    one('#status',shadow).before(section);chapters.push({...ch,urls:[ch.url]});
  }
  loadedPages++;requestAnimationFrame(updateReadingFooter);return firstNew;
}
function updateNextButton(){
  const button=one('#next-chapter-button',shadow),last=chapters.at(-1);if(!button)return;
  const available=Boolean(last?.next||last?.nextKind==='inline');
  button.disabled=loading||!available;
  button.textContent=loading?'加载中…':['page','inline'].includes(last?.nextKind)?'下一页':'下一章';
  button.title=['page','inline'].includes(last?.nextKind)?'加载本章下一页':'加载下一章';
}
function scheduleAutoNext(){
  const last=chapters.at(-1);if(preloadTimer||loading||autoBlocked||!host||(!last?.next&&last?.nextKind!=='inline')||main.scrollHeight-main.scrollTop-main.clientHeight>=900)return;
  const token=sessionToken;preloadTimer=setTimeout(()=>{preloadTimer=null;if(token===sessionToken&&main&&main.scrollHeight-main.scrollTop-main.clientHeight<900)loadNext(false)},Math.max(100,1500-(Date.now()-lastLoadTime)));
}
function showStatus(message,failed=false){
  if(!shadow)return;const status=one('#status',shadow);status.replaceChildren();const text=el('div','',message);text.setAttribute('role','status');text.setAttribute('aria-live','polite');status.append(text);
  const last=chapters.at(-1),next=last?.next;
  if(failed&&(next||last?.nextKind==='inline')){if(next){const a=el('a','',last.nextKind==='page'?'在原站打开本页下一页 ↗':'在原站打开下一章 ↗');a.href=next;a.target='_blank';a.rel='noopener noreferrer';a.style.cssText='display:inline-block;margin-top:14px;color:inherit;text-decoration:underline';status.append(a);}else if(last?.url){const a=el('a','','在原站继续本页 ↗');a.href=last.url;a.target='_blank';a.rel='noopener noreferrer';a.style.cssText='display:inline-block;margin-top:14px;color:inherit;text-decoration:underline';status.append(a);}const retry=el('button','','重试');retry.style.marginLeft='14px';retry.addEventListener('click',()=>loadNext(true));status.append(retry);}
  if(failed&&!next){const b=el('button','','返回原网页');b.addEventListener('click',close);status.append(b);}
}
async function loadInlinePage(previous,token){
  let button=findInlineButton(document);
  if(!button)throw Error('原站动态分页按钮已失效，请打开原站继续');
  const startURL=location.href,before=previous.lines.join('').replace(/\s/g,'');
  try{button.click();}catch{throw Error('原站动态分页按钮无法触发，请打开原站继续');}
  let buttonGone=false;
  for(let attempt=0;attempt<48;attempt++){
    await new Promise(resolve=>setTimeout(resolve,250));
    if(token!==sessionToken||!host)throw Error('阅读已关闭');
    if(location.href!==startURL)throw Error('原站页面已切换，请重新开启阅流');
    const page=parsePage(document,location.href);
    const after=page.lines.join('').replace(/\s/g,'');
    if(after.length>=120&&after!==before)return page;
    button=findInlineButton(document);
    if(!button)buttonGone=true;
  }
  throw Error(buttonGone?'原站动态分页按钮已消失，但没有返回新正文，请重试或打开原站继续':'原站动态分页没有返回新正文，请重试或打开原站继续');
}
async function loadNext(force){
  if(loading||!host||!chapters.length||(!force&&autoBlocked))return;
  const last=chapters.at(-1);
  const inline=last.nextKind==='inline';
  if((!last.next&&!inline)||(last.next&&chapterSeen(last.next))){autoBlocked=true;const message=last.nextWarning||'未找到可用下一章，或链接指向已读章节。可返回原网页使用站点导航。';showStatus(message,true);updateNextButton();if(force)toast(message);return;}
  if(loadedPages>=100){autoBlocked=true;showStatus('已连续载入 100 页，请打开当前章节原站后继续。',true);return;}
  if(!force&&Date.now()-lastLoadTime<1500)return;
  const token=sessionToken;autoBlocked=false;loading=true;lastLoadTime=Date.now();updateNextButton();showStatus(last.nextKind==='page'?'本章下一页加载中…':'下一章加载中…');
  try{
    let page;
    if(inline){page=await loadInlinePage(last,token);}else{
      const res=await fetchChapter(last.next,token);if(token!==sessionToken||!host)return;
      const doc=parseFetchedHTML(res.html);page=parsePage(doc,res.url);
    }
    if(canonical(page.next)===canonical(page.url))page.next=null;
    if(page.lines.join('').length<120)throw Error('下一章正文不足，可能仍需原站动态加载、登录或安全验证');
    if(!inline&&chapterSeen(page.url))throw Error('下一章返回已读地址，已停止以防循环');
    if(chapters.some(c=>page.lines.join('').replace(/\s/g,'')===c.lines.join('').replace(/\s/g,'')))throw Error('下一章内容与已读章节相同，已停止以防循环');
    const target=appendChapter(page);if(!target)throw Error('章节重复或内容为空');
    showStatus(page.next?'滑动到底部，自动载入后续内容':page.nextWarning||'已到最后一章或未找到后续章节');
    if(force){main.scrollTop=Math.max(0,target.offsetTop-(one('#toolbar',shadow)?.offsetHeight||0)-20);main.focus({preventScroll:true});updateReadingFooter();scheduleSave();}
  }catch(e){
    if(token!==sessionToken||!host)return;autoBlocked=true;pauseAuto(false);showStatus('翻页暂停：'+e.message,true);if(force)toast(e.message);
  }finally{if(token===sessionToken&&host){loading=false;updateNextButton();scheduleAutoNext();}}
}
function saveProgressNow(){
  if(!main||!shadow)return;const secs=$$('section.chapter',shadow);if(!secs.length)return;
  const marker=main.scrollTop+main.clientHeight*.3;let active=secs[0];
  for(const sec of secs){if(sec.offsetTop<=marker)active=sec;else break}
  const key='novelFlowProgress:'+location.origin+location.pathname;
  lastSaveTime=Date.now();
  chrome.storage.local.set({[key]:{url:active.dataset.url,offset:main.scrollTop,at:lastSaveTime}});
}
function flushProgress(){if(saveTimer){clearTimeout(saveTimer);saveTimer=null}saveProgressNow()}
function scheduleSave(){
  if(saveTimer)return;
  const delay=Math.max(0,900-(Date.now()-lastSaveTime));
  saveTimer=setTimeout(()=>{saveTimer=null;saveProgressNow()},delay);
}
let frame=0,lastFrame=0,carry=0;function animate(t){cancelAnimationFrame(frame);lastFrame=0;carry=0;if(!settings.auto||!main)return;const tick=now=>{if(!settings.auto||!main)return;if(!lastFrame)lastFrame=now;const delta=Math.min(now-lastFrame,100);lastFrame=now;carry+=settings.speed*14*delta/1000;const move=Math.floor(carry);if(move){main.scrollTop+=move;carry-=move}frame=requestAnimationFrame(tick)};frame=requestAnimationFrame(tick)}
function normalizeSettings(value){
  const input=value&&typeof value==='object'?value:{},number=(key,min,max)=>Number.isFinite(+input[key])?Math.min(max,Math.max(min,+input[key])):defaults[key];
  const customSelectors={};
  for(const [hostname,selector] of Object.entries(input.customSelectors||{}).slice(0,100))if(/^[a-z0-9.-]+$/i.test(hostname)&&typeof selector==='string'&&selector.trim())customSelectors[hostname]=selector.trim().slice(0,180);
  return {...defaults,theme:['paper','green','dark'].includes(input.theme)?input.theme:defaults.theme,fontSize:number('fontSize',15,32),lineHeight:number('lineHeight',1.4,2.6),width:number('width',550,1200),speed:number('speed',1,8),auto:false,customSelector:typeof input.customSelector==='string'?input.customSelector.trim().slice(0,180):'',customSelectors};
}
async function waitForChapter(){
  let chapter;
  for(let attempt=0;attempt<17;attempt++){
    chapter=parsePage(document,location.href);
    if(chapter.lines.join('').length>=120||attempt===16)return chapter;
    await new Promise(resolve=>setTimeout(resolve,250));
    if(location.href!==currentURL)throw Error('原站页面已切换，请在新章节加载完成后重试');
  }
  return chapter;
}
async function openReader(){
  if(host){close();return}
  if(opening)return;
  opening=true;
  try{
  sessionToken++;autoBlocked=false;lastLoadTime=0;lastSaveTime=0;
  settings=normalizeSettings((await chrome.storage.local.get('novelFlowSettings')).novelFlowSettings);
  if(settings.customSelector){if(!settings.customSelectors[location.hostname])settings.customSelectors[location.hostname]=settings.customSelector;settings.customSelector=''}
  currentURL=location.href;let ch;
  try{ch=await waitForChapter()}catch(e){alert('阅流：'+e.message);return}
  if(location.href!==currentURL)return;
  if(ch.lines.join('').length<120){alert('阅流：未能识别足够的小说正文。请先打开具体章节页面，或为该网站设置正文选择器。');return}
  chapters=[];loadedPages=0;setup();if(!appendChapter(ch)){close();alert('阅流：正文为空，无法开启阅读视图。');return}
  const key='novelFlowProgress:'+location.origin+location.pathname,saved=(await chrome.storage.local.get(key))[key];
  if(saved&&Date.now()-saved.at<30*86400000&&canonical(saved.url)===canonical(ch.url))main.scrollTop=Math.min(saved.offset,main.scrollHeight-main.clientHeight);
  showStatus(ch.next?'滑动到底部，自动载入后续内容':ch.nextWarning||'没有找到后续章节，可在原网页使用站点导航。');
  updateReadingFooter();updateNextButton();animate();scheduleAutoNext();
  }finally{opening=false}
}
function close(){
  if(host)flushProgress();
  sessionToken++;autoBlocked=false;clearTimeout(preloadTimer);preloadTimer=null;requestController?.abort();requestController=null;
  if(activeRequestId)chrome.runtime.sendMessage({type:'NOVEL_CANCEL',requestId:activeRequestId}).catch(()=>{});activeRequestId=null;
  pauseAuto(false);clearTimeout(saveTimer);saveTimer=null;clearInterval(timer);timer=null;clearInterval(routeTimer);routeTimer=null;
  if(visibilityHandler){document.removeEventListener('visibilitychange',visibilityHandler);window.removeEventListener('focus',visibilityHandler);visibilityHandler=null}
  if(main){main.removeEventListener('scroll',onScroll);if(manualPauseHandler){main.removeEventListener('wheel',manualPauseHandler);main.removeEventListener('touchstart',manualPauseHandler)}}
  if(pageHideHandler){window.removeEventListener('pagehide',pageHideHandler);pageHideHandler=null}
  if(keyHandler)document.removeEventListener('keydown',keyHandler,true);keyHandler=null;manualPauseHandler=null;
  host?.remove();restoreOriginalPage();host=null;shadow=null;main=null;chapters=[];loading=false;store();
}
chrome.runtime.onMessage.addListener(msg=>{if(msg.type==='NOVEL_TOGGLE')openReader().catch(e=>alert('阅流：'+e.message))});
})();
