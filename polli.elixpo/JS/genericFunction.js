function createToastNotification(msg) {
    let notifNode = `<div class="notification">
         <span>${msg}</span>
      </div>`;

    const notificationContainer = document.getElementById('notificationCenter');
    if (!notificationContainer) {
        console.error("Notification container not found.");
        return;
    }

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = notifNode.trim();
    const notifElement = tempDiv.firstChild;

    notificationContainer.appendChild(notifElement);
    if (typeof anime !== 'undefined') {
        anime({
            targets: notifElement,
            opacity: [0, 1],
            translateY: [-20, 0],
            duration: 500,
            easing: 'easeOutQuad'
        });

        setTimeout(() => {
            anime({
                targets: notifElement,
                opacity: [1, 0],
                translateY: [0, -20],
                duration: 500,
                easing: 'easeInQuad',
                complete: () => {
                    if (notificationContainer.contains(notifElement)) {
                        notificationContainer.removeChild(notifElement);
                    }
                }
            });
        }, 1200);
    } else {
        // Fallback for no animation
        setTimeout(() => {
            if (notificationContainer.contains(notifElement)) {
                notificationContainer.removeChild(notifElement);
            }
        }, 1700); // Wait for the display time
    }


    // Limit visible notifications
    if (notificationContainer.children.length > 3) {
        const excessNotif = notificationContainer.children[0];
        if (typeof anime !== 'undefined') {
             anime({
                targets: excessNotif,
                opacity: [1, 0],
                translateY: [0, -20],
                duration: 500,
                easing: 'easeInQuad',
                complete: () => {
                    if (notificationContainer.contains(excessNotif)) {
                        notificationContainer.removeChild(excessNotif);
                    }
                }
            });
        } else {
             // Fallback to instantly remove
            if (notificationContainer.contains(excessNotif)) {
                notificationContainer.removeChild(excessNotif);
            }
        }
    }
}


// SOCIAL LINKS (Added noopener,noreferrer for security)

document.getElementById("linkedinRedirect")?.addEventListener("click", function () {
    window.open("https://www.linkedin.com/company/pollinations-ai/posts/?feedView=all", "_blank", "noopener,noreferrer");
});

document.getElementById("githubRedirect")?.addEventListener("click", function () {
    window.open("https://github.com/pollinations/pollinations", "_blank", "noopener,noreferrer");
});

document.getElementById("discordRedirect")?.addEventListener("click", function () {
    window.open("https://discord.com/invite/k9F7SyTgqn", "_blank", "noopener,noreferrer");
});

document.getElementById("instagramRedirect")?.addEventListener("click", function () {
    window.open("https://www.instagram.com/pollinations.ai", "_blank", "noopener,noreferrer");
});

document.getElementById("tiktokRedirect")?.addEventListener("click", function () {
    window.open("https://tiktok.com/@pollinations.ai", "_blank", "noopener,noreferrer");
});

document.getElementById("youtubeRedirect")?.addEventListener("click", function () {
    window.open("https://www.youtube.com/channel/UCk4yKnLnYfyUmCCbDzOZOug", "_blank", "noopener,noreferrer");
});

document.getElementById("githubReadme")?.addEventListener("click", function () {
    window.open("https://github.com/pollinations/pollinations", "_blank", "noopener,noreferrer");
});

document.getElementById("discordInvite")?.addEventListener("click", function () {
    window.open("https://discord.com/invite/k9F7SyTgqn", "_blank", "noopener,noreferrer");
});

document.getElementById("tippingRedirects")?.addEventListener("click", function () {
    window.open("https://ko-fi.com/pollinationsai", "_blank", "noopener,noreferrer");
});

document.getElementById("projectSubmit")?.addEventListener("click", function () {
    window.open("https://github.com/pollinations/pollinations/issues/new?template=project-submission.yml", "_blank", "noopener,noreferrer");
});

document.getElementById("apiDocsVisit")?.addEventListener("click", function () {
    window.open("https://github.com/pollinations/pollinations/blob/master/APIDOCS.md", "_blank", "noopener,noreferrer");
});


let box_node = `<div class="box"></div>`;
const topBoxesDesigns = document.getElementById("topBoxesDesigns");
if (topBoxesDesigns) {
    for (let i = 0; i < 35; i++) {
        topBoxesDesigns.innerHTML += box_node;
    }
}


// Removed unused parameters 'owner' and 'repo'
async function updateGithubStarCount() {
    const owner = 'pollinations';
    const repo = 'pollinations';
    const starCountElem = document.getElementById('githubStarCount');
    if (!starCountElem) return;
  
    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
      if (!response.ok) throw new Error('Network response was not ok');
  
      const repoData = await response.json();
      const stars = repoData.stargazers_count ?? 0;
  
      starCountElem.textContent = stars.toLocaleString();
    } catch (error) {
      console.error('Failed to fetch GitHub stars:', error);
      starCountElem.textContent = 'N/A';
    }
}
  
  
  
  


  const container = document.querySelector('.container');
  // Changed to target all sections within the container for the snap logic
  const snapSections = document.querySelectorAll('.container > section'); 

  // Only proceed with snap-scrolling logic if a container and anime.js are present
  if (container && typeof anime !== 'undefined') {

      let isAutoScrolling = false;
      let scrollTimer = null;

      function getVisibleSectionIndex() {
          const containerTop = container.scrollTop;
          const viewHeight = window.innerHeight;

          let maxVisibleRatio = 0;
          let bestIndex = -1;

          snapSections.forEach((section, index) => {
              // Calculate section position relative to container's content
              const sectionTop = section.offsetTop;
              const sectionBottom = sectionTop + section.offsetHeight;

              // Calculate visible portion within the viewport (not just container)
              const visibleTop = Math.max(containerTop, sectionTop);
              const visibleBottom = Math.min(containerTop + viewHeight, sectionBottom);
              const visibleHeight = Math.max(0, visibleBottom - visibleTop);
              const ratio = visibleHeight / section.offsetHeight;

              if (ratio > maxVisibleRatio) {
                  maxVisibleRatio = ratio;
                  bestIndex = index;
              }
          });

          // Snap only if a section is highly visible (e.g., > 60% might be safer than 90%)
          return maxVisibleRatio >= 0.6 ? bestIndex : -1; 
      }

      container.addEventListener('scroll', () => {
          if (isAutoScrolling) return;
          clearTimeout(scrollTimer);

          scrollTimer = setTimeout(() => {
              const targetIndex = getVisibleSectionIndex();
              
              if (targetIndex !== -1) {
                  const targetScrollTop = snapSections[targetIndex].offsetTop;

                  // Check if already close to prevent unnecessary animation
                  if (Math.abs(container.scrollTop - targetScrollTop) < 5) {
                      return;
                  }

                  isAutoScrolling = true;
                  anime({
                      targets: container,
                      scrollTop: targetScrollTop,
                      duration: 700,
                      easing: 'easeOutCubic',
                      complete: () => {
                          isAutoScrolling = false;
                      }
                  });
              }
          }, 150); // wait a bit longer to ensure scroll fully stopped
      });
  }
  

  // General link smoother scroll functionality (unrelated to snap scroll)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        e.preventDefault();

        const scrollContainer = document.querySelector('.container');
        if (!scrollContainer) return;

        const targetPosition = targetElement.offsetTop;

        if (typeof anime !== 'undefined') {
            anime({
              targets: scrollContainer,
              scrollTop: targetPosition,
              duration: 700,
              easing: 'easeInOutQuad'
            });
        } else {
             // Fallback if anime.js is not loaded
             scrollContainer.scrollTop = targetPosition;
        }
      }
    });
  });
  
  // Initialize star count fetch
  updateGithubStarCount();