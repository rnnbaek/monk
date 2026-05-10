# 🧀 킹몽구 & 누나 — 브랜드 사이트 v1

치즈태비 ASMR 먹방 채널 [@cat.sister](https://www.youtube.com/@cat.sister)의 공식 굿즈샵 페이지.

---

## 🚀 빠르게 보기

```bash
cd /Users/artilm/mongu-brand/site
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000 열기
```

또는 `index.html`을 그대로 더블클릭해서 열어도 OK (단, 일부 기능은 로컬 서버에서만 정상 작동).

## 🌐 배포

정적 사이트라 어디든 무료로 호스팅 가능:

| 플랫폼 | 방법 |
|---|---|
| **Vercel** | `vercel` 명령 실행 또는 GitHub 연동 |
| **Netlify** | `site/` 폴더를 drag & drop |
| **GitHub Pages** | 레포에 push 후 Settings → Pages 활성화 |
| **Cloudflare Pages** | GitHub 연동 |

빌드 명령 없음 / 출력 디렉터리 = 루트.

---

## 📁 파일 구조

```
site/
├─ index.html          # 단일 페이지, 모든 섹션 포함
├─ styles.css          # 디자인 시스템 + 반응형
├─ app.js              # 영상 BG · CM송 · 스크롤 · 인터랙션
├─ assets/
│  ├─ mongu.svg        # 몽구 SVG 일러스트 (재사용 자산)
│  └─ cm-song.mp3      # ⚠️ 직접 추가 필요 (CM송 음원)
└─ README.md
```

---

## ✏️ Placeholder 채우는 곳 (4가지)

### 1. 🎬 히어로 영상 BG — 유튜브 영상 ID
[index.html](index.html) 안 `<iframe id="bgvideo">`의 **`data-yt-id`** 속성:

```html
<iframe id="bgvideo" data-yt-id="REPLACE_WITH_YOUTUBE_ID" ...>
```

→ 실제 영상 URL이 `https://www.youtube.com/watch?v=AbCdEf12345` 라면 `AbCdEf12345`만 넣으세요.
ID가 비어있을 때는 자동으로 몽구 SVG 폴백이 보입니다.

### 2. 📺 영상 갤러리 — 카드 4개의 영상 ID
[index.html](index.html) 안 `.video-card`들의 **`data-yt`** 속성:

```html
<a class="video-card" data-yt="REPLACE_VIDEO_ID_1" href="...">
```

→ 영상 ID를 넣으면 자동으로 유튜브 썸네일·링크가 연결돼요.
제목/duration/조회수도 마크업 안에서 직접 편집.

### 3. 🛍 굿즈 구매 링크
[index.html](index.html) 안 굿즈 카드의 **`href="#"`**를 스마트스토어/카페24/자체 결제 페이지 URL로 교체.

```html
<a class="btn btn-primary btn-sm" href="#" data-buy="sticker">구매하기</a>
                                  ↑ 여기를 실제 URL로
```

### 4. 🎵 CM송 음원
`assets/cm-song.mp3` 위치에 mp3 파일만 넣으면 자동 작동.
[index.html](index.html) 안 `<pre class="lyrics">` 가사도 자유롭게 편집.

---

## 🎨 디자인 시스템

CSS 변수로 깔끔하게 관리:

```css
--cheese:     #F4A24C;  /* 메인 */
--cream:      #FFF4DE;  /* 배경 */
--paper:      #FBF7F0;  /* 카드 */
--strawberry: #E66B7A;  /* 포인트 */
--sage:       #A8C9A0;  /* 보조 */
--bean:       #3B2A1F;  /* 텍스트 */
--mocha:      #7A5A44;  /* 보조 텍스트 */
```

색을 한꺼번에 바꾸려면 [styles.css:6-13](styles.css#L6-L13) 만 수정.

---

## 📐 레이아웃 / 반응형

- **모바일 우선** — 폭 < 720px에서 단일 컬럼
- **데스크톱** ≥ 720px — 영상 4컬럼 / 굿즈 2x2 그리드 / 푸터 2단
- 컨테이너 max-width: 콘텐츠 520px / 와이드 1080px

---

## 🛠 향후 확장 로드맵

1. **개별 굿즈 상세 페이지** — `/shop/sticker.html` 등
2. **실 결제 연동** — Toss Payments / 카카오페이 (사업자 등록 필요)
3. **블로그/공방일기 분리** — `/diary/2026-05-05.html` 또는 markdown + 정적 빌더
4. **다국어** — 영문 페이지 (해외 팬덤 대응)
5. **CMS 연동** — 영상/굿즈를 직접 수정 (Sanity, Notion API 등)

---

🐾 _made with love by 누나 · 1인 운영_
