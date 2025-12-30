function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  const feedback = document.getElementById('formFeedback');

  if(contactForm) {
    contactForm.addEventListener('submit', function(event) {
      event.preventDefault();

      const btn = contactForm.querySelector('.submit-btn');
      btn.textContent = 'Skickar...';

      const serviceID = 'service_adhpula';
      const templateID = 'template_cfr004h';
      const publicKey = 'CA0PLqzCq8Q01nW_X';

      emailjs.sendForm(serviceID, templateID, this, publicKey)
        .then(() => {
          contactForm.style.display = 'none';
          feedback.classList.remove('hidden');
        }, (error) => {
          alert('Det gick inte att skicka: ' + JSON.stringify(error));
          btn.textContent = 'Submit';
        });
    });
  }
}


function loadHeader() {
    fetch('templates/fragments/header.html') 
        .then(response => {
            if (!response.ok) throw new Error("Kunde inte ladda headern");
            return response.text();
        })
        .then(data => {
            document.getElementById('header-placeholder').innerHTML = data;
            renderDynamicMainCategories();
        })
        .catch(error => console.error('Fel:', error));
}

window.addEventListener('DOMContentLoaded', () => {
  loadHeader();
  initContactForm();
  initAdminPage();
  initSubcategoryProducts();
});



function checkLogin() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const error = document.getElementById('error-msg');
  
  if (username === "admin" & password === "admin") {
    localStorage.setItem("isLoggedIn", true);

    // Just nu hänvisar lyckad-login till "index.html", detta skall ändras till rätt html sida när den skapas. 
    window.location.href = "admin.html"; 
  } else {
    error.innerText = "Wrong credentials, try again"
  }
}



function slugifyCategoryName(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'category';
}

function getDynamicMainCategories() {
  const raw = localStorage.getItem('dynamicMainCategories');
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      if (parsed.length && typeof parsed[0] === 'object') {
        return parsed;
      }
      // Bakåtkompatibel: lista med bara namn
      return parsed.map(name => ({
        name,
        slug: slugifyCategoryName(name)
      }));
    }
    return [];
  } catch (e) {
    return [];
  }
}


function saveDynamicMainCategories(list) {
  localStorage.setItem('dynamicMainCategories', JSON.stringify(list));
}

function renderDynamicMainCategories() {
  const nav = document.querySelector('.nav-links');
  if (!nav) return;

  nav.querySelectorAll('.dynamic-main').forEach(li => li.remove());

  const categories = getDynamicMainCategories();
  categories.forEach(cat => {
    const li = document.createElement('li');
    li.classList.add('dynamic-main');
    const a = document.createElement('a');
    a.href = "category.html?cat=" + encodeURIComponent(cat.slug);
    a.textContent = cat.name;
    li.appendChild(a);
    nav.appendChild(li);
  });
}


// ======== PRODUKTER PER KATEGORI ========

function getDynamicProducts() {
  const raw = localStorage.getItem('dynamicProducts');
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (e) {
    return {};
  }
}

function saveDynamicProducts(map) {
  localStorage.setItem('dynamicProducts', JSON.stringify(map));
}

function initSubcategoryProducts() {
  const grid = document.querySelector('.product-grid');
  if (!grid) return;

  const filename = location.pathname.split('/').pop().toLowerCase();
  const slug = filename.replace('.html', '');
  const all = getDynamicProducts();
  const list = all[slug] || [];

  list.forEach(p => {
    const card = document.createElement('article');
    card.className = 'product-card dynamic-product';
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}" loading="lazy">
      <div class="product-body">
        <h3 class="product-name">${p.name}</h3>
        <div class="product-meta">
          <span>In stock</span>
          <span>${p.price}</span>
        </div>
        <a class="product-btn" href="#">View</a>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ======== ADMIN PAGE ========

function initAdminPage() {
  const adminLoginBox = document.querySelector('.login-admin');
  const adminPanel = document.getElementById('category-admin');
  const productPanel = document.getElementById('product-admin');

  // om vi inte är på admin-sidan, gör inget
  if (!adminLoginBox && !adminPanel && !productPanel) return;

  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  if (isLoggedIn) {
    const bar=document.getElementById('logout-bar');
    if(bar) bar.classList.remove('hidden');
    const btn=document.getElementById('logout-btn');
    if(btn) btn.onclick=logout;
    if (adminLoginBox) adminLoginBox.style.display = 'none';
    if (adminPanel) adminPanel.classList.remove('hidden');
    if (productPanel) productPanel.classList.remove('hidden');
    setupCategoryAdmin();
    initAdminProductForm();
  } else {
    if (adminPanel) adminPanel.classList.add('hidden');
    if (productPanel) productPanel.classList.add('hidden');
    if (adminLoginBox) adminLoginBox.style.display = 'block';
  }
}


function setupCategoryAdmin() {
  const input = document.getElementById('new-category-name');
  const btn = document.getElementById('add-category-btn');
  const listEl = document.getElementById('category-list');

  if (!input || !btn || !listEl) return;

  function renderList() {
    const categories = getDynamicMainCategories();
    listEl.innerHTML = '';

    categories.forEach((cat, index) => {
      const li = document.createElement('li');
      li.textContent = cat.name;

      const removeBtn = document.createElement('button');
      removeBtn.textContent = 'Ta bort';
      removeBtn.type = 'button';
      removeBtn.addEventListener('click', () => {
        const current = getDynamicMainCategories();
        const removed = current.splice(index, 1)[0];
        saveDynamicMainCategories(current);

        if (removed && removed.slug) {
          const all = getDynamicProducts();
          delete all[removed.slug];
          saveDynamicProducts(all);
        }

        renderDynamicMainCategories();
        renderDynamicProductAdminList();
        populateDynamicCategoryOptions();
        renderList();
      });

      li.appendChild(removeBtn);
      listEl.appendChild(li);
    });
  }

  btn.addEventListener('click', () => {
    const value = input.value.trim();
    if (!value) return;

    const categories = getDynamicMainCategories();
    const slug = slugifyCategoryName(value);
    categories.push({ name: value, slug });
    saveDynamicMainCategories(categories);

    input.value = '';
    renderDynamicMainCategories();
    populateDynamicCategoryOptions();
    renderList();
  });

  renderList();
}


function initAdminProductForm() {
  const form = document.getElementById('product-form');
  if (!form) return;

  const select = document.getElementById('product-category');
  const nameInput = document.getElementById('product-name');
  const priceInput = document.getElementById('product-price');
  const imageInput = document.getElementById('product-image');

  populateDynamicCategoryOptions();
  renderDynamicProductAdminList();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const slug = select.value;
    const name = nameInput.value.trim();
    const price = priceInput.value.trim();
    const image = imageInput.value.trim();

    if (!slug || !name || !price || !image) return;

    const all = getDynamicProducts();
    if (!Array.isArray(all[slug])) {
      all[slug] = [];
    }
    all[slug].push({ name, price, image });
    saveDynamicProducts(all);

    alert('Produkten lades till!');
    nameInput.value = '';
    priceInput.value = '';
    imageInput.value = '';

    renderDynamicProductAdminList();
  });
}

function populateDynamicCategoryOptions() {
  const select = document.getElementById('product-category');
  const group = document.getElementById('dynamic-main-options');
  if (!select || !group) return;

  group.innerHTML = '';
  const cats = getDynamicMainCategories();
  cats.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat.slug;
    opt.textContent = cat.name;
    group.appendChild(opt);
  });
}

function renderDynamicProductAdminList() {
  const container = document.getElementById('product-list-admin');
  if (!container) return;

  const all = getDynamicProducts();
  const cats = getDynamicMainCategories();
  const nameBySlug = {};
  cats.forEach(cat => { nameBySlug[cat.slug] = cat.name; });

  container.innerHTML = '';

  const slugs = Object.keys(all);
  if (!slugs.length) {
    container.textContent = 'Inga dynamiska produkter tillagda ännu.';
    return;
  }

  slugs.forEach(slug => {
    const list = all[slug];
    if (!Array.isArray(list) || !list.length) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'admin-product-group';

    const title = document.createElement('h4');
    title.textContent = nameBySlug[slug] || slug;
    wrapper.appendChild(title);

    const ul = document.createElement('ul');

    list.forEach((p, index) => {
      const li = document.createElement('li');
      li.textContent = p.name + ' – ' + p.price;

      const btn = document.createElement('button');
      btn.textContent = 'Ta bort';
      btn.type = 'button';
      btn.addEventListener('click', () => {
        const allProducts = getDynamicProducts();
        if (Array.isArray(allProducts[slug])) {
          allProducts[slug].splice(index, 1);
          if (!allProducts[slug].length) {
            delete allProducts[slug];
          }
          saveDynamicProducts(allProducts);
        }
        renderDynamicProductAdminList();
      });

      li.appendChild(btn);
      ul.appendChild(li);
    });

    wrapper.appendChild(ul);
    container.appendChild(wrapper);
  });
}



function logout() {
  const bar=document.getElementById('logout-bar');
  if(bar) bar.classList.add('hidden');
  localStorage.removeItem('isLoggedIn');
  window.location.href = 'index.html';
}
