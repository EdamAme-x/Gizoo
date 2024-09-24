let editMode = localStorage.getItem("__gizoo_editMode") === "true";

const removeOtherEditableElements = () => {
  const allGizooElements = document.querySelectorAll("[data-gizoo]");

      for (const element of allGizooElements) {
        const gizooData = element.getAttribute("data-gizoo");

        if (!gizooData) {
          continue;
        }

        const data = JSON.parse(gizooData);

        element.removeAttribute("data-gizoo");

        element.setAttribute("spellcheck", String(data.spellCheck));
        element.setAttribute("contenteditable", String(data.contentEditable));
      }
}

const disableLinks = () => {
  const allLinks = document.querySelectorAll("a");

  for (const link of allLinks) {
    const href = link.getAttribute("href");

    if (href) {
      link.setAttribute("href", `#gizoo_${btoa(encodeURIComponent(href))}`);
      link.setAttribute("data-gizoo-target", link.getAttribute("target") || "_self");
      link.setAttribute("target", "_self");
    }
  }
}

const enableLinks = () => {
  const allLinks = document.querySelectorAll("a");

  for (const link of allLinks) {
    try {
      const href = link.getAttribute("href");

      if (href) {
        const fixedHref = decodeURIComponent(atob(href.replace("#gizoo_", "")));
        link.setAttribute("href", fixedHref);
        const gizooTarget = link.getAttribute("data-gizoo-target");

        if (gizooTarget) {
          link.setAttribute("target", gizooTarget);
        }
      }
    }catch {}
  }
}

const disableImages = () => {
  const html = document.querySelector("html");

  if (!html) {
    return;
  }

  html.setAttribute("data-gizoo-edit", "true");
}

const enableImages = () => {
  const html = document.querySelector("html");

  if (!html) {
    return;
  }

  html.removeAttribute("data-gizoo-edit");
}

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  if (request.type === "setMode") {
    editMode = request.editMode;
    if (editMode) {
      localStorage.setItem("__gizoo_editMode", String(editMode));

      disableLinks();

      disableImages();
    }else {
      localStorage.removeItem("__gizoo_editMode");

      removeOtherEditableElements();

      enableLinks();

      enableImages();
    }
  }else if (request.type === "getMode") {
    sendResponse({
        editMode
    })
  }
});

const internalStyle = document.createElement("style");
internalStyle.innerHTML = `
  [contenteditable="true"] {
    outline: none;
    cursor: text;
  }

  html[data-gizoo-edit="true"] img, image, picture, svg {
    user-select: all;
  }
`;

document.body.appendChild(internalStyle);

addEventListener("click", (event) => {
  if (!editMode && event) {
    return;
  }

  const element = event.target as HTMLElement;

  if (!("getAttribute" in element)) {
    return;
  }

  if (element.hasAttribute("data-gizoo")) {
    return;
  }

  removeOtherEditableElements();

  const spellCheck = element.getAttribute("data-gizoo") === "true";
  const contentEditable = element.getAttribute("contenteditable") === "true";

  element.setAttribute(
    "data-gizoo",
    JSON.stringify({
      spellCheck,
      contentEditable,
    })
  );

  element.setAttribute("spellcheck", "false");
  element.setAttribute("contenteditable", "true");

  try {
    element.focus();
  }catch {}

  event.preventDefault();
}, true);

addEventListener("blur", (event) => {
  if (!editMode && event) { 
    return;
  }

  const element = event.target as HTMLElement;

  if (!("getAttribute" in element)) {
    return;
  }

  console.log(element);

  const gizooData = element.getAttribute("data-gizoo");

  if (!gizooData) {
    return;
  }

  const data = JSON.parse(gizooData);

  element.removeAttribute("data-gizoo");
  element.setAttribute("spellcheck", String(data.spellCheck));
  element.setAttribute("contenteditable", String(data.contentEditable));
});
