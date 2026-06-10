let items = [];
let selectedCategory = "";
let editingId = null;
let currentFilter = "all";

const itemsList = document.getElementById("itemsList");
const emptyState = document.getElementById("emptyState");
const modalOverlay = document.getElementById("modalOverlay");
const itemForm = document.getElementById("itemForm");
const btnAddItem = document.getElementById("btnAddItem");
const btnCloseModal = document.getElementById("btnCloseModal");
const btnClearAll = document.getElementById("btnClearAll");
const inputName = document.getElementById("inputName");
const inputCategory = document.getElementById("inputCategory");
const inputQuantity = document.getElementById("inputQuantity");
const inputPrice = document.getElementById("inputPrice");
const btnIncreaseQty = document.getElementById("btnIncreaseQty");
const btnDecreaseQty = document.getElementById("btnDecreaseQty");
const categoryBtns = document.querySelectorAll(".category-btn");
const categoryFilterBtns = document.querySelectorAll("#categoryFilter button");
const btnClearFilter = document.getElementById("btnClearFilter");

// Load items from localStorage
function loadItems() {
    const saved = localStorage.getItem("mercadoItems");
    if (saved) {
        items = JSON.parse(saved);
    }
    renderItems();
    updateTotals();
}

// Save items to localStorage
function saveItems() {
    localStorage.setItem("mercadoItems", JSON.stringify(items));
}

// Format currency
function formatCurrency(value) {
    if (!value || value === 0) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
}

// Get category emoji
function getCategoryEmoji(category) {
    const map = {
        Limpeza: "🧽",
        Geladeira: "❄️",
        Armário: "🍞",
        Higiene: "🧴",
        Outros: "📦",
    };
    return map[category] || "📦";
}

// Render items
function renderItems() {
    let filteredItems = items;
    if (currentFilter !== "all") {
        filteredItems = items.filter((item) => item.category === currentFilter);
    }

    if (filteredItems.length === 0) {
        emptyState.classList.remove("hidden");
        itemsList.innerHTML = "";
        itemsList.appendChild(emptyState);
        return;
    }

    emptyState.classList.add("hidden");

    // Sort: unchecked first, then by category
    const sortedItems = [...filteredItems].sort((a, b) => {
        if (a.checked === b.checked) {
            const categoryOrder = ["Limpeza", "Geladeira", "Armário", "Higiene", "Outros"];
            return categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
        }
        return a.checked ? 1 : -1;
    });

    itemsList.innerHTML = sortedItems
        .map(
            (item) => `
                <div class="item-card fade-in ${item.checked ? "opacity-60" : ""}" data-id="${item.id}">
                    <div class="bg-white rounded-2xl border-2 ${item.checked ? "border-green-200 bg-green-50" : "border-gray-100"} p-4 shadow-sm hover:shadow-md transition-all">
                        <div class="flex items-center gap-3">
                            <!-- Checkbox -->
                            <button class="checkmark w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${item.checked ? "bg-green-500 border-green-500" : "border-gray-300 hover:border-green-400"}" data-action="toggle" data-id="${item.id}">
                                ${item.checked ? '<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>' : ""}
                            </button>

                            <!-- Content -->
                            <div class="flex-1 min-w-0 cursor-pointer" data-action="edit" data-id="${item.id}">
                                <div class="flex items-start justify-between gap-2">
                                    <div class="flex-1 min-w-0">
                                        <div class="flex items-center gap-2">
                                            <h3 class="font-semibold text-gray-800 truncate ${item.checked ? "line-through text-gray-500" : ""}">${item.name}</h3>
                                            ${item.checked ? '<span class="pulse-dot w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>' : ""}
                                        </div>
                                        <div class="flex items-center gap-2 mt-1 flex-wrap">
                                            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600">
                                                ${getCategoryEmoji(item.category)} ${item.category}
                                            </span>
                                            <span class="text-xs text-gray-500">Qtd: ${item.quantity}</span>
                                            ${!item.price ? '<span class="text-xs text-orange-500 bg-orange-50 px-2 py-0.5 rounded-lg">💡 Preço não definido</span>' : ""}
                                        </div>
                                    </div>
                                    <div class="text-right flex-shrink-0">
                                        ${
                                            item.price
                                                ? `
                                            <p class="font-bold text-gray-800">${formatCurrency(item.price * item.quantity)}</p>
                                            <p class="text-xs text-gray-400">${formatCurrency(item.price)} un</p>
                                        `
                                                : `
                                            <p class="text-sm text-gray-400 italic">Sem preço</p>
                                        `
                                        }
                                    </div>
                                </div>
                            </div>

                            <!-- Delete Button -->
                            <button class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors flex-shrink-0" data-action="delete" data-id="${item.id}">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            `,
        )
        .join("");
}

// Update totals
function updateTotals() {
    const totalItems = items.length;
    const checkedItems = items.filter((item) => item.checked).length;
    const totalEstimated = items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
    const totalInCart = items.filter((item) => item.checked).reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

    document.getElementById("checkedCount").textContent = checkedItems;
    document.getElementById("totalCount").textContent = totalItems;

    const percentage = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;
    document.getElementById("progressText").textContent = `${percentage}% concluído`;
    document.getElementById("progressBar").style.width = `${percentage}%`;

    document.getElementById("totalEstimated").textContent = formatCurrency(totalEstimated);
    document.getElementById("totalInCart").textContent = `${formatCurrency(totalInCart)} no carrinho`;
}

// Toggle item
function toggleItem(id) {
    const item = items.find((i) => i.id === id);
    if (item) {
        item.checked = !item.checked;
        saveItems();
        renderItems();
        updateTotals();
    }
}

// Delete item
function deleteItem(id) {
    items = items.filter((i) => i.id !== id);
    saveItems();
    renderItems();
    updateTotals();
}

// Clear all
function clearAll() {
    if (items.length === 0) return;
    if (confirm("Tem certeza que deseja limpar toda a lista?")) {
        items = [];
        saveItems();
        renderItems();
        updateTotals();
    }
}

// Open modal
function openModal(itemId = null) {
    editingId = itemId;

    if (itemId) {
        const item = items.find((i) => i.id === itemId);
        if (item) {
            document.getElementById("modalTitle").textContent = "Editar Item";
            document.getElementById("btnSubmit").textContent = "Salvar alterações";
            inputName.value = item.name;
            inputQuantity.value = item.quantity;
            inputPrice.value = item.price || "";
            selectCategory(item.category);
        }
    } else {
        document.getElementById("modalTitle").textContent = "Novo Item";
        document.getElementById("btnSubmit").textContent = "Adicionar à lista";
        resetForm();
    }

    modalOverlay.classList.remove("hidden");
    modalOverlay.classList.add("flex");
    inputName.focus();
}

// Close modal
function closeModal() {
    modalOverlay.classList.add("hidden");
    modalOverlay.classList.remove("flex");
    editingId = null;
    resetForm();
}

// Reset form
function resetForm() {
    itemForm.reset();
    inputQuantity.value = 1;
    selectedCategory = "";
    categoryBtns.forEach((btn) => {
        btn.classList.remove("border-blue-500", "bg-blue-50", "border-green-500", "bg-green-50", "border-orange-500", "bg-orange-50", "border-purple-500", "bg-purple-50", "border-gray-500", "bg-gray-50");
        btn.classList.add("border-gray-100");
    });
}

// Select category
function selectCategory(category) {
    selectedCategory = category;
    inputCategory.value = category;

    categoryBtns.forEach((btn) => {
        if (btn.dataset.category === category) {
            const colorMap = {
                Limpeza: "border-blue-500 bg-blue-50",
                Geladeira: "border-green-500 bg-green-50",
                Armário: "border-orange-500 bg-orange-50",
                Higiene: "border-purple-500 bg-purple-50",
                Outros: "border-gray-500 bg-gray-50",
            };
            btn.classList.remove("border-gray-100");
            btn.classList.add(...colorMap[category].split(" "));
        } else {
            btn.classList.remove("border-blue-500", "bg-blue-50", "border-green-500", "bg-green-50", "border-orange-500", "bg-orange-50", "border-purple-500", "bg-purple-50", "border-gray-500", "bg-gray-50");
            btn.classList.add("border-gray-100");
        }
    });
}

// Event Listeners
btnAddItem.addEventListener("click", () => openModal());
btnCloseModal.addEventListener("click", closeModal);
btnClearAll.addEventListener("click", clearAll);

modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
});

// Category selection
categoryBtns.forEach((btn) => {
    btn.addEventListener("click", () => selectCategory(btn.dataset.category));
});

// Category filter
categoryFilterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        currentFilter = btn.dataset.filter;
        categoryFilterBtns.forEach((b) => {
            b.classList.remove("border-blue-500", "bg-blue-50", "text-blue-600");
            b.classList.add("border-gray-100", "text-gray-600");
        });
        btn.classList.remove("border-gray-100", "text-gray-600");
        btn.classList.add("border-blue-500", "bg-blue-50", "text-blue-600");

        btnClearFilter.classList.toggle("hidden", currentFilter === "all");
        renderItems();
    });
});

btnClearFilter.addEventListener("click", () => {
    currentFilter = "all";
    categoryFilterBtns.forEach((b) => {
        b.classList.remove("border-blue-500", "bg-blue-50", "text-blue-600");
        b.classList.add("border-gray-100", "text-gray-600");
    });
    categoryFilterBtns[0].classList.remove("border-gray-100", "text-gray-600");
    categoryFilterBtns[0].classList.add("border-blue-500", "bg-blue-50", "text-blue-600");
    btnClearFilter.classList.add("hidden");
    renderItems();
});

// Quantity controls
btnIncreaseQty.addEventListener("click", () => {
    inputQuantity.value = parseInt(inputQuantity.value) + 1;
});

btnDecreaseQty.addEventListener("click", () => {
    if (parseInt(inputQuantity.value) > 1) {
        inputQuantity.value = parseInt(inputQuantity.value) - 1;
    }
});

// Form submit
itemForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!selectedCategory) {
        alert("Por favor, selecione uma categoria");
        return;
    }

    const itemData = {
        id: editingId || Date.now(),
        name: inputName.value.trim(),
        category: selectedCategory,
        quantity: parseInt(inputQuantity.value),
        price: parseFloat(inputPrice.value) || 0,
        checked: false,
    };

    if (editingId) {
        const index = items.findIndex((i) => i.id === editingId);
        if (index !== -1) {
            itemData.checked = items[index].checked;
            items[index] = itemData;
        }
    } else {
        items.push(itemData);
    }

    saveItems();
    renderItems();
    updateTotals();
    closeModal();
});

// Item actions (event delegation)
itemsList.addEventListener("click", (e) => {
    const actionBtn = e.target.closest("[data-action]");
    if (!actionBtn) return;

    const action = actionBtn.dataset.action;
    const id = parseInt(actionBtn.dataset.id);

    if (action === "toggle") {
        toggleItem(id);
    } else if (action === "delete") {
        deleteItem(id);
    } else if (action === "edit") {
        openModal(id);
    }
});

// Initialize
loadItems();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/service-worker.js")
    .then(() => console.log("Service Worker registrado"));
}