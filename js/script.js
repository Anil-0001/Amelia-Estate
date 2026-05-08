
const menuToggle = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector(".mobile-nav");
const revealSections = document.querySelectorAll(".snapshot-section, .about-section, .opportunity-section,.peace-section");
const heroSlides = document.querySelectorAll(".hero-slide");
const heroPanels = document.querySelectorAll(".hero-panel");
const structSliderSection = document.querySelector(".struct-slider-section");
const structSlides = structSliderSection?.querySelectorAll(".struct-slide") || [];
const structCopies = structSliderSection?.querySelectorAll(".struct-copy") || [];
const structIndexes = structSliderSection?.querySelectorAll(".struct-index") || [];
const structDots = structSliderSection?.querySelectorAll(".struct-dot") || [];

let activeHeroSlide = 0;
let activeStructSlide = 0;
let structTouchStartY = 0;
let structAnimating = false;
let structLocked = false;
let structReleasedDirection = 0;

if (heroSlides.length > 1) {
  setInterval(() => {
    heroSlides[activeHeroSlide].classList.remove("is-active");
    heroPanels[activeHeroSlide]?.classList.remove("is-active");
    activeHeroSlide = (activeHeroSlide + 1) % heroSlides.length;
    heroSlides[activeHeroSlide].classList.add("is-active");
    heroPanels[activeHeroSlide]?.classList.add("is-active");
  }, 8000);
}

const updateStructSlide = (nextIndex) => {
  if (!structSlides.length || structAnimating || nextIndex === activeStructSlide) {
    return;
  }

  structAnimating = true;
  structSlides[activeStructSlide]?.classList.remove("is-active");
  structCopies[activeStructSlide]?.classList.remove("is-active");
  structIndexes[activeStructSlide]?.classList.remove("is-active");
  structDots[activeStructSlide]?.classList.remove("is-active");

  activeStructSlide = nextIndex;
  structSlides[activeStructSlide]?.classList.add("is-active");
  structCopies[activeStructSlide]?.classList.add("is-active");
  structIndexes[activeStructSlide]?.classList.add("is-active");
  structDots[activeStructSlide]?.classList.add("is-active");

  window.setTimeout(() => {
    structAnimating = false;
  }, 700);
};

if (structSliderSection && structSlides.length > 1) {
  const canMoveStructSlide = (direction) =>
    (direction > 0 && activeStructSlide < structSlides.length - 1) ||
    (direction < 0 && activeStructSlide > 0);

  const isStructInFocus = () => {
    const rect = structSliderSection.getBoundingClientRect();
    return rect.top < window.innerHeight * 0.72 && rect.bottom > window.innerHeight * 0.28;
  };

  const setStructLock = (shouldLock) => {
    if (shouldLock === structLocked) {
      return;
    }

    structLocked = shouldLock;
    document.body.classList.toggle("struct-slider-locked", shouldLock);

    if (shouldLock) {
      structSliderSection.scrollIntoView({ block: "start" });
    }
  };

  const syncStructLock = () => {
    if (!isStructInFocus()) {
      structReleasedDirection = 0;
      setStructLock(false);
      return;
    }

    if (
      (structReleasedDirection === 1 && activeStructSlide === structSlides.length - 1) ||
      (structReleasedDirection === -1 && activeStructSlide === 0)
    ) {
      setStructLock(false);
      return;
    }

    setStructLock(true);
  };

  const handleStructDirection = (direction, event) => {
    if (!isStructInFocus()) {
      syncStructLock();
      return;
    }

    if (canMoveStructSlide(direction)) {
      event.preventDefault();
      structReleasedDirection = 0;
      setStructLock(true);
      updateStructSlide(activeStructSlide + direction);
      return;
    }

    structReleasedDirection = direction;
    setStructLock(false);
  };

  const handleStructWheel = (event) => {
    if (Math.abs(event.deltaY) <= 12) {
      return;
    }

    handleStructDirection(event.deltaY > 0 ? 1 : -1, event);
  };

  const handleStructTouchStart = (event) => {
    structTouchStartY = event.touches[0]?.clientY || 0;
  };

  const handleStructTouchMove = (event) => {
    if (!isStructInFocus()) {
      return;
    }

    const currentY = event.touches[0]?.clientY || 0;
    const deltaY = structTouchStartY - currentY;
    if (Math.abs(deltaY) > 16) {
      handleStructDirection(deltaY > 0 ? 1 : -1, event);
      structTouchStartY = currentY;
    }
  };

  const handleStructKeydown = (event) => {
    if (!isStructInFocus()) {
      return;
    }

    if (["ArrowDown", "PageDown", "Space"].includes(event.code)) {
      handleStructDirection(1, event);
    } else if (["ArrowUp", "PageUp"].includes(event.code)) {
      handleStructDirection(-1, event);
    }
  };

  window.addEventListener("scroll", syncStructLock, { passive: true });
  window.addEventListener("wheel", handleStructWheel, { passive: false });
  window.addEventListener("touchstart", handleStructTouchStart, { passive: true });
  window.addEventListener("touchmove", handleStructTouchMove, { passive: false });
  window.addEventListener("keydown", handleStructKeydown);
  syncStructLock();
}

if (menuToggle && mobileNav) {
  menuToggle.addEventListener("click", () => {
    mobileNav.classList.toggle("hidden");
    mobileNav.classList.toggle("is-open");
    const isOpen = mobileNav.classList.contains("is-open");

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    menuToggle.innerHTML = isOpen
      ? '<i class="fa-solid fa-xmark" aria-hidden="true"></i>'
      : '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
  });

  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileNav.classList.add("hidden");
      mobileNav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open menu");
      menuToggle.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
    });
  });
}

// Reveal animated sections whenever they enter the viewport.
if (revealSections.length) {
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          } else {
            entry.target.classList.remove("is-visible");
          }
        });
      },
      {
        threshold: 0.08
      }
    );
    
    revealSections.forEach((section) => revealObserver.observe(section));
  } else {
    revealSections.forEach((section) => section.classList.add("is-visible"));
  }
}
