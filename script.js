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
  // 8.5. 3D HORIZONTAL SCROLL GALLERY (SUPAH.IT 3D CARD STACK / COVERFLOW)
  // =========================================================================
  (function init3DHorizontalGallery() {
    const pinWrap = document.getElementById("gallery3dPinWrap");
    const track = document.getElementById("gallery3dTrack");
    const cards = document.querySelectorAll(".gallery-3d-card");
    const activeIdxEl = document.getElementById("galleryActiveIdx");
    const progressBar = document.getElementById("galleryProgressBar");

    if (!pinWrap || !track || !cards.length) return;

    const totalCards = cards.length;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Hitung posisi layout agar Card 1 tepat berada di tengah layar pada awal
    function getLayout() {
      const card = cards[0];
      const cardWidth = card.offsetWidth;
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

    // Hitung efek 3D Coverflow untuk setiap card mengikuti referensi Supah.it
    function updateCardTransforms() {
      if (prefersReduced) return;

      const vWidth = window.innerWidth;
      const stageCenter = vWidth / 2;
      const isMobile = vWidth <= 768;
      const isTablet = vWidth > 768 && vWidth <= 1024;

      let closestIdx = 0;
      let minDistance = Infinity;

      cards.forEach((card, i) => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.left + rect.width / 2;
        const distFromCenter = cardCenter - stageCenter;
        const absDistPx = Math.abs(distFromCenter);

        if (absDistPx < minDistance) {
          minDistance = absDistPx;
          closestIdx = i;
        }

        // Jarak ternormalisasi: 0 = tepat di tengah, +1 = ke kanan, -1 = ke kiri
        const normDist = distFromCenter / (vWidth * 0.45);
        const clampedDist = Math.max(-2.5, Math.min(2.5, normDist));
        const absNorm = Math.abs(clampedDist);

        // Parameter 3D sesuai karakteristik Supah.it Coverflow
        const maxRotY = isMobile ? 8 : (isTablet ? 16 : 24);
        const maxRotZ = isMobile ? 2 : (isTablet ? 3.8 : 5.5);
        const maxTransZ = isMobile ? -35 : (isTablet ? -80 : -130);
        const scaleDrop = isMobile ? 0.07 : (isTablet ? 0.16 : 0.22);

        // Card kanan: miring ke arah tengah (negatif rotY, positif rotZ)
        // Card kiri: miring berlawanan ke arah tengah (positif rotY, negatif rotZ)
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

      // Update angka counter (01..07)
      if (activeIdxEl) {
        const numStr = String(closestIdx + 1).padStart(2, "0");
        if (activeIdxEl.textContent !== numStr) {
          activeIdxEl.textContent = numStr;
        }
      }
    }

    // Inisialisasi GSAP ScrollTrigger
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);

      // Jarak scroll vertikal yang proporsional untuk scrubbing 7 kartu
      const scrollDistance = Math.max(window.innerHeight * 1.8, 1400);
      let hasCompleted = false;

      const st = ScrollTrigger.create({
        trigger: pinWrap,
        pin: true,
        start: "top top",
        end: () => `+=${scrollDistance}`,
        scrub: 1, // Smooth dampening untuk inersia alami
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (hasCompleted) return;
          layout = getLayout();
          const currentX = -self.progress * layout.totalDistance;
          gsap.set(track, { x: currentX });
          updateCardTransforms();

          if (progressBar) {
            progressBar.style.width = `${(self.progress * 100).toFixed(1)}%`;
          }
        },
        onLeave: (self) => {
          if (hasCompleted) return;
          hasCompleted = true;

          const pinDistance = self.end - self.start;
          const currentScroll = window.scrollY;

          // 1. Revert SEMUA style pinning GSAP dan hapus spacer secara bersih
          self.kill(true);

          // 2. Bersihkan seluruh sisa inline style pada pinWrap agar kembali 100% ke alur normal
          gsap.set(pinWrap, { clearProps: "all" });

          // 3. Kunci posisi galeri mentok di kartu terakhir (Card 07)
          layout = getLayout();
          gsap.set(track, { x: -layout.totalDistance });
          updateCardTransforms();

          if (progressBar) {
            progressBar.style.width = "100%";
          }

          // 4. Koreksi posisi scroll seketika agar tidak terjadi lonjakan tampilan
          window.scrollTo(0, Math.max(0, currentScroll - pinDistance));
          ScrollTrigger.refresh();
        }
      });

      // Klik langsung pada card mana saja untuk membawa kartu tersebut ke tengah
      cards.forEach((card, idx) => {
        card.addEventListener("click", () => {
          layout = getLayout();
          const targetX = -idx * layout.cardStep;
          gsap.to(track, {
            x: targetX,
            duration: 0.65,
            ease: "power2.out",
            onUpdate: updateCardTransforms
          });
          if (progressBar) {
            progressBar.style.width = `${((idx / (totalCards - 1)) * 100).toFixed(1)}%`;
          }
        });
      });

      // Handle Resize Window
      window.addEventListener("resize", () => {
        layout = getLayout();
        ScrollTrigger.refresh();
        updateCardTransforms();
      });

      // Render perdana
      layout = getLayout();
      updateCardTransforms();
    } else {
      // Fallback jika library belum termuat
      updateCardTransforms();
    }
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
    const isTouchOrMobile = window.matchMedia("(hover: none)").matches || window.innerWidth <= 991;

    // Di mobile / layar sentuh / prefers-reduced: langsung tampilkan teks 100% tajam tanpa blur
    if (prefersReduced || isTouchOrMobile) {
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
});

