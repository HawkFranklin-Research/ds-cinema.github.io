(() => {
  "use strict";

  const reel = document.querySelector(".deck-reel");
  const scenes = [...document.querySelectorAll(".deck-scene")];
  const progress = [...document.querySelectorAll(".deck-progress button")];
  const topbar = document.querySelector(".deck-topbar");
  const counter = document.querySelector(".deck-counter");
  const brand = document.querySelector(".deck-brand");
  const scrollCue = document.querySelector(".deck-scroll-cue");
  const shareButton = document.querySelector(".deck-actions button");
  const toast = document.querySelector(".deck-toast");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeIndex = 0;

  const clampIndex = (index) => Math.max(0, Math.min(index, scenes.length - 1));

  const goTo = (index) => {
    scenes[clampIndex(index)].scrollIntoView({
      behavior: reducedMotion.matches ? "auto" : "smooth",
      block: "start",
    });
  };

  const setActive = (index) => {
    activeIndex = clampIndex(index);

    scenes.forEach((scene, sceneIndex) => {
      scene.classList.toggle("is-active", sceneIndex === activeIndex);
    });

    progress.forEach((button, buttonIndex) => {
      button.classList.toggle("active", buttonIndex === activeIndex);
      button.classList.toggle("seen", buttonIndex < activeIndex);
      if (buttonIndex === activeIndex) button.setAttribute("aria-current", "step");
      else button.removeAttribute("aria-current");
    });

    topbar.className = `deck-topbar deck-tone-${activeIndex}`;
    counter.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(scenes.length).padStart(2, "0")}`;
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible) setActive(scenes.indexOf(visible.target));
    },
    { root: reel, threshold: [0.45, 0.62, 0.8] },
  );

  scenes.forEach((scene) => observer.observe(scene));
  progress.forEach((button, index) => button.addEventListener("click", () => goTo(index)));
  brand.addEventListener("click", () => goTo(0));
  scrollCue.addEventListener("click", () => goTo(1));

  document.addEventListener("keydown", (event) => {
    if (["ArrowDown", "PageDown", " "].includes(event.key)) {
      event.preventDefault();
      goTo(activeIndex + 1);
    }
    if (["ArrowUp", "PageUp"].includes(event.key)) {
      event.preventDefault();
      goTo(activeIndex - 1);
    }
    if (event.key === "Home") {
      event.preventDefault();
      goTo(0);
    }
    if (event.key === "End") {
      event.preventDefault();
      goTo(scenes.length - 1);
    }
  });

  shareButton.addEventListener("click", async () => {
    const data = {
      title: "DS Cinema — The autonomous camera operator",
      text: "Privacy-first AI cinematography for solo creators.",
      url: window.location.href,
    };

    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(data.url);
        toast.classList.add("show");
        window.setTimeout(() => toast.classList.remove("show"), 1800);
      }
    } catch (error) {
      if (error && error.name === "AbortError") return;
      window.location.href = `mailto:?subject=${encodeURIComponent(data.title)}&body=${encodeURIComponent(data.url)}`;
    }
  });

  const linkedHeading = window.location.hash
    ? document.querySelector(window.location.hash)
    : null;
  const linkedScene = linkedHeading?.closest(".deck-scene");
  if (linkedScene) setActive(scenes.indexOf(linkedScene));
  else setActive(0);
})();
