# 四週年，楓紅與聖誕前夕

2026/11/13–11/17 的福岡手機旅行網站。入口為 `index.html`，純靜態，不需要環境變數。

四個入口：每日行程、美食、日文、旅途支援。選日期先看全天地圖與行程順序；點站點開啟「怎麼到、看什麼／吃什麼、說日文」。手機詳情分頁排列，關閉、上一站、下一站保持可見。

- 五天 37 個行程節點；已知地點依字母順序標記，重訪飯店合併字母。五個自由／私人安排保留在清單，不補假地址。
- 真實 OpenStreetMap 底圖、既存 OSRM 道路幾何、路線播放／暫停／重播，以及使用者主動啟用的位置查詢。
- 頁內 Google 地圖及點到點路線。Google 模式為額外參考，完整字母與順序以「今日完整路線」為準。
- 23 張有來源的實景照片；六間餐廳的具名人氣／招牌菜、推薦理由與兩人份量。
- 15 個 Google 評分快照；未取得的評論數不猜測。
- 31 段日文合成 MP3：19 段對應點餐、12 段交通／飯店／購物／求助。附大字卡與離線保存。
- 到訪標記保存在目前瀏覽器；不需要登入，也不會將位置或個人訂位資料上傳到本站伺服器。

## 正確性與來源

查核日期為 2026/11/03。`VERIFICATION.json` 記錄活動日期、營業、交通與官方來源；`GOOGLE-RATINGS.json`、`LOCATION-SOURCES.json`、`PHOTO-SOURCES.json` 保留評分、位置與照片證據。

已核對四個 2026 聖誕會場與當日時段，並修正 ONE FUKUOKA HOTEL 15:00 入住、大濠公園至魚男午餐的銜接。交通時間為規劃估算，不是即時班次、車流或候位。預約與航班來自原稿，未接入私人訂位系統；臨時休業、售完與航班變更以當日通知為準。

## 離線與發布

首次在線開啟並完成保存後，可離線重開行程、照片及所有語音。Google 地圖、背景圖磚與線上路線仍需網路；離線位置圖不是道路導航。

`offline.html` 內含圖片、程式與所有語音，可透過 GitHub Code → Download ZIP 下載完整網站。GitHub Pages 首次啟用方式見 `DEPLOYMENT.md`。更新後執行 `python scripts/package_site.py` 重建離線版與快取清單。

## 來源與授權

Commons 照片依各自 CC 授權，作者與來源保留在每張圖與 PHOTO-SOURCES.json。店家照片著作權歸原作者，不宣稱自由授權。照片經縮放、JPEG 處理，縮圖有裁切；實際季節、裝潢與供應可能不同。

Leaflet 1.9.4：BSD-2-Clause；OpenStreetMap：ODbL；道路幾何：FOSSGIS OSRM。日文語音由 Open JTalk／HTS Voice Mei 合成，MMDAgent Project Team／Nagoya Institute of Technology，CC BY 3.0，詳見 AUDIO-LICENSE.txt。
