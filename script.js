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
  // 2. YOUTUBE VIDEO EMBED CONTROLLER
  // =========================================================================
  const videoTimeStatus = document.getElementById("videoTimeStatus");
  if (videoTimeStatus) {
    videoTimeStatus.textContent = "HD 1080P · RESMI";
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
});

