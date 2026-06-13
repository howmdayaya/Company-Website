// 引入公共模块
import { loadView, showToast, getArticleList } from '/web/utils/load_view.js';

// 加载视图
loadView('nav-news');

// 全局状态
let allArticles = [];
let allCategories = [];
let currentCategoryId = 'all';
let currentPage = 1;
const pageSize = 4;

// 渲染分类菜单
const renderCategoryMenu = () => {
  return `
    <div id="news-category" class="lg:w-72 flex-shrink-0">
      <div class="bg-white rounded-xl shadow-md overflow-hidden">
        <div class="bg-[#4a6723] px-6 py-4">
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <i class="fas fa-newspaper"></i>
            新闻分类
          </h3>
        </div>
        <ul class="divide-y divide-gray-100">
          <li>
            <a href="#" data-id="all" class="category-link ${currentCategoryId === 'all' ? 'active' : ''} flex items-center justify-between px-6 py-4 hover:bg-[#f0f0e8] transition-colors">
              <span>全部新闻</span>
              <span class="text-gray-400 text-sm">${allArticles.length}</span>
            </a>
          </li>
          ${allCategories.map(category => {
            const count = allArticles.filter(p => p.article_category_id === category.id).length;
            return `
          <li>
            <a href="#" data-id="${category.id}" class="category-link ${currentCategoryId == category.id ? 'active' : ''} flex items-center justify-between px-6 py-4 hover:bg-[#f0f0e8] transition-colors">
              <span>${category.name}</span>
              <span class="text-gray-400 text-sm">${count}</span>
            </a>
          </li>
          `;}).join('')}
        </ul>
      </div>

      <!-- 联系我们卡片 -->
      <div class="bg-white rounded-xl shadow-md overflow-hidden mt-6">
        <div class="bg-[#2c3a32] px-6 py-4">
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <i class="fas fa-headset"></i>
            联系我们
          </h3>
        </div>
        <div class="p-6 space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-[#f0f0e8] flex items-center justify-center">
              <i class="fas fa-phone text-[#4a6723]"></i>
            </div>
            <div>
              <p class="text-sm text-gray-500">咨询热线</p>
              <p class="text-[#2c3a32] font-medium">400-888-8888</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-[#f0f0e8] flex items-center justify-center">
              <i class="fas fa-envelope text-[#4a6723]"></i>
            </div>
            <div>
              <p class="text-sm text-gray-500">电子邮箱</p>
              <p class="text-[#2c3a32] font-medium">info@hzz.com</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-[#f0f0e8] flex items-center justify-center">
              <i class="fas fa-clock text-[#4a6723]"></i>
            </div>
            <div>
              <p class="text-sm text-gray-500">工作时间</p>
              <p class="text-[#2c3a32] font-medium">周一至周五 9:00-18:00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
};

// 渲染新闻卡片
const renderNewsCard = (article) => {
  const coverImages = Array.isArray(article.coverfile)
    ? article.coverfile.filter(img => img && img.trim())
    : (article.coverfile ? [article.coverfile] : []);
  const coverImage = coverImages.length > 0 ? coverImages[0] : '';
  const publishDate = article.update_time ? article.update_time : article.publish_time;

  return `
    <article data-id="${article.id}" class="news-card bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-xl transition-shadow duration-300">
      <div class="flex flex-col md:flex-row">
        <div class="md:w-72 h-52 md:h-auto overflow-hidden flex-shrink-0">
          <img src="${coverImage}" alt="${article.title}"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onerror="this.src='/web/assets/images/placeholder.png'">
        </div>
        <div class="flex-1 p-6 flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-3 mb-3">
              <span class="px-3 py-1 bg-[#f0f0e8] text-[#4a6723] text-xs font-medium rounded-full">${article.article_category_name || '新闻'}</span>
              <span class="text-gray-400 text-sm flex items-center gap-1">
                <i class="far fa-calendar-alt"></i>
                ${publishDate}
              </span>
            </div>
            <h4 class="text-xl font-bold text-[#2c3a32] mb-3 group-hover:text-[#4a6723] transition-colors line-clamp-1">${article.title}</h4>
            <p class="text-gray-500 text-sm line-clamp-3">${article.intro || article.content?.substring(0, 150) || ''}</p>
          </div>
          <a href="/web/views/detail/article.html?id=${article.id}" class="self-start mt-4 px-6 py-2.5 border border-[#4a6723] text-[#4a6723] font-medium rounded-lg hover:bg-[#4a6723] hover:text-white transition-all duration-300 text-sm tracking-wider flex items-center gap-2">
            阅读全文
            <i class="fas fa-arrow-right text-xs"></i>
          </a>
        </div>
      </div>
    </article>
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

// 获取当前分类下的文章
const getFilteredArticles = () => {
  if (currentCategoryId === 'all') {
    return allArticles;
  }
  return allArticles.filter(p => p.article_category_id == currentCategoryId);
};

// 渲染新闻区域
const renderNewsArea = () => {
  const filteredArticles = getFilteredArticles();
  const totalItems = filteredArticles.length;

  if (totalItems === 0) {
    return `
      <div id="news-list" class="flex-1">
        <div class="text-center text-gray-500 py-12 bg-white rounded-xl">该分类下暂无新闻</div>
      </div>
    `;
  }

  // 分页切片
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pageArticles = filteredArticles.slice(startIndex, endIndex);

  const categoryName = currentCategoryId === 'all'
    ? '全部新闻'
    : (allCategories.find(c => c.id == currentCategoryId)?.name || '');

  return `
    <div id="news-list" class="flex-1">
      <h3 class="text-2xl font-bold text-[#2c3a32] mb-6 pb-3 border-b-2 border-[#4a6723]">${categoryName}</h3>
      <div class="space-y-6">
        ${pageArticles.map(article => renderNewsCard(article)).join('')}
      </div>
      ${renderPagination(totalItems)}
    </div>
  `;
};

// 主渲染函数
const renderNews = async () => {
  allArticles = await getArticleList();

  if (!allArticles || allArticles.length === 0) {
    $('#news').html('<div class="text-center text-gray-500 py-12">暂无新闻</div>');
    return;
  }

  // 提取分类列表
  allCategories = [...new Map(allArticles.map(article => [article.article_category_id, {
    id: article.article_category_id,
    name: article.article_category_name
  }])).values()];

  refreshUI();
};

// 刷新UI
const refreshUI = () => {
  const html = `
    <div class="flex flex-col lg:flex-row gap-8">
      ${renderCategoryMenu()}
      ${renderNewsArea()}
    </div>
  `;
  $('#news').html(html);
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
    $('#news-list')[0]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // 上一页
  $(document).off('click', '.prev-btn').on('click', '.prev-btn', function(e) {
    e.preventDefault();
    if (currentPage > 1) {
      currentPage--;
      refreshUI();
      $('#news-list')[0]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  // 下一页
  $(document).off('click', '.next-btn').on('click', '.next-btn', function(e) {
    e.preventDefault();
    const totalPages = Math.ceil(getFilteredArticles().length / pageSize);
    if (currentPage < totalPages) {
      currentPage++;
      refreshUI();
      $('#news-list')[0]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  // 阅读全文按钮
  $(document).off('click', '.news-card button').on('click', '.news-card button', function(e) {
    e.preventDefault();
    const newsTitle = $(this).closest('.news-card').find('h4').text();
    showToast(`查看新闻: ${newsTitle}`, 'info');
  });
};

// DOM加载完成后初始化
$(function() {
  renderNews();
});
