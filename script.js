/* =========================================================
   DEVA BRIGHT D — PORTFOLIO SCRIPT
   ========================================================= */
(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Header: solid background after scrolling ---------- */
  const header = document.getElementById("header");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- 2. Mobile menu ---------- */
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("nav");

  const setMenu = (open) => {
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
  };
  toggle.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  /* ---------- 3. Scroll reveal ---------- */
  const revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    // Small stagger for items that sit in the same grid
    document.querySelectorAll(".grid, .skill-grid, .soft-grid").forEach((group) => {
      group.querySelectorAll(".reveal").forEach((el, i) => {
        el.style.transitionDelay = `${(i % 3) * 90}ms`;
      });
    });

    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ---------- 4. Hero particles (soft embers / light dust) ---------- */
  const canvas = document.getElementById("particles");
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext("2d");
    const hero = document.getElementById("home");
    let w = 0, h = 0, particles = [], running = true, raf;

    const colors = ["208,18,45", "240,210,122", "255,255,255"];

    const make = (initial) => ({
      x: Math.random() * w,
      y: initial ? Math.random() * h : h + 10,
      r: Math.random() * 1.8 + 0.4,
      vy: Math.random() * 0.35 + 0.1,
      vx: (Math.random() - 0.5) * 0.15,
      a: Math.random() * 0.5 + 0.15,
      c: colors[Math.floor(Math.random() * colors.length)],
      t: Math.random() * Math.PI * 2,
    });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = hero.clientWidth;
      h = hero.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = w < 700 ? 30 : 64;
      particles = Array.from({ length: count }, () => make(true));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (const p of particles) {
        p.t += 0.01;
        p.y -= p.vy;
        p.x += p.vx + Math.sin(p.t) * 0.1;
        if (p.y < -10) Object.assign(p, make(false));

        const tw = p.a * (0.6 + 0.4 * Math.sin(p.t * 3));
        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.c},${tw})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (running) raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);

    // Pause when hero is off screen (saves battery)
    new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting;
      if (running) { cancelAnimationFrame(raf); draw(); }
    }).observe(hero);
  }


/* ---------- 5. Video modal ---------- */
const modal = document.getElementById("modal");
const stage = document.getElementById("modalStage");
const modalTitle = document.getElementById("modalTitle");
const closeBtn = document.getElementById("modalClose");

let lastFocus = null;

const youTubeId = (url) => {
  const match = url.match(
    /(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/
  );
  return match ? match[1] : null;
};

const openModal = (src, title) => {
  if (!src || !modal || !stage) return;

  lastFocus = document.activeElement;
  stage.replaceChildren();
  modalTitle.textContent = title || "Video";

  const ytId = youTubeId(src);

  // YouTube videos
  if (ytId) {
    const iframe = document.createElement("iframe");
    iframe.src =
      `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`;
    iframe.allow =
      "autoplay; encrypted-media; fullscreen; picture-in-picture";
    iframe.allowFullscreen = true;
    iframe.title = title || "YouTube video";
    stage.appendChild(iframe);
  }

  // Google Drive videos
  else if (src.includes("drive.google.com")) {
    const match = src.match(/\/file\/d\/([^/?]+)/);
    const fileId = match ? match[1] : null;

    if (!fileId) {
      stage.textContent = "Invalid Google Drive video link.";
    } else {
      const iframe = document.createElement("iframe");
      iframe.src =
        `https://drive.google.com/file/d/${fileId}/preview`;
      iframe.allow = "autoplay; fullscreen";
      iframe.allowFullscreen = true;
      iframe.title = title || "Google Drive video";
      stage.appendChild(iframe);
    }
  }

  // Local MP4 videos
  else {
    const video = document.createElement("video");
    video.src = src;
    video.controls = true;
    video.autoplay = true;
    video.playsInline = true;

    video.addEventListener("error", () => {
      stage.textContent =
        "Video could not load. Check the video file path.";
    });

    stage.appendChild(video);
  }

  if (!modal.open) {
    modal.showModal();
  }

  document.body.style.overflow = "hidden";
  closeBtn.focus();
};

const closeModal = () => {
  if (modal.open) {
    modal.close();
  }
};

modal.addEventListener("close", () => {
  // Removing the iframe stops Google Drive/YouTube playback.
  // Removing the video stops local MP4 playback.
  stage.replaceChildren();
  document.body.style.overflow = "";

  if (lastFocus && lastFocus.isConnected) {
    lastFocus.focus();
  }
});

closeBtn.addEventListener("click", closeModal);

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

// Open the correct video when a card is clicked.
document.querySelectorAll(".card").forEach((card) => {
  const watchButton = card.querySelector(".watch");
  const thumbnail = card.querySelector(".thumb");

  const open = () => {
    openModal(card.dataset.video, card.dataset.title);
  };

  if (watchButton) watchButton.addEventListener("click", open);
  if (thumbnail) thumbnail.addEventListener("click", open);
});












  /* ---------- 6. RAW → FINAL comparison slider ---------- */
  const compare = document.getElementById("compare");
  const range = document.getElementById("compareRange");
  if (compare && range) {
    const update = () => compare.style.setProperty("--pos", `${range.value}%`);
    range.addEventListener("input", update);
    update();

    // One gentle demo sweep when the section first appears
    if (!reduceMotion && "IntersectionObserver" in window) {
      const demo = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        demo.disconnect();
        let t = 0;
        const step = () => {
          t += 0.03;
          range.value = 50 + Math.sin(t) * 25 * Math.max(0, 1 - t / 6);
          update();
          if (t < 6) requestAnimationFrame(step);
          else { range.value = 50; update(); }
        };
        step();
      }, { threshold: 0.6 });
      demo.observe(compare);
    }
  }

  /* ---------- 7. Footer year ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();


