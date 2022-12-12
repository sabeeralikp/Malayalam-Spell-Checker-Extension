(() => {
  let base_URL = "https://192.168.65.16:5000/";
  // let base_URL = "https://127.0.0.1:5000/";

  let mainContainer = document.createElement("div");
  mainContainer.className = "mainContainer buttonContainer";

  let spellCheckRow = document.createElement("div");
  spellCheckRow.className = "spellCheckerRow";

  let copyTextButtonContainer = document.createElement("div");
  copyTextButtonContainer.className = "buttonContainer";

  let copyTextButton = document.createElement("div");
  copyTextButton.id = "copyTextButton";

  let copyTextImg = document.createElement("img");
  copyTextImg.src = chrome.runtime.getURL("images/copy.png");
  copyTextImg.className = "copyimg";

  copyTextButton.appendChild(copyTextImg);

  let selectionButton = document.createElement("div");
  selectionButton.id = "selectionButton";
  selectionButton.className = "M";

  let extensionLogo = document.createElement("img");
  extensionLogo.src = chrome.runtime.getURL("images/default_icon_256.png");
  extensionLogo.className = "extensionLogo";

  selectionButton.appendChild(extensionLogo);

  let resultBoxButtonContainer = document.createElement("div");
  resultBoxButtonContainer.className = "buttonContainer";

  let resultBox = document.createElement("div");
  resultBox.id = "resultBox";
  resultBoxButtonContainer.appendChild(resultBox);

  copyTextButtonContainer.appendChild(copyTextButton);
  copyTextButtonContainer.appendChild(selectionButton);
  spellCheckRow.appendChild(copyTextButtonContainer);
  spellCheckRow.appendChild(resultBoxButtonContainer);
  mainContainer.appendChild(spellCheckRow);

  let suggestionsBox = document.createElement("div");
  suggestionsBox.id = "suggestionsBox";

  mainContainer.appendChild(suggestionsBox);

  document.body.appendChild(mainContainer);

  let snackbar = document.createElement("div");
  snackbar.id = "snackbar";
  snackbar.innerHTML = "Copied the text";
  document.body.appendChild(snackbar);

  let selectedWordsText = "";

  document.onselectionchange = () => {
    if (document.getSelection) {
      let selectedWords = document.getSelection();
      if (selectedWords.toString() != "") {
        selectionButton.style.display = "block";
        selectionButton.className = "M";
        selectedWordsText = selectedWords.toString();
      }
    } else selectionButton.style.display = "none";
  };

  let getSuggestionElement = document.getElementsByClassName("incorrect");
  let changeTextElement = document.getElementsByClassName("changeText");

  selectionButton.addEventListener("click", async () => {
    if (selectionButton.className == "M") {
      selectionButton.className = "X";
      extensionLogo.src = chrome.runtime.getURL("images/close.png");

      resultBox.innerHTML = "";
      suggestionsBox.innerHTML = "";
      if (selectedWordsText) {
        copyTextButton.style.display = "block";
        fetch(`${base_URL}spellCheck/?words=${selectedWordsText}`)
          .then((response) => response.json())
          .then((incorrectWords) => {
            selectedWordsText.split(" ").forEach((word) => {
              resultBox.innerHTML += incorrectWords.includes(word)
                ? `<a class="incorrect" id="${word}" >${word}</a> `
                : `${word} `;
            });
          })
          .then(() => {
            for (let i = 0; i < getSuggestionElement.length; i++) {
              getSuggestionElement[i].addEventListener("click", async (e) => {
                suggestionsBox.style.display = "block";
                suggestionsBox.innerHTML = "";
                fetch(`${base_URL}suggestions/?word=${e.target.id}`)
                  .then((response) => response.json())
                  .then((suggestions) => {
                    suggestions.forEach((element) => {
                      suggestionsBox.innerHTML += `<div class="changeText" id="${e.target.id}2${element}" >${element}</div>`;
                    });
                  })
                  .then(() => {
                    for (let i = 0; i < changeTextElement.length; i++) {
                      changeTextElement[i].addEventListener(
                        "click",
                        async (e) => {
                          suggestionsBox.style.display = "none";
                          const nodeList = document.querySelectorAll(
                            `#${e.target.id.split("2")[0]}`
                          );
                          for (let i = 0; i < nodeList.length; i++) {
                            nodeList[i].innerHTML = `${
                              e.target.id.split("2")[1]
                            }`;
                            nodeList[i].style.color = "white";
                            nodeList[i].style.textDecoration =
                              "underline dashed rgb(20, 20, 231) 1.5px";
                          }
                        }
                      );
                    }
                  });
              });
            }
          });

        resultBox.style.display = "block";
      }
    } else {
      copyTextButton.style.display = "none";
      selectionButton.className == "M";
      extensionLogo.src = chrome.runtime.getURL("images/default_icon_256.png");
      selectionButton.style.display = "none";
      resultBox.innerHTML = "";
      resultBox.style.display = "none";
      suggestionsBox.innerHTML = "";
      suggestionsBox.style.display = "none";
    }
  });

  copyTextButton.addEventListener("click", async () => {
    navigator.clipboard.writeText(resultBox.textContent);
    window.getSelection = resultBox.textContent;
    snackbar.className = "show";
    setTimeout(function () {
      snackbar.className = snackbar.className.replace("show", "");
    }, 3000);
  });
})();
function getSuggestions(word) {
  suggestionsBox.style.display = "block";
  suggestionsBox.innerHTML = "";
  fetch(`${base_URL}suggestions/?word=${word}`)
    .then((response) => response.json())
    .then((suggestions) => {
      suggestions.forEach((element) => {
        document.getElementById(
          "suggestionsBox"
        ).innerHTML += `<div id="${word}2${element}" onclick="changeText(this.id)">${element}</div>`;
      });
    });
}

function changeText(word) {
  suggestionsBox.style.display = "none";
  const nodeList = document.querySelectorAll(`#${word.split("2")[0]}`);
  console.log(nodeList);
  for (let i = 0; i < nodeList.length; i++) {
    nodeList[i].innerHTML = `${word.split("2")[1]}`;
    nodeList[i].style.color = "black";
    nodeList[i].style.textDecoration = "underline dotted blue";
  }
}
