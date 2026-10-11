import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { pathToFileURL } from 'node:url';

const runtime = readFileSync(new URL('../src/runtime/summary.js', import.meta.url), 'utf8');
function element(dataset = {}) {
  return { dataset, hidden:true, open:false, textContent:'', attributes:{}, listeners:new Map(), top:0, height:100,
    addEventListener(type,fn,options) { const list=this.listeners.get(type)||[]; list.push({fn,options}); this.listeners.set(type,list); },
    removeEventListener(type,fn) { this.listeners.set(type,(this.listeners.get(type)||[]).filter(x=>x.fn!==fn)); },
    async dispatch(type,event={}) { for(const x of [...(this.listeners.get(type)||[])]) { await x.fn(event); if(x.options?.once)this.removeEventListener(type,x.fn); } },
    setAttribute(name,value) {this.attributes[name]=value;}, removeAttribute(name) {delete this.attributes[name];},
    getBoundingClientRect() {return {top:this.top,height:this.height};}, focus() {this.focused=true;}, select() {this.selected=true;},
  };
}
export function summaryFixture({navigator={}, observerFailure, reduced=false, hash=''}={}) {
  const window=element(),sources=element({toc:'sources'}),sourceLink=element(),body=element(),meter=element(),percent=element(),progress=element();
  const sections=[element({toc:'s1'}),element({toc:'s2'}),sources];
  sections.forEach((e,i)=>{e.top=100+i*800;e.hidden=false;});
  body.height=2400;body.top=100;body.hidden=false;
  const links=sections.map(e=>element({tocLink:e.dataset.toc}));
  const controls=Object.fromEntries(['status','input','copy','native','toast'].map(k=>[k,element()]));
  const selectors={'[data-share-status]':controls.status,'input':controls.input,'[data-share-copy]':controls.copy,'[data-share-native]':controls.native,'[data-share-toast]':controls.toast};
  const panel={dataset:{shareUrl:'https://example.com/en/datasets/test/',shareTitle:'Test',copySuccess:'copied',copyFallback:'copy-failed',shareSuccess:'opened',shareFallback:'share-failed'},querySelector:q=>selectors[q]};
  progress.querySelector=q=>q==='progress'?meter:percent;
  const singles={'#sources':sources,'[data-reading-body]':body,'[data-reading-progress]':progress,'[data-summary-share]':panel};
  const document={documentElement:{clientHeight:800},querySelector:q=>singles[q]||null,querySelectorAll:q=>q==='[data-open-sources]'?[sourceLink,links[2]]:q==='[data-toc]'?sections:q==='[data-toc-link]'?links:[]};
  let nextFrame=0;const frames=new Map(),timers=new Map();let nextTimer=0;
  window.innerHeight=800;
  window.requestAnimationFrame=fn=>{frames.set(++nextFrame,fn);return nextFrame;};
  window.cancelAnimationFrame=id=>frames.delete(id);
  window.setTimeout=(fn,ms)=>{timers.set(++nextTimer,{fn,ms});return nextTimer;};
  window.clearTimeout=id=>timers.delete(id);
  window.matchMedia=()=>({matches:reduced});
  const location={hash};let observer;
  class Observer { constructor(callback,options){if(observerFailure==='constructor')throw Error('Observer unavailable'); this.callback=callback;this.options=options;this.targets=[];observer=this;} observe(target){if(observerFailure==='observe')throw Error('Observe failed');this.targets.push(target);} disconnect(){this.disconnected=true;} }
  vm.runInNewContext(runtime,{document,window,location,navigator,IntersectionObserver:Observer});
  return {window,document,location,sources,sourceLink,body,meter,percent,progress,sections,links,controls,panel,observer,frames,timers,
    flush(){for(const [id,fn]of [...frames]){frames.delete(id);fn();}},
  };
}
export async function validateSummaryRuntime() {
  let checks=0;
  const missing=summaryFixture();
  assert.equal(missing.controls.native.hidden,true);
  await missing.controls.copy.dispatch('click');
  assert.equal(missing.controls.status.textContent,'copy-failed — https://example.com/en/datasets/test/');
  assert(missing.controls.input.focused&&missing.controls.input.selected);
  assert.equal(missing.controls.toast.hidden,false);assert.equal([...missing.timers.values()][0].ms,3200);
  [...missing.timers.values()][0].fn();assert.equal(missing.controls.toast.hidden,true);assert(missing.controls.status.textContent.includes('https://example.com'));checks++;
  let written;const success=summaryFixture({navigator:{clipboard:{writeText:async url=>{written=url;}}}});
  await success.controls.copy.dispatch('click');assert.equal(written,success.panel.dataset.shareUrl);assert.equal(success.controls.status.textContent,'copied');checks++;
  const denied=summaryFixture({navigator:{clipboard:{writeText:async()=>{throw Error('Denied');}}}});await denied.controls.copy.dispatch('click');assert(denied.controls.input.selected);assert(denied.controls.status.textContent.startsWith('copy-failed'));checks++;
  const cancelled=summaryFixture({navigator:{share:async()=>{throw {name:'AbortError'};}}});await cancelled.controls.native.dispatch('click');assert.equal(cancelled.controls.status.textContent,'');checks++;
  const failed=summaryFixture({navigator:{share:async()=>{throw Error('Failure');}}});await failed.controls.native.dispatch('click');assert(failed.controls.input.selected);assert(failed.controls.status.textContent.startsWith('share-failed'));checks++;
  const shared=summaryFixture({navigator:{share:async()=>{}}});await shared.controls.native.dispatch('click');assert.equal(shared.controls.status.textContent,'opened');checks++;
  const facts=summaryFixture();assert.equal(facts.sources.open,false);let prevented=false;await facts.sourceLink.dispatch('click',{preventDefault(){prevented=true;}});assert(facts.sources.open);assert.equal(prevented,false);checks++;
  const hash=summaryFixture({hash:'#sources'});assert(hash.sources.open);hash.sources.open=false;await hash.window.dispatch('hashchange');assert(hash.sources.open);checks++;
  const scroll=summaryFixture();assert.equal(scroll.meter.value,15);assert.equal(scroll.links[0].attributes['aria-current'],'location');
  scroll.body.top=-800;scroll.sections[0].top=-800;scroll.sections[1].top=100;
  await scroll.window.dispatch('scroll');await scroll.window.dispatch('scroll');assert.equal(scroll.frames.size,1);scroll.flush();assert.equal(scroll.meter.value,60);assert.equal(scroll.links[1].attributes['aria-current'],'location');assert.equal(scroll.links[0].attributes['aria-current'],undefined);
  scroll.body.top=-5000;await scroll.window.dispatch('resize');scroll.flush();assert.equal(scroll.meter.value,100);
  scroll.body.top=2000;await scroll.window.dispatch('scroll');scroll.flush();assert.equal(scroll.meter.value,0);checks++;
  for(const observerFailure of ['constructor','observe']){const f=summaryFixture({observerFailure});await f.sourceLink.dispatch('click');assert(f.sources.open);await f.controls.copy.dispatch('click');assert(f.controls.input.selected);f.body.top=-800;await f.window.dispatch('scroll');f.flush();assert.equal(f.meter.value,60);assert.equal(f.body.hidden,false);assert(f.sections.every(s=>s.hidden===false));checks++;}
  const reduced=summaryFixture({reduced:true});assert.equal(reduced.body.hidden,false);await reduced.sourceLink.dispatch('click');assert(reduced.sources.open);assert(!runtime.includes('.animate(')&&!runtime.includes('scrollIntoView('));checks++;
  const cached=summaryFixture();await cached.window.dispatch('pagehide',{persisted:true});await cached.sourceLink.dispatch('click');assert(cached.sources.open);assert.equal(cached.observer.disconnected,undefined);await cached.window.dispatch('pagehide',{persisted:false});assert(cached.observer.disconnected);checks++;
  const cleanup=summaryFixture();await cleanup.window.dispatch('scroll');await cleanup.controls.copy.dispatch('click');await cleanup.window.dispatch('pagehide',{persisted:false});assert.equal(cleanup.frames.size,0);assert.equal(cleanup.timers.size,0);assert(cleanup.observer.disconnected);cleanup.sources.open=false;await cleanup.sourceLink.dispatch('click');assert.equal(cleanup.sources.open,false);checks++;
  return checks;
}
if (process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href) console.log(`PASS ${await validateSummaryRuntime()} article runtime fixtures.`);
