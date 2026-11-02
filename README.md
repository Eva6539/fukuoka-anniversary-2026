# 四週年・楓紅與聖誕前夕・福岡

2026/11/13–11/17，手機優先的五天旅行網站。

- Google Maps 直接嵌入：切換日期看已知地址的全日道路預覽，留在同一頁。
- A→B 動畫圖：真實 OpenStreetMap 圖磚、FOSSGIS OSRM 道路路線，播放／暫停／重播。
- 37 個行程節點，點字母或行程卡查看上一站至此站交通、實景與評分快照。
- 23 張本地實景照片：店家官方照片與 Wikimedia Commons，逐張標示來源與授權。
- 六家餐廳具名招牌／人氣品項、推薦理由、兩人搭配與來源；19 句對應日文合成 MP3。
- 15 個 Google 評分快照，2026/11/03 查核；未顯示的評論數不猜測。
- 首次在線載入後可離線讀取行程、照片與音檔。Google 地圖與 OSM 背景圖磚需要網路，離線顯示位置示意。

## 資料限制

未定晚餐／茶屋等地址保留待定；不推測紀念日晚餐。Google 免 Key 嵌入圖只涵蓋已知地址，Google 自動標記可能與完整行程字母不同；完整字母、逐站動畫與自訂交通詳情在 A→B 模式。
路網路線不是即時車流或列車班表，行車時間以行程中的緩衝估時為準。最後出入口依現場指示。大名花園城市與河畔等屬區域參考位置。2026 聖誕活動、餐廳價格／餘量、航班均應出發前再確認。

## 來源與授權

`PHOTO-SOURCES.json`、`LOCATION-SOURCES.json`、`GOOGLE-RATINGS.json` 列出來源。餐點來源在頁內各店推薦區。
Commons 照片遵循各自 CC 授權並保留作者；店家照片著作權歸原作者，不宣稱自由授權。照片經調整尺寸與轉為 JPEG，頁內縮圖亦有裁切。
Leaflet 1.9.4：BSD-2-Clause；OpenStreetMap：ODbL；FOSSGIS OSRM 公共路線服務：https://routing.openstreetmap.de/。
語音：Open JTalk／HTS Voice Mei，MMDAgent Project Team／Nagoya Institute of Technology，CC BY 3.0，見 AUDIO-LICENSE.txt。

## 發布

純靜態網站，入口 `index.html`，不需要環境變數。`.github/workflows/pages.yml` 自動發布 GitHub Pages；`offline.html` 另提供內含照片、地圖資料和 MP3 的單檔版本。
