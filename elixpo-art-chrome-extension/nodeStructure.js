let selectionLock = false;
let typingTimeout;
const themes = ["Normal", "Chromatic", "Wpap", "Landscape", "Anime", "Pixel"];
const aspectRatios = ["1:1", "4:3", "16:9", "9:16"];
let selectedAspectRatio = "1:1";
let selectedTheme = "Normal";
let selectedText = "";
let shineButton = null;
let wrapperCreated = false;

document.addEventListener("mouseup", function (event) {
  if (wrapperCreated) {
    return;
  }
  let selection = window.getSelection();
  selectedText = selection.toString().trim();
  setTimeout(() => {
    if (selection.toString().trim() == "") {
      if (document.querySelector(".shine-button")) {
        document.querySelector(".shine-button").remove();
        shineButton = null;
      }
      selectionLock = false;
      return;
    }
  }, 200);

  if (selectionLock) {
    return;
  }

  let range = selection.getRangeAt(0);
  selectedText = selection.toString().trim();

  if (selectedText) {
    selectionLock = true;

    removeShineButton();
    shineButton = document.createElement("button");
    shineButton.classList.add("shine-button");
    let shineImage = document.createElement("img");
    shineImage.src = chrome.runtime.getURL("assests/shines_thumbnail.png");
    shineImage.alt = "Generate with Shines";
    shineButton.appendChild(shineImage);

    Object.assign(shineButton.style, {
      position: "absolute",
      padding: "5px",
      height: "40px",
      width: "45px",
      zIndex: "10001",
      background: "linear-gradient(135deg, #2a0038, #4b0082)", // Deep purple gradient
      border: "none",
      cursor: "pointer",
      borderRadius: "15px",
      opacity: "1",
      transition: "opacity 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
      display: "flex",
      justifyContent: "center",
      transform: "scale(0.8)",
      alignItems: "center",
      boxShadow: "inset 4px 4px 6px rgba(0, 0, 0, 0.8), inset -4px -4px 6px rgba(144, 0, 255, 0.3)", // Purple glow inset
    });

    Object.assign(shineImage.style, {
      width: "24px",
      height: "24px",
    });

    let rect = range.getBoundingClientRect(); //Get bounding rectangle
    shineButton.style.left = `${rect.left + window.scrollX - shineButton.offsetWidth - 10}px`; // Position just to the left of the selection
    shineButton.style.top = `${rect.top + window.scrollY - 45}px`; // Adjust vertical position

    shineButton.addEventListener("click", function () {
      wrapperCreated = true;

      let node = document.createElement("div");
      node.classList.add("elixpo-wrapper");
      node.innerHTML = `
        <div class="content-container">
            <div class="pic-container" id="picContainer">
                <div class="loader" id="loader"></div>
            </div>
            <div class="controls-container">
                <div class="themeContainer"></div>
                <div class="aspect-container"></div>
            </div>
        </div>
        <div class="promptcontrol">
            <svg id="closePopup" class="ionicon" viewBox="0 0 512 512" width="24" height="24">
                <path d="M289.94 256l95-95A24 24 0 00351 127l-95 95-95-95a24 24 0 00-34 34l95 95-95 95a24 24 0 1034 34l95-95 95 95a24 24 0 0034-34z"></path>
            </svg>
            <input type="text" placeholder="Any Custom Instructions?" class="promptInstruction" id="promptInstruction" autocomplete="off" spellcheck="false">
            <button class="generate-button" id="generateImage">
                <svg class="ionicon" viewBox="0 0 512 512" width="24" height="24">
                    <path d="M208 512a24.84 24.84 0 01-23.34-16l-39.84-103.6a16.06 16.06 0 00-9.19-9.19L32 343.34a25 25 0 010-46.68l103.6-39.84a16.06 16.06 0 009.19-9.19L184.66 144a25 25 0 0146.68 0l39.84 103.6a16.06 16.06 0 009.19 9.19l103 39.63a25.49 25.49 0 0116.63 24.1 24.82 24.82 0 01-16 22.82l-103.6 39.84a16.06 16.06 0 00-9.19 9.19L231.34 496A24.84 24.84 0 01208 512zm66.85-254.84zM88 176a14.67 14.67 0 01-13.69-9.4l-16.86-43.84a7.28 7.28 0 00-4.21-4.21L9.4 101.69a14.67 14.67 0 010-27.38l43.84-16.86a7.31 7.31 0 004.21-4.21L74.16 9.79A15 15 0 0186.23.11a14.67 14.67 0 0115.46 9.29l16.86 43.84a7.31 7.31 0 004.21 4.21l43.84 16.86a14.67 14.67 0 010 27.38l-43.84 16.86a7.28 7.28 0 00-4.21 4.21l-16.86 43.84A14.67 14.67 0 0188 176zM400 256a16 16 0 01-14.93-10.26l-22.84-59.37a8 8 0 00-4.6-4.6l-59.37-22.84a16 16 0 010-29.86l59.37-22.84a8 8 0 004.6-4.6l22.67-58.95a16.45 16.45 0 0113.17-10.57 16 16 0 0116.86 10.15l22.84 59.37a8 8 0 004.6 4.6l59.37 22.84a16 16 0 010 29.86l-59.37 22.84a8 8 0 00-4.6 4.6l-22.84 59.37A16 16 0 01400 256z"></path>
                </svg>
            </button>
            <button class="downloadBtn" id="downloadBtn">
                <svg class="ionicon" viewBox="0 0 512 512" width="24" height="24">
                    <path d="M376 160H272v153.37l52.69-52.68a16 16 0 0122.62 22.62l-80 80a16 16 0 01-22.62 0l-80-80a16 16 0 0122.62-22.62L240 313.37V160H136a56.06 56.06 0 00-56 56v208a56.06 56.06 0 0056 56h240a56.06 56.06 0 0056-56V216a56.06 56.06 0 00-56-56zM272 48a16 16 0 00-32 0v112h32z"></path>
                </svg>
            </button>
        </div>
        <p class="pimp-text" id="pimpText"></p>
    `;

      // Get references to elements
      let themeContainer = node.querySelector(".themeContainer");
      let aspectContainer = node.querySelector(".aspect-container");


      // Create theme items dynamically
      for (let i = 0; i < themes.length; i++) {
        let themeDiv = document.createElement("div");
        themeDiv.classList.add("theme-item");
        if (i === 0) themeDiv.classList.add("selected");
        themeDiv.innerHTML = `<p>${themes[i]}</p>`;
        themeContainer.appendChild(themeDiv);

        Object.assign(themeDiv.style, {
          backgroundImage: `url('${chrome.runtime.getURL(`assests/${i}.jpeg`)}')`,
        });

        themeDiv.addEventListener("mouseover", function () {
          this.style.opacity = "1";
        });
        themeDiv.addEventListener("mouseleave", function () {
          if (!this.classList.contains("selected")) this.style.opacity = "0.35";
        });
        themeDiv.addEventListener("click", function () {
          document.querySelectorAll(".theme-item").forEach((item) => {
            item.classList.remove("selected");
            item.style.opacity = "0.35";
          });
          this.classList.add("selected");
          this.style.opacity = "1";
          selectedTheme = themes[i];
        });
      }

      // Create aspect ratio items dynamically
      for (let i = 0; i < aspectRatios.length; i++) {
        let aspectDiv = document.createElement("div");
        aspectDiv.classList.add("aspect-item");
        if (i === 0) aspectDiv.classList.add("selected");
        aspectDiv.textContent = aspectRatios[i];
        aspectContainer.appendChild(aspectDiv);

        aspectDiv.addEventListener("click", function () {
          document.querySelectorAll(".aspect-item").forEach((item) => {
            item.classList.remove("selected");
          });
          this.classList.add("selected");
          selectedAspectRatio = this.textContent;
        });
      }

      // Event listeners
      node.querySelector("#closePopup").onclick = function () {
        node.style.transition = "opacity 0.5s ease-out";
        node.style.opacity = "0";
        setTimeout(() => {
          node.remove();
        }, 500);
        selectionLock = false;
        wrapperCreated = false;
        removeShineButton();
      };


      let container = range.startContainer;
      while (container.nodeType !== 1) {
        container = container.parentNode;
      }
      container.parentNode.insertBefore(node, container.nextSibling);

      document.getElementById("generateImage").addEventListener("click", () => {
        generateImage();
      });
      document.getElementById("downloadBtn").addEventListener("click", () => {
        downloadImage();
      });
      type(
        `This is what you have selected haa? ..." ${selectedText} " \n Well Select any theme and aspect-ratio and HIT that generate button `
      );

      window.getSelection().removeAllRanges();
      removeShineButton();
    });

    document.body.appendChild(shineButton);
  } else {
    removeShineButton();
    selectionLock = false;
  }
});

function removeShineButton() {
  if (document.querySelector(".shine-button")) {
    document.querySelector(".shine-button").remove();
    shineButton = null;
  }
}

function type(text) {
  let element = document.getElementById("pimpText");
  element.textContent = "";
  let index = 0;

  function typeChar() {
    if (index < text.length) {
      element.textContent += text.charAt(index);
      index++;
      typingTimeout = requestAnimationFrame(typeChar);
    }
  }

  cancelAnimationFrame(typingTimeout);
  typeChar();
}