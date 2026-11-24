/**
 * ACFATREATMENT — INTERACTIVE SCRIPT
 * Landing Page Kemitraan Bisnis Treatment Sepatu, Helm, Koper, & Stroller
 */

document.addEventListener("DOMContentLoaded", () => {
  // =========================================================================
  // 0. LENIS SMOOTH SCROLL CONTROLLER (MOMENTUM & INERTIA SCROLL SEPERTI WEALTHCLUB.ID)
  // =========================================================================
  let lenisInstance = null;
  function initLenis() {
    if (typeof Lenis === "undefined") return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    lenisInstance = new Lenis({
      duration: 1.5, // 1.5s easing: menghasilkan scroll yang tenang, elegan, dan halus
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Easing eksponensial
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.85, // Memperlambat wheel agar tidak melompat cepat dan terasa berbobot
      touchMultiplier: 1.5,
      infinite: false
    });

    window.lenis = lenisInstance;

    // Sinkronisasi dua arah dengan GSAP ScrollTrigger
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
  // 8.5. 3D HORIZONTAL SCROLL GALLERY (SUPAH.IT 3D CARD STACK / COVERFLOW)
  // =========================================================================
  (function init3DHorizontalGallery() {
    const pinWrap = document.getElementById("gallery3dPinWrap");
    const track = document.getElementById("gallery3dTrack");
    const viewport = document.getElementById("gallery3dViewport");
    const cards = document.querySelectorAll(".gallery-3d-card");
    const progressBar = document.getElementById("galleryProgressBar");
    const prevBtn = document.getElementById("galleryPrevBtn");
    const nextBtn = document.getElementById("galleryNextBtn");

    if (!pinWrap || !track || !cards.length) return;

    const totalCards = cards.length;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let currentX = 0;
    let isUserInteracting = false;

    // Hitung posisi layout agar Card 1 tepat berada di tengah layar pada awal
    function getLayout() {
      const card = cards[0];
      const cardWidth = card.offsetWidth || 340;
      const trackStyle = window.getComputedStyle(track);
      const gap = parseFloat(trackStyle.gap || "52") || 52;
      const cardStep = cardWidth + gap;
      const totalDistance = (totalCards - 1) * cardStep;

      // Padding kiri dan kanan agar kartu pertama dan terakhir bisa berhenti tepat di tengah viewport
      const centerOffset = (window.innerWidth - cardWidth) / 2;
      track.style.paddingLeft = `${Math.max(0, centerOffset)}px`;
      track.style.paddingRight = `${Math.max(0, centerOffset)}px`;

      return { cardWidth, cardStep, totalDistance };
    }

    let layout = getLayout();
    let currentProgress = 0; // 0 to 1
    let scrollTriggerInstance = null;

    // Hitung efek 3D Coverflow untuk setiap card mengikuti referensi Supah.it
    function updateCardTransforms() {
      if (prefersReduced) return;

      const vWidth = window.innerWidth;
      const stageCenter = vWidth / 2;
      const isMobile = vWidth <= 768;
      const isTablet = vWidth > 768 && vWidth <= 1024;

      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.left + rect.width / 2;
        const distFromCenter = cardCenter - stageCenter;

        // Jarak ternormalisasi: 0 = tepat di tengah, +1 = ke kanan, -1 = ke kiri
        const normDist = distFromCenter / (vWidth * 0.45);
        const clampedDist = Math.max(-2.5, Math.min(2.5, normDist));
        const absNorm = Math.abs(clampedDist);

        // Parameter 3D sesuai karakteristik Supah.it Coverflow
        const maxRotY = isMobile ? 8 : (isTablet ? 16 : 24);
        const maxRotZ = isMobile ? 2 : (isTablet ? 3.8 : 5.5);
        const maxTransZ = isMobile ? -35 : (isTablet ? -80 : -130);
        const scaleDrop = isMobile ? 0.07 : (isTablet ? 0.16 : 0.22);

        const rotY = -clampedDist * maxRotY;
        const rotZ = clampedDist * maxRotZ;
        const transZ = -Math.min(1.8, absNorm) * Math.abs(maxTransZ);
        const scale = Math.max(0.76, 1 - Math.min(1.4, absNorm) * scaleDrop);
        const opacity = Math.max(0.25, 1 - Math.min(1.5, absNorm) * 0.45);
        const zIndex = Math.round(50 - Math.min(30, absNorm * 18));

        card.style.transform = `translate3d(0, 0, ${transZ.toFixed(1)}px) rotateY(${rotY.toFixed(2)}deg) rotateZ(${rotZ.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
        card.style.opacity = opacity.toFixed(2);
        card.style.zIndex = zIndex;

        // Card tengah menjadi fokus utama
        if (absNorm < 0.28) {
          card.classList.add("is-centered");
        } else {
          card.classList.remove("is-centered");
        }
      });
    }

    function setGalleryX(x, updateBar = true) {
      currentX = Math.max(-layout.totalDistance, Math.min(0, x));
      gsap.set(track, { x: currentX });
      updateCardTransforms();

      if (updateBar && progressBar && layout.totalDistance > 0) {
        const pct = (-currentX / layout.totalDistance) * 100;
        progressBar.style.width = `${Math.max(0, Math.min(100, pct)).toFixed(1)}%`;
      }

      // Update tombol nav disable state
      if (prevBtn) prevBtn.disabled = closestIdx === 0;
      if (nextBtn) nextBtn.disabled = closestIdx === totalCards - 1;
    }

<<<<<<< HEAD
    // Fungsi pusat untuk menggeser track ke progres tertentu (0..1)
    function applyProgress(prog, animate = false) {
      currentProgress = Math.max(0, Math.min(1, prog));
      layout = getLayout();
      const currentX = -currentProgress * layout.totalDistance;

      if (animate && typeof gsap !== "undefined") {
        gsap.to(track, {
          x: currentX,
          duration: 0.5,
          ease: "power2.out",
          onUpdate: updateCardTransforms
        });
      } else {
        if (typeof gsap !== "undefined") {
          gsap.set(track, { x: currentX });
        } else {
          track.style.transform = `translate3d(${currentX}px, 0, 0)`;
        }
        updateCardTransforms();
      }

      if (progressBar) {
        progressBar.style.width = `${(currentProgress * 100).toFixed(1)}%`;
      }
    }

    // Fungsi geser ke indeks card tertentu
    function goToCard(idx, smooth = true) {
      if (idx < 0 || idx >= totalCards) return;
      const targetProg = idx / (totalCards - 1);

      if (scrollTriggerInstance) {
        const targetScroll = scrollTriggerInstance.start + targetProg * (scrollTriggerInstance.end - scrollTriggerInstance.start);
        if (window.lenis && smooth) {
          window.lenis.scrollTo(targetScroll, { duration: 1.0 });
        } else {
          window.scrollTo({
            top: targetScroll,
            behavior: smooth ? "smooth" : "auto"
          });
        }
      } else {
        applyProgress(targetProg, smooth);
      }
    }

    // 1. Inisialisasi GSAP ScrollTrigger jika tersedia
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);

      const scrollDistance = Math.max(window.innerHeight * 2.5, 1800);

      scrollTriggerInstance = ScrollTrigger.create({
=======
    function animateToCard(idx) {
      layout = getLayout();
      const targetX = -Math.max(0, Math.min(totalCards - 1, idx)) * layout.cardStep;
      currentX = targetX;
      gsap.to(track, {
        x: targetX,
        duration: 0.55,
        ease: "power2.out",
        onUpdate: updateCardTransforms
      });
      if (progressBar && layout.totalDistance > 0) {
        const pct = (-targetX / layout.totalDistance) * 100;
        progressBar.style.width = `${Math.max(0, Math.min(100, pct)).toFixed(1)}%`;
      }
    }

    // Inisialisasi GSAP ScrollTrigger untuk scroll vertikal halus (ZERO GLITCH)
    let st = null;
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);

      const scrollDistance = Math.max(window.innerHeight * 1.6, 1300);

      st = ScrollTrigger.create({
>>>>>>> e5a377fd1f3c5bd9251915f61a62b8f76a4c28de
        trigger: pinWrap,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        start: "top top",
        end: () => `+=${scrollDistance}`,
<<<<<<< HEAD
        scrub: true,
=======
        scrub: 1, // Inersia alami
>>>>>>> e5a377fd1f3c5bd9251915f61a62b8f76a4c28de
        invalidateOnRefresh: true,
        fastScrollEnd: true,
        preventOverlaps: true,
        onUpdate: (self) => {
<<<<<<< HEAD
          applyProgress(self.progress);
        }
      });
    }

    // 2. Gesture Drag & Touch Swipe (berfungsi di Desktop mouse & HP touchscreen)
    let isDown = false;
    let startX = 0;
    let startProg = 0;
    let hasDragged = false;
    const dragTarget = viewport || track;

    dragTarget.addEventListener("pointerdown", (e) => {
      isDown = true;
      hasDragged = false;
      startX = e.clientX;
      startProg = currentProgress;
    });

    window.addEventListener("pointermove", (e) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 6) {
        hasDragged = true;
        const progChange = -dx / layout.totalDistance;
        const newProg = Math.max(0, Math.min(1, startProg + progChange));

        if (scrollTriggerInstance) {
          const targetScroll = scrollTriggerInstance.start + newProg * (scrollTriggerInstance.end - scrollTriggerInstance.start);
          window.scrollTo(0, targetScroll);
        } else {
          applyProgress(newProg);
        }
      }
    });

    window.addEventListener("pointerup", () => {
      if (!isDown) return;
      isDown = false;
      setTimeout(() => {
        hasDragged = false;
      }, 50);
    });

    // 3. Tombol Panah Prev / Next
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        const curIdx = Math.round(currentProgress * (totalCards - 1));
        goToCard(Math.max(0, curIdx - 1), true);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        const curIdx = Math.round(currentProgress * (totalCards - 1));
        goToCard(Math.min(totalCards - 1, curIdx + 1), true);
      });
    }

    // 4. Klik langsung pada card mana saja
    cards.forEach((card, idx) => {
      card.addEventListener("click", () => {
        if (hasDragged) return;
        goToCard(idx, true);
      });
    });

    // 5. Handle Resize Window
    window.addEventListener("resize", () => {
      layout = getLayout();
      if (scrollTriggerInstance) {
        ScrollTrigger.refresh();
      }
      applyProgress(currentProgress);
    });

    // Render perdana
    layout = getLayout();
    applyProgress(0);

    // Refresh ScrollTrigger setelah layout dan media selesai stabil
    if (typeof ScrollTrigger !== "undefined") {
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 350);
=======
          // Hanya sinkronkan dengan scroll vertikal jika pengguna tidak sedang aktif drag/touch
          if (isUserInteracting) return;
          layout = getLayout();
          setGalleryX(-self.progress * layout.totalDistance);
        }
      });
>>>>>>> e5a377fd1f3c5bd9251915f61a62b8f76a4c28de
    }

    // =========================================================================
    // MULTI-INPUT GESTURE CONTROLLER (TOUCHPAD 2 JARI, HP TOUCH, MOUSE DRAG)
    // =========================================================================

    // 1. LAPTOP TOUCHPAD (2 JARI HORIZONTAL SWIPE - deltaX)
    pinWrap.addEventListener("wheel", (e) => {
      // Deteksi usapan 2 jari horizontal pada trackpad
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 4) {
        if (e.cancelable) e.preventDefault();
        layout = getLayout();
        setGalleryX(currentX - e.deltaX * 1.25);
      }
    }, { passive: false });

    // 2. SMARTPHONE / TABLET TOUCH (1 JARI SWIPE DI HP)
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartCurrentX = 0;
    let isHorizontalGesture = false;

    pinWrap.addEventListener("touchstart", (e) => {
      if (e.touches.length !== 1) return;
      isUserInteracting = true;
      isHorizontalGesture = false;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartCurrentX = currentX;
      layout = getLayout();
    }, { passive: true });

    pinWrap.addEventListener("touchmove", (e) => {
      if (e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - touchStartX;
      const dy = e.touches[0].clientY - touchStartY;

      if (!isHorizontalGesture && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
        isHorizontalGesture = true;
      }

      if (isHorizontalGesture) {
        if (e.cancelable) e.preventDefault(); // Mencegah layar loncat vertikal saat geser kartu ke samping
        setGalleryX(touchStartCurrentX + dx * 1.2);
      }
    }, { passive: false });

    pinWrap.addEventListener("touchend", () => {
      isUserInteracting = false;
      if (isHorizontalGesture) {
        layout = getLayout();
        const nearestIdx = Math.round(-currentX / layout.cardStep);
        animateToCard(nearestIdx);
      }
    });

    // 3. DESKTOP / PC MOUSE DRAG
    let isMouseDown = false;
    let mouseStartX = 0;
    let mouseStartCurrentX = 0;
    let hasMouseDragged = false;

    pinWrap.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      isMouseDown = true;
      isUserInteracting = true;
      hasMouseDragged = false;
      mouseStartX = e.clientX;
      mouseStartCurrentX = currentX;
      pinWrap.classList.add("is-dragging");
      layout = getLayout();
    });

    window.addEventListener("mousemove", (e) => {
      if (!isMouseDown) return;
      const dx = e.clientX - mouseStartX;
      if (Math.abs(dx) > 6) {
        hasMouseDragged = true;
      }
      setGalleryX(mouseStartCurrentX + dx * 1.2);
    });

    window.addEventListener("mouseup", () => {
      if (!isMouseDown) return;
      isMouseDown = false;
      isUserInteracting = false;
      pinWrap.classList.remove("is-dragging");
      if (hasMouseDragged) {
        layout = getLayout();
        const nearestIdx = Math.round(-currentX / layout.cardStep);
        animateToCard(nearestIdx);
      }
    });

    // 4. KLIK LANGSUNG PADA CARD MANA SAJA UNTUK FOKUS KE TENGAH
    cards.forEach((card, idx) => {
      card.addEventListener("click", () => {
        if (hasMouseDragged || isHorizontalGesture) return;
        animateToCard(idx);
      });
    });

    // Handle Resize Window
    window.addEventListener("resize", () => {
      layout = getLayout();
      if (st) ScrollTrigger.refresh();
      setGalleryX(currentX);
    });

    // Render perdana
    layout = getLayout();
    setGalleryX(0);
  })();

  // =========================================================================
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

