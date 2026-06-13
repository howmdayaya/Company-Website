/* 
 * 加载视图
 */

// 顶部导航选中状态切换
const topBarActive = (activeId) => {
  // 清除所有导航的激活状态
  $('#nav-home, #nav-products, #nav-about, #nav-news, #nav-contact').removeClass('active');

  // 如果找到匹配的导航，添加激活样式
  if (activeId) {
    const $activeNav = $('#' + activeId);
    if ($activeNav.length) {
      $activeNav.addClass('active');

      // 如果是子菜单项，展开对应的父级菜单
      const $parent = $activeNav.closest('.has-submenu');
      if ($parent.length && $parent.find('.submenu').hasClass('hidden')) {
        $parent.find('.submenu').removeClass('hidden');
        $parent.find('.submenu-icon').addClass('rotate-180');
      }
    }
  }
}


// 渲染视图方法
const loadView=async (activeId)=> {

  // 并行加载所有组件
  try {
    const [ topBarRes,footerRes,bannerRes,heroRes] = await Promise.all([
      fetch('/web/components/topBar/index.html'),
      fetch('/web/components/footer/index.html'),
      fetch('/web/components/banner/index.html'),
      fetch('/web/components/hero/index.html')
    ]);

    // Promise.all
    // 并行处理多个 Promise，等待所有 Promise 都完成
    const [topBarHtml, footerHtml,bannerHtml,heroHtml] = await Promise.all([

      topBarRes.text(),
      footerRes.text(),
      bannerRes.text(),
      heroRes.text()
    ]);

    // 渲染组件
    $('#topBar').html(topBarHtml);
    $('#footer').html(footerHtml);
    $('#banner').html(bannerHtml);
    $('#hero').html(heroHtml);

    // 渲染 aside 数据和激活状态
    
    topBarActive(activeId);



  } catch (error) {
    console.error('加载组件失败:', error);
  }
}

// 设置一个通用的toast通知
const showToast = (message, type = 'info', duration = 3000) => {
  // 移除已存在的toast
  $('.toast-notification').remove();
  
  // 根据类型设置不同的样式和图标
  const typeConfig = {
    success: {
      bg: 'bg-green-500',
      icon: 'fa-check-circle'
    },
    error: {
      bg: 'bg-red-500',
      icon: 'fa-times-circle'
    },
    warning: {
      bg: 'bg-yellow-500',
      icon: 'fa-exclamation-triangle'
    },
    info: {
      bg: 'bg-blue-500',
      icon: 'fa-info-circle'
    }
  };
  
  const config = typeConfig[type] || typeConfig.info;
  
  // 创建toast元素
  const toast = $(`
    <div class="toast-notification fixed top-4 right-4 ${config.bg} text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3 z-50 transform transition-all duration-300 translate-x-full opacity-0">
      <i class="fas ${config.icon}"></i>
      <span>${message}</span>
    </div>
  `);
  
  // 添加到页面
  $('body').append(toast);
  
  // 显示动画
  setTimeout(() => {
    toast.removeClass('translate-x-full opacity-0');
  }, 10);
  
  // 自动消失
  setTimeout(() => {
    toast.addClass('translate-x-full opacity-0');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, duration);
};

// 自定义 confirm 确认框
const showConfirm = (options = {}) => {
  const {
    title = '确认',
    content = '确定要执行此操作吗？',
    confirmText = '确定',
    cancelText = '取消',
    type = 'warning' // warning, danger, info, success
  } = options;

  return new Promise((resolve) => {
    // 移除已存在的确认框
    $('.confirm-modal').remove();

    // 根据类型设置图标和颜色
    const typeConfig = {
      warning: {
        icon: 'fa-exclamation-triangle',
        iconColor: 'text-yellow-500',
        confirmBg: 'bg-yellow-500 hover:bg-yellow-600'
      },
      danger: {
        icon: 'fa-times-circle',
        iconColor: 'text-red-500',
        confirmBg: 'bg-red-500 hover:bg-red-600'
      },
      info: {
        icon: 'fa-info-circle',
        iconColor: 'text-blue-500',
        confirmBg: 'bg-blue-500 hover:bg-blue-600'
      },
      success: {
        icon: 'fa-check-circle',
        iconColor: 'text-green-500',
        confirmBg: 'bg-green-500 hover:bg-green-600'
      }
    };

    const config = typeConfig[type] || typeConfig.warning;

    // 创建确认框元素
    const modal = $(`
      <div class="confirm-modal fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-95 opacity-0">
          <div class="p-6">
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-12 h-12 rounded-full ${config.iconColor} bg-opacity-10 flex items-center justify-center" style="background-color: currentColor;">
                <i class="fas ${config.icon} text-2xl"></i>
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-800 mb-2">${title}</h3>
                <p class="text-gray-600 text-sm">${content}</p>
              </div>
            </div>
          </div>
          <div class="flex gap-3 px-6 pb-6">
            <button class="cancel-btn flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors">
              ${cancelText}
            </button>
            <button class="confirm-btn flex-1 ${config.confirmBg} text-white py-2.5 px-4 rounded-lg font-medium transition-colors">
              ${confirmText}
            </button>
          </div>
        </div>
      </div>
    `);

    // 添加到页面
    $('body').append(modal);
    $('body').css('overflow', 'hidden');

    // 显示动画
    setTimeout(() => {
      modal.find('.bg-white').removeClass('scale-95 opacity-0');
    }, 10);

    // 确认按钮
    modal.find('.confirm-btn').on('click', () => {
      closeModal(modal);
      resolve(true);
    });

    // 取消按钮
    modal.find('.cancel-btn').on('click', () => {
      closeModal(modal);
      resolve(false);
    });

    // 点击遮罩关闭
    modal.on('click', (e) => {
      if (e.target === modal[0]) {
        closeModal(modal);
        resolve(false);
      }
    });

    // ESC键关闭
    $(document).on('keydown.confirmModal', (e) => {
      if (e.key === 'Escape') {
        closeModal(modal);
        resolve(false);
      }
    });
  });
};

// 关闭确认框
const closeModal = (modal) => {
  modal.find('.bg-white').addClass('scale-95 opacity-0');
  setTimeout(() => {
    modal.remove();
    $('body').css('overflow', 'auto');
    $(document).off('keydown.confirmModal');
  }, 200);
};

// 获取产品列表
const getProductList = async () => {
  try {
    const res = await fetch('http://localhost:5050/products');
    
    // 先检查状态码，再解析数据
    if (res.ok) {
      const data = await res.json();
      // console.log(data);
      return data; // 返回数据
    } else {
      console.error('获取产品列表失败，状态码:', res.status);
      return null;
    }
  } catch (error) {
    console.error('获取产品列表失败:', error);
    return null;
  }
};

// 获取新闻资讯列表
const getArticleList = async () => {
  try {
    const res = await fetch('http://localhost:5050/articles');
    
    // 先检查状态码，再解析数据
    if (res.ok) {
      const data = await res.json();
      // console.log(data);
      return data; // 返回数据
    } else {
      console.error('获取新闻资讯列表失败，状态码:', res.status);
      return null;
    }
  } catch (error) {
    console.error('获取新闻资讯列表失败:', error);
    return null;
  }
};


export { loadView, showToast, showConfirm, getProductList,getArticleList };
