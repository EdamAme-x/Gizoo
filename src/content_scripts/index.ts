let editMode = localStorage.getItem("__gizoo_editMode") === "true";
const drag = {
  isDragging: false,
  target: null as null | HTMLElement,
};

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
};

const disableLinks = () => {
  const allLinks = document.querySelectorAll("a");

  for (const link of allLinks) {
    const href = link.getAttribute("href");

    if (href) {
      link.setAttribute("href", `#gizoo_${btoa(encodeURIComponent(href))}`);
      link.setAttribute(
        "data-gizoo-target",
        link.getAttribute("target") || "_self",
      );
      link.setAttribute("target", "_self");
    }
  }
};

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
    } catch {}
  }
};

const disableImages = () => {
  const html = document.querySelector("html");

  if (!html) {
    return;
  }

  html.setAttribute("data-gizoo-edit", "true");
};

const enableImages = () => {
  const html = document.querySelector("html");

  if (!html) {
    return;
  }

  html.removeAttribute("data-gizoo-edit");
};

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  if (request.type === "setMode") {
    editMode = request.editMode;
    if (editMode) {
      localStorage.setItem("__gizoo_editMode", String(editMode));

      disableLinks();

      disableImages();
    } else {
      localStorage.removeItem("__gizoo_editMode");

      removeOtherEditableElements();

      enableLinks();

      enableImages();
    }
  } else if (request.type === "getMode") {
    sendResponse({
      editMode,
    });
  }
});

const internalStyle = document.createElement("style");
internalStyle.innerHTML = `
  [contenteditable="true"] {
    outline: none;
    cursor: text;
  }

  html[data-gizoo-edit="true"] img, image, picture, video {
    user-select: all;
  }
`;

document.body.appendChild(internalStyle);

addEventListener("mouseover", (event) => {
  if (!editMode && event) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
}, true);

addEventListener("click", (event) => {
  if (!editMode && event) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  const element = event.target as HTMLElement;

  if (!("getAttribute" in element)) {
    return;
  }

  if (element.hasAttribute("data-gizoo")) {
    return;
  }

  removeOtherEditableElements();

  if (drag.isDragging && drag.target) {
    drag.isDragging = false;
    drag.target = null;

    return;
  }

  if (event.shiftKey && event.ctrlKey) {
    const copiedHTML = localStorage.getItem("__gizoo_copy");
    if (copiedHTML) {
      const html = copiedHTML;

      if (html) {
        const decodedHtml = decodeURIComponent(atob(html));

        const div = document.createElement("div");
        div.style.position = "fixed";
        div.style.top = `${event.clientY}px`;
        div.style.left = `${event.clientX}px`;
        div.setAttribute("data-gizoo-copy", "true");

        div.innerHTML = decodedHtml;

        document.body.appendChild(div);
      }
    }
    return;
  }

  if (event.ctrlKey && event.altKey) {
    drag.isDragging = true;
    drag.target = element.cloneNode(true) as HTMLElement;
    element.style.visibility = "hidden";

    document.body.appendChild(drag.target);
    drag.target.style.position = "fixed";
    drag.target.style.top = `${event.clientY}px`;
    drag.target.style.left = `${event.clientX}px`;
    drag.target.style.width = `${element.offsetWidth}px !important`;
    drag.target.style.height = `${element.offsetHeight}px !important`;

    return;
  }

  if (event.ctrlKey) {
    const copiedHTML = localStorage.getItem("__gizoo_copy");
    if (copiedHTML) {
      const html = copiedHTML;

      if (html) {
        const decodedHtml = decodeURIComponent(atob(html));

        element.outerHTML = decodedHtml;
      }
    }
    return;
  }

  if (event.altKey) {
    element.style.visibility = "hidden";
    return;
  }

  if (event.shiftKey) {
    const html = btoa(encodeURIComponent(element.outerHTML));
    localStorage.setItem("__gizoo_copy", html);
    return;
  }

  const spellCheck = element.getAttribute("data-gizoo") === "true";
  const contentEditable = element.getAttribute("contenteditable") === "true";

  element.setAttribute(
    "data-gizoo",
    JSON.stringify({
      spellCheck,
      contentEditable,
    }),
  );

  element.setAttribute("spellcheck", "false");
  element.setAttribute("contenteditable", "true");

  try {
    element.focus();
  } catch {}
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

addEventListener("mousemove", (event) => {
  if (!editMode && event) {
    return;
  }

  if (drag.isDragging && drag.target) {
    drag.target.style.position = "fixed";
    drag.target.style.top = `${event.clientY}px`;
    drag.target.style.left = `${event.clientX}px`;
  }
});
