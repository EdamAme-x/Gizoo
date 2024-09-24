import "./style.css";

addEventListener("DOMContentLoaded", () => {
  const cb = document.querySelector<HTMLInputElement>(".cb");

  if (!cb) {
    return;
  }

  let editMode = cb.checked;

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0].id) {
      return;
    }
    chrome.tabs.sendMessage(
      tabs[0].id,
      {
        type: "getMode",
      },
      (response) => {
        editMode = response.editMode;
        if (editMode) {
          cb.checked = true;
        }

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (!tabs[0].id) {
            return;
          }
          chrome.tabs.sendMessage(tabs[0].id, {
            type: "setMode",
            editMode,
          });
        });
      }
    );
  });

  cb.addEventListener("change", () => {
    editMode = cb.checked;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0].id) {
        return;
      }
      chrome.tabs.sendMessage(tabs[0].id, {
        type: "setMode",
        editMode,
      });
    });
  });
});
