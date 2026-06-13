// 引入公共模块
import { loadView, showToast, getProductList } from '/web/utils/load_view.js';

// 加载视图
loadView('nav-products');

// 全局状态
let allProducts = [];
let allCategories = [];
let currentCategoryId = 'all';
let currentPage = 1;
const pageSize = 6;

// 渲染分类菜单
const renderCategoryMenu = () => {
  return `
    <div id="product-category" class=" lg:w-72 flex-shrink-0">
      <div class="bg-white rounded-xl shadow-md overflow-hidden">
        <div class="bg-[#4a6723] px-6 py-4">
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <i class="fas fa-folder-open"></i>
            产品分类
          </h3>
        </div>
        <ul class="divide-y divide-gray-100">
          <li>
            <a href="#" data-id="all" class="category-link ${currentCategoryId === 'all' ? 'active' : ''} flex items-center justify-between px-6 py-4 hover:bg-[#f0f0e8] transition-colors">
              <span>全部产品</span>
              <span class="text-gray-400 text-sm">${allProducts.length}</span>
            </a>
          </li>
          ${allCategories.map(category => {
            const count = allProducts.filter(p => p.product_category_id === category.id).length;
            return `
          <li>
            <a href="#" data-id="${category.id}" class="category-link ${currentCategoryId == category.id ? 'active' : ''} flex items-center justify-between px-6 py-4 hover:bg-[#f0f0e8] transition-colors">
              <span>${category.name}</span>
              <span class="text-gray-400 text-sm">${count}</span>
            </a>
          </li>
          `;}).join('')}
        </ul>
        <div class="px-6 py-8 shadow-md">
            <a href="#">
              咨询热线：<span>400-888-8888</span>
            </a>
        </div>
      </div>
    </div>
  `;
};

// 渲染产品卡片
const renderProductCard = (product) => {
  const coverImages = Array.isArray(product.thumb_img_urls)
    ? product.thumb_img_urls.filter(img => img && img.trim())
    : (product.thumb_img_urls ? [product.thumb_img_urls] : []);
  const coverImage = coverImages.length > 0 ? coverImages[0] : '';

  return `
    <div class="product-card bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-xl transition-shadow duration-300">
      <div class="relative overflow-hidden aspect-square">
        <img src="${coverImage}" alt="${product.title}"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
      </div>
      <div class="p-6">
        <h4 class="text-lg font-bold text-[#2c3a32] mb-2 group-hover:text-[#4a6723] transition-colors">${product.title}</h4>
        <p class="text-sm text-gray-500 mb-4 line-clamp-2">${product.intro || ''}</p>
        <a href="/web/views/detail/product.html?id=${product.id}" class="w-full flex justify-center items-center py-2.5 border border-[#4a6723] text-[#4a6723] font-medium rounded-lg hover:bg-[#4a6723] hover:text-white transition-all duration-300 text-sm tracking-wider">
          VIEW MORE +
        </a>
      </div>
    </div>
  `;
};

// 渲染分页器
const renderPagination = (totalItems) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  if (totalPages <= 1) return '';

  let pagesHtml = '';
  for (let i = 1; i <= totalPages; i++) {
    if (i === currentPage) {
      pagesHtml += `<button class="page-btn w-10 h-10 rounded-full bg-[#4a6723] text-white font-medium" data-page="${i}">${i}</button>`;
    } else {
      pagesHtml += `<button class="page-btn w-10 h-10 rounded-full border border-gray-200 text-gray-600 hover:bg-[#4a6723] hover:text-white hover:border-[#4a6723] transition-all duration-300" data-page="${i}">${i}</button>`;
    }
  }

  return `
    <div class="flex justify-center mt-12">
      <nav class="flex items-center gap-2">
        <button class="prev-btn w-10 h-10 rounded-full border border-gray-200 text-gray-500 hover:bg-[#4a6723] hover:text-white hover:border-[#4a6723] transition-all duration-300 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}">
          <i class="fas fa-chevron-left"></i>
        </button>
        ${pagesHtml}
        <button class="next-btn w-10 h-10 rounded-full border border-gray-200 text-gray-500 hover:bg-[#4a6723] hover:text-white hover:border-[#4a6723] transition-all duration-300 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}">
          <i class="fas fa-chevron-right"></i>
        </button>
      </nav>
    </div>
  `;
};

// 获取当前分类下的产品
const getFilteredProducts = () => {
  if (currentCategoryId === 'all') {
    return allProducts;
  }
  return allProducts.filter(p => p.product_category_id == currentCategoryId);
};

// 渲染产品区域
const renderProductArea = () => {
  const filteredProducts = getFilteredProducts();
  const totalItems = filteredProducts.length;

  if (totalItems === 0) {
    return `
      <div id="product-list" class="flex-1">
        <div class="text-center text-gray-500 py-12 bg-white rounded-xl">该分类下暂无产品</div>
      </div>
    `;
  }

  // 分页切片
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pageProducts = filteredProducts.slice(startIndex, endIndex);

  const categoryName = currentCategoryId === 'all'
    ? '全部产品'
    : (allCategories.find(c => c.id == currentCategoryId)?.name || '');

  return `
    <div id="product-list" class="flex-1">
      <h3 class="text-2xl font-bold text-[#2c3a32] mb-6 pb-3 border-b-2 border-[#4a6723]">${categoryName}</h3>
      <div class="grid grid-cols-2 lg:grid-cols-3 gap-6">
        ${pageProducts.map(product => renderProductCard(product)).join('')}
      </div>
      ${renderPagination(totalItems)}
    </div>
  `;
};

// 主渲染函数
const renderProducts = async () => {
  allProducts = await getProductList();

  if (!allProducts || allProducts.length === 0) {
    $('#products').html('<div class="text-center text-gray-500 py-12">暂无产品</div>');
    return;
  }

  // 提取分类列表
  allCategories = [...new Map(allProducts.map(product => [product.product_category_id, {
    id: product.product_category_id,
    name: product.product_category_name
  }])).values()];

  refreshUI();
};

// 刷新UI（不重新请求数据）
const refreshUI = () => {
  const html = `
    <div class="flex flex-col lg:flex-row gap-8">
      ${renderCategoryMenu()}
      ${renderProductArea()}
    </div>
  `;
  $('#products').html(html);
  bindEvents();
};

// 绑定事件
const bindEvents = () => {
  // 分类点击
  $(document).off('click', '.category-link').on('click', '.category-link', function(e) {
    e.preventDefault();
    const newCategoryId = $(this).data('id');
    if (newCategoryId === currentCategoryId) return;

    currentCategoryId = newCategoryId;
    currentPage = 1;
    refreshUI();
  });

  // 分页点击
  $(document).off('click', '.page-btn').on('click', '.page-btn', function(e) {
    e.preventDefault();
    const newPage = parseInt($(this).data('page'));
    if (newPage === currentPage) return;

    currentPage = newPage;
    refreshUI();
    // 滚动到产品列表顶部
    $('#product-list')[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // 上一页
  $(document).off('click', '.prev-btn').on('click', '.prev-btn', function(e) {
    e.preventDefault();
    if (currentPage > 1) {
      currentPage--;
      refreshUI();
      $('#product-list')[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  // 下一页
  $(document).off('click', '.next-btn').on('click', '.next-btn', function(e) {
    e.preventDefault();
    const totalPages = Math.ceil(getFilteredProducts().length / pageSize);
    if (currentPage < totalPages) {
      currentPage++;
      refreshUI();
      $('#product-list')[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

};

// DOM加载完成后初始化
$(function() {
  renderProducts();
});
