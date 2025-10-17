document.addEventListener("DOMContentLoaded", () => {
    const loader = document.getElementById("welcomeLoader");
    const icon = document.getElementById("loaderIcon");
    const segments = document.querySelectorAll(".bar-segment");
    const text = document.querySelector(".loader-text");
    const firstSection = document.querySelector("section");
  
    const iconNames = [
      "flash-outline",
      "rocket-outline",
      "planet-outline",
      "aperture-outline",
      "pulse-outline",
      "code-slash-outline",
    ];
  
    // Lucid icon transition function
    function animateIconTransition(newName) {
      // Animate out current icon: slide up + fade out + scale down
      return gsap.timeline()
        .to(icon, {
          duration: 0.35,
          y: -20,
          opacity: 0,
          scale: 0.8,
          ease: "power1.in",
        })
        .add(() => {
          if (icon) icon.setAttribute("name", newName);
        })
        // Animate in new icon: slide down + fade in + scale up
        .to(icon, {
          duration: 0.4,
          y: 0,
          opacity: 1,
          scale: 1.1,
          ease: "power2.out",
        });
    }
  
    // Animate text subtle scale pulse
    function animateTextPulse() {
      if (typeof anime === 'undefined' || !text) return;
      anime({
        targets: text,
        scale: [1, 1.1, 1],
        duration: 700,
        easing: 'easeInOutQuad',
      });
    }
  
    // Cycle icons with lucid transitions every 700ms
    let iconIndex = 0;
    let iconTimeline = animateIconTransition(iconNames[iconIndex]);
  
    const iconInterval = setInterval(() => {
      iconIndex = (iconIndex + 1) % iconNames.length;
      iconTimeline = animateIconTransition(iconNames[iconIndex]);
      animateTextPulse();
    }, 700);
  
    // Animate progress bar with Anime.js stagger
    if (typeof anime !== 'undefined') {
        anime({
          targets: segments,
          scaleX: [0, 1],
          opacity: [0, 1],
          easing: "easeOutExpo",
          delay: anime.stagger(150, { start: 500 }),
        });
    }
  
    // When page fully loaded
    window.onload = () => {
      setTimeout(() => {
        clearInterval(iconInterval);
  
        // Animate loader fade out
        if (loader) {
            gsap.to(loader, {
              duration: 1,
              opacity: 0,
              pointerEvents: "none",
              ease: "power2.out",
              onComplete: () => {
                loader.style.display = "none";
      
                // Animate first section fade-up
                if (firstSection) {
                  gsap.fromTo(
                    firstSection,
                    { y: 50, opacity: 0 },
                    {
                      y: 0,
                      opacity: 1,
                      duration: 1.2,
                      ease: "power3.out",
                      onComplete: () => {
                        // FIX: Unlock scrolling by setting overflow to 'auto'
                        document.body.style.overflow = "auto"; 
                        const container = document.getElementById("container");
                        if (container) container.style.overflow = "auto"; 
                      },
                    }
                  );
                } else {
                  // fallback unlock scroll if no section
                  document.body.style.overflow = "auto";
                  const container = document.getElementById("container");
                  if (container) container.style.overflow = "auto"; 
                }
              },
            });
        }
      },  400);
    };
    
    // Initial scroll lock (set on DOMContentLoaded)
    document.body.style.overflow = "hidden";
    const container = document.getElementById("container");
    if (container) container.style.overflow = "hidden"; 
  });