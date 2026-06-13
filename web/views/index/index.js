// 引入公共模块
import { loadView, getProductList, getArticleList } from '/web/utils/load_view.js';

// 加载视图
loadView('nav-home');

/** 
 * 动态渲染产品列表
 * 从产品列表中提取分类ID和名称，生成分类按钮。
 * @param {Array} products - 产品列表数据
*/
const loadProducts = async () => {
  const products = await getProductList();
  if (products) {
    // console.log('获取到的数据:', products);
    // 在这里可以使用 products 进行动态渲染
    renderProducts(products);
  }
};
const renderProducts = (products) => {

  // 过滤出产品列表里面的分类，组成分类列表（同时获取分类ID和名称）
  const product_categorys = [...new Map(products.map(product => [product.product_category_id, {
    id: product.product_category_id,
    name: product.product_category_name
  }])).values()];
  // console.log(product_categorys);

  // 生成分类按钮
  const tabs = `
    <div id="tabs"
            class="w-full flex justify-around gap-2 mb-8 bg-gray-100 p-2 rounded-full overflow-x-auto whitespace-nowrap scrollbar-hide">
      ${product_categorys.map(category => `
        <button data-tab="tab${category.id}" class="px-4 py-2 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100">
          ${category.name}
        </button>
      `).join('\n')}
    </div>
  `

  // 生成分类内容
  const tabContents = `
        <div id="tab-content" class="relative">
          ${product_categorys.map(category => `
            <div id="tab${category.id}" class="tab-panel ">
              <ul class="grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-4 h-full items-start">
                ${products.filter(product => product.product_category_id === category.id).map(product => {
    const coverImages = Array.isArray(product.thumb_img_urls) ? product.thumb_img_urls.filter(img => img && img.trim()) : (product.thumb_img_urls ? [product.thumb_img_urls] : []);
    const coverImage = coverImages.length > 0 ? coverImages[0] : '';
    return `
                  <li>
                    <a href="/web/views/detail/product.html?id=${product.id}" class="group overflow-hidden flex flex-col gap-4 items-center justify-between py-10 px-8 bg-white rounded-2xl shadow-md hover:bg-[#f0f0e8] hover:shadow-lg transition-all duration-300">
                      <figure class="relative z-10 mb-4 aspect-square w-full overflow-hidden rounded-xl">
                        <img src="${coverImage || '/images/placeholder.png'}" alt="${product.title}" class="w-full h-full object-cover">
                      </figure>
                      <div class="relative z-10 flex justify-between items-center w-full">
                        <h3 class="text-2xl font-light text-[#2c3a32]">${product.title}</h3>
                        <svg t="1780653159507" class="icon w-6 h-6 group-hover:rotate-45 transition-all duration-300" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="28918">
                          <path d="M863.0912 102.4l2.7904 0.064 3.328 0.256c1.7408 0.1792 3.456 0.4352 5.1584 0.768l3.1104 0.704 2.048 0.5504 4.3008 1.4464 3.1104 1.28 3.6864 1.792 2.624 1.4976c1.088 0.6656 2.176 1.3568 3.2128 2.0864l1.28 0.9088 2.9184 2.304 2.24 1.9712 3.072 3.072 1.4336 1.6128 1.216 1.4464 0.6784 0.8576c0.64 0.8192 1.2672 1.664 1.856 2.5216l1.856 2.8288 1.7152 3.008 1.4848 2.9696 1.344 3.136 1.1648 3.264 0.5376 1.7536c1.536 5.1968 2.3424 10.7136 2.3424 16.4096v526.6304a58.5088 58.5088 0 0 1-117.0304 0V302.1696L202.2912 904.4608a58.5216 58.5216 0 0 1-80.576 2.0736l-2.176-2.0736a58.5088 58.5088 0 0 1 0-82.752l602.2784-602.2912H336.4608a58.5216 58.5216 0 0 1-58.4576-55.744l-0.064-2.7648A58.5088 58.5088 0 0 1 336.4608 102.4h526.6304z" fill="#2c3a32" p-id="28919"></path>
                        </svg>
                      </div>
                    </a>
                  </li>
                  `;
  }).join('\n')}
              </ul>
            </div>
          `).join('\n')}
        
        </div>
  `

  // 渲染到 index_products 中
  const index_productsHTML = `
    <div class="relative w-full">
      <!-- Tab 按钮区 -->
          ${tabs}

      <!-- Tab 内容区 -->
      ${tabContents}
    </div>
  `
  $('#index_products').html(index_productsHTML);
  
};



/**
 * 新闻资讯
 * 渲染到 index_articles 中
 * */
const loadArticles = async () => {
  const articles = await getArticleList();
  if (articles) {
    // 渲染到 index_articles 中
    // console.log(articles);
    renderArticles(articles);
  }
}
const renderArticles = (articles) => {

  // 过滤出新闻资讯列表里面的分类，组成分类列表（同时获取分类ID和名称）
  const article_categorys = [...new Map(articles.map(article => [article.article_category_id, {
    id: article.article_category_id,
    name: article.article_category_name
  }])).values()];
  // console.log(article_categorys);

  const articleTabs = `
      <div id="article-tabs"
              class="flex justify-around gap-2 bg-gray-100 p-2 rounded-full overflow-x-auto whitespace-nowrap scrollbar-hide">
              ${article_categorys.map(category => `
                <button data-tab="article-tab${category.id}" class="px-6 py-4 rounded-full text-sm font-medium transition-colors duration-300"
                data-tab="article-tab${category.id}">${category.name}</button>
              `).join('\n')}
            </div>
  `

  const articleTabContents = ` 
      <div id="article-content" class="relative">
          ${article_categorys.map(category => `
            <div id="article-tab${category.id}" class="article-tab-panel">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${articles.filter(article => article.article_category_id === category.id).map(article => {
    const coverImages = Array.isArray(article.coverfile) ? article.coverfile.filter(img => img && img.trim()) : (article.coverfile ? [article.coverfile] : []);
    const coverImage = coverImages.length > 0 ? coverImages[0] : '';
    return `
                    <article
                class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                <div class="relative overflow-hidden aspect-video">
                  <img loading="lazy" src="${coverImage || ''}" alt="${article.title}"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                  <span class="absolute top-4 left-4 bg-[#4a6723] text-white px-3 py-1 text-sm rounded-full">${category.name}</span>
                </div>
                <div class="p-6">
                  <div class="flex items-center gap-2 text-gray-500 text-sm mb-3">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>${article.publish_time ? article.publish_time.split(' ')[0] : ''}</span>
                  </div>
                  <h3 class="text-lg font-bold text-gray-800 mb-2 group-hover:text-[#4a6723] transition-colors">
                    ${article.title}</h3>
                  <p class="text-gray-600 text-sm line-clamp-2 mb-4">${article.intro || ''}</p>
                  <a href="/web/views/detail/article.html?id=${article.id}"
                    class="inline-flex items-center gap-2 text-[#4a6723] font-medium text-sm hover:gap-3 transition-all">
                    阅读更多
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </article>
                  `}).join('\n')}
              </div>
            </div>
          `).join('\n')}
      </div>

                
  `

  const index_articlesHTML = `
    <div class="relative w-full">
        <div class="flex justify-between sm:items-center flex-col sm:flex-row gap-4 mb-12">
          <h2 class="text-4xl font-bold text-[#2c3a32]">
            新闻资讯
          </h2>
          
          <!-- article Tab 按钮区 -->
          <div class="flex items-center gap-4">
            ${articleTabs}
            <div class="flex justify-center">
              <a href="/web/views/news/index.html"
                class="group flex items-center justify-center gap-3 text-lg px-4 sm:px-8 py-4 transition-all duration-300 bg-primary text-white rounded-full hover:shadow-lg ">
                <span class="hidden sm:block">查看更多</span>
                <svg t="1780723787221" class="icon group-hover:translate-x-[10px] transition-add duration-300"
                  viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="18905" width="24"
                  height="24">
                  <path
                    d="M496 128c12.266667 0 24.554667 4.501333 33.941333 13.504l352.021334 337.92a44.8 44.8 0 0 1 0 65.130667l-352 337.941333a49.429333 49.429333 0 0 1-67.904 0 44.8 44.8 0 0 1 0-65.173333L735.637333 554.666667H170.666667a42.666667 42.666667 0 1 1 0-85.333334h565.034666L462.058667 206.656a44.714667 44.714667 0 0 1-2.56-62.485333l2.56-2.645334A48.704 48.704 0 0 1 495.978667 128z"
                    fill="#ffffff" p-id="18906"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>

          <!-- article Tab 内容区 -->
          ${articleTabContents}
        
      </div>  
  `
  // 渲染到 index_articles 中
  $('#index_articles').html(index_articlesHTML);

}

/**
 * Tab 切换功能
 * 使用 CSS 类切换，避免高度塌陷
 */
const initTabs = () => {
  const activeClass = 'text-white bg-primary';

  // 初始化：显示第一个 tab
  $('#tabs > button').first().addClass(activeClass);
  $('.tab-panel').first().addClass('active');

  $('#article-tabs > button').first().addClass(activeClass);
  $('.article-tab-panel').first().addClass('active');

  // 点击切换
  $('#tabs > button').on('click', function () {
    const $this = $(this);
    const tabId = $this.data('tab');

    // 更新按钮状态
    $('#tabs > button').removeClass(activeClass);
    $this.addClass(activeClass);

    // 切换内容（CSS 过渡动画）
    $('.tab-panel').removeClass('active');
    $(`#${tabId}`).addClass('active');
  });
  // 新闻资讯 Tab 切换
  $('#article-tabs > button').on('click', function () {
    const $this = $(this);
    const tabId = $this.data('tab');

    // 更新按钮状态
    $('#article-tabs > button').removeClass(activeClass);
    $this.addClass(activeClass);

    // 切换内容（CSS 过渡动画）
    $('.article-tab-panel').removeClass('active');
    $(`#${tabId}`).addClass('active');
  });
};


// 执行加载
const init = async () => {
  await Promise.all([
    loadProducts(),
    loadArticles()
  ]);
  // 所有内容渲染完成后，统一初始化 tab
  initTabs();
};
init();