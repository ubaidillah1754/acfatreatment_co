/**
 * ACFATREATMENT — INTERACTIVE SCRIPT
 * Landing Page Kemitraan Bisnis Treatment Sepatu, Helm, Koper, & Stroller
 */

document.addEventListener("DOMContentLoaded", () => {
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
        const targetPos = daftarSection.getBoundingClientRect().top + window.pageYOffset - navOffset;
        window.scrollTo({
          top: targetPos,
          behavior: "smooth"
        });
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
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - navOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });

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
          // Reset ketika keluar pandangan agar animasi aktif kembali saat di-scroll ulang
          entry.target.classList.remove("is-visible");
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
  // 8.5. TESTIMONIAL MITRA SLIDER (HORIZONTAL DRAG & ARROW NAVIGATION)
  // =========================================================================
  const slider = document.getElementById("mitraSlider");
  const prevBtn = document.getElementById("mitraPrevBtn");
  const nextBtn = document.getElementById("mitraNextBtn");
  const dots = document.querySelectorAll(".slider-dot");

  if (slider) {
    const cards = slider.querySelectorAll(".testimonial-card");
    const totalCards = cards.length;

    // Menghitung lebar langkah scroll per kartu + gap
    function getScrollStep() {
      if (!cards.length) return 380;
      const card = cards[0];
      const track = slider.querySelector(".testimonial-track");
      let gap = 24;
      if (track) {
        const style = window.getComputedStyle(track);
        gap = parseInt(style.gap || "24", 10) || 24;
      }
      return card.offsetWidth + gap;
    }

    // Update status tombol panah (disable/enable) dan titik pagination aktif
    function updateSliderState() {
      const scrollLeft = slider.scrollLeft;
      const maxScroll = slider.scrollWidth - slider.clientWidth - 8;

      if (prevBtn) {
        prevBtn.disabled = scrollLeft <= 8;
      }
      if (nextBtn) {
        nextBtn.disabled = scrollLeft >= maxScroll;
      }

      // Hitung indeks kartu aktif berdasarkan posisi scroll
      const step = getScrollStep();
      const activeIdx = Math.min(totalCards - 1, Math.max(0, Math.round(scrollLeft / step)));

      dots.forEach((dot, idx) => {
        if (idx === activeIdx) {
          dot.classList.add("active");
        } else {
          dot.classList.remove("active");
        }
      });
    }

    // Klik tombol Next
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        const step = getScrollStep();
        slider.scrollBy({ left: step, behavior: "smooth" });
      });
    }

    // Klik tombol Prev
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        const step = getScrollStep();
        slider.scrollBy({ left: -step, behavior: "smooth" });
      });
    }

    // Klik titik pagination
    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const idx = parseInt(dot.getAttribute("data-index"), 10) || 0;
        const step = getScrollStep();
        slider.scrollTo({ left: idx * step, behavior: "smooth" });
      });
    });

    // Throttled scroll listener
    let isTicking = false;
    slider.addEventListener("scroll", () => {
      if (!isTicking) {
        window.requestAnimationFrame(() => {
          updateSliderState();
          isTicking = false;
        });
        isTicking = true;
      }
    }, { passive: true });

    // Drag to scroll dengan mouse pada desktop
    let isMouseDown = false;
    let startX = 0;
    let scrollStart = 0;

    slider.addEventListener("mousedown", (e) => {
      isMouseDown = true;
      slider.classList.add("is-dragging");
      startX = e.pageX - slider.offsetLeft;
      scrollStart = slider.scrollLeft;
    });

    window.addEventListener("mouseup", () => {
      if (isMouseDown) {
        isMouseDown = false;
        slider.classList.remove("is-dragging");
      }
    });

    slider.addEventListener("mousemove", (e) => {
      if (!isMouseDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 1.5;
      slider.scrollLeft = scrollStart - walk;
    });

    // Jalankan kalkulasi status awal
    updateSliderState();
    window.addEventListener("resize", updateSliderState, { passive: true });
  }

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

      const dismissBtn = modalBody.querySelector("#modalDismissBtn");
      if (dismissBtn) dismissBtn.addEventListener("click", closeModal);

      if (modalClose) modalClose.focus();
    }

    function closeModal() {
      if (!modal) return;
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
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
    });
    scrollToCard(0);
  })();
});

