/* Daily itinerary, place drawer and offline travel support. No account or API key. */
(() => {
  'use strict';
  const facts = TRAVEL_FACTS;
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const esc = escapeHTML;
  const memory = { read(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }, write(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} } };
  let selectedDay = 1, currentView = 'itinerary', languageCategory = '本日點餐', toastTimer;
  const visited = new Set(memory.read('fukuoka-visited', []));
  const names = (day, i) => DATA.days[day - 1][i][1] ? DATA.places[DATA.days[day - 1][i][1]][0] : (facts.flexible[day + ':' + i] || '自由安排');
  const allPhrases = new Map();
  let phraseIndex = 0;
  for (const [key, menu] of Object.entries(DATA.menus)) {
    allPhrases.set(key, menu[2].map(([ja, zh]) => ({ ja, zh, file: 'assets/audio/phrase' + String(++phraseIndex).padStart(2, '0') + '.mp3' })));
  }
  const travelPhrases = facts.language.map(([id, category, ja, zh]) => ({ id, category, ja, zh, file: 'assets/audio/' + id + '.mp3' }));
  const toast = document.createElement('div'); toast.className = 'field-toast'; toast.hidden = true; toast.setAttribute('role', 'status'); document.body.append(toast);
  function announce(text) { clearTimeout(toastTimer); toast.textContent = text; toast.hidden = false; toastTimer = setTimeout(() => toast.hidden = true, 2600); }
  async function copy(text, button) {
    try { await navigator.clipboard.writeText(text); announce('已複製地址'); }
    catch { const line = button.previousElementSibling; if (line) { const selection = window.getSelection(), range = document.createRange(); range.selectNodeContents(line); selection.removeAllRanges(); selection.addRange(range); } announce('請長按已選取的地址複製'); }
  }
  function stopAudio() { $$('audio').forEach(a => a.pause()); }
  document.addEventListener('play', event => { if (event.target instanceof HTMLMediaElement) $$('audio').forEach(a => { if (a !== event.target) a.pause(); }); }, true);

  // One full-screen phrase, suitable for showing a driver or member of staff.
  const phraseDialog = document.createElement('dialog'); phraseDialog.className = 'phrase-display';
  phraseDialog.innerHTML = '<button class="field-button display-close" type="button" aria-label="關閉日文大字卡">關閉 ×</button><p class="display-ja" lang="ja"></p><p class="display-zh"></p><audio controls preload="none" aria-label="日文發音"></audio>';
  document.body.append(phraseDialog);
  $('.display-close', phraseDialog).onclick = () => phraseDialog.close();
  phraseDialog.addEventListener('close', () => $('audio', phraseDialog).pause());
  function displayPhrase(phrase) {
    stopAudio(); $('.display-ja', phraseDialog).textContent = phrase.ja; $('.display-zh', phraseDialog).textContent = phrase.zh;
    const audio = $('audio', phraseDialog); audio.hidden = !phrase.file; if (phrase.file) audio.src = phrase.file; else audio.removeAttribute('src');
    phraseDialog.showModal();
  }
  function phraseCard(phrase) {
    const card = document.createElement('article'); card.className = 'phrase-card';
    card.innerHTML = '<p class="jp" lang="ja">' + esc(phrase.ja) + '</p><p class="zh">' + esc(phrase.zh) + '</p>' + (phrase.file ? '<audio controls preload="none" src="' + esc(phrase.file) + '" aria-label="' + esc(phrase.zh) + '"></audio>' : '') + '<button class="field-button" type="button">大字給店員看</button>';
    $('button', card).onclick = () => displayPhrase(phrase); return card;
  }
  function sourceLink(url, label) { return '<a class="source-link" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' + esc(label || '查看官方來源') + ' ↗</a>'; }
  function sourcesBlock(key) {
    const f = facts.places[key], rec = LIVE.recommendations[key];
    if (!f && !rec) return '';
    let html = '<details class="menu-source"><summary>來源與查核 · ' + facts.checked + '</summary>';
    if (f) { html += sourceLink(f.source, '地址／營業資訊來源'); if (f.extraSource) html += sourceLink(f.extraSource, 'THE ROOF 官方時段'); }
    if (rec) html += rec.sources.map(s => sourceLink(s.url, s.title)).join('');
    const rating = LIVE.ratings[key]; if (rating?.source) html += sourceLink(rating.source, 'Google 評分快照來源');
    return html + '<p class="helper-note">營業時間與價格為查核快照；臨時休業、售完及班次依當日資訊。</p></details>';
  }
  function mealContent(key, host) {
    const rec = LIVE.recommendations[key]; if (!rec) return;
    const photos = document.createElement('div'); photos.className = 'menu-photos';
    for (const p of rec.photos) if (LIVE.photos[p]) photos.append(photoFigure(p));
    if (photos.children.length) host.append(photos);
    for (const item of rec.items) {
      const article = document.createElement('article'); article.className = 'dish';
      article.innerHTML = '<h4>' + esc(item.zh) + '<span lang="ja">' + esc(item.ja) + '</span></h4><div class="dish-price">' + esc(item.price) + '</div><p>' + esc(item.why) + '</p><details class="menu-source"><summary>推薦依據</summary><p>' + esc(item.basis) + '</p></details>';
      host.append(article);
    }
    const pair = document.createElement('p'); pair.innerHTML = '<b>兩人這樣點</b><br>' + esc(rec.pair); host.append(pair);
  }

  // Keep the itinerary's complete letter map as the first view, with Google as a second mode.
  const originalMode = setMapMode;
  setMapMode = function(day, mode) {
    originalMode(day, mode); const host = $('#planner' + day), actual = mapModes.get(day);
    $('.mapcaption', host).textContent = actual === 'google' ? 'Google 參考地圖 · 全部站點與動畫在「今日完整路線」' : 'A → B 依序造訪 · 實線為道路，未定地點保留在清單';
    $$('.map-mode-switch button', host).forEach(b => { b.setAttribute('aria-pressed', String(b.dataset.mode === actual)); });
    const geo = $('.geo-button', host); if (geo) geo.hidden = actual !== 'animation';
  };
  DATA.days.forEach((rows, idx) => {
    const day = idx + 1, host = $('#planner' + day), section = host.closest('.day');
    const note = document.createElement('p'); note.className = 'day-note'; note.textContent = facts.daily[idx].note; $('.dayhead', section).after(note);
    $('.map-mode-switch [data-mode="animation"]', host).textContent = '今日完整路線';
    $('.map-mode-switch [data-mode="google"]', host).textContent = 'Google 地圖';
    const toggle = $('.map-mode-switch', host); toggle.prepend($('[data-mode="animation"]', toggle));
    const heading = document.createElement('div'); heading.className = 'daily-heading'; heading.innerHTML = '<h3>今日行程</h3><span>' + rows.length + ' 站</span>'; $('.trip-points', host).before(heading);
    $$('.trip-point', host).forEach((point, i) => { $('.point-name', point).textContent = names(day, i); point.classList.toggle('visited', visited.has(day + ':' + i)); point.setAttribute('aria-label', letters[i] + ' ' + names(day, i) + '，' + rows[i][0]); });
    $('.play-trip', host).textContent = '▶ 播放路線'; $('.replay-trip', host).textContent = '重播'; $('.overview-trip', host).textContent = '總覽';
    const geo = document.createElement('button'); geo.className = 'geo-button'; geo.type = 'button'; geo.textContent = '◎ 我的位置'; geo.onclick = () => locate(day); $('.mapbox', host).append(geo);
    const status = document.createElement('p'); status.className = 'geo-status'; status.setAttribute('role', 'status'); status.hidden = true; $('.mapbox', host).after(status);
    const state = tripStates.get(day), old = state.detail;
    const dialog = document.createElement('dialog'); dialog.className = 'trip-detail'; dialog.dataset.day = day; dialog.hidden = true; dialog.setAttribute('aria-label', '行程地點詳情'); old.remove(); document.body.append(dialog); state.detail = dialog;
    dialog.addEventListener('close', () => { stopAudio(); dialog.hidden = true; document.body.classList.remove('modal-open'); });
    dialog.addEventListener('click', e => { if (e.target !== dialog) return; const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); });
    setMapMode(day, 'animation');
  });

  function setDetailTab(dialog, tab) {
    $$('.detail-tabs button', dialog).forEach(b => { const active = b.dataset.tab === tab; b.classList.toggle('active', active); b.setAttribute('aria-selected', String(active)); b.tabIndex = active ? 0 : -1; });
    $$('.detail-pane', dialog).forEach(p => p.hidden = p.dataset.pane !== tab);
    $('.detail-body', dialog).scrollTop = 0;
    dialog.style.setProperty('--detail-header-height', $('.detail-header', dialog).getBoundingClientRect().height + 'px');
    stopAudio();
  }
  function showEmbeddedLeg(day, index, mode) {
    const rows = DATA.days[day - 1], a = rows[index - 1]?.[1], b = rows[index][1]; if (!a || !b) return;
    const dialog = tripStates.get(day).detail, panel = $('#live' + day), pane = $('[data-pane="transport"]', dialog);
    $('h3', panel).textContent = ({walking:'步行',transit:'大眾運輸',driving:'開車'})[mode] + '｜' + letters[index - 1] + ' → ' + letters[index];
    const note = $('p', panel); if (note) note.textContent = navigator.onLine ? 'Google 路線依查詢當下顯示；出發時再確認班次與候車。' : '目前離線；請參考上方已保存的交通建議。';
    $('iframe', panel).hidden = !navigator.onLine;
    if (navigator.onLine) $('iframe', panel).src = googleRouteEmbed([DATA.places[a][3], DATA.places[b][3]], mode);
    $('.photo', panel).replaceChildren(); panel.hidden = false; pane.append(panel);
    const route = cachedRoute(a, b, mode); const box = $('.road-summary', pane); if (box) box.remove();
    if (route) { const summary = document.createElement('div'); summary.className = 'road-summary'; summary.innerHTML = roadSummary(route); $('.detail-actions', pane).after(summary); }
    panel.scrollIntoView({block:'nearest',behavior:reducedMotion?'instant':'smooth'});
  }
  const previousSelection = selectTripStop;
  selectTripStop = function(day, index, options = {}) {
    previousSelection(day, index, options);
    const state = tripStates.get(day), rows = DATA.days[day - 1], row = rows[index]; if (!state || !row) return;
    const dialog = state.detail, key = row[1], f = facts.places[key], rec = LIVE.recommendations[key], panel = $('#live' + day);
    $('#planner' + day).append(panel); panel.hidden = true;
    if (options.playback) { if (dialog.open) dialog.close(); dialog.hidden = true; return; }
    dialog.hidden = false;
    dialog.innerHTML = '<header class="detail-header"><div><div class="detail-time">11/' + (12 + day) + ' · ' + esc(row[0]) + '</div><h3 id="detail-title-' + day + '"><span class="letter ' + (!key?'pendingletter':'') + '">' + letters[index] + '</span><span>' + esc(names(day,index)) + '</span></h3></div><button class="close-stop" type="button" aria-label="收起所選行程點詳情">×</button></header><div class="detail-tabs" role="tablist" aria-label="地點資訊"><button role="tab" data-tab="transport" id="tab-' + day + '-transport" aria-controls="pane-' + day + '-transport">怎麼到</button><button role="tab" data-tab="visit" id="tab-' + day + '-visit" aria-controls="pane-' + day + '-visit">' + (rec?'吃什麼':'看什麼') + '</button><button role="tab" data-tab="language" id="tab-' + day + '-language" aria-controls="pane-' + day + '-language">說日文</button></div><div class="detail-body"><section class="detail-pane" role="tabpanel" data-pane="transport" id="pane-' + day + '-transport" aria-labelledby="tab-' + day + '-transport"></section><section class="detail-pane" role="tabpanel" data-pane="visit" id="pane-' + day + '-visit" aria-labelledby="tab-' + day + '-visit"></section><section class="detail-pane" role="tabpanel" data-pane="language" id="pane-' + day + '-language" aria-labelledby="tab-' + day + '-language"></section></div><footer class="detail-nav"><button class="previous-stop" type="button" ' + (index===0?'disabled':'') + '>← 上一站</button><button class="visited-toggle" type="button"></button><button class="next-stop" type="button" ' + (index===rows.length-1?'disabled':'') + '>下一站 →</button></footer>';
    dialog.setAttribute('aria-labelledby', 'detail-title-' + day);
    $('.close-stop', dialog).onclick = () => dialog.close();
    $('.previous-stop', dialog).onclick = () => selectTripStop(day,index-1);
    $('.next-stop', dialog).onclick = () => selectTripStop(day,index+1);
    const visitButton = $('.visited-toggle', dialog); const updateVisit = () => { const done = visited.has(day+':'+index); visitButton.textContent = done?'✓ 已到訪':'標記到訪'; visitButton.setAttribute('aria-pressed',String(done)); };
    updateVisit(); visitButton.onclick = () => { const id = day+':'+index; visited.has(id)?visited.delete(id):visited.add(id); memory.write('fukuoka-visited',[...visited]); state.points.children[index].classList.toggle('visited',visited.has(id)); updateVisit(); };
    const transport = $('[data-pane="transport"]', dialog), visit = $('[data-pane="visit"]', dialog), language = $('[data-pane="language"]', dialog);
    transport.innerHTML = '<div class="incoming"><b>' + esc(index?letters[index-1]+' '+names(day,index-1)+' → '+letters[index]:'本日第一站') + '</b><p>' + esc(row[2]) + '</p></div><p>' + esc(row[3]) + '</p>';
    if (key && f) {
      const address = document.createElement('div'); address.className = 'address-block'; address.innerHTML = '<span lang="ja">' + esc(DATA.places[key][3]+'\n'+f.address).replace(/\n/g,'<br>') + '</span><button type="button">複製地址</button> <button type="button" class="taxi-card">給司機看</button>';
      $('button', address).onclick = e => copy(DATA.places[key][3]+'\n'+f.address, e.currentTarget);
      $('.taxi-card', address).onclick = () => displayPhrase({ja:DATA.places[key][3]+'\n'+f.address,zh:'請載我們到這裡。',file:null}); transport.append(address);
      if (f.transit) { const p = document.createElement('p'); p.textContent = f.transit; transport.append(p); }
    }
    if (key && rows[index-1]?.[1] && rows[index-1][1] !== key) {
      const actions = document.createElement('div'); actions.className = 'detail-actions';
      for (const [mode,label] of [['walking','步行路線'],['transit','大眾運輸'],['driving','計程車／開車']]) { const b = document.createElement('button'); b.type = 'button'; b.textContent = label; b.onclick = () => showEmbeddedLeg(day,index,mode); actions.append(b); }
      transport.append(actions);
    }
    if (!key) { const p = document.createElement('p'); p.className = 'helper-note'; p.textContent = day===3&&index===5?'這一站留給你們的私人安排。沒有公開地址，地圖不顯示位置。':'這段保留彈性；選好店家後，向飯店詢問路線或用頁內 Google 地圖搜尋。'; transport.append(p); }
    if (key && LIVE.photos[key] && !rec) visit.append(photoFigure(key));
    if (f) { const p = document.createElement('p'); p.textContent = f.tip; visit.append(p); const hours = document.createElement('div'); hours.className = 'hour-block'; hours.innerHTML = '<h4>營業／參訪時間</h4><p>' + esc(f.hours) + '</p>'; visit.append(hours); }
    else { const p = document.createElement('p'); p.textContent = row[3]; visit.append(p); }
    const rating = LIVE.ratings[key]; if (rating && typeof rating.score === 'number') { const el = document.createElement('div'); el.className = 'verified-rating'; el.innerHTML = '<strong>★ '+rating.score.toFixed(1)+'</strong> Google'+(rating.reviewCount?' · '+rating.reviewCount.toLocaleString()+' 則評論':'')+'<small>'+facts.checked+' 查核快照</small>'; visit.append(el); }
    if (rec) mealContent(key, visit);
    const source = document.createElement('div'); source.innerHTML = sourcesBlock(key); visit.append(source);
    const phrases = allPhrases.get(key) || (key==='airport'?travelPhrases.filter(p=>p.id==='support01') : key==='miyako'?travelPhrases.filter(p=>['support02','support08'].includes(p.id)) : key==='one'?travelPhrases.filter(p=>['support03','support08'].includes(p.id)) : travelPhrases.filter(p=>['support03','support04','support11'].includes(p.id)));
    for (const phrase of phrases) language.append(phraseCard(phrase));
    const synth = document.createElement('p'); synth.className = 'helper-note'; synth.textContent = '日文合成語音 · 可離線播放'; language.append(synth);
    $$('.detail-tabs button', dialog).forEach(b => {
      b.onclick = () => setDetailTab(dialog,b.dataset.tab);
      b.onkeydown = e => { if (!['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) return; e.preventDefault(); const tabs = $$('.detail-tabs button', dialog), i = tabs.indexOf(b), next = e.key==='Home'?0:e.key==='End'?2:(i+(e.key==='ArrowRight'?1:2))%3; setDetailTab(dialog,tabs[next].dataset.tab); tabs[next].focus(); };
    });
    if (!dialog.open) dialog.showModal(); document.body.classList.add('modal-open');
    setDetailTab(dialog,'transport'); dialog.scrollTop = 0;
    memory.write('fukuoka-last-stop',{day,index});
  };

  // Four destinations, each with only the information needed in that moment.
  const languageSection = document.createElement('section'); languageSection.id='language'; languageSection.className='field-section';
  languageSection.innerHTML='<h2>日文隨身卡</h2><div class="language-categories" role="group" aria-label="日文分類"></div><div class="language-content"></div><p class="helper-note">合成日文語音；餐點用語與各店推薦品項相對應。</p>';
  const support = document.createElement('section'); support.id='support'; support.className='field-section';
  support.innerHTML='<h2>旅途支援</h2><section class="field-card"><h3>把旅程放進口袋</h3><button type="button" class="field-button primary wide" id="save-offline">保存離線內容</button><p class="inline-status" id="offline-state" role="status">正在檢查離線內容…</p><details class="support-details"><summary>離線範圍與加入主畫面</summary><p>行程、實景照片與日文音檔可保存。Google 地圖、線上路線及背景圖磚需要網路；離線時保留地點順序示意，不能作即時道路導航。</p><p>iPhone：Safari 分享 → 加入主畫面。Android：Chrome 選單 → 加到主畫面。首次請保持網路直到顯示保存完成。</p><a class="field-button" href="offline.html" download>下載單檔備份</a></details></section><section class="field-card" id="hotel-support"></section><details class="support-details" id="transport-support"><summary>機場與太宰府交通</summary></details><details class="support-details" id="rain-support"><summary>下雨或走累了</summary></details><details class="support-details"><summary>預約與航班紀錄</summary><ul class="reservation-list"><li>博多都酒店、ONE FUKUOKA HOTEL：原行程記錄已訂。</li><li>11/13 水炊鍋晚餐：待選店。</li><li>11/14 せいもん払い：訂位待確認。</li><li>11/15 紀念日晚餐：私人安排，不公開餐廳。</li><li>11/16 魚男午餐：候位／預約規則待確認。</li><li>11/16 18:30 やま中赤坂店：原行程記錄已訂。</li><li>11/17 19:20 返台：原稿航班時間，請以航空公司通知為準。</li></ul><p class="helper-note">本站未連接你們的訂位帳號；不包含姓名、訂位代碼或憑證。</p></details><details class="support-details"><summary>需要協助時</summary><p>JNTO 旅客諮詢：24 小時，提供中文、英文與韓文服務。</p><div class="field-actions"><a href="tel:+815038162787">旅客諮詢 050-3816-2787</a><a href="tel:110">警察 110</a><a href="tel:119">救護／消防 119</a></div>'+sourceLink(facts.help.source,'JNTO 官方聯絡資訊')+'</details><details class="support-details"><summary>資料來源與更新</summary><p>查核日期：'+facts.checked+'。評分、營業時間與價格為快照，交通時間為行程估時；不是即時車流、班次或空位。</p><p>照片來自店家官網與 Wikimedia Commons，每張附來源。原始季節、裝潢與當日餐點可能不同。</p>'+sourceLink('PHOTO-SOURCES.json','照片來源清單')+sourceLink('GOOGLE-RATINGS.json','Google 評分快照')+sourceLink('LOCATION-SOURCES.json','位置來源清單')+sourceLink('VERIFICATION.json','營業與活動查核清單')+'</details>';
  $('#order').after(languageSection,support);
  const nav=$('.bottomnav'); nav.innerHTML='<a href="#itinerary" data-view="itinerary">每日行程</a><a href="#food" data-view="food">美食</a><a href="#language" data-view="language">日文</a><a href="#support" data-view="support">旅途支援</a>';
  function setView(view, scroll=true) {
    if (!['itinerary','food','language','support'].includes(view)) view='itinerary';
    stopPlayback();stopAudio();currentView=view;document.body.dataset.view=view;
    $$('.bottomnav a').forEach(a=>{a.classList.toggle('active',a.dataset.view===view);a.setAttribute('aria-current',a.dataset.view===view?'page':'false');});
    if(view==='itinerary')requestAnimationFrame(()=>{maps[selectedDay]?.invalidateSize();arrangeTripLabels(selectedDay);});
    if(view==='language')renderLanguage();if(view==='support')renderSupport();
    if(scroll)$('#filters').scrollIntoView({block:'start',behavior:reducedMotion?'instant':'smooth'});
  }
  $$('.bottomnav a').forEach(a=>a.onclick=e=>{e.preventDefault();history.replaceState(null,'','#'+a.dataset.view);setView(a.dataset.view);});
  function renderLanguage() {
    const categories=['本日點餐','交通','餐廳','飯店','購物','求助'], buttons=$('.language-categories',languageSection);buttons.replaceChildren();
    for(const category of categories){const b=document.createElement('button');b.type='button';b.textContent=category;b.classList.toggle('active',languageCategory===category);b.setAttribute('aria-pressed',String(languageCategory===category));b.onclick=()=>{languageCategory=category;stopAudio();renderLanguage();};buttons.append(b);}
    const content=$('.language-content',languageSection);content.replaceChildren();
    if(languageCategory==='本日點餐'){
      for(const key of dailyDining[selectedDay]){
        const h=document.createElement('h3');h.className='phrase-group-title';h.textContent=key==='general'?'通用點餐':DATA.menus[key][0];content.append(h);
        for(const phrase of allPhrases.get(key)||[])content.append(phraseCard(phrase));
      }
    } else for(const phrase of travelPhrases.filter(p=>p.category===languageCategory))content.append(phraseCard(phrase));
  }
  for(const info of facts.transport){const card=document.createElement('section');card.className='field-card';card.innerHTML='<h3>'+esc(info.title)+'</h3><p>'+esc(info.body)+'</p>'+sourceLink(info.source,'官方交通資訊');$('#transport-support',support).append(card);}
  function renderSupport(){
    const daily=facts.daily[selectedDay-1],host=$('#hotel-support',support);host.innerHTML='<h3>今天的飯店</h3><p>'+esc(daily.hotel)+'</p><p class="helper-note">'+esc(facts.places[daily.hotelKey].address)+'</p><button class="field-button" type="button">查看位置與回程支援</button>';
    $('button',host).onclick=()=>{const i=DATA.days[selectedDay-1].findLastIndex(row=>row[1]===daily.hotelKey);selectTripStop(selectedDay,i);};
    $('#rain-support',support).innerHTML='<summary>下雨或走累了</summary><p>'+esc(daily.rain)+'</p>';
  }
  $('#order h2').textContent='今天吃什麼';$('#order .audiointro').textContent='各店招牌、推薦理由與兩人份量。';
  $$('#order .menubox').forEach(box=>{
    const key=box.dataset.menu;box.open=false;const verified=$('.restaurant-verified',box);
    if(verified){verified.replaceChildren();mealContent(key,verified);const sources=document.createElement('div');sources.innerHTML=sourcesBlock(key);verified.append(sources);const b=document.createElement('button');b.className='meal-language';b.type='button';b.textContent='日文點餐與語音';b.onclick=()=>{const i=DATA.days[selectedDay-1].findIndex(row=>row[1]===key);if(i>=0){selectTripStop(selectedDay,i);setDetailTab(tripStates.get(selectedDay).detail,'language');}};verified.append(b);}
    if(key==='general'||key==='sando')box.hidden=true;
    box.addEventListener('toggle',()=>{if(box.open) $$('#order .menubox').forEach(other=>{if(other!==box)other.open=false;});});
  });
  function updateFood(){let visible=0;$$('#order .menubox').forEach(box=>{box.hidden=!dailyDining[selectedDay].includes(box.dataset.menu)||!LIVE.recommendations[box.dataset.menu];box.open=false;if(!box.hidden)visible++;});let empty=$('.empty-selection',$('#order'));if(!empty){empty=document.createElement('p');empty.className='empty-selection';$('#order').append(empty);}empty.hidden=visible>0;empty.textContent='今天保留自由用餐與紀念日晚餐；通用點餐句在「日文」。';}
  $$('#filters button[data-day]').forEach(b=>b.addEventListener('click',()=>{selectedDay=Number(b.dataset.day);memory.write('fukuoka-day',selectedDay);tripStates.forEach(s=>{if(s.detail.open)s.detail.close();});setMapMode(selectedDay,'animation');updateFood();renderLanguage();renderSupport();b.scrollIntoView({inline:'nearest',block:'nearest'});if(currentView==='itinerary')requestAnimationFrame(()=>fitDaily(selectedDay));}));
  $$('#filters button[data-day]').forEach(b=>{const day=Number(b.dataset.day),week=['五','六','日','一','二'][day-1];b.setAttribute('aria-label','11月'+(12+day)+'日 星期'+week+(day===3?' 四週年紀念日':''));});
  document.addEventListener('click',e=>{const photo=e.target.closest('.real-photo img,.gallery-card img');if(photo)stopAudio();});
  window.addEventListener('resize',()=>{tripStates.forEach(s=>{if(s.detail.open)s.detail.style.setProperty('--detail-header-height',$('.detail-header',s.detail).getBoundingClientRect().height+'px');});});

  let positionMarker, accuracyCircle;
  function locate(day){
    const status=$('.geo-status',$('#planner'+day));status.hidden=false;status.textContent='正在取得位置…';
    if(!navigator.geolocation){status.textContent='這個瀏覽器不支援定位，仍可查看今日路線。';return;}
    navigator.geolocation.getCurrentPosition(position=>{
      const map=maps[day],lat=position.coords.latitude,lng=position.coords.longitude,accuracy=Math.round(position.coords.accuracy);
      if(positionMarker){positionMarker.remove();accuracyCircle.remove();}
      positionMarker=L.circleMarker([lat,lng],{radius:8,color:'#fff',weight:3,fillColor:'#276ba0',fillOpacity:1}).addTo(map).bindTooltip('我的位置');
      accuracyCircle=L.circle([lat,lng],{radius:Math.min(accuracy,500),color:'#276ba0',weight:1,fillOpacity:.08}).addTo(map);map.setView([lat,lng],15);
      const nearest=DATA.days[day-1].map((row,i)=>row[1]?{i,distance:map.distance([lat,lng],[DATA.places[row[1]][1],DATA.places[row[1]][2]])}:null).filter(Boolean).sort((a,b)=>a.distance-b.distance)[0];
      status.textContent='定位誤差約 '+accuracy+' m'+(nearest?' · 最近 '+letters[nearest.i]+' '+names(day,nearest.i)+'，直線約 '+distanceLabel(nearest.distance):'');
    },error=>{status.textContent=error.code===1?'未允許定位。可在瀏覽器網站設定開啟，或直接點今日行程。':'暫時無法定位，請到室外或稍後重試。';},{enableHighAccuracy:true,timeout:12000,maximumAge:30000});
  }

  const connection=document.createElement('div');connection.className='connection-bar';connection.hidden=navigator.onLine;connection.textContent='離線 · 行程、照片與語音可用';$('#filters').after(connection);
  function connectivity(){connection.hidden=navigator.onLine;if(!navigator.onLine){connection.textContent='離線 · 已保存的行程、照片與語音可用';DATA.days.forEach((_,i)=>setMapMode(i+1,'animation'));}refreshOffline();}
  window.addEventListener('offline',connectivity);window.addEventListener('online',connectivity);
  async function refreshOffline(){
    const status=$('#offline-state');if(!('serviceWorker'in navigator)||!('caches'in window)){status.textContent='此瀏覽器不支援網站離線保存，可下載單檔備份。';return;}
    try{const keys=await caches.keys();const key=keys.find(k=>k.startsWith('anniversary-'));if(!key){status.textContent=navigator.onLine?'首次保存中，請保持網路…':'尚未完整保存；連網後按保存。';return;}const cache=await caches.open(key);const requests=await cache.keys();const mp3=requests.filter(r=>r.url.endsWith('.mp3')).length;const photos=requests.filter(r=>r.url.includes('/assets/photos/')).length;status.textContent=mp3>=31&&photos>=23?'已保存：5 天行程、23 張照片、31 段日文語音。':'保存尚未完成，請連網後再試。';}
    catch{status.textContent='無法讀取離線儲存空間；可下載單檔備份。';}
  }
  $('#save-offline').onclick=async()=>{
    if(!navigator.onLine){announce('請先連網，再保存最新內容');return;}
    $('#offline-state').textContent='正在保存照片與語音，請保持網路…';
    try{const registration=await navigator.serviceWorker.register('sw.js');await registration.update();const ready=await navigator.serviceWorker.ready;ready.active?.postMessage({type:'CACHE_OFFLINE'});}
    catch{$('#offline-state').textContent='保存失敗，請確認網路或下載單檔備份。';}
  };
  if('serviceWorker'in navigator){navigator.serviceWorker.addEventListener('message',e=>{if(e.data?.type==='CACHE_DONE')refreshOffline();if(e.data?.type==='CACHE_FAILED')$('#offline-state').textContent='部分內容保存失敗，請保持網路後重試。';});navigator.serviceWorker.ready.then(()=>{refreshOffline();setTimeout(refreshOffline,1500);});navigator.serviceWorker.addEventListener('controllerchange',refreshOffline);}
  const date=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const today=facts.daily.findIndex(d=>d.date===date)+1;const remembered=memory.read('fukuoka-day',1);selectedDay=today||((remembered>=1&&remembered<=5)?remembered:1);
  $('#filters button[data-day="'+selectedDay+'"]').click();
  const hash=location.hash.slice(1);setView(['food','language','support'].includes(hash)?hash:'itinerary',false);refreshOffline();
  // Remove stale source-only claims from the earlier draft after current facts are in place.
  $$('.original,.guide-intro,.gallery-section').forEach(e=>e.remove());
  $$('.livepanel>p').forEach(e=>e.textContent='Google 地圖直接在本頁顯示；路線與班次以當下查詢為準。');
  $('.hero>p').textContent='2026.11.13 — 11.17 · 博多、太宰府、天神';
  const footer=$('.foot');if(footer)footer.innerHTML='資料查核 '+facts.checked+' · 交通為估時，營業與價格為快照。<br>日文語音：Open JTalk／HTS Voice Mei，<a href="AUDIO-LICENSE.txt">CC BY 3.0</a>。照片來源見各圖。';
})();
