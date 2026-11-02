# 啟用 GitHub Pages

完整程式、實景照片、MP3 與離線版已在 main 分支。

GitHub 整合工具與 Actions token 在建立 Pages 時都得到 HTTP 403 `Resource not accessible by integration`。這項權限需要專案擁有者在 GitHub 設定啟用，不是環境變數或雲端允許網域設定。

1. 開啟 https://github.com/Eva6539/fukuoka-anniversary-2026/settings/pages
2. 在 Build and deployment → Source 選 GitHub Actions。
3. 開啟 Actions → Publish travel website → Run workflow → main → Run workflow。

成功後網址為 https://eva6539.github.io/fukuoka-anniversary-2026/ 。目前仍待首次啟用及成功部署。

也可以在 Source 選 Deploy from a branch、main、/(root)，再 Save，交由 GitHub 自動發布；根目錄已有 .nojekyll 與完整靜態資產。

實作的真實底圖與頁內 Google 地圖不需要 API 金鑰。若將來要在同一張 Google 地圖上自行控制全部地標與動畫，才需要 Maps JavaScript API 與計費。
