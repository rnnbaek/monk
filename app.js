// =====================================================
// 킹몽구 & 누나 — Brand Site App v1
// 인터랙션: 영상 BG · CM송 · 스크롤 리빌 · 부드러운 앵커
// =====================================================

// ----- 1) 유튜브 영상 BG 자동 임베드 -----
// data-yt-id 가 placeholder가 아니면 자동 재생/음소거/루프로 로드
(function setupHeroVideo() {
  const iframe = document.getElementById('bgvideo');
  if (!iframe) return;
  const id = iframe.getAttribute('data-yt-id');
  if (!id || id.startsWith('REPLACE')) {
    // 영상 ID 미설정 → 폴백 (몽구 SVG)이 보이도록 그대로 둠
    return;
  }
  const params = new URLSearchParams({
    autoplay: '1', mute: '1', loop: '1', controls: '0',
    playsinline: '1', modestbranding: '1', rel: '0',
    playlist: id,           // 단일 영상 루프를 위해 필요
    iv_load_policy: '3',
    cc_load_policy: '0',
    fs: '0', disablekb: '1',
  });
  iframe.src = `https://www.youtube.com/embed/${id}?${params.toString()}`;
  iframe.addEventListener('load', () => iframe.classList.add('is-loaded'));
})();

// ----- 2) Topbar 축소 -----
(function setupTopbar() {
  const bar = document.querySelector('.topbar');
  if (!bar) return;
  const update = () => {
    if (window.scrollY > 24) bar.dataset.shrunk = '';
    else delete bar.dataset.shrunk;
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

// ----- 3) 부드러운 앵커 스크롤 -----
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"], [data-scroll-to]');
  if (!link) return;
  const target = link.getAttribute('href') || link.dataset.scrollTo;
  if (!target || target === '#') return;
  const el = document.querySelector(target);
  if (!el) return;
  e.preventDefault();
  const top = el.getBoundingClientRect().top + window.scrollY - 60;
  window.scrollTo({ top, behavior: 'smooth' });
});

// ----- 4) 스크롤 리빌 -----
(function setupReveal() {
  const els = document.querySelectorAll('.section-head, .about-card, .video-card, .good-card, .diary-item, .song-card');
  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach((el) => io.observe(el));
})();

// ----- 5) 영상 카드 썸네일 자동 연결 (data-yt 속성 사용) -----
(function setupVideoThumbs() {
  document.querySelectorAll('.video-card[data-yt]').forEach((card) => {
    const id = card.getAttribute('data-yt');
    if (!id || id.startsWith('REPLACE')) return;
    const thumb = card.querySelector('.video-thumb');
    if (!thumb) return;
    thumb.style.backgroundImage = `url("https://i.ytimg.com/vi/${id}/hqdefault.jpg")`;
    card.dataset.ytThumb = '';
    card.setAttribute('href', `https://www.youtube.com/watch?v=${id}`);
  });
})();

// ----- 6) CM송 플레이어 -----
(function setupCMSong() {
  const audio = document.getElementById('cmAudio');
  const btn = document.getElementById('playSong');
  const vol = document.getElementById('volume');
  const bgmToggle = document.getElementById('bgmToggle');
  const vinyl = document.getElementById('vinyl');
  const mini = document.getElementById('miniMusic');
  const miniBtn = document.getElementById('miniToggle');
  if (!audio || !btn) return;

  const setUI = (playing) => {
    btn.querySelector('.play-ico').textContent = playing ? '❚❚' : '▶';
    btn.querySelector('.play-label').textContent = playing ? '정지' : '재생';
    vinyl?.classList.toggle('is-playing', playing);
    miniBtn?.classList.toggle('is-on', playing);
  };

  const togglePlay = async () => {
    try {
      if (audio.paused) {
        await audio.play();
      } else {
        audio.pause();
      }
    } catch (err) {
      console.warn('[몽구송] 재생 실패 — 음원 파일이 없거나 자동재생 정책에 막혔어요:', err.message);
      alert('음원 파일이 아직 없어요!\n./assets/cm-song.mp3 를 추가하면 작동합니다 🎵');
    }
  };

  audio.volume = parseFloat(vol?.value ?? '0.6');
  vol?.addEventListener('input', () => { audio.volume = parseFloat(vol.value); });
  btn.addEventListener('click', togglePlay);
  miniBtn?.addEventListener('click', togglePlay);

  audio.addEventListener('play',  () => setUI(true));
  audio.addEventListener('pause', () => setUI(false));
  audio.addEventListener('ended', () => setUI(false));
  audio.addEventListener('error', () => {
    console.warn('[몽구송] audio source 에러: ./assets/cm-song.mp3 가 있는지 확인하세요.');
  });

  // 사이트 백그라운드 토글: 미니 플레이어 노출
  bgmToggle?.addEventListener('change', (e) => {
    if (mini) mini.hidden = !e.target.checked;
  });
})();

// ----- 7) 굿즈 구매 버튼 (placeholder 클릭 안내) -----
(function setupBuyButtons() {
  document.querySelectorAll('[data-buy]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const href = btn.getAttribute('href');
      if (!href || href === '#') {
        e.preventDefault();
        const item = btn.dataset.buy;
        alert(`아직 ${item} 구매 링크가 연결되지 않았어요!\n` +
              `index.html 의 data-buy="${item}" 버튼 href 를 \n` +
              `스마트스토어 / 카페24 등 외부 URL로 바꾸면 작동합니다 🛍`);
      }
    });
  });
})();

// ----- 8) 상품 · 일기 동적 렌더링 (관리자 localStorage 데이터 사용) -----
const ADMIN_KEYS = { PRODUCTS: 'mongu_products', DIARY: 'mongu_diary' };

const DEFAULT_PRODUCTS = [
  { id:1, featured:true,  badge:'신상', emoji:'🐱', emojiStack:'🧀', color:'#F4A24C', name:'먹방 스티커팩',  description:'몽구의 시그니처 먹방 컷 6종 스티커', price:'4500', buyLink:'' },
  { id:2, featured:false, badge:'',    emoji:'📮', emojiStack:'✉️', color:'#FFF4DE', name:'엽서 4종 세트',  description:'치즈 노을 · 산타 모자 · 식빵 · 시크한 표정', price:'2000', buyLink:'' },
  { id:3, featured:false, badge:'',    emoji:'🔑', emojiStack:'👑', color:'#A8C9A0', name:'킹몽구 키링',    description:'왕관 쓴 몽구 아크릴 키링 50×50mm', price:'9000', buyLink:'' },
  { id:4, featured:false, badge:'',    emoji:'📛', emojiStack:'🐾', color:'#E66B7A', name:'치즈태비 뱃지',  description:'금속 핀뱃지 · 가방·옷에 콕', price:'5000', buyLink:'' },
];
const DEFAULT_DIARY = [
  { id:1, date:'2026.05.05', title:'🍪 새 먹방 촬영 — 어린이날 쿠키', content:'몽구가 쿠키 모양 빵을 한참 노려보다가 결국 한 입. 영상 곧 올라가요.' },
  { id:2, date:'2026.04.28', title:'📦 키링 1차 입고',                  content:'아크릴 키링 30개 입고. 검수에서 7개 탈락… 다시 발주 넣었어요.' },
  { id:3, date:'2026.04.20', title:'🎨 굿즈샵 v1 시안 완성',            content:'브랜드 컬러팔레트 7종 확정. 치즈 오렌지 + 따뜻한 종이 베이스.' },
];

function renderGoods(products) {
  const grid = document.getElementById('goodsGrid');
  if (!grid) return;
  grid.innerHTML = products.map(p => `
    <article class="good-card${p.featured ? ' featured' : ''} in">
      ${p.badge ? `<span class="badge-new">${p.badge}</span>` : ''}
      <div class="good-art" style="--bg:${p.color || '#F4A24C'}">
        <span class="emoji">${p.emoji}</span>
        ${p.emojiStack ? `<span class="emoji-stack">${p.emojiStack}</span>` : ''}
      </div>
      <div class="good-info">
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        <div class="good-bottom">
          <span class="price">₩${Number(p.price).toLocaleString()}</span>
          <a class="btn btn-primary btn-sm"
             href="${p.buyLink || '#'}"
             ${p.buyLink ? 'target="_blank" rel="noopener"' : `data-buy="${p.id}"`}>구매하기</a>
        </div>
      </div>
    </article>
  `).join('');
}

function renderDiaryFeed(diary) {
  const feed = document.getElementById('diaryFeed');
  if (!feed) return;
  feed.innerHTML = diary.map(d => `
    <article class="diary-item in">
      <time>${d.date}</time>
      <h4>${d.title}</h4>
      <p>${d.content}</p>
    </article>
  `).join('');
}

// data.json(GitHub) → localStorage(관리자 로컬) → 기본값 순으로 시도
(function setupDynamicRender() {
  const needsShop  = !!document.getElementById('goodsGrid');
  const needsDiary = !!document.getElementById('diaryFeed');
  if (!needsShop && !needsDiary) return;

  // 1) data.json fetch 시도 (GitHub Pages에 배포된 데이터)
  fetch('./data.json?t=' + Date.now())
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(data => {
      if (needsShop  && data.products) renderGoods(data.products);
      if (needsDiary && data.diary)    renderDiaryFeed(data.diary);
    })
    .catch(() => {
      // 2) fallback: localStorage → defaults
      const products = (() => { try { return JSON.parse(localStorage.getItem(ADMIN_KEYS.PRODUCTS)) || DEFAULT_PRODUCTS; } catch { return DEFAULT_PRODUCTS; } })();
      const diary    = (() => { try { return JSON.parse(localStorage.getItem(ADMIN_KEYS.DIARY))    || DEFAULT_DIARY;    } catch { return DEFAULT_DIARY;    } })();
      if (needsShop)  renderGoods(products);
      if (needsDiary) renderDiaryFeed(diary);
    });
})();

// ----- 9) 현재 페이지 nav 활성 탭 표시 -----
(function setupNavActive() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.topnav a').forEach((a) => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();

// ----- 11) 작은 환영 로그 -----
console.log(
  '%c🧀 킹몽구 & 누나 v1 %c\n' +
  '시안 → 사이트 v1 빌드 · 1인 운영 굿즈샵',
  'background:#F4A24C;color:#3B2A1F;padding:4px 10px;border-radius:4px;font-weight:bold;',
  'color:#7A5A44;'
);
