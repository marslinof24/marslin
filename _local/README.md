# 網站內容工作室

雙擊工作區根目錄的「開啟內容工作室.cmd」，或開啟：
http://127.0.0.1:4175/

1. 選擇 Home / Portfolio / Workspace / About / Welcome。
2. 點選畫面中的文字、連結或圖片區，在左側修改；文字也可以雙擊直接輸入。
3. 圖片區可以加入 PNG、JPG、WebP（12MB 以下），並填寫圖片說明。
4. Portfolio / Workspace 左側可新增或刪除項目，至少保留一項。
5. 切換「預覽」可操作頁面動畫、導覽及游標；「手機」可比較窄版。
6. 按「儲存草稿」（或 Ctrl+S）。重新開啟仍會保留。
7. 回到對話告訴我「套用草稿」，我會讀取 `_local/drafts/draft.json`，
   檢查修改並產生本機版本給你驗收。只有你另行下令，才會 push。

草稿、圖片與編輯器只留在本機，不在 GitHub Pages 上公開。
你也可以繼續用截圖或瀏覽器標註指出位置，我會對照同一份版型修改。
未填的 X、Linux／資料庫截圖仍可之後補上。

## 維護對接口

- 原始版型快照：`_local/templates/`；欄位以固定 ID 對應，包含純文字、
  連結、圖片。草稿包含 revision、fields、projects、captures、base。
- 儲存：`POST /api/save`，上傳圖片：`POST /api/upload`，新增刪除項目：
  `POST /api/item`。只接受本機 Host、同源請求與本次程序發出的 token。
- 自動備份上一版草稿：`_local/drafts/previous.json`。
- 套用前必須讀取草稿；需確認 root 頁面沒有被其他修改覆蓋。
  使用 `python _local/editor/server.py --apply` 只輸出本機 HTML 和 effects.js，
  移除編輯標記，複製實際使用的圖片前會備份輸出前的頁面。
- 套用不會執行 git。正式檔案先在 root 驗收；發布副本在 `.cache/publish`。
  不得整個工作區一起上傳。後續 push 必須另外取得使用者指令。
- 若版型改動，先合併／更新 `_local/templates` 與 baseline；不要直接覆寫草稿。
- 圖片不壓縮、不裁切；目前沿用既有圖片框的 contain/cover 規則。
- 編輯器不處理自由排版、移動區塊或部署，這些仍在對話中處理。

測試：`python _local/editor/test_editor.py` 使用獨立暫存草稿，不修改使用者草稿。
