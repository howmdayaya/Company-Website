import { loadView, showToast, getArticleList } from '/web/utils/load_view.js';

// 加载视图
loadView('nav-news');

// 获取URL参数
const getUrlParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    id: params.get('id')
  };
};

// 根据id获取文章详情
const getArticleById = async (id) => {
  try {
    const articles = await getArticleList();
    if (!articles) return null;
    
    return articles.find(article => article.id == id);
  } catch (error) {
    console.error('获取文章详情失败:', error);
    return null;
  }
};

// 渲染文章详情
const renderArticleDetail = (article) => {
  if (!article) {
    $('#articleDetail').html(`
      <div class="text-center py-12">
        <i class="fas fa-exclamation-circle text-6xl text-gray-300 mb-4"></i>
        <p class="text-gray-500 text-lg">文章不存在或已被删除</p>
        <a href="../news/index.html" class="inline-block mt-4 px-6 py-2 bg-[#4a6723] text-white rounded-lg hover:bg-[#5a7733] transition-colors">
          返回新闻列表
        </a>
      </div>
    `);
    return;
  }

  // 处理封面图片
  const coverImages = Array.isArray(article.coverfile)
    ? article.coverfile.filter(img => img && img.trim())
    : (article.coverfile ? [article.coverfile] : []);
  const coverImage = coverImages.length > 0 ? coverImages[0] : '/web/assets/images/placeholder.png';
  
  // 处理发布日期
  const publishDate = article.update_time || article.publish_time || '未知日期';
  
  // 处理文章内容
  const content = article.content || '暂无内容';
  
  // 处理文章简介
  const intro = article.intro || content.substring(0, 150);

  const html = `
    <!-- 文章头部 -->
    <div class="p-8 border-b border-gray-100">
      <div class="flex items-center gap-3 mb-4">
        <span class="px-3 py-1 bg-[#4a6723] text-white text-xs font-medium rounded-full">
          ${article.article_category_name || '新闻'}
        </span>
        <span class="text-gray-400 text-sm flex items-center gap-1">
          <i class="far fa-calendar-alt"></i>
          ${publishDate}
        </span>
        <span class="text-gray-400 text-sm flex items-center gap-1">
          <i class="fas fa-user"></i>
          ${article.author || '管理员'}
        </span>
      </div>
      <h1 class="text-3xl md:text-4xl font-bold text-[#2c3a32] mb-4">
        ${article.title}
      </h1>
      <p class="text-gray-500 text-lg bg-[#f9f9f9] p-4 border-l-4 border-[#4a6723] pl-4">
        ${intro}
      </p>
    </div>

    <!-- 文章图片 -->
    ${coverImage ? `
    <div class="relative">
      <img src="${coverImage}" alt="${article.title}" 
        class="w-full h-full object-cover"
        onerror="this.src='/web/assets/images/placeholder.png'">
      <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
    </div>
    ` : ''}

    <!-- 文章内容 -->
    <div class="p-8">
      <div class="prose prose-lg max-w-none">
        <div class="text-gray-600 leading-relaxed whitespace-pre-wrap">
          ${content}
        </div>

        <!-- 标签 -->
        ${article.labels ? `
        <div class="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-100">
          <span class="text-gray-500 text-sm">标签：</span>
          ${article.labels.split(',').map(label => `
            <span class="px-3 py-1 bg-[#f0f0e8] text-[#4a6723] text-sm rounded-full">${label.trim()}</span>
          `).join('')}
        </div>
        ` : ''}
      </div>
    </div>

  `;

  $('#articleDetail').html(html);
  
  // 更新页面标题
  document.title = `${article.title} - HZZ`;
};

// 渲染相关文章
const renderRelatedArticles = async (currentArticle) => {
  if (!currentArticle) return;
  
  try {
    const articles = await getArticleList();
    if (!articles) return;
    
    // 获取同分类的其他文章，最多3篇
    const relatedArticles = articles
      .filter(article => 
        article.id != currentArticle.id && 
        article.article_category_id == currentArticle.article_category_id
      )
      .slice(0, 3);
    
    if (relatedArticles.length === 0) {
      $('#relatedArticles').hide();
      return;
    }

    const html = relatedArticles.map(article => {
      const coverImages = Array.isArray(article.coverfile)
        ? article.coverfile.filter(img => img && img.trim())
        : (article.coverfile ? [article.coverfile] : []);
      const coverImage = coverImages.length > 0 ? coverImages[0] : '/web/assets/images/placeholder.png';
      const publishDate = article.update_time || article.publish_time || '';

      return `
        <article class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer" onclick="window.location.href='article.html?id=${article.id}'">
          <img src="${coverImage}" alt="${article.title}" 
            class="w-full h-48 object-cover"
            onerror="this.src='/web/assets/images/placeholder.png'">
          <div class="p-4">
            <span class="text-[#4a6723] text-sm">${article.article_category_name || '新闻'}</span>
            <h4 class="text-lg font-bold text-[#2c3a32] mt-2 line-clamp-2">${article.title}</h4>
            <p class="text-gray-400 text-sm mt-2">${publishDate}</p>
          </div>
        </article>
      `;
    }).join('');

    $('#relatedArticles .grid').html(html);
    $('#relatedArticles').show();
  } catch (error) {
    console.error('获取相关文章失败:', error);
  }
};

// 初始化
const init = async () => {
  const { id } = getUrlParams();
  
  if (!id) {
    showToast('文章ID不存在', 'error');
    $('#articleDetail').html(`
      <div class="text-center py-12">
        <i class="fas fa-exclamation-circle text-6xl text-gray-300 mb-4"></i>
        <p class="text-gray-500 text-lg">文章ID不存在</p>
        <a href="../news/index.html" class="inline-block mt-4 px-6 py-2 bg-[#4a6723] text-white rounded-lg hover:bg-[#5a7733] transition-colors">
          返回新闻列表
        </a>
      </div>
    `);
    return;
  }

  // 显示加载状态
  $('#articleDetail').html(`
    <div class="text-center py-12">
      <i class="fas fa-spinner fa-spin text-4xl text-[#4a6723] mb-4"></i>
      <p class="text-gray-500">加载中...</p>
    </div>
  `);

  // 获取文章详情
  const article = await getArticleById(id);
  
  // 渲染文章详情
  renderArticleDetail(article);
  
  // 渲染相关文章
  await renderRelatedArticles(article);
};

// DOM加载完成后初始化
$(function() {
  init();
});
