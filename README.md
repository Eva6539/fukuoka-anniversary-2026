# 四週年・福岡楓紅聖誕前夕之旅

2026-11-13 至 2026-11-17，繁體中文手機旅行頁。

## 使用

網站入口 `index.html`，每日字母標記、分段 Google Maps 導航、交通估時、人氣餐點待查證區及 19 句日文語言練習 MP3。
第一次在線開啟後，行程與本站音檔會由 Service Worker 快取；Google Maps、即時評價、外部實景照片與 OpenStreetMap 圖磚需要網路。離線座標圖不是道路導航。

## 查證限制

地址座標為概略位置，需以 Google Maps 店家頁確認。評分、評論數與照片尚未在製作環境核實，不捏造數值或以示意圖冒充實景。未提供地址的餐廳保留待定。交通估時非即時班次；2026 聖誕活動日期、營業時間及菜單需出發前再確認。

## GitHub Pages

將本目錄內容置於公開專案 `fukuoka-anniversary-2026` 的 main 分支根目錄，至 Settings → Pages 選擇 Deploy from a branch / main / root。無需 API key 或建置工具。

## 來源

行程來自使用者提供的 HTML。地圖：Leaflet 1.9.4（BSD-2-Clause）與 OpenStreetMap；照片按需從 Wikipedia 載入並連結來源。Google 評價、照片與地圖連結回 Google Maps。
日文語音由 Open JTalk 與 HTS Voice Mei 合成；模型為 MMDAgent Project Team / Nagoya Institute of Technology，CC BY 3.0，詳見 AUDIO-LICENSE.txt。

## 日期與行程互動

選日期先顯示全日地圖，依字母順序播放可暫停或重播。點擊地標或行程點，手機顯示可收合的詳情面板，包含上一站至此站交通與頁內路線。地址待定的點保留順序，不放置假座標。圖上連線與動畫是造訪順序示意。
