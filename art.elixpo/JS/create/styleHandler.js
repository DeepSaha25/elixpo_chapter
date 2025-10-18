let selectedTheme = "Normal";
let selectedAspectRatio = "16:9"; // Defaulting to your HTML 'selected' class
let selectedModel = "flux"; // Defaulting to your HTML 'selected' class

document.addEventListener('DOMContentLoaded', () => {
    const themeItems = document.querySelectorAll('.imageThemeContainer .themes');
    const aspectItems = document.querySelectorAll('.aspectRatioTiles');
    const modelItems = document.querySelectorAll('.modelsTiles');

    // Initialize selections from HTML classes
    const initialSelectedTheme = document.querySelector('.imageThemeContainer .themes.selected');
    if (initialSelectedTheme) {
        selectedTheme = initialSelectedTheme.dataset.theme;
    }

    const initialSelectedAspect = document.querySelector('.aspectRatioTiles.selected');
    if (initialSelectedAspect) {
        selectedAspectRatio = initialSelectedAspect.dataset.ratio;
    }

    const initialSelectedModel = document.querySelector('.modelsTiles.selected');
    if (initialSelectedModel) {
        selectedModel = initialSelectedModel.dataset.model;
    }


    themeItems.forEach(item => {
        item.addEventListener('click', () => {
            themeItems.forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            selectedTheme = item.dataset.theme;
        });
    });

    aspectItems.forEach(item => {
        item.addEventListener('click', () => {
            aspectItems.forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            selectedAspectRatio = item.dataset.ratio;
        });
    });

    modelItems.forEach(item => {
        item.addEventListener('click', () => {
            const model = item.dataset.model;

            // Check if in imageMode and if the selected model is unsupported
            // 'window.imageMode' should be set in imageProcessPrompt.js
            if (window.imageMode && (model === 'flux' || model === 'turbo')) {
                showUnsupportedModelToast();
                return; // Prevent switching to the unsupported model
            }

            modelItems.forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            selectedModel = model;
        });
    });
});


/**
 * Shows a toast notification when an unsupported model is selected in image-to-image mode.
 */
function showUnsupportedModelToast() {
    const toast = document.getElementById('unsupported-model-toast');
    if (!toast) {
        console.error("Toast element not found!");
        return;
    }

    toast.textContent = "This model does not support image-to-image edits.";
    toast.classList.add('show');

    // Hide the toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}