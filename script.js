/**
 * ACFATREATMENT — INTERACTIVE SCRIPT
 * Landing Page Kemitraan Bisnis Treatment Sepatu, Helm, Koper, & Stroller
 */

document.addEventListener("DOMContentLoaded", () => {
  // =========================================================================
  // 1. KONFIGURASI KEMITRAAN & KONTAK
  // =========================================================================
  const CONFIG = {
    whatsappNumber: "6282230196689",
    whatsappDisplay: "+62 822-3019-6689",
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
        daftarSection.scrollIntoView({ behavior: "smooth" });
        setTimeout(() => {
          if (formName) formName.focus();
        }, 500);
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
  // 7. TAHUN COPYRIGHT
  // =========================================================================
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

