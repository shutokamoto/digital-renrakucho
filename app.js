const editorsRoot = document.querySelector("#entryEditors");
const printSheet = document.querySelector("#printSheet");
const editorTemplate = document.querySelector("#editorTemplate");
const printCardTemplate = document.querySelector("#printCardTemplate");
const dateInput = document.querySelector("#sharedDate");
const widthSelect = document.querySelector("#cardWidth");
const fontSizeSelect = document.querySelector("#fontSize");
const addEntryButton = document.querySelector("#addEntryButton");
const printButton = document.querySelector("#printButton");
const cardCount = document.querySelector("#cardCount");

let entries = [];
let nextId = 1;

const fontSizes = {
  small: "10pt",
  medium: "11pt",
  large: "12pt",
};

function todayISO() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

function formatJapaneseDate(value) {
  if (!value) return "";
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  return `${year}年${month}月${day}日（${weekdays[date.getDay()]}）`;
}

function createEntry() {
  entries.push({
    id: nextId++,
    message: "",
  });
  render();
}

function removeEntry(id) {
  if (entries.length === 1) {
    entries[0].message = "";
  } else {
    entries = entries.filter((entry) => entry.id !== id);
  }
  render();
}

function updateEntry(id, field, value) {
  const entry = entries.find((item) => item.id === id);
  if (!entry) return;
  entry[field] = value;
  renderPreview();
}

function renderEditors() {
  editorsRoot.replaceChildren();

  entries.forEach((entry, index) => {
    const fragment = editorTemplate.content.cloneNode(true);
    const card = fragment.querySelector(".editor-card");
    const number = fragment.querySelector(".entry-number");
    const remove = fragment.querySelector(".remove-entry");
    const message = fragment.querySelector(".message");

    number.textContent = `連絡 ${index + 1}`;
    message.value = entry.message;

    message.addEventListener("input", (event) => {
      updateEntry(entry.id, "message", event.target.value);
    });

    remove.addEventListener("click", () => removeEntry(entry.id));

    card.dataset.entryId = entry.id;
    editorsRoot.append(fragment);
  });
}

function renderPreview() {
  printSheet.replaceChildren();
  document.documentElement.style.setProperty("--card-width", `${widthSelect.value}mm`);
  document.documentElement.style.setProperty(
    "--message-font-size",
    fontSizes[fontSizeSelect.value] ?? fontSizes.medium
  );

  entries.forEach((entry) => {
    const fragment = printCardTemplate.content.cloneNode(true);
    fragment.querySelector(".renraku-date").textContent = formatJapaneseDate(dateInput.value);
    fragment.querySelector(".renraku-message").textContent = entry.message.trim();
    printSheet.append(fragment);
  });

  cardCount.textContent = `${entries.length}枚`;
  fitPreviewOnSmallScreens();
}

function render() {
  renderEditors();
  renderPreview();
}

function fitPreviewOnSmallScreens() {
  const shell = document.querySelector(".paper-shell");
  if (!shell || window.matchMedia("print").matches) return;

  const sheetWidth = printSheet.getBoundingClientRect().width;
  const available = Math.max(shell.clientWidth - 20, 1);
  const scale = Math.min(1, available / sheetWidth);

  if (scale < 1) {
    printSheet.style.transform = `scale(${scale})`;
    printSheet.style.marginBottom = `${-(printSheet.offsetHeight * (1 - scale))}px`;
  } else {
    printSheet.style.transform = "";
    printSheet.style.marginBottom = "";
  }
}

dateInput.value = todayISO();

dateInput.addEventListener("change", renderPreview);
widthSelect.addEventListener("change", renderPreview);
fontSizeSelect.addEventListener("change", renderPreview);
addEntryButton.addEventListener("click", createEntry);
printButton.addEventListener("click", () => window.print());
window.addEventListener("resize", fitPreviewOnSmallScreens);

window.addEventListener("beforeprint", () => {
  printSheet.style.transform = "";
  printSheet.style.marginBottom = "";
});

window.addEventListener("afterprint", fitPreviewOnSmallScreens);

createEntry();
