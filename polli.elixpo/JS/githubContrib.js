// WARNING: The original file contained a hardcoded GitHub Personal Access Token.
// This is a severe security vulnerability and has been removed.
// The fetching logic is updated to use an unauthenticated request for public data.
// GitHub's API allows unauthenticated access for public repo data, subject to rate limits.

// Removed GITHUB_TOKEN constant

async function getTopContributors(owner, repo, topN = 10) {
    // Note: The GitHub API allows unauthenticated access for public data, but is subject to strict rate limits.
    const url = `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=${topN}`;

    try {
      const response = await fetch(url, {
        // Removed 'Authorization' header to use unauthenticated public access.
        headers: {
          'Accept': 'application/vnd.github+json'
        }
      });

      if (!response.ok) {
        // Fallback to simpler anonymous fetch if status is related to auth/rate limit
        console.warn(`GitHub API unauthenticated fetch failed: ${response.status}. Falling back to default data or returning empty.`);
        // Note: Returning empty if fetch fails
        return [];
      }

      const contributors = await response.json();

      return contributors.slice(0, topN).map(c => ({
        username: c.login,
        avatar: c.avatar_url,
        profile: c.html_url,
        contributions: c.contributions
      }));
    } catch (err) {
      console.error('Failed to fetch contributors:', err);
      return [];
    }
}

// Display avatars
(async () => {
    // Pollinations repo
    const contributors = await getTopContributors('pollinations', 'pollinations', 5);
    const displayContainer = document.getElementById('profile-stack');
    if (!displayContainer) return;

    contributors.forEach(contributor => {
        // Added alt and loading="lazy" for accessibility and performance
        let contribImage = `<img src="${contributor.avatar}" 
                              alt="GitHub contributor avatar for ${contributor.username}" 
                              title="${contributor.username}" 
                              id="contributor-${contributor.username}" 
                              data-url="${contributor.profile}" 
                              onclick="showProfile(this)"
                              loading="lazy" />`;
        displayContainer.innerHTML += contribImage;
    });
})();


// Add click event to open profile in new tab
// Made this function globally accessible via window object as it's used in inline onclick
window.showProfile = function(self) {
    const url = self.getAttribute('data-url');
    if (url) {
        // Added noopener,noreferrer for security
        window.open(url, '_blank', 'noopener,noreferrer');
    } else {
        console.error('Profile URL not found');
    }
}