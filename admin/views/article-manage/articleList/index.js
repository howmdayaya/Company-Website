/* 文章列表页
  

*/


// 引入公共模块
import { loadView, showToast, showConfirm } from '/admin/utils/load_view.js';

// 加载视图
loadView('nav-article-list');

// 分页状态
let currentPage = 1;
let totalPages = 1;
const pageSize = 5;
let currentCategory = ''; // 当前选中的分类

// 加载分类列表
const loadCategories = async () => {
  try {
    const response = await fetch('http://localhost:5050/article_categorys');
    const categories = await response.json();
    
    // 清空并添加默认选项
    const $select = $('#articleCategory');
    $select.html('<option value="">全部分类</option>');
    
    // 递归添加分类（支持多级）
    const addOptions = (items, parentId = 0, level = 0) => {
      items.filter(item => item.parent_id === parentId).forEach(item => {
        const prefix = '- '.repeat(level);
        $select.append(`<option value="${item.id}">${prefix}${item.name}</option>`);
        const children = categories.filter(c => c.parent_id === item.id);
        if (children.length > 0) {
          addOptions(categories, item.id, level + 1);
        }
      });
    };
    
    addOptions(categories);
  } catch (error) {
    console.error('加载分类失败:', error);
  }
};

// 渲染文章列表
const renderArticleList = async (page = 1, category = '') => {
  const articleList = $('#articleList');
  articleList.empty();
  
  // 更新当前状态
  currentPage = page;
  currentCategory = category;

  try {
    // 获取所有文章数据
    const allResponse = await fetch('http://localhost:5050/articles');
    const allData = await allResponse.json();
    
    // 分类筛选
    const filteredData = category 
      ? allData.filter(item => item.article_category_id == category)
      : allData;
    
    // 按时间排序，新添加的文章排前面（优先按更新时间，其次按发布时间）
    filteredData.sort((a, b) => {
      const timeA = a.update_time || a.publish_time || '';
      const timeB = b.update_time || b.publish_time || '';
      return timeB.localeCompare(timeA);
    });
    
    // 计算总页数
    totalPages = Math.ceil(filteredData.length / pageSize);
    currentPage = Math.min(page, Math.max(1, totalPages));
    
    // 如果没有数据
    if (filteredData.length === 0) {
      articleList.html('<div class="text-gray-500 text-center py-12">暂无文章</div>');
      renderPagination();
      return;
    }
    
    // 获取当前页数据
    const startIndex = (currentPage - 1) * pageSize;
    const list = filteredData.slice(startIndex, startIndex + pageSize);
    
    articleList.html(list.map(item => `
    <article class="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6">
      <div class="flex flex-col sm:flex-row gap-6">
        <div class="sm:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
          ${(() => {
            const coverImages = Array.isArray(item.coverfile) ? item.coverfile.filter(img => img && img.trim()) : (item.coverfile ? [item.coverfile] : []);
            const coverImage = coverImages.length > 0 ? coverImages[0] : null;
            return coverImage ? `<img src="${coverImage}" alt="${item.title}" class="w-full h-full object-cover">` : '<i class="fas fa-image w-full h-full flex items-center justify-center text-white text-3xl"></i>';
          })()}
        </div>
        <div class="flex-1 flex flex-col justify-between min-w-0">
          <div class="flex items-start justify-between gap-4">
            <h3 class="text-lg font-semibold text-gray-800 hover:text-blue-600 cursor-pointer truncate">
              ${item.title}
            </h3>
            <span class="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full flex-shrink-0">
              ${item.article_category_name || '未分类'}
            </span>
          </div>
          <p class="text-gray-500 text-sm mt-2 line-clamp-2">
            ${item.intro || '暂无简介'}
          </p>
          <div class="flex items-center justify-between mt-4 text-sm text-gray-400">
            <div class="flex items-center gap-4">
              <span class="flex items-center gap-1">
                <i class="fas fa-user"></i>
                <span>${item.author}</span>
              </span>
              <span class="flex items-center gap-1">
                <i class="fas fa-calendar"></i>
                <span>${item.update_time || item.publish_time || ''}</span>
              </span>
              <span class="flex items-center gap-1">
                <i class="fas fa-mouse-pointer"></i>
                <span>${item.click_times || 0}</span>
              </span>
            </div>
            <div class="flex items-center gap-2">
              <button class="view-btn p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" data-id="${item.id}">
                <i class="fas fa-eye"></i>
              </button>
              <button class="edit-btn p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" data-id="${item.id}">
                <i class="fas fa-edit"></i>
              </button>
              <button class="delete-btn p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" data-id="${item.id}" data-title="${item.title}">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  `).join('\n'));
    renderPagination();
  } catch (error) {
    console.error('加载文章列表失败:', error);
    articleList.html('<div class="text-gray-500 text-center py-12">加载失败</div>');
  }
};

// 渲染分页组件
const renderPagination = () => {
  const $pagination = $('#pagination');
  $pagination.empty();
  
  // 如果没有数据，不显示分页
  if (totalPages === 0) {
    return;
  }
  
  let paginationHTML = '';
  
  // 上一页按钮
  paginationHTML += `
    <button class="page-btn px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${currentPage === 1 ? 'disabled' : ''}" data-page="${currentPage - 1}">
      <i class="fas fa-chevron-left"></i>
    </button>
  `;
  
  // 页码按钮
  for (let i = 1; i <= totalPages; i++) {
    paginationHTML += `
      <button class="page-btn px-4 py-2 text-sm font-medium border ${currentPage === i 
        ? 'text-white bg-blue-600 border-blue-600 hover:bg-blue-700' 
        : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'}" data-page="${i}">
        ${i}
      </button>
    `;
  }
  
  // 下一页按钮
  paginationHTML += `
    <button class="page-btn px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${currentPage === totalPages ? 'disabled' : ''}" data-page="${currentPage + 1}">
      <i class="fas fa-chevron-right"></i>
    </button>
  `;
  
  $pagination.html(paginationHTML);
};

// 预览文章
const previewArticle = async (id) => {
  try {
    const response = await fetch(`http://localhost:5050/articles/${id}`);
    const article = await response.json();
    
    const previewContent = `
      <div class="prose max-w-none">
        <h1 class="text-2xl font-bold text-gray-800 mb-4">${article.title}</h1>
        <div class="flex items-center gap-4 text-sm text-gray-400 mb-6">
          <span class="flex items-center gap-1">
            <i class="fas fa-user"></i>
            ${article.author}
          </span>
          <span class="flex items-center gap-1">
            <i class="fas fa-calendar"></i>
            ${article.update_time || article.publish_time || ''}
          </span>
          <span class="flex items-center gap-1">
            <i class="fas fa-eye"></i>
            ${article.click_times || 0}
          </span>
          <span class="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full">
            ${article.article_category_name || '未分类'}
          </span>
        </div>
        <!-- ${(() => {
          const coverImages = Array.isArray(article.coverfile) ? article.coverfile.filter(img => img && img.trim()) : (article.coverfile ? [article.coverfile] : []);
          const coverImage = coverImages.length > 0 ? coverImages[0] : null;
          return coverImage ? `<img src="${coverImage}" alt="${article.title}" class="w-full h-64 object-cover rounded-lg mb-6">` : '';
        })()} -->
        ${article.intro ? `<div class="border-l-4 border-blue-500 pl-4 text-gray-500 text-sm my-2">${article.intro}</div>` : ''}
        <div class="text-gray-700 leading-relaxed">${article.content || '暂无内容'}</div>
      </div>
    `;
    
    $('#previewContent').html(previewContent);
    $('#previewModal').show();
    $('#previewOverlay').show();
    $('body').css('overflow', 'hidden');
    // 触发淡入动画
    setTimeout(() => {
      $('#previewModal').find('.bg-white').removeClass('opacity-0');
    }, 10);
  } catch (error) {
    console.error('预览文章失败:', error);
    showToast('预览文章失败', 'error');
  }
};

// 关闭预览模态框
const closePreviewModal = () => {
  // 添加淡出动画
  $('#previewModal').find('.bg-white').addClass('opacity-0');
  setTimeout(() => {
    $('#previewModal').hide();
    $('#previewOverlay').hide();
    $('body').css('overflow', '');
  }, 300);
};

// 编辑文章 - 获取文章信息并显示模态框




// 删除文章
const deleteArticle = async (id, title) => {
  if (!await showConfirm({
    title: '删除确认',
    content: `确定要删除文章 "${title}" 吗？`,
    confirmText: '删除',
    cancelText: '取消',
    type: 'danger'
  })) {
    return;
  }
  
  try {
    await fetch(`http://localhost:5050/articles/${id}`, { method: 'DELETE' });
    showToast('删除成功', 'success');
    renderArticleList();
  } catch (error) {
    console.error('删除失败:', error);
    showToast('删除失败', 'error');
  }
};

// 事件委托处理按钮点击（支持点击按钮内的图标）
$('#articleList').on('click', function(e) {
  const $viewBtn = $(e.target).closest('.view-btn');
  const $editBtn = $(e.target).closest('.edit-btn');
  const $deleteBtn = $(e.target).closest('.delete-btn');
  
  if ($viewBtn.length && !$viewBtn.is('[disabled]')) {
    previewArticle($viewBtn.data('id'));
  } else if ($editBtn.length && !$editBtn.is('[disabled]')) {
    console.log($editBtn.data('id'));
    window.location.href = `/admin/views/article-manage/editArticle/index.html?id=${$editBtn.data('id')}`;

  } else if ($deleteBtn.length && !$deleteBtn.is('[disabled]')) {
    deleteArticle($deleteBtn.data('id'), $deleteBtn.data('title'));
  }
});

// 点击遮罩层或关闭按钮关闭预览模态框
$('#previewOverlay, #closePreviewBtn').on('click', closePreviewModal);

// 分页点击事件
$('#pagination').on('click', '.page-btn', function(e) {
  e.preventDefault();
  const $btn = $(this);
  if ($btn.is('[disabled]')) return;
  
  const page = parseInt($btn.data('page'));
  if (page >= 1 && page <= totalPages && page !== currentPage) {
    renderArticleList(page, currentCategory);
  }
});

// 分类筛选事件
$('#articleCategory').on('change', function() {
  const category = $(this).val();
  renderArticleList(1, category);
});

// 初始化
const init = async () => {
  await loadCategories();
  renderArticleList();
};

// 页面加载完成后初始化
init();



