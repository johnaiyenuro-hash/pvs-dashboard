// Pinterest to Plate Client App (v5)
const STORES = {
  tesco: {
    name: "Tesco",
    btnClass: "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200",
    getUrl: (q) => `https://www.tesco.com/groceries/en-GB/search?query=${encodeURIComponent(q)}`
  },
  sainsburys: {
    name: "Sainsbury's",
    btnClass: "bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200",
    getUrl: (q) => `https://www.sainsburys.co.uk/gol-ui/SearchResults/${encodeURIComponent(q)}`
  },
  asda: {
    name: "Asda",
    btnClass: "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border-emerald-200",
    getUrl: (q) => `https://groceries.asda.com/search/${encodeURIComponent(q)}`
  },
  aldi: {
    name: "Aldi",
    btnClass: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200",
    getUrl: (q) => `https://groceries.aldi.co.uk/en-GB/Search?keywords=${encodeURIComponent(q)}`
  },
  lidl: {
    name: "Lidl",
    btnClass: "bg-sky-50 text-sky-700 hover:bg-sky-100 border-sky-200",
    getUrl: (q) => `https://www.lidl.co.uk/q/search?q=${encodeURIComponent(q)}`
  }
};

let recipes = [];
let selectedRecipeIds = new Set(['sliders', 'fondant_leeks', 'crispy_salmon_bites']);
let currentStore = 'tesco';
let hidePantry = false;
let currentCategory = 'all';
let searchQuery = '';
let pantryChecked = new Set(JSON.parse(localStorage.getItem('p2p_pantry_checked') || '[]'));

// DOM Elements
const recipeGrid = document.getElementById('recipe-grid');
const selectedBadge = document.getElementById('selected-count-badge');
const showingCountText = document.getElementById('showing-count-text');
const recipeSearch = document.getElementById('recipe-search');
const categoryPills = document.querySelectorAll('.category-pill');
const storeSelector = document.getElementById('store-selector');
const basketContent = document.getElementById('basket-content');
const basketItemCount = document.getElementById('basket-item-count');
const pantryCountLabel = document.getElementById('pantry-count-label');
const toggleHidePantry = document.getElementById('toggle-hide-pantry');
const btnShuffle = document.getElementById('btn-shuffle');
const btnClear = document.getElementById('btn-clear');
const btnOpenAll = document.getElementById('btn-open-all');
const btnCopyWhatsapp = document.getElementById('btn-copy-whatsapp');
const currentStoreBtnName = document.getElementById('current-store-btn-name');

// Sync Modal Elements
const syncModal = document.getElementById('sync-modal');
const btnOpenSync = document.getElementById('btn-open-sync');
const syncModalClose = document.getElementById('sync-modal-close');
const btnQuickSyncShalom = document.getElementById('btn-quick-sync-shalom');
const customBoardInput = document.getElementById('custom-board-input');
const btnImportUrl = document.getElementById('btn-import-url');
const syncStatus = document.getElementById('sync-status');

// Recipe Modal Elements
const recipeModal = document.getElementById('recipe-modal');
const modalClose = document.getElementById('modal-close');
const modalTitle = document.getElementById('modal-title');
const modalTag = document.getElementById('modal-tag');
const modalCreator = document.getElementById('modal-creator');
const modalIngredients = document.getElementById('modal-ingredients');
const modalInstructions = document.getElementById('modal-instructions');

// Init
async function init() {
  try {
    const res = await fetch('/api/recipes');
    if (res.ok) {
      recipes = await res.json();
    }
  } catch (err) {
    console.warn('API fetch failed, falling back to static recipes.json:', err);
  }

  if (!recipes || recipes.length === 0) {
    try {
      const fallbackRes = await fetch('recipes.json');
      if (fallbackRes.ok) {
        recipes = await fallbackRes.json();
      }
    } catch (e) {
      console.error('Fallback static fetch failed:', e);
    }
  }

  setupCategoryCounts();
  renderStores();
  renderRecipes();
  renderBasket();
}

// Compute counts for category pills
function setupCategoryCounts() {
  const getCount = (cat) => cat === 'all' ? recipes.length : recipes.filter(r => r.category === cat).length;
  
  const elAll = document.getElementById('count-all');
  const elQuick = document.getElementById('count-quick');
  const elComfort = document.getElementById('count-comfort');
  const elHealthy = document.getElementById('count-healthy');
  const elSoups = document.getElementById('count-soups');
  const elAppetizers = document.getElementById('count-appetizers');

  if (elAll) elAll.innerText = recipes.length;
  if (elQuick) elQuick.innerText = getCount('Quick & Easy');
  if (elComfort) elComfort.innerText = getCount('Comfort Food');
  if (elHealthy) elHealthy.innerText = getCount('Healthy & Veggie');
  if (elSoups) elSoups.innerText = getCount('Soups & Stews');
  if (elAppetizers) elAppetizers.innerText = getCount('Appetizers & Bites');
}

// Category Pill Click
categoryPills.forEach(pill => {
  pill.onclick = () => {
    categoryPills.forEach(p => {
      p.classList.remove('bg-slate-900', 'text-white', 'font-bold');
      p.classList.add('bg-slate-100', 'text-slate-700', 'font-semibold');
    });
    pill.classList.remove('bg-slate-100', 'text-slate-700', 'font-semibold');
    pill.classList.add('bg-slate-900', 'text-white', 'font-bold');

    currentCategory = pill.dataset.cat;
    renderRecipes();
  };
});

// Search input
recipeSearch.oninput = (e) => {
  searchQuery = e.target.value.toLowerCase().trim();
  renderRecipes();
};

// Render Supermarket Selector
function renderStores() {
  storeSelector.innerHTML = '';
  Object.keys(STORES).forEach(key => {
    const store = STORES[key];
    const isSelected = key === currentStore;
    const btn = document.createElement('button');
    btn.className = `py-2 px-1 text-center rounded-lg text-xs font-bold transition-all border ${
      isSelected 
        ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
    }`;
    btn.innerText = store.name;
    btn.onclick = () => {
      currentStore = key;
      currentStoreBtnName.innerText = store.name;
      renderStores();
      renderBasket();
    };
    storeSelector.appendChild(btn);
  });
}

// Filter recipes by Category and Search
function getFilteredRecipes() {
  return recipes.filter(r => {
    const matchesCat = currentCategory === 'all' || r.category === currentCategory;
    if (!matchesCat) return false;

    if (!searchQuery) return true;
    const inTitle = r.title.toLowerCase().includes(searchQuery);
    const inCreator = r.creator.toLowerCase().includes(searchQuery);
    const inIngredients = r.ingredients.some(ing => ing.name.toLowerCase().includes(searchQuery));
    return inTitle || inCreator || inIngredients;
  });
}

// Render Recipe Cards
function renderRecipes() {
  recipeGrid.innerHTML = '';
  const filtered = getFilteredRecipes();

  showingCountText.innerText = `Showing ${filtered.length} of ${recipes.length} recipes`;

  if (filtered.length === 0) {
    recipeGrid.innerHTML = `
      <div class="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
        <p class="font-bold text-slate-600">No recipes matched "${searchQuery}"</p>
        <p class="text-xs mt-1">Try searching for an ingredient like "chicken", "spinach", or "tofu".</p>
      </div>
    `;
    selectedBadge.innerText = `${selectedRecipeIds.size} selected`;
    return;
  }

  filtered.forEach(recipe => {
    const isSelected = selectedRecipeIds.has(recipe.id);
    const card = document.createElement('div');
    card.className = `group relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col cursor-pointer select-none ${
      isSelected 
        ? 'border-red-500 ring-2 ring-red-500/20 shadow-md' 
        : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
    }`;

    card.innerHTML = `
      <div class="relative h-44 bg-slate-100 overflow-hidden">
        <img src="${recipe.imageUrl}" alt="${recipe.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        <div class="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
          isSelected ? 'bg-red-600 text-white' : 'bg-white/80 backdrop-blur-sm text-transparent border border-white/50'
        }">
          <svg class="w-4 h-4 fill-current stroke-current" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </div>

        <div class="absolute bottom-3 left-3 flex items-center gap-1.5 flex-wrap">
          <span class="px-2 py-0.5 rounded-md text-[11px] font-bold bg-white/90 backdrop-blur-sm text-slate-900 shadow-sm">
            ${recipe.tag}
          </span>
          <span class="px-2 py-0.5 rounded-md text-[11px] font-medium bg-black/40 backdrop-blur-sm text-white">
            ⏱ ${recipe.prepTime}
          </span>
        </div>
      </div>

      <div class="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 class="font-bold text-slate-900 text-sm leading-snug group-hover:text-red-600 transition-colors">
            ${recipe.title}
          </h3>
          <p class="text-xs text-slate-400 mt-1">${recipe.creator} • ${recipe.servings} servings</p>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span class="text-xs text-slate-500 font-medium">${recipe.ingredients.length} ingredients</span>
          <button class="btn-view-steps text-xs font-semibold text-slate-600 hover:text-slate-900 underline underline-offset-2">
            View Steps
          </button>
        </div>
      </div>
    `;

    card.onclick = (e) => {
      if (e.target.classList.contains('btn-view-steps')) {
        openRecipeModal(recipe);
        return;
      }
      if (selectedRecipeIds.has(recipe.id)) {
        selectedRecipeIds.delete(recipe.id);
      } else {
        selectedRecipeIds.add(recipe.id);
      }
      renderRecipes();
      renderBasket();
    };

    recipeGrid.appendChild(card);
  });

  selectedBadge.innerText = `${selectedRecipeIds.size} selected`;
}

// Render Consolidated Basket
async function renderBasket() {
  const selectedList = Array.from(selectedRecipeIds);
  btnOpenAll.disabled = selectedList.length === 0;
  btnCopyWhatsapp.disabled = selectedList.length === 0;

  if (selectedList.length === 0) {
    basketItemCount.innerText = '0 items';
    basketContent.innerHTML = `
      <div class="text-center py-12 text-slate-400">
        <svg class="w-12 h-12 mx-auto stroke-slate-300 mb-3" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <p class="font-medium text-slate-600">No recipes selected</p>
        <p class="text-xs mt-1">Select meals on the left to generate your grocery list.</p>
      </div>
    `;
    return;
  }

  const res = await fetch('/api/consolidate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipeIds: selectedList })
  });
  const data = await res.json();
  const aisles = data.aisles || {};

  basketContent.innerHTML = '';
  let totalCount = 0;
  let pantryCount = 0;

  const currentStoreConfig = STORES[currentStore] || STORES.tesco;

  Object.keys(aisles).forEach(aisleName => {
    let items = aisles[aisleName];

    const filteredItems = items.filter(item => {
      const isMarkedPantry = item.isPantry || pantryChecked.has(item.search);
      if (item.isPantry) pantryCount++;
      return !(hidePantry && isMarkedPantry);
    });

    if (filteredItems.length === 0) return;
    totalCount += filteredItems.length;

    const aisleBlock = document.createElement('div');
    aisleBlock.className = 'space-y-2';

    const aisleEmoji = getAisleEmoji(aisleName);
    aisleBlock.innerHTML = `
      <div class="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider pb-1 border-b border-slate-100">
        <span>${aisleEmoji} ${aisleName}</span>
        <span class="text-slate-400 font-normal">(${filteredItems.length})</span>
      </div>
    `;

    const ul = document.createElement('ul');
    ul.className = 'space-y-2';

    filteredItems.forEach(item => {
      const isChecked = pantryChecked.has(item.search);
      const storeSearchUrl = currentStoreConfig.getUrl(item.search);

      const li = document.createElement('li');
      li.className = `p-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 text-sm ${
        isChecked 
          ? 'bg-slate-50 border-slate-200 opacity-60' 
          : 'bg-white border-slate-200/70 hover:border-slate-300 shadow-sm'
      }`;

      li.innerHTML = `
        <div class="flex items-center gap-2.5 flex-1 min-w-0">
          <input type="checkbox" ${isChecked ? 'checked' : ''} class="item-pantry-checkbox w-4 h-4 rounded text-slate-800 border-slate-300 focus:ring-slate-500 cursor-pointer">
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <span class="font-semibold text-slate-800 truncate ${isChecked ? 'line-through text-slate-400' : ''}">${item.name}</span>
              <span class="text-xs text-slate-500 font-medium whitespace-nowrap bg-slate-100 px-1.5 py-0.5 rounded">${item.combinedQty}</span>
            </div>
            <div class="text-[11px] text-slate-400 truncate">
              For: ${item.fromRecipes.join(', ')}
            </div>
          </div>
        </div>

        <a href="${storeSearchUrl}" target="_blank" rel="noopener noreferrer" 
           class="supermarket-link inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all shadow-sm ${currentStoreConfig.btnClass}">
          <span>Find in ${currentStoreConfig.name}</span>
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      `;

      const link = li.querySelector('.supermarket-link');
      link.onclick = (e) => e.stopPropagation();

      const checkbox = li.querySelector('.item-pantry-checkbox');
      checkbox.onchange = (e) => {
        if (e.target.checked) {
          pantryChecked.add(item.search);
        } else {
          pantryChecked.delete(item.search);
        }
        localStorage.setItem('p2p_pantry_checked', JSON.stringify(Array.from(pantryChecked)));
        renderBasket();
      };

      ul.appendChild(li);
    });

    aisleBlock.appendChild(ul);
    basketContent.appendChild(aisleBlock);
  });

  basketItemCount.innerText = `${totalCount} needed`;
  pantryCountLabel.innerText = `${pantryCount} staples detected`;
}

function getAisleEmoji(aisle) {
  if (aisle.includes('Produce')) return '🥬';
  if (aisle.includes('Meat') || aisle.includes('Poultry')) return '🍗';
  if (aisle.includes('Dairy') || aisle.includes('Chilled')) return '🧀';
  if (aisle.includes('Bakery')) return '🥖';
  if (aisle.includes('Pantry') || aisle.includes('Cupboard')) return '🥫';
  if (aisle.includes('Frozen')) return '❄️';
  return '🛒';
}

// Pinterest Sync Modal Handlers
btnOpenSync.onclick = () => {
  syncModal.classList.remove('hidden');
};
syncModalClose.onclick = () => {
  syncModal.classList.add('hidden');
};

// Direct Board & Pin Sync Handler (Zero Tokens)
async function executeImport(targetUrl, triggerBtn) {
  const originalText = triggerBtn.innerHTML;
  triggerBtn.disabled = true;
  triggerBtn.innerHTML = '<span>⏳</span><span>Syncing Recipes...</span>';
  syncStatus.classList.remove('hidden');
  syncStatus.innerText = 'Connecting directly to Pinterest board feed... (No API tokens required)';

  try {
    const res = await fetch('/api/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: targetUrl })
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Failed to import recipes');
    }

    const count = data.newImported || data.count || (data.recipes ? data.recipes.length : 0);
    syncStatus.innerText = `🎉 Successfully synced ${count} recipes! Reloading meal planner...`;
    triggerBtn.innerHTML = '<span>✅</span><span>Import Complete!</span>';

    if (data.recipes && data.recipes.length > 0) {
      recipes = data.recipes;
      setupCategoryCounts();
      renderStores();
      renderRecipes();
      renderBasket();
    } else {
      await init();
    }

    setTimeout(() => {
      syncModal.classList.add('hidden');
      triggerBtn.disabled = false;
      triggerBtn.innerHTML = originalText;
      syncStatus.classList.add('hidden');
    }, 1800);
  } catch (err) {
    alert(`Import notice: ${err.message}`);
    triggerBtn.disabled = false;
    triggerBtn.innerHTML = originalText;
    syncStatus.classList.add('hidden');
  }
}

if (btnQuickSyncShalom) {
  btnQuickSyncShalom.onclick = () => {
    executeImport('https://uk.pinterest.com/shalom_x/food', btnQuickSyncShalom);
  };
}

if (btnImportUrl) {
  btnImportUrl.onclick = () => {
    const url = (customBoardInput.value || '').trim();
    if (!url) {
      alert('Please enter a Pinterest board link or recipe URL');
      return;
    }
    executeImport(url, btnImportUrl);
  };
}

// Open Recipe Modal
function openRecipeModal(recipe) {
  modalTitle.innerText = recipe.title;
  modalTag.innerText = recipe.tag;
  modalCreator.innerText = `${recipe.creator} • Prep: ${recipe.prepTime} • ${recipe.servings} servings`;
  
  modalIngredients.innerHTML = recipe.ingredients.map(ing => 
    `<li>• <strong>${ing.qty}</strong> ${ing.name}</li>`
  ).join('');

  modalInstructions.innerHTML = recipe.instructions.map(step => 
    `<li>${step}</li>`
  ).join('');

  recipeModal.classList.remove('hidden');
}

modalClose.onclick = () => recipeModal.classList.add('hidden');
window.onclick = (e) => { 
  if (e.target === recipeModal) recipeModal.classList.add('hidden');
  if (e.target === syncModal) syncModal.classList.add('hidden');
};

// Shuffle / Pick 3
btnShuffle.onclick = () => {
  const allIds = recipes.map(r => r.id);
  const shuffled = [...allIds].sort(() => 0.5 - Math.random()).slice(0, 3);
  selectedRecipeIds = new Set(shuffled);
  renderRecipes();
  renderBasket();
};

// Clear
btnClear.onclick = () => {
  selectedRecipeIds.clear();
  renderRecipes();
  renderBasket();
};

// Toggle Hide Pantry
toggleHidePantry.onchange = (e) => {
  hidePantry = e.target.checked;
  renderBasket();
};

// Open All Missing Items
btnOpenAll.onclick = async () => {
  const currentStoreConfig = STORES[currentStore] || STORES.tesco;
  const res = await fetch('/api/consolidate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipeIds: Array.from(selectedRecipeIds) })
  });
  const data = await res.json();
  const aisles = data.aisles || {};

  const itemsToOpen = [];
  Object.values(aisles).forEach(items => {
    items.forEach(item => {
      const isMarked = item.isPantry || pantryChecked.has(item.search);
      if (!isMarked) {
        itemsToOpen.push(item.search);
      }
    });
  });

  if (itemsToOpen.length === 0) {
    alert('All items are already marked as in your pantry!');
    return;
  }

  const firstUrl = currentStoreConfig.getUrl(itemsToOpen[0]);
  window.open(firstUrl, '_blank');

  if (itemsToOpen.length > 1) {
    for (let i = 1; i < Math.min(itemsToOpen.length, 4); i++) {
      window.open(currentStoreConfig.getUrl(itemsToOpen[i]), '_blank');
    }
    setTimeout(() => {
      alert(`Opened top search tabs in ${currentStoreConfig.name}.\n\nTip: If your browser blocked popups, click the "Pop-ups blocked" icon in your URL address bar to allow Pinterest to Plate.`);
    }, 400);
  }
};

// Copy for WhatsApp
btnCopyWhatsapp.onclick = async () => {
  const currentStoreConfig = STORES[currentStore] || STORES.tesco;
  const res = await fetch('/api/consolidate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipeIds: Array.from(selectedRecipeIds) })
  });
  const data = await res.json();
  const aisles = data.aisles || {};

  let text = `🛒 *Pinterest to Plate Grocery List*\n`;
  text += `📍 Store: *${currentStoreConfig.name}*\n`;
  text += `🍽 Meals: ${Array.from(selectedRecipeIds).map(id => recipes.find(r => r.id === id)?.title).filter(Boolean).join(', ')}\n\n`;

  Object.keys(aisles).forEach(aisleName => {
    const items = aisles[aisleName].filter(item => !pantryChecked.has(item.search));
    if (items.length > 0) {
      text += `${getAisleEmoji(aisleName)} *${aisleName.toUpperCase()}*\n`;
      items.forEach(item => {
        const itemUrl = currentStoreConfig.getUrl(item.search);
        text += `  • [ ] ${item.name} (${item.combinedQty})\n    🔗 ${itemUrl}\n`;
      });
      text += `\n`;
    }
  });

  text += `\nGenerated with Pinterest to Plate ✨`;

  try {
    await navigator.clipboard.writeText(text);
    const oldText = btnCopyWhatsapp.innerText;
    btnCopyWhatsapp.innerText = '✅ Copied to Clipboard (with links)!';
    setTimeout(() => { btnCopyWhatsapp.innerText = oldText; }, 2500);
  } catch (err) {
    prompt('Copy your WhatsApp shopping list below:', text);
  }
};

// Run!
init();
