/**
 * ACFATREATMENT — INTERACTIVE SCRIPT
 * Landing Page Kemitraan Bisnis Treatment Sepatu, Helm, Koper, & Stroller
 */

document.addEventListener("DOMContentLoaded", () => {
  // Cegah browser restore posisi scroll lama (penyebab gallery mulai di tengah)
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);

  // Tandai bahwa JS berhasil dijalankan — CSS fallback opacity: 1 dinonaktifkan
  document.body.classList.add("js-loaded");

  // Deteksi mobile yang akurat: gunakan CSS media query, bukan hanya innerWidth
  // Ini menghindari salah deteksi pada laptop touchscreen Windows
  const isMobileDevice = window.matchMedia("(max-width: 768px)").matches;

  // =========================================================================
  // 0. LENIS SMOOTH SCROLL CONTROLLER (DESKTOP ONLY — mobile pakai native scroll)
  // =========================================================================
  let lenisInstance = null;
  function initLenis() {
    if (typeof Lenis === "undefined") return;
    // Lenis hanya di desktop — di mobile native scroll lebih halus dan bebas bug
    if (isMobileDevice) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    lenisInstance = new Lenis({
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.5,
      infinite: false
    });

    window.lenis = lenisInstance;

    if (typeof ScrollTrigger !== "undefined") {
      lenisInstance.on("scroll", ScrollTrigger.update);
    }

    if (typeof gsap !== "undefined") {
      gsap.ticker.add((time) => {
        lenisInstance.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenisInstance.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  }

  initLenis();

  // =========================================================================
  // 1. KONFIGURASI KEMITRAAN & KONTAK
  // =========================================================================
  const CONFIG = {
    whatsappNumber: "62881027481001",
    whatsappDisplay: "+62 881-0274-81001",
    email: "sayyidahmed86@gmail.com",
    youtubeVideoId: "UhSJwrgIjIU" // Video profil YouTube resmi Anda
  };

  // Helper untuk membersihkan ID YouTube jika diisi link lengkap
  function extractYouTubeId(urlOrId) {
    if (!urlOrId) return "UhSJwrgIjIU";
    const clean = urlOrId.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) return clean;
    const match = clean.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : clean.substring(0, 11);
  }

  const cleanVideoId = extractYouTubeId(CONFIG.youtubeVideoId);

  // =========================================================================
  // 2. YOUTUBE VIDEO EMBED & SCROLL AUTOPLAY CONTROLLER
  // =========================================================================
  const videoTimeStatus = document.getElementById("videoTimeStatus");
  if (videoTimeStatus) {
    videoTimeStatus.textContent = "HD 1080P · RESMI";
  }

  const youtubeIframe = document.getElementById("youtubePlayerIframe");
  const videoContainer = document.querySelector(".testimoni-video-container");

  if (youtubeIframe && videoContainer) {
    // Pastikan URL iframe siap dengan enablejsapi=1, mute=1, playsinline=1, rel=0
    const desiredSrc = `https://www.youtube.com/embed/${cleanVideoId}?enablejsapi=1&mute=1&playsinline=1&rel=0`;
    if (!youtubeIframe.src || !youtubeIframe.src.includes("enablejsapi=1")) {
      youtubeIframe.src = desiredSrc;
    }

    function sendYTCommand(command, args = "") {
      try {
        if (youtubeIframe && youtubeIframe.contentWindow) {
          youtubeIframe.contentWindow.postMessage(
            JSON.stringify({ event: "command", func: command, args: args }),
            "*"
          );
        }
      } catch (err) {
        // Cross-origin safe guard
      }
    }

    let isVideoPlaying = false;

    function playYT() {
      // Browser modern (Chrome/Safari/Edge/iOS/Android) mewajibkan video dalam kondisi mute
      // agar diizinkan autoplay saat discroll tanpa interaksi tombol khusus.
      sendYTCommand("mute");
      sendYTCommand("playVideo");
      isVideoPlaying = true;
    }

    function pauseYT() {
      if (isVideoPlaying) {
        sendYTCommand("pauseVideo");
        isVideoPlaying = false;
      }
    }

    // Saat iframe selesai termuat, cek apakah posisi saat ini sudah di area video
    youtubeIframe.addEventListener("load", () => {
      sendYTCommand("mute");
      const rect = videoContainer.getBoundingClientRect();
      const inView = rect.top < window.innerHeight * 0.75 && rect.bottom > window.innerHeight * 0.25;
      if (inView) {
        playYT();
      }
    });

    // Deteksi scroll menggunakan IntersectionObserver (efisien dan tidak membebani memori)
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            // Ketika user scroll dan video masuk ke layar (>= 30% area terlihat)
            if (entry.isIntersecting && entry.intersectionRatio >= 0.28) {
              playYT();
            } else if (!entry.isIntersecting || entry.intersectionRatio < 0.15) {
              // Ketika user scroll menjauh ke atas atau ke bawah
              pauseYT();
            }
          });
        },
        {
          threshold: [0.1, 0.28, 0.5, 0.8]
        }
      );
      observer.observe(videoContainer);
    } else {
      // Fallback untuk browser lawas
      let scrollTimer = null;
      window.addEventListener("scroll", () => {
        if (scrollTimer) return;
        scrollTimer = setTimeout(() => {
          scrollTimer = null;
          const rect = videoContainer.getBoundingClientRect();
          const inView = rect.top < window.innerHeight * 0.75 && rect.bottom > window.innerHeight * 0.25;
          if (inView) {
            playYT();
          } else {
            pauseYT();
          }
        }, 150);
      }, { passive: true });
    }
  }

  // =========================================================================
  // 3. PILIH PAKET -> OTOMATIS PILIH DROPDOWN & FOCUS FORM
  // =========================================================================
  const selectPackageBtns = document.querySelectorAll(".select-package-btn");
  const formPackage = document.getElementById("formPackage");
  const formName = document.getElementById("formName");
  const daftarSection = document.getElementById("daftar");

  selectPackageBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const chosenPackage = btn.getAttribute("data-package");

      if (formPackage && chosenPackage) {
        for (let i = 0; i < formPackage.options.length; i++) {
          if (formPackage.options[i].value === chosenPackage) {
            formPackage.selectedIndex = i;
            break;
          }
        }
      }

      if (daftarSection) {
        const isMobile = window.innerWidth <= 768;
        const navOffset = isMobile ? 85 : 110;
        if (window.lenis) {
          window.lenis.scrollTo(daftarSection, {
            offset: -navOffset,
            duration: 1.5
          });
        } else {
          const targetPos = daftarSection.getBoundingClientRect().top + window.pageYOffset - navOffset;
          window.scrollTo({
            top: targetPos,
            behavior: "smooth"
          });
        }
        setTimeout(() => {
          if (formName) formName.focus();
        }, 600);
      }
    });
  });

  // =========================================================================
  // 4. FORMULIR PENDAFTARAN KE WHATSAPP
  // =========================================================================
  const partnerForm = document.getElementById("partnerInquiryForm");

  if (partnerForm) {
    partnerForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("formName").value.trim();
      const phone = document.getElementById("formPhone").value.trim();
      const city = document.getElementById("formCity").value.trim();
      const packageChoice = document.getElementById("formPackage").value;
      const notes = document.getElementById("formNotes").value.trim() || "-";

      const message =
        `Halo Tim Kemitraan acfatreatment,

Saya tertarik untuk mendaftar dan mengambil paket kemitraan:
• Nama Lengkap: ${name}
• Nomor WhatsApp: ${phone}
• Alamat / Kota: ${city}
• Paket yang Diambil: ${packageChoice}
• Catatan / Pertanyaan: ${notes}

Mohon informasi langkah selanjutnya dan pengiriman proposal kemitraan resminya. Terima kasih!`;

      const encoded = encodeURIComponent(message);
      const waUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${encoded}`;
      window.open(waUrl, "_blank", "noopener,noreferrer");
    });
  }

  // =========================================================================
  // 5. MOBILE NAV TOGGLE
  // =========================================================================
  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");
  const navLinks = document.querySelectorAll(".nav-link, .nav-cta");

  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));

      const lines = menuToggle.querySelectorAll(".hamburger-line");
      if (isOpen) {
        lines[0].style.transform = "translateY(7px) rotate(45deg)";
        lines[1].style.opacity = "0";
        lines[2].style.transform = "translateY(-7px) rotate(-45deg)";
      } else {
        lines[0].style.transform = "none";
        lines[1].style.opacity = "1";
        lines[2].style.transform = "none";
      }
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        mainNav.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        const lines = menuToggle.querySelectorAll(".hamburger-line");
        lines[0].style.transform = "none";
        lines[1].style.opacity = "1";
        lines[2].style.transform = "none";
      });
    });
  }

  // =========================================================================
  // UNIVERSAL SMOOTH SCROLL DENGAN CLEARANCE NAVBAR MELAYANG (SEMUA LINK #)
  // =========================================================================
  const allAnchorLinks = document.querySelectorAll('a[href^="#"]');
  allAnchorLinks.forEach((anchor) => {
    // Abaikan jika sudah di-handle oleh selectPackageBtns
    if (anchor.classList.contains("select-package-btn")) return;

    anchor.addEventListener("click", function (e) {
      const targetHash = this.getAttribute("href");
      if (!targetHash || targetHash === "#") return;

      const targetEl = document.querySelector(targetHash);
      if (targetEl) {
        e.preventDefault();
        const isMobile = window.innerWidth <= 768;
        const navOffset = isMobile ? 85 : 110;
        if (window.lenis) {
          window.lenis.scrollTo(targetEl, {
            offset: -navOffset,
            duration: 1.5
          });
        } else {
          const elementPosition = targetEl.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - navOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          });
        }

        // Tutup menu mobile jika sedang terbuka
        if (mainNav && mainNav.classList.contains("open")) {
          mainNav.classList.remove("open");
          if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
          const lines = menuToggle.querySelectorAll(".hamburger-line");
          if (lines.length) {
            lines[0].style.transform = "none";
            lines[1].style.opacity = "1";
            lines[2].style.transform = "none";
          }
        }
      }
    });
  });

  // =========================================================================
  // 6. SCROLL SPY UNTUK NAVIGASI AKTIF
  // =========================================================================
  const sections = document.querySelectorAll("main section[id]");
  const headerLinks = document.querySelectorAll(".nav .nav-link");

  window.addEventListener("scroll", () => {
    const scrollPos = window.scrollY + 120;
    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute("id");

      if (scrollPos >= top && scrollPos < top + height) {
        headerLinks.forEach((link) => {
          link.classList.remove("active");
          if (link.getAttribute("href") === `#${id}`) {
            link.classList.add("active");
          }
        });
      }
    });
  }, { passive: true });

  // =========================================================================
  // 7. DYNAMIC 2-WAY SCROLL REVEAL (INTERSECTION OBSERVER)
  // =========================================================================
  function initScrollReveal() {
    // Otomatis atur delay berurutan untuk grup kartu
    const groups = document.querySelectorAll(".reveal-group");
    groups.forEach((group) => {
      const items = group.querySelectorAll(".reveal-item");
      items.forEach((item, idx) => {
        if (!item.style.transitionDelay) {
          item.style.transitionDelay = `${idx * 140}ms`;
        }
      });
    });

    const revealElements = document.querySelectorAll(".reveal-item");
    if (!revealElements.length) return;

    if (!("IntersectionObserver" in window)) {
      revealElements.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    // Observer dua arah: Berjalan saat scroll ke bawah DAN saat scroll balik ke atas
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        } else {
          // Hanya reset ketika elemen keluar ke bawah (bukan saat scroll ke bawah melewati elemen)
          const rect = entry.target.getBoundingClientRect();
          if (rect.top > (window.innerHeight || document.documentElement.clientHeight)) {
            entry.target.classList.remove("is-visible");
          }
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px"
    });

    revealElements.forEach((el) => observer.observe(el));

    // Langsung tampilkan elemen yang sudah ada di viewport saat halaman dimuat
    // (penting untuk GitHub Pages: CDN kadang lambat, elemen pertama tidak ter-trigger)
    requestAnimationFrame(() => {
      revealElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.98 && rect.bottom > 0) {
          el.classList.add("is-visible");
        }
      });
    });
  }

  initScrollReveal();

  // =========================================================================
  // 8. SCROLL PROGRESS BAR (INDIKATOR SCROLL DINAMIS)
  // =========================================================================
  const progressBar = document.getElementById("scrollProgressBar");
  if (progressBar) {
    window.addEventListener("scroll", () => {
      const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      progressBar.style.width = `${scrolled}%`;
    }, { passive: true });
  }

  // =========================================================================
  // 8.5. 3D HORIZONTAL SCROLL GALLERY
  // =========================================================================
  (function init3DHorizontalGallery() {
    var pinWrap  = document.getElementById("gallery3dPinWrap");
    var track    = document.getElementById("gallery3dTrack");
    var viewport = document.getElementById("gallery3dViewport");
    var cards    = document.querySelectorAll(".gallery-3d-card");
    var activeIdxEl    = document.getElementById("galleryActiveIdx");
    var galProgressBar = document.getElementById("galleryProgressBar");
    var prevBtn  = document.getElementById("galleryPrevBtn");
    var nextBtn  = document.getElementById("galleryNextBtn");

    if (!pinWrap || !track || !cards.length) return;

    var totalCards = cards.length;
    var GAP_MOBILE = 20;

    function setUI(idx) {
      idx = Math.max(0, Math.min(totalCards - 1, idx));
      if (activeIdxEl)    activeIdxEl.textContent = String(idx + 1).padStart(2, "0");
      if (prevBtn)        prevBtn.disabled  = (idx === 0);
      if (nextBtn)        nextBtn.disabled  = (idx === totalCards - 1);
      if (galProgressBar) galProgressBar.style.width = ((idx / (totalCards - 1) * 100).toFixed(1)) + "%";
      cards.forEach(function(c, i) { c.classList.toggle("is-centered", i === idx); });
    }

    // ── MODE MOBILE: JS touch carousel, transform translateX ──
    if (isMobileDevice) {
      var curIdx = 0;
      var translateX = 0;
      var isDragging = false;
      var dragStartX = 0;
      var dragStartTranslate = 0;
      var velocity = 0;
      var lastTouchX = 0;
      var lastTouchTime = 0;

      if (!viewport) return;

      viewport.style.overflow = "hidden";
      viewport.style.touchAction = "pan-y";
      track.style.willChange = "transform";

      function getCardMetrics() {
        var cardEl = cards[0];
        var cardW  = cardEl ? cardEl.offsetWidth : Math.min(window.innerWidth * 0.84, 320);
        var offset = (viewport.offsetWidth - cardW) / 2;
        return { cardW: cardW, offset: offset };
      }

      function translateTo(idx, animate) {
        if (animate === undefined) animate = true;
        curIdx = Math.max(0, Math.min(totalCards - 1, idx));
        var metrics = getCardMetrics();
        translateX = metrics.offset - curIdx * (metrics.cardW + GAP_MOBILE);
        track.style.transition = animate
          ? "transform 0.38s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
          : "none";
        track.style.transform = "translateX(" + translateX + "px)";
        setUI(curIdx);
      }

      viewport.addEventListener("touchstart", function(e) {
        isDragging = true;
        dragStartX = e.touches[0].clientX;
        dragStartTranslate = translateX;
        lastTouchX = dragStartX;
        lastTouchTime = Date.now();
        velocity = 0;
        track.style.transition = "none";
      }, { passive: true });

      viewport.addEventListener("touchmove", function(e) {
        if (!isDragging) return;
        var dx = e.touches[0].clientX - dragStartX;
        var now = Date.now();
        velocity = (e.touches[0].clientX - lastTouchX) / (now - lastTouchTime + 1);
        lastTouchX = e.touches[0].clientX;
        lastTouchTime = now;
        var metrics = getCardMetrics();
        var minX = metrics.offset - (totalCards - 1) * (metrics.cardW + GAP_MOBILE);
        var maxX = metrics.offset;
        var newX = dragStartTranslate + dx;
        if (newX > maxX) newX = maxX + (newX - maxX) * 0.3;
        if (newX < minX) newX = minX + (newX - minX) * 0.3;
        track.style.transform = "translateX(" + newX + "px)";
      }, { passive: true });

      function onDragEnd(endClientX) {
        if (!isDragging) return;
        isDragging = false;
        var dx = endClientX - dragStartX;
        var metrics = getCardMetrics();
        var threshold = metrics.cardW * 0.25;
        var targetIdx = curIdx;
        if (Math.abs(dx) > threshold || Math.abs(velocity) > 0.4) {
          if (dx < 0 || velocity < -0.4) targetIdx = curIdx + 1;
          else targetIdx = curIdx - 1;
        }
        translateTo(targetIdx, true);
      }

      viewport.addEventListener("touchend", function(e) { onDragEnd(e.changedTouches[0].clientX); }, { passive: true });
      viewport.addEventListener("touchcancel", function(e) { onDragEnd(e.changedTouches[0] ? e.changedTouches[0].clientX : dragStartX); }, { passive: true });

      if (prevBtn) prevBtn.addEventListener("click", function() { translateTo(curIdx - 1); });
      if (nextBtn) nextBtn.addEventListener("click", function() { translateTo(curIdx + 1); });

      requestAnimationFrame(function() { translateTo(0, false); });
      return;
    }

    // ── MODE DESKTOP: GSAP ScrollTrigger pin + 3D Coverflow ──
    var currentProgress = 0;
    var scrollTriggerInstance = null;

    function computeLayout() {
      var cardWidth = cards[0].offsetWidth || 380;
      var trackStyle = window.getComputedStyle(track);
      var gap = parseFloat(trackStyle.gap) || 52;
      var cardStep = cardWidth + gap;
      var totalDistance = (totalCards - 1) * cardStep;
      var centerOffset = Math.max(0, (window.innerWidth - cardWidth) / 2);
      track.style.paddingLeft  = centerOffset + "px";
      track.style.paddingRight = centerOffset + "px";
      return { cardWidth: cardWidth, cardStep: cardStep, totalDistance: totalDistance };
    }

    var layout = computeLayout();

    function updateCardTransforms() {
      var vWidth = window.innerWidth;
      var stageCenter = vWidth / 2;
      var isTablet = vWidth <= 1024;
      var closestIdx = 0, minDist = Infinity;

      cards.forEach(function(card, i) {
        var rect = card.getBoundingClientRect();
        var cardCenter = rect.left + rect.width / 2;
        var dist = cardCenter - stageCenter;
        var absDist = Math.abs(dist);
        if (absDist < minDist) { minDist = absDist; closestIdx = i; }

        var norm    = Math.max(-2.5, Math.min(2.5, dist / (vWidth * 0.45)));
        var absNorm = Math.abs(norm);
        var rotY    = -norm * (isTablet ? 16 : 24);
        var rotZ    =  norm * (isTablet ? 3.8 : 5.5);
        var transZ  = -Math.min(1.8, absNorm) * (isTablet ? 80 : 130);
        var scale   = Math.max(0.76, 1 - Math.min(1.4, absNorm) * (isTablet ? 0.16 : 0.22));
        var opacity = Math.max(0.25, 1 - Math.min(1.5, absNorm) * 0.45);

        card.style.transform = "translate3d(0,0," + transZ.toFixed(1) + "px) rotateY(" + rotY.toFixed(2) + "deg) rotateZ(" + rotZ.toFixed(2) + "deg) scale(" + scale.toFixed(3) + ")";
        card.style.opacity   = opacity.toFixed(2);
        card.style.zIndex    = String(Math.round(50 - Math.min(30, absNorm * 18)));
        card.classList.toggle("is-centered", absNorm < 0.28);
      });

      if (activeIdxEl) {
        var s = String(closestIdx + 1).padStart(2, "0");
        if (activeIdxEl.textContent !== s) activeIdxEl.textContent = s;
      }
      if (prevBtn) prevBtn.disabled = (closestIdx === 0);
      if (nextBtn) nextBtn.disabled = (closestIdx === totalCards - 1);
    }

    function applyProgress(prog) {
      currentProgress = Math.max(0, Math.min(1, prog));
      var targetX = -currentProgress * layout.totalDistance;
      if (typeof gsap !== "undefined") {
        gsap.set(track, { x: targetX });
      } else {
        track.style.transform = "translate3d(" + targetX + "px,0,0)";
      }
      updateCardTransforms();
      if (galProgressBar) galProgressBar.style.width = (currentProgress * 100).toFixed(1) + "%";
    }

    function goToCard(idx, smooth) {
      if (smooth === undefined) smooth = true;
      if (idx < 0 || idx >= totalCards) return;
      var prog = idx / (totalCards - 1);
      if (scrollTriggerInstance) {
        var targetScroll = scrollTriggerInstance.start + prog * (scrollTriggerInstance.end - scrollTriggerInstance.start);
        if (window.lenis && smooth) window.lenis.scrollTo(targetScroll, { duration: 0.9 });
        else window.scrollTo({ top: targetScroll, behavior: smooth ? "smooth" : "auto" });
      } else {
        applyProgress(prog);
      }
    }

    // Init: render card 1 di tengah sebelum ScrollTrigger dibuat
    layout = computeLayout();
    applyProgress(0);

    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
      var scrollDistance = Math.max(window.innerHeight * 2.5, 1800);

      scrollTriggerInstance = ScrollTrigger.create({
        trigger: pinWrap,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        start: "top top",
        end: function() { return "+=" + scrollDistance; },
        scrub: true,
        invalidateOnRefresh: true,
        fastScrollEnd: true,
        preventOverlaps: true,
        onUpdate: function(self) { applyProgress(self.progress); },
        onEnter: function() { if (currentProgress < 0.01) applyProgress(0); }
      });
    }

    var isDown = false, dragSX = 0, dragSProg = 0, hasDragged = false;
    var dragTarget = viewport || track;

    dragTarget.addEventListener("pointerdown", function(e) {
      isDown = true; hasDragged = false; dragSX = e.clientX; dragSProg = currentProgress;
    });
    window.addEventListener("pointermove", function(e) {
      if (!isDown) return;
      var dx = e.clientX - dragSX;
      if (Math.abs(dx) > 6) {
        hasDragged = true;
        var np = Math.max(0, Math.min(1, dragSProg - dx / layout.totalDistance));
        if (scrollTriggerInstance) window.scrollTo(0, scrollTriggerInstance.start + np * (scrollTriggerInstance.end - scrollTriggerInstance.start));
        else applyProgress(np);
      }
    });
    window.addEventListener("pointerup", function() {
      if (!isDown) return;
      isDown = false;
      setTimeout(function() { hasDragged = false; }, 50);
    });

    if (prevBtn) prevBtn.addEventListener("click", function() {
      goToCard(Math.max(0, Math.round(currentProgress * (totalCards - 1)) - 1), true);
    });
    if (nextBtn) nextBtn.addEventListener("click", function() {
      goToCard(Math.min(totalCards - 1, Math.round(currentProgress * (totalCards - 1)) + 1), true);
    });

    cards.forEach(function(card, idx) {
      card.addEventListener("click", function() { if (!hasDragged) goToCard(idx, true); });
    });

    window.addEventListener("resize", function() {
      layout = computeLayout();
      if (scrollTriggerInstance) ScrollTrigger.refresh();
      else applyProgress(currentProgress);
    });
  })();
  // 9. TAHUN COPYRIGHT
  // =========================================================================
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // =========================================================================
  // 9.5 ANIMASI GARIS JATUH BERGULIR SESUAI SCROLL
  // =========================================================================
  (function initDropLine() {
    const dropLine = document.getElementById("manfaatLineFill");
    const dropDot = document.getElementById("manfaatLineDot");
    const dropWrap = document.querySelector(".scroll-drop-line-wrap");
    if (!dropWrap || !dropLine) return;

    function updateDropLine() {
      const rect = dropWrap.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.90;
      const end = vh * 0.35;
      const progress = Math.min(1, Math.max(0, (start - rect.top) / (start - end)));

      const pct = (progress * 100).toFixed(1);
      dropLine.style.height = `${pct}%`;
      if (dropDot) {
        dropDot.style.top = `${pct}%`;
        dropDot.style.opacity = progress > 0.05 ? "1" : "0";
      }
    }

    window.addEventListener("scroll", updateDropLine, { passive: true });
    window.addEventListener("resize", updateDropLine, { passive: true });
    updateDropLine();
  })();

  // =========================================================================
  // 10. MANFAAT BLUR-TO-FOCUS & EFEK ULIR SCROLL ANIMATION (Wealthclub Style)
  // =========================================================================
  (function initManfaatBlur() {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Jika pengguna mengaktifkan preferensi kurangi gerakan di OS/browser: tampilkan langsung tajam
    if (prefersReduced) {
      document.querySelectorAll(".mw").forEach((w) => w.classList.add("mw-focused"));
      return;
    }

    const items = document.querySelectorAll(".manfaat-item");
    if (!items.length) return;

    function updateScrollEffects() {
      const vh = window.innerHeight;
      const isMobile = window.innerWidth <= 768;

      items.forEach((item) => {
        const rect = item.getBoundingClientRect();
        // Item starts entering around 90% of viewport, finishes reveal around 32%
        const start = isMobile ? vh * 0.90 : vh * 0.88;
        const end = isMobile ? vh * 0.32 : vh * 0.38;
        const progress = Math.min(1, Math.max(0, (start - rect.top) / (start - end)));

        // 1. Efek Ulir: Rotation tilt based on scroll progress (hook tengah tetap 0deg)
        const wordsWrap = item.querySelector(".manfaat-words");
        if (wordsWrap) {
          if (item.classList.contains("manfaat-hook-item")) {
            wordsWrap.style.setProperty("--rot", "0deg");
          } else {
            const maxRot = isMobile ? 1.6 : 2.5;
            const rot = (1 - progress) * maxRot;
            wordsWrap.style.setProperty("--rot", `${rot.toFixed(2)}deg`);
          }
        }

        // 2. Word-by-word blur-to-focus reveal
        const words = item.querySelectorAll(".mw");
        const totalWords = words.length;
        if (!totalWords) return;

        words.forEach((word, i) => {
          // Stagger each word sequentially across progress 0..0.95
          const threshold = (i / totalWords) * 0.95;
          if (progress >= threshold) {
            word.classList.add("mw-focused");
          } else {
            word.classList.remove("mw-focused");
          }
        });
      });
    }

    // Touch support for mobile: tapping immediately brings the touched item into full focus
    items.forEach((item) => {
      item.addEventListener("touchstart", () => {
        item.classList.add("is-touched");
        item.querySelectorAll(".mw").forEach((w) => w.classList.add("mw-focused"));
        const wordsWrap = item.querySelector(".manfaat-words");
        if (wordsWrap) wordsWrap.style.setProperty("--rot", "0deg");
      }, { passive: true });
    });

    window.addEventListener("scroll", updateScrollEffects, { passive: true });
    window.addEventListener("resize", updateScrollEffects, { passive: true });
    updateScrollEffects();
  })();

  // =========================================================================
  // 11. EKOSISTEM BISNIS (CAROUSEL & DETAIL MODAL)
  // =========================================================================
  (function initEkosistem() {
    const track = document.getElementById("ekosistemTrack");
    if (!track) return;

    const cards = Array.from(track.querySelectorAll(".ekosistem-card"));
    const prevBtn = document.getElementById("ekosistemPrev");
    const nextBtn = document.getElementById("ekosistemNext");
    const dotsWrap = document.getElementById("ekosistemDots");
    const dots = dotsWrap ? Array.from(dotsWrap.querySelectorAll(".ekosistem-dot")) : [];

    const modal = document.getElementById("ekosistemModal");
    const modalBackdrop = document.getElementById("ekosistemModalBackdrop");
    const modalClose = document.getElementById("ekosistemModalClose");
    const modalBody = document.getElementById("ekosistemModalBody");

    const EKOSISTEM_DATA = [
      {
        tag: "01 / LAYANAN & RETAIL",
        title: "ATVA Treatment Co & De'atva",
        desc: "Lini bisnis utama yang bergerak di bidang jasa perawatan bergaransi serta penjualan produk perawatan mandiri untuk pasar produktif.",
        points: [
          "Layanan cuci dan reparasi sepatu, tas, topi, helm, koper, hingga aksesoris.",
          "Memiliki 13 cabang operasional aktif di berbagai kota Indonesia dengan 10.000++ klien.",
          "Memproduksi lini parfum eksklusif De'atva dengan tagline \"Exclusive Care For Your Favorite Items\"."
        ]
      },
      {
        tag: "02 / SUPPLIER CHEMICAL",
        title: "Acfalabs",
        desc: "Divisi penyedia bahan baku kimia dan formulasi khusus untuk memastikan setiap cabang menghasilkan kualitas perawatan yang seragam.",
        points: [
          "Menyuplai cairan pembersih, whitening, unyellowing, hingga bahan pewarnaan (recolour) untuk mitra.",
          "Menjaga ketersediaan stok bahan baku langsung dari pusat agar mitra tidak bergantung pada pihak ketiga.",
          "Formulasi disesuaikan untuk keamanan berbagai material sepatu, tas, dan helm."
        ]
      },
      {
        tag: "03 / MANUFAKTUR MESIN",
        title: "Acfa Machina",
        desc: "Unit manufaktur peralatan yang merancang dan memproduksi mesin pendukung operasional cuci dan reparasi sepatu.",
        points: [
          "Memproduksi mesin cuci dan peralatan reparasi sepatu khusus kebutuhan gerai.",
          "Mempercepat durasi pengerjaan treatment di cabang dengan standar hasil yang konsisten.",
          "Memudahkan upgrade peralatan seiring peningkatan kapasitas order cabang."
        ]
      }
    ];

    let currentIndex = 0;
    let isDragging = false;
    let hasDragged = false;
    let startX = 0;
    let scrollStart = 0;
    let isPointerDown = false;

    // Helper: Scroll card to center
    function scrollToCard(index) {
      if (index < 0 || index >= cards.length) return;
      const card = cards[index];
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const trackCenter = track.clientWidth / 2;
      const targetScroll = cardCenter - trackCenter;

      track.scrollTo({
        left: targetScroll,
        behavior: "smooth"
      });
      setActiveCard(index);
    }

    // Helper: Update active card and controls
    function setActiveCard(index) {
      if (index < 0 || index >= cards.length) return;
      currentIndex = index;

      cards.forEach((c, i) => {
        const isActive = i === index;
        c.classList.toggle("is-active", isActive);
        c.setAttribute("aria-selected", isActive ? "true" : "false");
      });

      dots.forEach((dot, i) => {
        const isActive = i === index;
        dot.classList.toggle("active", isActive);
        dot.setAttribute("aria-selected", isActive ? "true" : "false");
      });

      if (prevBtn) prevBtn.disabled = index === 0;
      if (nextBtn) nextBtn.disabled = index === cards.length - 1;
    }

    // Detect closest card to center during scroll
    let scrollTimeout = null;
    function onTrackScroll() {
      if (scrollTimeout) cancelAnimationFrame(scrollTimeout);
      scrollTimeout = requestAnimationFrame(() => {
        const trackCenter = track.scrollLeft + track.clientWidth / 2;
        let closestIndex = 0;
        let minDiff = Infinity;

        cards.forEach((card, i) => {
          const cardCenter = card.offsetLeft + card.offsetWidth / 2;
          const diff = Math.abs(cardCenter - trackCenter);
          if (diff < minDiff) {
            minDiff = diff;
            closestIndex = i;
          }
        });

        if (closestIndex !== currentIndex) {
          setActiveCard(closestIndex);
        }
      });
    }

    track.addEventListener("scroll", onTrackScroll, { passive: true });

    // Desktop Mouse Drag Handling
    track.addEventListener("mousedown", (e) => {
      isPointerDown = true;
      hasDragged = false;
      startX = e.pageX;
      scrollStart = track.scrollLeft;
    });

    window.addEventListener("mousemove", (e) => {
      if (!isPointerDown) return;
      const dx = e.pageX - startX;
      if (Math.abs(dx) > 6) {
        hasDragged = true;
        isDragging = true;
        track.scrollLeft = scrollStart - dx;
      }
    });

    window.addEventListener("mouseup", () => {
      if (!isPointerDown) return;
      isPointerDown = false;
      if (hasDragged) {
        setTimeout(() => {
          isDragging = false;
          hasDragged = false;
        }, 50);
      }
    });

    // Touch Swipe Handling for Mobile
    let touchStartX = 0;
    let touchStartY = 0;
    let touchDragged = false;

    track.addEventListener("touchstart", (e) => {
      if (!e.touches.length) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchDragged = false;
    }, { passive: true });

    track.addEventListener("touchmove", (e) => {
      if (!e.touches.length) return;
      const dx = Math.abs(e.touches[0].clientX - touchStartX);
      const dy = Math.abs(e.touches[0].clientY - touchStartY);
      if (dx > 8 || dy > 8) {
        touchDragged = true;
      }
    }, { passive: true });

    track.addEventListener("touchend", () => {
      if (touchDragged) {
        setTimeout(() => {
          touchDragged = false;
        }, 80);
      }
    }, { passive: true });

    // Card Click: Inactive card -> scroll to center; Active card -> open modal
    cards.forEach((card, i) => {
      card.addEventListener("click", (e) => {
        if (isDragging || hasDragged || touchDragged) {
          e.preventDefault();
          return;
        }

        if (i !== currentIndex) {
          scrollToCard(i);
        } else {
          openModal(i);
        }
      });
    });

    // Arrow Buttons
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        scrollToCard(Math.max(0, currentIndex - 1));
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        scrollToCard(Math.min(cards.length - 1, currentIndex + 1));
      });
    }

    // Dot Indicators
    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        scrollToCard(i);
      });
    });

    // ==================== MODAL LOGIC ====================
    function openModal(index) {
      const data = EKOSISTEM_DATA[index];
      if (!data || !modal || !modalBody) return;

      const pointsHtml = data.points
        .map(
          (pt) => `
            <li class="modal-point-item">
              <span class="modal-point-icon" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </span>
              <span>${pt}</span>
            </li>`
        )
        .join("");

      modalBody.innerHTML = `
        <span class="modal-header-tag">${data.tag}</span>
        <h3 class="modal-title">${data.title}</h3>
        <p class="modal-desc">${data.desc}</p>
        <ul class="modal-points-list">
          ${pointsHtml}
        </ul>
        <div class="modal-footer-actions">
          <button type="button" class="modal-btn-dismiss" id="modalDismissBtn">Tutup Rincian</button>
          <a href="https://wa.me/6282230196689?text=Halo%20Tim%20Kemitraan%2C%20saya%20ingin%20tanya%20lebih%20lanjut%20tentang%20entitas%20${encodeURIComponent(data.title)}" target="_blank" rel="noopener" class="modal-btn-cta">
            Konsultasi WhatsApp <span>↗</span>
          </a>
        </div>
      `;

      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
      if (window.lenis) window.lenis.stop();

      const dismissBtn = modalBody.querySelector("#modalDismissBtn");
      if (dismissBtn) dismissBtn.addEventListener("click", closeModal);

      if (modalClose) modalClose.focus();
    }

    function closeModal() {
      if (!modal) return;
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
      if (window.lenis) window.lenis.start();
      if (cards[currentIndex]) cards[currentIndex].focus();
    }

    if (modalClose) modalClose.addEventListener("click", closeModal);
    if (modalBackdrop) modalBackdrop.addEventListener("click", closeModal);

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal && modal.classList.contains("is-open")) {
        closeModal();
      }
    });

    // Initial positioning
    window.addEventListener("load", () => {
      scrollToCard(0);
      if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.refresh();
      }
    });
    scrollToCard(0);
  })();
});

