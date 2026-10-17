"use strict";

const catches = [
  { id: "yellowfin-tuna", name: "Yellowfin Tuna (Bariles)", type: "Finfish", category: "Finfish", origin: "Gasan", seller: "Local fisherfolk · Gasan", price: 420, description: "Freshly caught pelagic fish from the waters of Gasan.", emoji: "🐟", tone: "sage" },
  { id: "market-squid", name: "Market Squid (Pusit)", type: "Shellfish", category: "Shellfish", origin: "Gasan", seller: "Local fish vendor · Gasan", price: 320, description: "Locally landed squid ideal for household meals and local vendors.", emoji: "🦑", tone: "sand" },
  { id: "skipjack-tuna", name: "Skipjack Tuna (Tulingan)", type: "Finfish", category: "Finfish", origin: "Boac", seller: "Local fisherfolk · Boac", price: 360, description: "Island-landed tuna, a versatile choice for everyday family meals.", emoji: "🐟", tone: "coral" },
  { id: "round-scad", name: "Round Scad (Galunggong)", type: "Finfish", category: "Finfish", origin: "Mogpog", seller: "Local fisherfolk · Mogpog", price: 180, description: "A familiar local catch, suited to home cooking and neighborhood markets.", emoji: "🐟", tone: "blue" },
  { id: "blue-swimming-crab", name: "Blue Swimming Crab (Alimasag)", type: "Shellfish", category: "Shellfish", origin: "Torrijos", seller: "Local seafood vendor · Torrijos", price: 380, description: "Locally landed crab for shared meals and fresh seafood stalls.", emoji: "🦀", tone: "sand" },
  { id: "shrimp", name: "Shrimp (Hipon)", type: "Shellfish", category: "Shellfish", origin: "Santa Cruz", seller: "Local fisherfolk · Santa Cruz", price: 450, description: "Fresh local shrimp, ready for home recipes and community buyers.", emoji: "🦐", tone: "sage" }
];

const currency = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 2
});

const grid = document.querySelector("#catch-grid");
const searchInput = document.querySelector("#catch-search");
const typeFilter = document.querySelector("#type-filter");
const originFilter = document.querySelector("#origin-filter");
const sortFilter = document.querySelector("#sort-filter");
const resultCount = document.querySelector("#result-count");
const orderSelect = document.querySelector("#order-catch");
const quantityInput = document.querySelector("#order-quantity");
const unitPriceOutput = document.querySelector("#unit-price");
const totalOutput = document.querySelector("#order-total");
const orderForm = document.querySelector("#order-form");
const orderStatus = document.querySelector("#order-status");
const buyerNameInput = document.querySelector("#buyer-name");
const buyerContactInput = document.querySelector("#buyer-contact");

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function getVisibleCatches() {
  const query = searchInput.value.trim().toLocaleLowerCase();
  const filtered = catches.filter((item) => {
    const matchesText = `${item.name} ${item.category} ${item.origin} ${item.seller} ${item.description}`.toLocaleLowerCase().includes(query);
    const matchesType = typeFilter.value === "all" || item.type === typeFilter.value;
    const matchesOrigin = originFilter.value === "all" || item.origin === originFilter.value;
    return matchesText && matchesType && matchesOrigin;
  });

  if (sortFilter.value === "price-low") filtered.sort((a, b) => a.price - b.price);
  if (sortFilter.value === "price-high") filtered.sort((a, b) => b.price - a.price);
  if (sortFilter.value === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));
  return filtered;
}

function renderCatches() {
  const visible = getVisibleCatches();
  resultCount.textContent = `${visible.length} ${visible.length === 1 ? "example listing" : "example listings"}`;

  if (visible.length === 0) {
    grid.innerHTML = '<p class="empty-state">No seafood matches those filters. Try another search or reset your filters.</p>';
    return;
  }

  grid.innerHTML = visible.map((item) => `
    <article class="catch-card">
      <div class="catch-art catch-art-${item.tone}" aria-hidden="true">
        <span class="catch-kind">${escapeHTML(item.category)}</span>
        <span class="catch-emoji">${escapeHTML(item.emoji)}</span>
        <span class="catch-town">${escapeHTML(item.origin)} · Marinduque</span>
      </div>
      <div class="catch-content">
        <div class="catch-name-row">
          <h3 class="catch-name">${escapeHTML(item.name)}</h3>
          <span class="catch-price">${currency.format(item.price)}<small> / kg</small></span>
        </div>
        <p class="catch-seller"><strong>Category:</strong> ${escapeHTML(item.category)} · ${escapeHTML(item.seller)}</p>
        <p class="catch-description">${escapeHTML(item.description)}</p>
        <div class="catch-card-bottom">
          <span class="catch-availability">${escapeHTML(item.availability)}</span>
          <button class="catch-order" type="button" data-order-catch="${escapeHTML(item.id)}">Estimate order</button>
        </div>
      </div>
    </article>
  `).join("");
}

function populateOrderOptions() {
  orderSelect.innerHTML = catches.map((item) =>
    `<option value="${escapeHTML(item.id)}">${escapeHTML(item.name)} · ${escapeHTML(item.origin)}</option>`
  ).join("");
}

function updateOrderEstimate() {
  const selectedCatch = catches.find((item) => item.id === orderSelect.value);
  const quantity = Number(quantityInput.value);
  const validQuantity = quantityInput.value !== "" && Number.isFinite(quantity) && quantity >= 0.5 && quantity <= 1000;

  if (!selectedCatch) {
    unitPriceOutput.textContent = "Unavailable";
    totalOutput.textContent = "—";
    return;
  }

  unitPriceOutput.textContent = `${currency.format(selectedCatch.price)} / kg`;
  totalOutput.textContent = validQuantity ? currency.format(selectedCatch.price * quantity) : "Enter a valid quantity";
}

function resetOrderStatus() {
  orderStatus.textContent = "No order is sent. Confirm this estimate and arrange pickup with the seller.";
  orderStatus.classList.remove("is-confirmation", "is-error");
}

searchInput.addEventListener("input", renderCatches);
typeFilter.addEventListener("change", renderCatches);
originFilter.addEventListener("change", renderCatches);
sortFilter.addEventListener("change", renderCatches);

document.querySelector("#reset-filters").addEventListener("click", () => {
  searchInput.value = "";
  typeFilter.value = "all";
  originFilter.value = "all";
  sortFilter.value = "featured";
  renderCatches();
  searchInput.focus();
});

grid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-order-catch]");
  if (!button) return;

  orderSelect.value = button.dataset.orderCatch;
  updateOrderEstimate();
  resetOrderStatus();
  const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
  document.querySelector("#order").scrollIntoView({ behavior, block: "start" });
  orderSelect.focus({ preventScroll: true });
});

orderSelect.addEventListener("change", () => {
  updateOrderEstimate();
  resetOrderStatus();
});
quantityInput.addEventListener("input", () => {
  updateOrderEstimate();
  resetOrderStatus();
});

orderForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!orderForm.reportValidity()) return;

  const selectedCatch = catches.find((item) => item.id === orderSelect.value);
  const quantity = Number(quantityInput.value);
  if (!selectedCatch || !Number.isFinite(quantity) || quantity < 0.5 || quantity > 1000) {
    orderStatus.textContent = "Please choose a seafood item and enter a quantity from 0.5 to 1,000 kg.";
    orderStatus.classList.add("is-error");
    return;
  }

  const buyerName = buyerNameInput.value.trim();
  orderStatus.textContent = `Order request draft for ${buyerName} (${buyerContactInput.value.trim()}): ${quantity} kg of ${selectedCatch.name}, estimated at ${currency.format(selectedCatch.price * quantity)}. Nothing was sent—contact the seller to confirm.`;
  orderStatus.classList.remove("is-error");
  orderStatus.classList.add("is-confirmation");
});

populateOrderOptions();
renderCatches();
updateOrderEstimate();