// Source snapshots checked on 2026-11-03. Opening hours are not live availability.
const TRAVEL_FACTS = {
  checked: '2026/11/03',
  places: {
    airport: {address:'福岡県福岡市博多区下臼井778-1 国際線旅客ターミナル',hours:'國際線與國內線以免費接駁車往返；地鐵只到國內線。',tip:'回程直接給司機看「福岡空港 国際線ターミナル」。15:00 從飯店出發，目標 16:00 前到國際線。',source:'https://www.fukuoka-airport.jp/access/bus2.html'},
    miyako: {address:'福岡県福岡市博多区博多駅東2-1-1',hours:'標準入住 15:00／退房 12:00，特殊方案依訂單。',tip:'博多站筑紫口一側；地鐵博多站東7出口與飯店連通。',source:'https://www.miyakohotels.ne.jp/hakata/'},
    one: {address:'福岡県福岡市中央区天神1-11-1 ONE FUKUOKA BLDG. 18–19F',hours:'標準入住 15:00／退房 12:00。THE ROOF 酒吧 17:00–24:00，L.O. 23:00。',tip:'天神站直結。抵達先寄行李，15:00 後辦理入住；回飯店找 ONE FUKUOKA BLDG.。',source:'https://onefukuokahotel.jp/faq/',extraSource:'https://onefukuokahotel.jp/restaurant/the-roof/'},
    rec: {address:'福岡県福岡市博多区博多駅中央街9-1 博多マルイ6F',hours:'10:00–21:00；百貨臨時休館另計。',tip:'在博多丸井 6 樓，不是路邊獨立店面。吐司分食、兩杯咖啡，留點胃口給晚餐。',source:'https://rec-coffee.com/pages/coffee-shop-hakata'},
    kamado: {address:'福岡県太宰府市内山883',hours:'境內散步與授與所服務時間不同；御守、御朱印當日服務請先向社務所確認。',tip:'先看參道與授與所，再慢慢走神社境內。這次是山麓下宮，不是攀登寶滿山；楓紅依天候而變。',source:'https://kamadojinja.or.jp/access/',transit:'太宰府站前搭「まほろば号」內山方向，終點「内山」下車。神社官網列車程約 10 分鐘、單程 ¥100；候車另計。'},
    tenmangu: {address:'福岡県太宰府市宰府4-7-1',hours:'11 月通常 06:30–19:00；臨時參拜安排依當日公告。',tip:'參拜天滿宮，再走表參道找茶屋。七五三週末人潮多；若從竈門神社步行下山，午餐時間需往後挪。',source:'https://www.dazaifutenmangu.or.jp/'},
    sando: {address:'太宰府駅から太宰府天満宮までの表参道',hours:'各茶屋營業時間不同；這裡標示參道區域。',tip:'梅枝餅買現烤的，先各一個，再找一家有座位的茶屋喝抹茶。還未指定店家，這是參道小吃建議。',source:'https://www.dazaifutenmangu.or.jp/access'},
    seimon: {address:'福岡県福岡市博多区上川端町5-107',hours:'店家頁列 17:00–24:00（L.O. 23:00）、週日休。頁面含舊休業公告，出發前請再確認。',tip:'原行程的週六晚餐；優先確認訂位，再依當天漁獲點芝麻鯖魚與刺身。',source:'https://fazg900.gorp.jp/'},
    river: {address:'中洲川端・那珂川沿い',hours:'河畔為開放散步區域；雨天或太累可直接回飯店。',tip:'慢慢走、拍拍河面夜景。這是區域參考點，並非指定入口或單一拍照位置。',source:'https://yokanavi.com/'},
    amam: {address:'福岡県福岡市中央区六本松3-7-6',hours:'官網核對到六本松店地址；當日營業、出爐與售完狀況需再確認。',tip:'先找想吃的兩款，不用每款都拿。官網有六本松外帶預訂服務，是否有可選時段依當日頁面。',source:'https://amamdacotan.com/pages/shop/'},
    ohori: {address:'福岡県福岡市中央区大濠公園',hours:'戶外公園散步；園內美術館與日本庭園有各自開放時間。',tip:'選湖畔一小段散步、吃麵包即可。12:15 左右開始叫車，別為繞完整圈壓縮午餐。',source:'https://www.ohorikouen.jp/'},
    fish: {address:'福岡県福岡市中央区今泉1-4-23',hours:'官網午餐 11:00–14:30、晚餐 16:30–23:00。西鐵採訪列午餐 L.O. 14:00；12:45 到較從容。',tip:'第一次來優先選綜合刺身定食；想吃當月階梯定食先問還有沒有。人氣不等於到店必定有貨。',source:'https://sakanaotoko.com/'},
    yamanaka: {address:'福岡県福岡市中央区赤坂1-9-1 サニー赤坂店2F',hours:'週一 16:00–23:00，L.O. 22:30。鍋物至少兩人份。',tip:'原行程記錄 11/16 18:30 已訂；請出示你們的預約紀錄。味噌鍋兩人份起，麵等最後再加。',source:'https://motsunabe-yamanaka.com/akasaka_/'},
    shin: {address:'福岡県福岡市中央区天神2-11-1 福岡PARCO本館B1',hours:'11:00–23:00，L.O. 22:30；百貨臨時休館另計。',tip:'指定福岡 PARCO 本館地下 1 樓，不是天神本店。11:00 開店時段前往，候位時間另留緩衝。',source:'https://www.hakata-shinshin.com/tenpo_parco'},
    station: {address:'福岡県福岡市博多区博多駅中央街1-1 博多口駅前広場',hours:'2026/11/7–12/25。11/13 週五 16:00–23:00，L.O. 22:45。',tip:'免費入場。逛燈飾與小屋，熱飲和限定杯依現場供應；天氣變化可能影響活動。',source:'https://christmas-advent.jp/fukuoka-hakata/'},
    garden: {address:'福岡県福岡市中央区大名2-6-50 福岡大名ガーデンシティ広場',hours:'2026/11/13–12/25。11/16 週一 17:00–22:00。',tip:'牛腸鍋後散步到廣場；這站以燈飾和現場氣氛為主，不用再吃一頓。',source:'https://christmas-advent.jp/fukuoka-daimyo/'},
    cityhall: {address:'福岡県福岡市中央区天神1-8-1 福岡市役所西側ふれあい広場',hours:'2026/11/14–12/26。11/16 週一 17:00–23:00，L.O. 22:45。11/28–29 休業。',tip:'免費入場；20:40 到還有時間逛。若走累了，從這裡直接步行回 ONE FUKUOKA HOTEL。',source:'https://christmas-advent.jp/fukuoka-tenjin/'},
    central: {address:'福岡県福岡市中央区天神1丁目1 県営天神中央公園',hours:'2026/11/12–12/25。週一攤位 17:00–22:00、L.O. 21:45；燈飾至 24:00。',tip:'21:30 後當作燈飾散步備選；想買熱飲要在 21:45 前點餐。體力不足就跳過。',source:'https://christmas-advent.jp/fukuoka-chuo-koen/'}
  },
  daily: [
    {date:'2026-11-13',label:'抵達博多',hotel:'博多都酒店',hotelKey:'miyako',note:'國際線入境 → 飯店寄行李 → 咖啡與站前燈飾',rain:'下雨就縮短站前散步，把時間留給博多站內與飯店。'},
    {date:'2026-11-14',label:'太宰府的秋日',hotel:'博多都酒店',hotelKey:'miyako',note:'09:15–09:30 出發｜竈門神社 → 天滿宮 → 海鮮晚餐',rain:'雨天山麓路面濕滑，竈門神社到天滿宮搭車；茶屋多坐一會兒。'},
    {date:'2026-11-15',label:'我們的四週年',hotel:'ONE FUKUOKA HOTEL',hotelKey:'one',note:'換飯店、慢慢午餐｜15:00 入住，晚餐留給驚喜',rain:'今天不趕景點。寄行李後在附近午餐，15:00 後回飯店。'},
    {date:'2026-11-16',label:'麵包、湖光與燈飾',hotel:'ONE FUKUOKA HOTEL',hotelKey:'one',note:'12:45 魚男午餐｜18:30 やま中（原行程記錄已訂）',rain:'大濠公園縮短為短程散步；午餐後回飯店，晚間市集視雨勢選去。'},
    {date:'2026-11-17',label:'拉麵後，帶回回憶',hotel:'ONE FUKUOKA HOTEL',hotelKey:'one',note:'14:30 取行李｜15:00 出發，16:00 前到國際線',rain:'商圈以地下街、PARCO 與飯店周邊為主，照原定時間去機場。'}
  ],
  flexible: {'1:4':'博多晚餐・待選水炊鍋','3:2':'天神午餐與咖啡','3:4':'抹茶或自由逛街','3:5':'四週年晚餐・私人安排','5:2':'天神最後的採買'},
  transport: [
    {title:'機場 → 博多',body:'有行李：國際線計程車約 15–25 分。省預算：先搭免費接駁到國內線，再搭空港線到博多；整段抓 30–45 分。',source:'https://www.fukuoka-airport.jp/access/'},
    {title:'博多 → 太宰府 → 竈門神社',body:'地鐵空港線博多 → 天神，步行轉西鐵福岡（天神）→ 西鐵二日市，轉太宰府線 → 太宰府。站前轉まほろば號內山方向；整段估 65–90 分，候車或人潮多時更久。',source:'https://kamadojinja.or.jp/access/'},
    {title:'回程 → 機場國際線',body:'15:00 從飯店出發。計程車估 20–35 分，另留交通緩衝。搭地鐵要到國內線再轉免費接駁，全程抓 40–60 分。19:20 航班是原稿時間，請以航空公司通知為準。',source:'https://www.fukuoka-airport.jp/access/bus2.html'}
  ],
  help: {hotline:'050-3816-2787',source:'https://www.japan.travel/en/plan/hotline/'},
  language: [
    ['support01','交通','福岡空港の国際線ターミナルまでお願いします。','請載我們到福岡機場國際線航廈。'],
    ['support02','交通','都ホテル博多までお願いします。','請載我們到博多都酒店。'],
    ['support03','交通','この住所までお願いします。','請載我們到這個地址。（出示地址）'],
    ['support04','交通','太宰府駅はどこですか。','請問太宰府站在哪裡？'],
    ['support05','餐廳','二人です。席は空いていますか。','我們兩位，請問有空位嗎？'],
    ['support06','餐廳','どのくらい待ちますか。','請問大約要等多久？'],
    ['support07','餐廳','これは生ですか。火を通してもらえますか。','這是生的嗎？可以幫我煮熟嗎？'],
    ['support08','飯店','チェックインまで荷物を預かっていただけますか。','入住前可以寄放行李嗎？'],
    ['support09','購物','持ち帰りでお願いします。','麻煩幫我外帶。'],
    ['support10','購物','クレジットカードは使えますか。','可以刷信用卡嗎？'],
    ['support11','求助','中国語を話せる方はいますか。','請問有會說中文的人嗎？'],
    ['support12','求助','病院に行きたいです。手伝っていただけますか。','我想去醫院，可以幫助我嗎？']
  ]
};
