/* Optional public-page probe. It uses an isolated browser profile and authored URLs.
 * Set NF_LIVE_URLS to a comma-separated list to replace the defaults.
 */
const {chromium}=require('playwright');
const fs=require('node:fs/promises');
const os=require('node:os');
const path=require('node:path');

const extension=path.resolve(__dirname,'..');
const defaults=[
  'https://www.kuaiyankanshu.info/book/61776/13395752.html',
  'https://www.biquge345.com/chapter/737622/470462211.html',
  'https://www.biquge555.net/book/6826/4224200.html',
  'https://www.kuaiyankanshucn.com/1/read_1.html',
  'https://www.kuaiyankanshuinfo.com/1/read_1.html',
  'https://api.wmcms.foxcms.xin/module/novel/read.php?tid=3&nid=12209&cid=743676',
  'http://demo1.enovelcms.cn/read/1/1'
];
const urls=(process.env.NF_LIVE_URLS||defaults.join(',')).split(',').map(s=>s.trim()).filter(Boolean).slice(0,8);
const clickCount=Math.max(0,Math.min(3,Number(process.env.NF_LIVE_CLICKS??(process.env.NF_LIVE_CLICK==='1'?1:0))||0));

(async()=>{
  const profile=await fs.mkdtemp(path.join(os.tmpdir(),'novelflow-live-'));
  const context=await chromium.launchPersistentContext(profile,{
    headless:true,
    executablePath:process.env.CHROME_PATH||undefined,
    ignoreDefaultArgs:['--disable-extensions'],
    ignoreHTTPSErrors:true,
    args:['--enable-unsafe-extension-debugging'],
    viewport:{width:1400,height:900}
  });
  const results=[];
  try{
    const cdp=await context.browser().newBrowserCDPSession();
    const {id}=await cdp.send('Extensions.loadUnpacked',{path:extension});
    for(const url of urls){
      const page=await context.newPage();
      const item={url};
      const dialogs=[];
      page.on('dialog',async dialog=>{dialogs.push(dialog.message());await dialog.dismiss().catch(()=>{})});
      try{
        await page.route('**/*',route=>['image','media','font'].includes(route.request().resourceType())?route.abort():route.continue());
        const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:20000});
        await page.waitForTimeout(1200);
        item.http=response?.status()||null;
        item.finalURL=page.url();
        item.source=await page.evaluate(()=>{
          const pick=selector=>document.querySelector(selector);
          const next=pick('#next_url, #j_chapterNext, .art_ctrl#chapterinfo a:last-child, .chapter-nav a[rel="next"], a[rel="next"], a[title*="下一章"]');
          const article=pick('#article.content, #fullContent, #contentBody, #chapterContent, .j_readContent, .art_fm .art_cnt, .art_cnt, #content');
          return {
            title:document.title,
            articleSelector:article?.id?`#${article.id}`:article?.className?`.${String(article.className).trim().split(/\s+/).join('.')}`:'',
            articleCharacters:article?.textContent?.trim().length||0,
            articleSample:article?.textContent?.replace(/\s+/g,' ').trim().slice(0,300)||'',
            nextText:next?.textContent?.trim()||'',
            nextHref:next?.getAttribute('href')||'',
            nextDisabled:!!next&&(next.matches('[disabled],[aria-disabled="true"]')||/disabled|is-disabled/.test(next.className)),
            candidates:['#article.content','#fullContent','#contentBody','#chapterContent','.j_readContent','.art_fm .art_cnt','.read-section.jsChapterWrapper'].map(selector=>{
              const node=pick(selector);
              return {selector,found:!!node,characters:node?.textContent?.trim().length||0};
            })
          };
        });
        const targets=await cdp.send('Target.getTargets',{filter:[{type:'tab',exclude:false}]});
        const target=targets.targetInfos.filter(t=>t.url===page.url()).at(-1);
        if(!target)throw Error('找不到页面标签');
        await cdp.send('Extensions.triggerAction',{id,targetId:target.targetId});
        await page.locator('#novelflow-host #screen').waitFor({timeout:7000});
        item.reader=await page.evaluate(()=>{
          const root=document.querySelector('#novelflow-host')?.shadowRoot;
          const chapters=[...root.querySelectorAll('section.chapter')];
          const button=root.querySelector('#next-chapter-button');
          const text=chapters.map(s=>s.textContent).join('\n');
          return {chapters:chapters.length,characters:chapters.reduce((n,s)=>n+s.textContent.length,0),paragraphs:chapters.reduce((n,s)=>n+s.querySelectorAll('p').length,0),sample:text.replace(/\s+/g,' ').trim().slice(0,300)||'',tail:text.replace(/\s+/g,' ').trim().slice(-400)||'',knownNoise:/作者有话说|显示所有文的作话|快眼看书booksky已将原网页|本站仅提供资源搜索服务|推荐阅读/.test(text),title:chapters[0]?.querySelector('h1')?.textContent||'',next:button?.textContent||'',nextDisabled:!!button?.disabled};
        });
        if(clickCount&&!item.reader.nextDisabled){
          item.afterClicks=[];
          for(let click=1;click<=clickCount;click++){
            const before=await page.evaluate(()=>{
              const root=document.querySelector('#novelflow-host')?.shadowRoot;
              const chapters=[...root.querySelectorAll('section.chapter')];
              return {chapters:chapters.length,characters:chapters.reduce((n,s)=>n+s.textContent.length,0),next:root.querySelector('#next-chapter-button')?.textContent||'',disabled:!!root.querySelector('#next-chapter-button')?.disabled};
            });
            if(before.disabled)break;
            await page.locator('#novelflow-host #next-chapter-button').click();
            await page.waitForFunction(before=>{
              const root=document.querySelector('#novelflow-host')?.shadowRoot;
              if(!root)return true;
              const status=root.querySelector('#status')?.textContent||'';
              const chapters=[...root.querySelectorAll('section.chapter')];
              return chapters.length>before.chapters||chapters.reduce((n,s)=>n+s.textContent.length,0)>before.characters+20||/翻页暂停|失败|登录|订阅|付费|安全验证|超时/.test(status);
            },before,{timeout:18000}).catch(()=>{});
            const state=await page.evaluate(()=>{
              const root=document.querySelector('#novelflow-host')?.shadowRoot;
              const chapters=[...root.querySelectorAll('section.chapter')];
              const button=root.querySelector('#next-chapter-button');
              return {chapters:chapters.length,characters:chapters.reduce((n,s)=>n+s.textContent.length,0),paragraphs:chapters.reduce((n,s)=>n+s.querySelectorAll('p').length,0),lastTitle:chapters.at(-1)?.querySelector('h1')?.textContent||'',next:button?.textContent||'',nextDisabled:!!button?.disabled,status:root?.querySelector('#status')?.textContent||''};
            });
            item.afterClicks.push(state);
            if(/翻页暂停|失败|登录|订阅|付费|安全验证|超时/.test(state.status)||state.nextDisabled)break;
          }
          item.afterClick=item.afterClicks.at(-1);
        }else if(clickCount){
          item.afterClick={skipped:'原站没有可靠的可点击下一章入口'};
        }
      }catch(e){item.error=e.message;if(dialogs.length)item.dialogs=dialogs;}
      results.push(item);
      console.log(JSON.stringify(item));
      await page.close();
    }
  }finally{
    await context.close();
  }
  const target=process.env.NF_LIVE_REPORT||path.join(__dirname,'live-results.json');
  await fs.writeFile(target,JSON.stringify({date:new Date().toISOString(),results},null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
