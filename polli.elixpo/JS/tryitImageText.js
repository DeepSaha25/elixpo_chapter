// NOTE: This file now contains the full feed logic and replaces polli.elixpo/JS/realtimeFeed.js.

let enhanceImage = false;
let privateImage = false;
let logoImage = true;
let modelIndexImage = 0;
let modelsImage = ["Flux", "Turbo", "gptImage"];
let modelsText = [
    "openai",
    "openai-fast",
    "openai-large",
    "openai-roblox",
    "qwen-coder",
    "llama",
    "llamascout",
    "mistral",
    "unity",
    "mirexa",
    "midijourney",
    "rtist",
    "searchgpt",
    "evil",
    "deepseek-reasoning",
    "phi",
    "hormoz",
    "hypnosis-tracy",
    "deepseek",
    "grok",
    "sur",
    "bidara",
    "openai-audio"
];
let modelIndexText = 0;
let currentMode = "watchMode"; // Start in watch mode by default

// EventSource variables
let eventSourceImage = null;
let eventSourceText = null;
let isDisplayingImage = false; // Flag to prevent overlapping image feed updates
let isDisplayingText = false;   // Flag to prevent overlapping text feed updates
let typingSpeed = 50; // Speed for text typing animation

// Helper function for notifications, assuming it is defined in genericFunction.js
function showToast(message) {
    if (typeof createToastNotification === 'function') {
        createToastNotification(message);
    } else {
        console.warn("Toast function missing:", message);
    }
}

document.getElementById("tryItBtn")?.addEventListener("click", function(e) {
    // Toggle the overall mode state
    if (currentMode === "watchMode") {
        currentMode = "tryMode";
        if (document.getElementById("tryItBtnText")) document.getElementById("tryItBtnText").innerText = "Watch Feed?";
        if (document.getElementById("imageFeedSectionDescriptionLeft")) document.getElementById("imageFeedSectionDescriptionLeft").innerText = "Try generating images";
        if (document.getElementById("imageFeedSectionDescriptionRight")) document.getElementById("imageFeedSectionDescriptionRight").innerText = "texts using pollinations";
    } else {
        currentMode = "watchMode";
        if (document.getElementById("tryItBtnText")) document.getElementById("tryItBtnText").innerText = "Try Now?";
        if (document.getElementById("imageFeedSectionDescriptionLeft")) document.getElementById("imageFeedSectionDescriptionLeft").innerText = "This is the realtime image";
        if (document.getElementById("imageFeedSectionDescriptionRight")) document.getElementById("imageFeedSectionDescriptionRight").innerText = "text feed of pollinations  ";
    }
    // Update the UI and feed state based on the new mode and current checkbox state
    updateUIMode();
});

document.getElementById("imageOrTextCheckBox")?.addEventListener("change", function() {
    // Update the UI and feed state based on the current mode and the new checkbox state
    updateUIMode();
});

document.addEventListener("DOMContentLoaded", function() {
    // Initial UI and feed setup based on default mode and checkbox state
    updateUIMode();
});

// This function handles the core display elements (output areas)
// and the generationInfo textMode class. It does NOT control prompt inputs.
function toggleOutputDisplay() {
    const isTextMode = document.getElementById("imageOrTextCheckBox")?.checked;
    
    if (isTextMode) {
        // Text output mode
        document.getElementById("displayImage")?.classList.add("hidden"); 
        document.getElementById("aiRespondServer")?.classList.remove("hidden"); 
        document.getElementById("userPromptServer")?.classList.remove("hidden"); 
        document.getElementById("generationInfo")?.classList.add("textMode"); 
        document.getElementById("imagePrompt")?.classList.add("hidden");
    } else {
        // Image output mode
        document.getElementById("displayImage")?.classList.remove("hidden"); // Show image output area
        document.getElementById("aiRespondServer")?.classList.add("hidden"); // Hide text response area
        document.getElementById("userPromptServer")?.classList.add("hidden"); // Hide text user prompt echo area
        document.getElementById("generationInfo")?.classList.remove("textMode"); // Remove text mode styling
        document.getElementById("imagePrompt")?.classList.remove("hidden");
    }
}

// Central function to update ALL UI and manage feed connections
function updateUIMode() {
    const isTextMode = document.getElementById("imageOrTextCheckBox")?.checked;
    const imagePromptEl = document.getElementById("imagePrompt");
    const ImagePromptSection = document.getElementById("ImagePromptSection"); 
    const textPromptSectionEl = document.getElementById("textPromptSection");
    const tryitElements = document.querySelectorAll(".tryit-target");

    // 1. Reset 'tryitMode' class on all affected elements
    tryitElements.forEach(el => el.classList.remove("tryitMode"));

    // 2. Reset buttons and generation listeners
    resetButtonsAndListeners();

    // 3. Manage EventSource Feed Connections
    if (currentMode === "watchMode") {
        // In watch mode, connect to the appropriate feed and close the other
        if (isTextMode) {
            connectToServer("text");
        } else {
            connectToServer("image");
        }
    } else { // tryMode
        // In try mode, close both feed connections to save resources
        if (eventSourceImage) {
            eventSourceImage.close();
            eventSourceImage = null;
        }
        if (eventSourceText) {
            eventSourceText.close();
            eventSourceText = null;
        }
        // Reset displaying flags when closing feeds
        isDisplayingImage = false;
        isDisplayingText = false;
        // Clear feed content when entering try mode
        if (document.getElementById("displayImage")) document.getElementById("displayImage").style.backgroundImage = '';
        if (document.getElementById("imagePrompt")) document.getElementById("imagePrompt").innerHTML = '';
        if (document.getElementById("aiRespondServer")) document.getElementById("aiRespondServer").innerHTML = '';
        if (document.getElementById("userPromptServer")) document.getElementById("userPromptServer").innerHTML = '';

    }


    // 4. Handle prompt section visibility, button setup, and applying 'tryitMode'
    if (currentMode === "tryMode") {
        // Apply 'tryitMode' to the general elements that are part of the try mode UI
        tryitElements.forEach(el => el.classList.add("tryitMode"));

        if (isTextMode) {
            // Try Mode: Text Generation UI
            if (imagePromptEl) imagePromptEl.style.display = "none";
            if (imagePromptEl) imagePromptEl.classList.remove("tryitMode");
            if (ImagePromptSection) ImagePromptSection.classList.remove("tryitMode");

            if (textPromptSectionEl) textPromptSectionEl.style.display = "block"; // Or 'flex', 'grid'
            if (textPromptSectionEl) textPromptSectionEl.classList.add("tryitMode");

            settleButtonsText(true); 
            // Add text generation listener
            document.getElementById("generateText")?.addEventListener("click", handleTextGeneration);
        } else {
            // Try Mode: Image Generation UI
            if (imagePromptEl) imagePromptEl.style.display = "block"; // Or 'flex', 'grid'
            if (imagePromptEl) imagePromptEl.classList.add("tryitMode");
            if (ImagePromptSection) ImagePromptSection.classList.add("tryitMode");

            if (textPromptSectionEl) textPromptSectionEl.style.display = "none";
            if (textPromptSectionEl) textPromptSectionEl.classList.remove("tryitMode"); 

            settleButtonsImage(true); 
            // Add image generation listener
            document.getElementById("generateImage")?.addEventListener("click", handleImageGeneration);
        }
    } else { // watchMode
        // Watch Mode: Prompt input sections are hidden
        if (imagePromptEl) imagePromptEl.style.display = "block"; 
        if (imagePromptEl) imagePromptEl.classList.remove("tryitMode");
        if (ImagePromptSection) ImagePromptSection.classList.remove("tryitMode");

        if (textPromptSectionEl) textPromptSectionEl.style.display = "none"; 
        if (textPromptSectionEl) textPromptSectionEl.classList.remove("tryitMode");
    }

    // 5. Handle the core display elements (image/text output area)
    toggleOutputDisplay();
}

// Helper function to remove all generation and button listeners
function resetButtonsAndListeners() {
    document.getElementById("generateImage")?.removeEventListener("click", handleImageGeneration);
    document.getElementById("generateText")?.removeEventListener("click", handleTextGeneration);
    // Remove specific button listeners managed by settleButtons
    document.getElementById("modelImage")?.removeEventListener("click", handleModelImageClick);
    document.getElementById("modelText")?.removeEventListener("click", handleModelTextClick);
    document.getElementById("enhanceButton")?.removeEventListener("click", handleEnhanceClick);
    document.getElementById("privateButton")?.removeEventListener("click", handlePrivateClick);
    document.getElementById("logoButton")?.removeEventListener("click", handleLogoClick);

    // Reset internal state for clarity (visual reset depends on CSS)
    enhanceImage = false;
    privateImage = false;
    logoImage = true; // Assuming default is logo ON

    // Reset visual states of buttons that might be active in try mode
    document.getElementById("enhanceButton")?.classList.remove("enhance");
    document.getElementById("privateButton")?.classList.remove("private");
    document.getElementById("logoButton")?.classList.add("logo"); // Re-apply default logo state
}


// Handlers for button clicks (moved to separate functions for clarity)
function handleModelTextClick() {
    modelIndexText = (modelIndexText + 1) % modelsText.length;
    if (document.getElementById("modelText")) {
        document.getElementById("modelText").innerHTML = `<ion-icon name="shuffle"></ion-icon> ${modelsText[modelIndexText]}` ;
    }
}

function handleModelImageClick() {
    modelIndexImage = (modelIndexImage + 1) % modelsImage.length;
    if (document.getElementById("modelImage")) {
        document.getElementById("modelImage").innerHTML = `<ion-icon name="shuffle"></ion-icon> ${modelsImage[modelIndexImage]}` ;
    }
}

function handleEnhanceClick() {
    enhanceImage = !enhanceImage;
    if (enhanceImage) {
        showToast("AI enhancement active");
        document.getElementById("enhanceButton")?.classList.add("enhance");
    } else {
        document.getElementById("enhanceButton")?.classList.remove("enhance");
    }
}

function handlePrivateClick() {
    privateImage = !privateImage;
    if (privateImage) {
        document.getElementById("privateButton")?.classList.add("private");
        showToast("Woossh!! Generates images will not show up in the feed anymore");
    } else {
        document.getElementById("privateButton")?.classList.remove("private");
    }
}

function handleLogoClick() {
    logoImage = !logoImage;
    if (logoImage) {
        document.getElementById("logoButton")?.classList.add("logo");
    } else {
        showToast("Watermark will no longer appear on your images");
        document.getElementById("logoButton")?.classList.remove("logo");
    }
}


// Functions to add/remove specific button listeners
function settleButtonsText(set) {
    const modelTextEl = document.getElementById("modelText");
    if (!modelTextEl) return;

    // Ensure previous listener is removed before potentially adding a new one
    modelTextEl.removeEventListener("click", handleModelTextClick);

    if (set) {
        modelTextEl.innerHTML = `<ion-icon name="shuffle"></ion-icon> ${modelsText[modelIndexText]}`;
        modelTextEl.addEventListener("click", handleModelTextClick);
    }
}

function settleButtonsImage(set) {
     const modelImageEl = document.getElementById("modelImage");
    const enhanceButtonEl = document.getElementById("enhanceButton");
    const privateButtonEl = document.getElementById("privateButton");
    const logoButtonEl = document.getElementById("logoButton");

     // Ensure previous listeners are removed before potentially adding new ones
    modelImageEl?.removeEventListener("click", handleModelImageClick);
    enhanceButtonEl?.removeEventListener("click", handleEnhanceClick);
    privateButtonEl?.removeEventListener("click", handlePrivateClick);
    logoButtonEl?.removeEventListener("click", handleLogoClick);

    if (set) {
        if (modelImageEl) {
            modelImageEl.innerHTML = `<ion-icon name="shuffle"></ion-icon> ${modelsImage[modelIndexImage]}`;
            modelImageEl.addEventListener("click", handleModelImageClick);
        }
        enhanceButtonEl?.addEventListener("click", handleEnhanceClick);
        privateButtonEl?.addEventListener("click", handlePrivateClick);
        logoButtonEl?.addEventListener("click", handleLogoClick);

        // Set initial state of buttons visually when activated
        if (enhanceImage) enhanceButtonEl?.classList.add("enhance");
        else enhanceButtonEl?.classList.remove("enhance");

        if (privateImage) privateButtonEl?.classList.add("private");
        else privateButtonEl?.classList.remove("private");

        if (logoImage) logoButtonEl?.classList.add("logo");
        else logoButtonEl?.classList.remove("logo");

    }
}


// --- Generation Functions ---

async function generateImage(prompt, height, width, seed, modelIndexImage, enhanceImage, privateImage, logoImage) {
    const displayElement = document.getElementById("displayImage");
    const generateButton = document.getElementById("generateImage");
    const animationElement = document.getElementById("imageGenerationAnimation");
    
    if (!displayElement || !generateButton || !animationElement) {
        return; 
    }

    generateButton.classList.add("generating");
     // Add the 'generating' class to the animation element here
     animationElement.classList.add("generating");
    showToast("Generating image...");

    const model = modelsImage[modelIndexImage] || "Flux"; // Use default "Flux" if index is bad
    
    // REMOVED hardcoded 'token' parameter
    const params = {
        width,
        height,
        seed,
        model,
        enhance: enhanceImage ? "true" : "false",
        private: privateImage ? "true" : "false",
        nologo: logoImage ? "true" : "false", // Parameter name is usually 'nologo'
        referrer: "elixpoart",
        // Removed hardcoded token
    };

    const queryParams = new URLSearchParams(params);
    const encodedPrompt = encodeURIComponent(prompt);
    // Use the standard image endpoint
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?${queryParams.toString()}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text();
             // Attempt to parse JSON error if applicable
            try {
                const errorJson = JSON.parse(errorText);
                throw new Error(`API Error: ${errorJson.message || errorText}`);
            } catch (e) {
                 throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
        }
        const imageBlob = await response.blob();
        const imageUrl = URL.createObjectURL(imageBlob);
        return imageUrl; // Return the URL
    } catch (error) {
        showToast(`Error generating image: ${error.message}`); // Show specific error
        throw error; // Re-throw to be caught by the click handler's .catch
    } finally {
        // Ensure generating state is removed even on error or success
        generateButton.classList.remove("generating");
        // Remove the 'generating' class from the animation element here
        animationElement.classList.remove("generating");
    }
}

// Handler for the image generation button click
async function handleImageGeneration() {
    const promptInput = document.getElementById("promptInputImage");
    const heightInput = document.getElementById("heightImage");
    const widthInput = document.getElementById("widthImage");
    const seedInput = document.getElementById("seedImage");
    const displayElement = document.getElementById("displayImage");

    if (!promptInput || !heightInput || !widthInput || !seedInput || !displayElement) return;

    let prompt = promptInput.value;
    if (prompt.trim() === "") {
        showToast("Please enter a prompt");
        return;
    }
    let height = heightInput.value ? parseInt(heightInput.value) : 1024;
    let width = widthInput.value ? parseInt(widthInput.value) : 1024;
    let seed = seedInput.value ? parseInt(seedInput.value) : Math.floor(Math.random() * 1000000);

    try {
        const imageUrl = await generateImage(prompt, height, width, seed, modelIndexImage, enhanceImage, privateImage, logoImage);
        if (imageUrl) {
            showToast("Image generated successfully");

             // Clear previous styles before applying new background for smoother update
            displayElement.style.background = ''; // Clear all background properties
            displayElement.style.backgroundImage = `url(${imageUrl})`;
            displayElement.style.backgroundRepeat = 'no-repeat';
            displayElement.style.backgroundPosition = 'center';
            displayElement.style.backgroundSize = "contain"; // Or 'cover' depending on desired fill

            // Clear input fields after successful generation
            heightInput.value = "";
            widthInput.value = "";
            seedInput.value = "";
            promptInput.value = "";
        }
    } catch (error) {
        // Error handling is done inside generateImage, toast is shown there.
    }
}


async function generateText(prompt, modelIndexText, asJson = false) {
      const model = modelsText[modelIndexText] || "mistral";
      const params = {
        model,
        json: asJson ? "true" : "false"
      };

      const queryParams = new URLSearchParams(params);
      const encodedPrompt = encodeURIComponent(prompt);
      const url = `https://text.pollinations.ai/${encodedPrompt}?${queryParams.toString()}`;

      try {
        const response = await fetch(url);
        if (!response.ok) {
             const errorText = await response.text();
            try {
                const errorJson = JSON.parse(errorText);
                throw new Error(`API Error: ${errorJson.message || errorText}`);
            } catch (e) {
                 throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
        }

        const responseText = await response.text();

        if (asJson) {
          try {
            const parsed = JSON.parse(responseText);
            return parsed; // Return the parsed JSON
          } catch (e) {
            throw new Error("Failed to parse JSON response"); // Throw a specific error
          }
        } else {
          return responseText; // Return plain text
        }
      } catch (error) {
        showToast(`Error generating text: ${error.message}`); // Show specific error
        throw error; // Re-throw to be caught by the click handler's .catch
      }
}

// Handler for the text generation button click
async function handleTextGeneration() {
    const promptInput = document.getElementById("promptInputText");
    const generateButton = document.getElementById("generateText");
    const aiResponseElement = document.getElementById("aiRespondServer");
    const userPromptElement = document.getElementById("userPromptServer");

    if (!promptInput || !generateButton || !aiResponseElement || !userPromptElement) return;

    let prompt = promptInput.value;
    if (prompt.trim() === "") {
        showToast("Please enter a prompt");
        return;
    }
    document.getElementById("generateText").classList.add("generating");
    showToast("Generating text...");

    // Clear previous response immediately
    aiResponseElement.innerHTML = "";
    // Optionally, show user's prompt in the userPromptServer area
     userPromptElement.innerHTML = `<strong>You:</strong> ${prompt}`;


    try {
        const textResponse = await generateText(prompt, modelIndexText);

        if (typeof anime !== 'undefined') {
            // Animation for text response
            anime({
                targets: aiResponseElement,
                innerHTML: [""], // Start from empty
                round: 1,
                duration: Math.min(2000, textResponse.length * 30), // Adjust duration based on text length, max 2 sec
                easing: "linear",
                update: function(anim) {
                     // Ensure we don't go past the actual text length
                    let currentLength = Math.floor(anim.progress / 100 * textResponse.length);
                     // Handle potential issues if update runs after complete
                     if (currentLength <= textResponse.length) {
                        aiResponseElement.innerHTML = textResponse.substring(0, currentLength);
                     }
                },
                complete: function() {
                     aiResponseElement.innerHTML = textResponse; // Ensure full text is shown at the end
                }
            });
        } else {
            aiResponseElement.innerHTML = textResponse;
        }

        // Clear input field after successful generation
         promptInput.value = "";

    } catch (error) {
         // Error handling is done inside generateText, toast is shown there.
         // We just catch here to prevent unhandled promise rejection.
         userPromptElement.innerHTML = ""; // Optionally clear the user prompt echo on error
    } finally {
        // Ensure generating state is removed even on error or success
        generateButton.classList.remove("generating");
    }
}

// EventSource Feed Handling
function connectToServer(mode) {
    const feedUrlImage = "https://image.pollinations.ai/feed";
    const feedUrlText = "https://text.pollinations.ai/feed";

    const imageHolder = document.getElementById("displayImage");
    const imagePromptHolder = document.getElementById("imagePrompt");
    const modelUsed = document.getElementById("modelused");
    const referrerMentioned = document.getElementById("referrerMentioned");

    const userTextPrompt = document.getElementById("userPromptServer");
    const aiTextResponse = document.getElementById("aiRespondServer");

    // Close any existing connections first
    if (eventSourceImage) {
        eventSourceImage.close();
        eventSourceImage = null;
    }
    if (eventSourceText) {
        eventSourceText.close();
        eventSourceText = null;
    }

    // Reset display flags
    isDisplayingImage = false;
    isDisplayingText = false;

    if (mode === "image") {
        eventSourceImage = new EventSource(feedUrlImage);

        eventSourceImage.onmessage = function (event) {
            // *** NEW CHECK ***: Only process if in watch mode and image feed is selected
            if (currentMode !== "watchMode" || document.getElementById("imageOrTextCheckBox")?.checked) {
                return;
            }
             if (isDisplayingImage) return; // Prevent overlap

            try {
                const imageData = JSON.parse(event.data);
                if (!imageHolder || !imagePromptHolder || !modelUsed || !referrerMentioned) return;

                isDisplayingImage = true;

                const newImg = new Image();
                newImg.src = imageData.imageURL;
                newImg.onload = () => {
                    // Animate fade out
                    imageHolder.style.transition = "opacity 0.5s ease-in-out";
                    imageHolder.style.opacity = "0";

                    setTimeout(() => {
                        // Update background
                        imageHolder.style.backgroundImage = `url(${imageData.imageURL})`;
                        imageHolder.style.backgroundSize = "contain";
                        imageHolder.style.backgroundRepeat = "no-repeat";
                        imageHolder.style.backgroundPosition = "center";

                        // Update prompt text with typing animation
                        imagePromptHolder.innerHTML = ""; // Clear previous
                        const words = imageData.prompt.split(" ");
                        words.forEach((word, index) => {
                            const span = document.createElement("span");
                            span.textContent = word + " ";
                            span.style.opacity = "0";
                            span.style.filter = "blur(5px)";
                            span.style.transition = "all 0.5s ease-in-out";
                            imagePromptHolder.appendChild(span);

                            setTimeout(() => {
                                span.style.opacity = "1";
                                span.style.filter = "blur(0)";
                            }, index * 60); // Typing speed for image prompt
                        });

                        modelUsed.innerHTML = imageData.model;
                        referrerMentioned.innerHTML = imageData.referrer || "Unknown";

                        // Animate fade in
                        imageHolder.style.opacity = "1";

                        setTimeout(() => {
                             // Allow next image after fade-in and maybe a small delay
                            isDisplayingImage = false;
                        }, 1000); // Example delay after fade-in
                    }, 500); // wait for fade-out to finish
                };

                newImg.onerror = () => {
                    isDisplayingImage = false;
                };

            } catch (error) {
                // console.error("Error parsing image data:", error);
            }
        };

        eventSourceImage.onerror = function () {
            // console.error("Error with Image Feed connection.", eventSourceImage.readyState);
            eventSourceImage?.close();
            eventSourceImage = null;
            setTimeout(() => connectToServer("image"), 5000); // Attempt to reconnect after 5 seconds
        };

    } else if (mode === "text") {
        eventSourceText = new EventSource(feedUrlText);

        eventSourceText.onmessage = function (event) {
             // *** NEW CHECK ***: Only process if in watch mode and text feed is selected
            if (currentMode !== "watchMode" || !document.getElementById("imageOrTextCheckBox")?.checked) {
                return;
            }
            if (isDisplayingText) return; // Prevent overlap

            try {
                const textData = JSON.parse(event.data);
                if (!modelUsed || !referrerMentioned || !userTextPrompt || !aiTextResponse) return;
                
                isDisplayingText = true;

                modelUsed.innerHTML = textData.parameters.model;
                referrerMentioned.innerHTML = textData.parameters.referrer || "Unknown";

                // Clear old content immediately for typing animation
                userTextPrompt.innerHTML = "";
                aiTextResponse.innerHTML = "";

                let userWords = [];
                let aiWords = [];

                try {
                     // Handle potential undefined messages array or content
                    userWords = textData.parameters.messages?.[0]?.content?.split(/\s+/)?.slice(0, 30) || ["User", "prompt", "unavailable"]; // Limit user prompt words
                    aiWords = textData.response?.split(/\s+/)?.slice(0, 50) || ["AI", "response", "unavailable"]; // Limit AI response words
                } catch (error) {
                    userWords = ["Error", "loading", "user", "text"];
                    aiWords = ["Error", "loading", "AI", "response"];
                }

                // Typing animation for userTextPrompt
                 // Clear existing user prompt first to ensure clean animation
                 userTextPrompt.innerHTML = "<strong>You:</strong> ";
                userWords.forEach((word, index) => {
                    const span = document.createElement("span");
                    span.innerHTML = word + " ";
                    span.style.filter = "blur(5px)";
                    span.style.opacity = "0";
                    span.style.transition = "opacity 0.3s ease-in-out, filter 0.3s ease-in-out";
                    userTextPrompt.appendChild(span);

                    setTimeout(() => {
                        span.style.opacity = "1";
                        span.style.filter = "blur(0px)";
                    }, index * typingSpeed);
                });

                // Typing animation for aiTextResponse - start after user prompt animation is roughly done
                const userPromptAnimationDelay = userWords.length * typingSpeed;
                setTimeout(() => {
                     // Add 'AI:' prefix before AI response animation
                    aiTextResponse.innerHTML = "<strong>AI:</strong> ";
                    aiWords.forEach((word, index) => {
                        const span = document.createElement("span");
                        span.innerHTML = word + " ";
                        span.style.opacity = "0";
                        span.style.filter = "blur(5px)";
                        span.style.transition = "opacity 0.3s ease-in-out, filter 0.3s ease-in-out";
                        aiTextResponse.appendChild(span);

                        setTimeout(() => {
                            span.style.opacity = "1";
                            span.style.filter = "blur(0)";
                             // Trigger reflow for smooth transition (optional, but can help)
                             void span.offsetHeight;
                        }, index * typingSpeed);
                    });

                     // Total animation time before accepting next message
                    const totalDelay = aiWords.length * typingSpeed + 800; // Delay based on AI words + buffer
                    setTimeout(() => {
                        isDisplayingText = false;
                    }, totalDelay);

                }, userPromptAnimationDelay + 200); // Start AI animation slightly after user prompt finishes


            } catch (error) {
                // console.error("Error parsing text data:", error);
                isDisplayingText = false; // Allow next message on error
            }
        };

        eventSourceText.onerror = function (event) {
            // console.error("Error with Text Feed connection.", event.target.readyState);
            eventSourceText?.close();
            eventSourceText = null;
            setTimeout(() => connectToServer("text"), 5000); // Attempt to reconnect after 5 seconds
        };
    }
}