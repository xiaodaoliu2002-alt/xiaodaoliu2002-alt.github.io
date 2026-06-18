const previewImage = document.querySelector(".hero-preview img");
const projectLinks = Array.from(document.querySelectorAll(".project-link"));
const projects = Array.from(document.querySelectorAll("[data-project]"));
const dockTitle = document.querySelector("[data-dock-title]");
const prevDock = document.querySelector("[data-dock='prev']");
const nextDock = document.querySelector("[data-dock='next']");
const pdfStrips = Array.from(document.querySelectorAll(".pdf-strip"));
const homeHero = document.querySelector(".home-hero");
const homeSlides = Array.from(document.querySelectorAll("[data-home-slide]"));
const homeBackdrop = document.querySelector("[data-home-backdrop]");
const pdfStageStates = new WeakMap();

let currentProjectIndex = 0;
let activePdfStage = null;
let homeSlideIndex = 0;

function updateHomeChrome() {
  if (!homeHero) return;

  const threshold = homeHero.offsetHeight - window.innerHeight * 0.28;
  document.body.classList.toggle("is-home", window.scrollY <= threshold);
}

window.addEventListener("scroll", updateHomeChrome, { passive: true });
window.addEventListener("resize", updateHomeChrome);
updateHomeChrome();

function updateHomeCarousel(index = homeSlideIndex) {
  if (!homeSlides.length) return;

  homeSlideIndex = (index + homeSlides.length) % homeSlides.length;
  const beforeIndex = (homeSlideIndex - 1 + homeSlides.length) % homeSlides.length;
  const afterIndex = (homeSlideIndex + 1) % homeSlides.length;

  homeSlides.forEach((slide, slideIndex) => {
    const isActive = slideIndex === homeSlideIndex;

    slide.classList.toggle("is-active", isActive);
    slide.classList.toggle("is-before", slideIndex === beforeIndex);
    slide.classList.toggle("is-after", slideIndex === afterIndex);
    slide.setAttribute("aria-current", isActive ? "true" : "false");
  });

  const nextBackdrop = homeSlides[homeSlideIndex]?.dataset.bg;
  if (!homeBackdrop || !nextBackdrop || homeBackdrop.getAttribute("src") === nextBackdrop) return;

  homeBackdrop.style.opacity = "0";
  window.setTimeout(() => {
    homeBackdrop.src = nextBackdrop;
    homeBackdrop.style.opacity = "";
  }, 180);
}

if (homeSlides.length) {
  updateHomeCarousel(0);
  window.setInterval(() => updateHomeCarousel(homeSlideIndex + 1), 4200);
}

projectLinks.forEach((link, index) => {
  link.addEventListener("mouseenter", () => setPreview(link, index));
  link.addEventListener("focus", () => setPreview(link, index));
});

function setPreview(link, index) {
  const src = link.dataset.preview;
  if (!previewImage || !src || previewImage.getAttribute("src") === src) return;

  projectLinks.forEach((item) => item.classList.toggle("is-active", item === link));
  currentProjectIndex = index;

  previewImage.style.opacity = "0";
  window.setTimeout(() => {
    previewImage.src = src;
    previewImage.alt = `${link.querySelector(".project-link__title")?.textContent || "项目"} 预览`;
    previewImage.style.transform = "scale(1.025)";
    previewImage.style.opacity = "1";
    window.setTimeout(() => {
      previewImage.style.transform = "scale(1)";
    }, 260);
  }, 120);
}

const projectObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    const index = projects.indexOf(visible.target);
    if (index < 0) return;

    currentProjectIndex = index;
    updateProjectNavigation(index);
  },
  { threshold: [0.35, 0.5, 0.75] },
);

projects.forEach((project) => projectObserver.observe(project));

prevDock?.addEventListener("click", () => scrollProject(currentProjectIndex - 1));
nextDock?.addEventListener("click", () => scrollProject(currentProjectIndex + 1));

window.addEventListener("keydown", (event) => {
  const activeState = activePdfStage ? pdfStageStates.get(activePdfStage) : null;
  if (activeState && (event.key === "ArrowLeft" || event.key === "ArrowRight" || event.key === "Escape")) {
    event.preventDefault();
    if (event.key === "ArrowLeft") activeState.showPage(activeState.index - 1);
    if (event.key === "ArrowRight") activeState.showPage(activeState.index + 1);
    if (event.key === "Escape") activeState.showVideo();
    return;
  }

  if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
    event.preventDefault();
    scrollProject(currentProjectIndex - 1);
  }
  if (event.key === "ArrowDown" || event.key === "ArrowRight") {
    event.preventDefault();
    scrollProject(currentProjectIndex + 1);
  }
});

function scrollProject(index) {
  const clamped = Math.max(0, Math.min(projects.length - 1, index));
  projects[clamped]?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function updateProjectNavigation(index) {
  const project = projects[index];
  const link = projectLinks[index];
  if (!project || !link || !dockTitle || !prevDock || !nextDock) return;

  projectLinks.forEach((item, linkIndex) => item.classList.toggle("is-active", linkIndex === index));
  dockTitle.textContent = project.dataset.title || link.querySelector(".project-link__title")?.textContent || "Work";
  dockTitle.href = `#${project.id}`;
  prevDock.disabled = index === 0;
  nextDock.disabled = index === projects.length - 1;
}

pdfStrips.forEach((strip) => {
  const pages = strip.querySelector("[data-pdf-pages]");
  const prevStrip = strip.querySelector("[data-strip-prev]");
  const nextStrip = strip.querySelector("[data-strip-next]");
  const images = Array.from(pages?.querySelectorAll("img") || []);
  const project = strip.closest("[data-project]");
  const stage = project?.querySelector("[data-project-stage]");
  const video = stage?.querySelector("[data-stage-video]");
  const stageImage = stage?.querySelector("[data-stage-pdf]");
  const prevStage = stage?.querySelector("[data-stage-prev]");
  const nextStage = stage?.querySelector("[data-stage-next]");
  const videoToggle = stage?.querySelector("[data-stage-video-toggle]");
  const defaultStageSrc = stageImage?.getAttribute("src") || "";
  const defaultStageAlt = stageImage?.getAttribute("alt") || "";

  if (!pages || !images.length || !stage || !stageImage) return;

  const state = {
    index: 0,
    showPage,
    showVideo,
  };
  pdfStageStates.set(stage, state);

  const updateStripButtons = () => {
    const maxScroll = pages.scrollWidth - pages.clientWidth - 2;
    if (prevStrip) prevStrip.disabled = pages.scrollLeft <= 2;
    if (nextStrip) nextStrip.disabled = pages.scrollLeft >= maxScroll;
  };

  prevStrip?.addEventListener("click", () => {
    pages.scrollBy({ left: -pages.clientWidth * 0.86, behavior: "smooth" });
  });

  nextStrip?.addEventListener("click", () => {
    pages.scrollBy({ left: pages.clientWidth * 0.86, behavior: "smooth" });
  });

  pages.addEventListener("scroll", updateStripButtons, { passive: true });
  window.addEventListener("resize", updateStripButtons);
  requestAnimationFrame(updateStripButtons);

  images.forEach((image, index) => {
    image.tabIndex = 0;
    image.addEventListener("click", () => showPage(index));
    image.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      showPage(index);
    });
  });

  prevStage?.addEventListener("click", () => showPage(state.index - 1));
  nextStage?.addEventListener("click", () => showPage(state.index + 1));
  videoToggle?.addEventListener("click", showVideo);

  function showPage(index) {
    if (activePdfStage && activePdfStage !== stage) {
      pdfStageStates.get(activePdfStage)?.showVideo();
    }

    const nextIndex = (index + images.length) % images.length;
    const selected = images[nextIndex];

    state.index = nextIndex;
    activePdfStage = stage;
    video?.pause();
    if (video) video.hidden = true;

    stageImage.src = selected.currentSrc || selected.src;
    stageImage.alt = selected.alt;
    stageImage.hidden = false;

    [prevStage, nextStage, videoToggle].forEach((control) => {
      if (control) control.hidden = false;
    });

    images.forEach((image, imageIndex) => {
      image.classList.toggle("is-active", imageIndex === nextIndex);
    });
    selected.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }

  function showVideo() {
    if (video) {
      video.hidden = false;
      stageImage.hidden = true;
      stageImage.removeAttribute("src");
      stageImage.alt = "";
    } else if (defaultStageSrc) {
      stageImage.src = defaultStageSrc;
      stageImage.alt = defaultStageAlt;
      stageImage.hidden = false;
    } else {
      stageImage.hidden = true;
      stageImage.removeAttribute("src");
      stageImage.alt = "";
    }
    [prevStage, nextStage, videoToggle].forEach((control) => {
      if (control) control.hidden = true;
    });
    images.forEach((image) => image.classList.remove("is-active"));
    if (activePdfStage === stage) activePdfStage = null;
  }
});

updateProjectNavigation(0);
