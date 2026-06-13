import { loadView, showToast, getProductList } from '/web/utils/load_view.js';

// 加载视图
loadView('nav-products');

// 获取URL参数
const getUrlParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    id: params.get('id')
  };
};

// 根据id获取产品详情
const getProductById = async (id) => {
  try {
    const products = await getProductList();
    if (!products) return null;

    return products.find(product => product.id == id);
  } catch (error) {
    console.error('获取产品详情失败:', error);
    return null;
  }
};

// 当前显示的图片索引
let currentImageIndex = 0;
let productImages = [];

// 渲染产品主信息区
const renderProductDetail = (product) => {
  if (!product) {
    $('#productDetail').html(`
      <div class="text-center py-12">
        <i class="fas fa-exclamation-circle text-6xl text-gray-300 mb-4"></i>
        <p class="text-gray-500 text-lg">产品不存在或已被删除</p>
        <a href="../products/index.html" class="inline-block mt-4 px-6 py-2 bg-[#4a6723] text-white rounded-lg hover:bg-[#5a7733] transition-colors">
          返回产品列表
        </a>
      </div>
    `);
    return;
  }

  // 处理产品图片
  productImages = Array.isArray(product.thumb_img_urls)
    ? product.thumb_img_urls.filter(img => img && img.trim())
    : (product.thumb_img_urls ? [product.thumb_img_urls] : []);

  if (productImages.length === 0) {
    productImages = ['/web/assets/images/placeholder.png'];
  }

  currentImageIndex = 0;

  // 处理产品分类
  const categoryName = product.product_category_name || '产品';

  const html = `
    <div class="flex flex-col lg:flex-row gap-8 lg:gap-12">
      <!-- 左侧：产品图片轮播 -->
      <div class="lg:w-1/2">
        <div class="relative">
          <!-- 主图 -->
          <div class="bg-gray-50 rounded-2xl overflow-hidden aspect-square flex items-center justify-center">
            <img id="productMainImage" src="${productImages[0]}" alt="${product.title}"
              class="w-full h-full object-contain p-8"
              onerror="this.src='/web/assets/images/placeholder.png'">
          </div>

          <!-- 左右切换按钮 -->
          ${productImages.length > 1 ? `
          <button id="prevImageBtn" class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:bg-[#4a6723] hover:text-white transition-all duration-300">
            <i class="fas fa-chevron-left"></i>
          </button>
          <button id="nextImageBtn" class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:bg-[#4a6723] hover:text-white transition-all duration-300">
            <i class="fas fa-chevron-right"></i>
          </button>
          ` : ''}
        </div>

        <!-- 缩略图列表 -->
        ${productImages.length > 1 ? `
        <div class="mt-4 flex gap-3 overflow-x-auto pb-2">
          ${productImages.map((img, index) => `
            <button class="thumbnail-btn flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${index === 0 ? 'border-[#4a6723]' : 'border-gray-200'} hover:border-[#4a6723] transition-colors" data-index="${index}">
              <img src="${img}" alt="缩略图${index + 1}" class="w-full h-full object-contain bg-gray-50 p-1"
                onerror="this.src='/web/assets/images/placeholder.png'">
            </button>
          `).join('')}
        </div>
        ` : ''}
      </div>

      <!-- 右侧：产品信息 -->
      <div class="lg:w-1/2 flex flex-col justify-start">
        <!-- 分类标签 -->
        <div class="mb-4">
          <span class="text-[#4a6723] text-sm font-medium tracking-wider">— ${categoryName}</span>
        </div>

        <!-- 产品标题 -->
        <h1 class="text-3xl lg:text-4xl font-bold text-[#2c3a32] mb-6 product-title">
          ${product.title}
        </h1>

        <!-- 产品简介 -->
        <p class="text-gray-500 text-base mb-8 leading-relaxed">
          ${product.intro || '暂无详细介绍'}
        </p>

        <!-- 分隔线 -->
        <div class="border-t border-gray-200 pt-6 mb-6"></div>


        <!-- 操作按钮 -->
        <div class="flex gap-4">
          <a href="/web/views/contact/index.html" id="consultBtn" class="flex-1 px-8 py-3 bg-[#4a6723] text-white font-medium rounded-lg hover:bg-[#5a7733] transition-colors flex items-center justify-center gap-2">
            <i class="fas fa-headset"></i>
            立即咨询
          </a>
        </div>
      </div>
    </div>
  `;

  $('#productDetail').html(html);

  // 更新页面标题
  document.title = `${product.title} - HZZ`;

  // 绑定图片切换事件
  bindImageEvents();
};

// 绑定图片切换事件
const bindImageEvents = () => {
  // 左右切换按钮
  $('#prevImageBtn').on('click', () => {
    currentImageIndex = (currentImageIndex - 1 + productImages.length) % productImages.length;
    updateMainImage();
  });

  $('#nextImageBtn').on('click', () => {
    currentImageIndex = (currentImageIndex + 1) % productImages.length;
    updateMainImage();
  });

  // 缩略图点击
  $('.thumbnail-btn').on('click', function() {
    currentImageIndex = parseInt($(this).data('index'));
    updateMainImage();
  });

};

// 更新主图
const updateMainImage = () => {
  $('#productMainImage').attr('src', productImages[currentImageIndex]);
  // 更新缩略图选中状态
  $('.thumbnail-btn').each((index, el) => {
    if (parseInt($(el).data('index')) === currentImageIndex) {
      $(el).removeClass('border-gray-200').addClass('border-[#4a6723]');
    } else {
      $(el).removeClass('border-[#4a6723]').addClass('border-gray-200');
    }
  });
};

// 渲染产品介绍区
const renderProductIntro = (product) => {
  if (!product) return;

  // 渲染产品详细介绍
  const description = product.content || product.intro || '暂无详细介绍';
  const descriptionHtml = `
    <div class="text-gray-600 leading-relaxed whitespace-pre-wrap">
      ${description}
    </div>
  `;
  $('#productDescription').html(descriptionHtml);
};

// 渲染相关产品
const renderRelatedProducts = async (currentProduct) => {
  if (!currentProduct) {
    $('#relatedProducts').hide();
    return;
  }

  try {
    const products = await getProductList();
    if (!products) return;

    // 获取同分类的其他产品，最多3个
    const relatedProducts = products
      .filter(p =>
        p.id != currentProduct.id &&
        p.product_category_id == currentProduct.product_category_id
      )
      .slice(0, 3);

    if (relatedProducts.length === 0) {
      $('#relatedProducts').hide();
      return;
    }

    const html = relatedProducts.map(product => {
      const coverImages = Array.isArray(product.thumb_img_urls)
        ? product.thumb_img_urls.filter(img => img && img.trim())
        : (product.thumb_img_urls ? [product.thumb_img_urls] : []);
      const coverImage = coverImages.length > 0 ? coverImages[0] : '/web/assets/images/placeholder.png';

      return `
        <article class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer group" onclick="window.location.href='product.html?id=${product.id}'">
          <div class="relative overflow-hidden aspect-square bg-gray-50">
            <img src="${coverImage}" alt="${product.title}"
              class="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
              onerror="this.src='/web/assets/images/placeholder.png'">
          </div>
          <div class="p-4">
            <h4 class="text-lg font-bold text-[#2c3a32] mb-2 group-hover:text-[#4a6723] transition-colors line-clamp-1">${product.title}</h4>
            <p class="text-sm text-gray-500 line-clamp-2 mb-3">${product.intro || ''}</p>
            <button class="w-full py-2 border border-[#4a6723] text-[#4a6723] text-sm font-medium rounded-lg hover:bg-[#4a6723] hover:text-white transition-all duration-300">
              查看详情
            </button>
          </div>
        </article>
      `;
    }).join('');

    $('#relatedProductsList').html(html);
    $('#relatedProducts').show();
  } catch (error) {
    console.error('获取相关产品失败:', error);
  }
};

// 初始化
const init = async () => {
  const { id } = getUrlParams();

  if (!id) {
    showToast('产品ID不存在', 'error');
    $('#productDetail').html(`
      <div class="text-center py-12">
        <i class="fas fa-exclamation-circle text-6xl text-gray-300 mb-4"></i>
        <p class="text-gray-500 text-lg">产品ID不存在</p>
        <a href="../products/index.html" class="inline-block mt-4 px-6 py-2 bg-[#4a6723] text-white rounded-lg hover:bg-[#5a7733] transition-colors">
          返回产品列表
        </a>
      </div>
    `);
    return;
  }

  // 获取产品详情
  const product = await getProductById(id);

  // 渲染各个区域
  renderProductDetail(product);
  renderProductIntro(product);
  await renderRelatedProducts(product);
};

// DOM加载完成后初始化
$(function() {
  init();
});
