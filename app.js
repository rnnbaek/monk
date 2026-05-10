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

// ----- 8) 작은 환영 로그 -----
console.log(
  '%c🧀 킹몽구 & 누나 v1 %c\n' +
  '시안 → 사이트 v1 빌드 · 1인 운영 굿즈샵',
  'background:#F4A24C;color:#3B2A1F;padding:4px 10px;border-radius:4px;font-weight:bold;',
  'color:#7A5A44;'
);
