/* 
 * 加载视图
 */
const isLogin=()=> {
  return localStorage.getItem('token');
}

// 加载视图数据
const renderAside = (tokenData) => {
  const username = tokenData?.username || '用户';
  const photo = tokenData?.photo || '';

  // 填充用户数据
  const usernameEl = $('#sidebar-username');
  const photoEl = $('#sidebar-photo');
  const logoutBtn = $('#sidebar-logout');

  if (usernameEl) {
    usernameEl.text(username);
  }
  if (photo && photoEl) {
    photoEl.attr('src', photo);
    photoEl.removeClass('hidden');
  }

  // 退出按钮事件
  if (logoutBtn) {
    logoutBtn.on('click', function () {
      localStorage.removeItem('token');
      window.location.href = '/admin/views/login/index.html';
    });
  }
}

// 侧边栏选中状态切换
const asideActive = (activeId) => {
  // 清除所有导航的激活状态
  $('[id^="nav-"]').removeClass('bg-blue-50 text-blue-600 font-medium');

  // 如果找到匹配的导航，添加激活样式
  if (activeId) {
    const $activeNav = $('#' + activeId);
    if ($activeNav.length) {
      $activeNav.addClass('bg-blue-50 text-blue-600 font-medium');

      // 如果是子菜单项，展开对应的父级菜单
      const $parent = $activeNav.closest('.has-submenu');
      if ($parent.length && $parent.find('.submenu').hasClass('hidden')) {
        $parent.find('.submenu').removeClass('hidden');
        $parent.find('.submenu-icon').addClass('rotate-180');
      }
    }
  }
}


// 侧边栏抽屉切换（仅移动端有效）
const toggleAside = () => {
  const $aside = $('#aside');
  const $overlay = $('#drawer-overlay');
  const $toggleAside = $('#toggleAside');
  
  // 判断是否为移动端（屏幕宽度 < 640px）
  const isMobile = window.innerWidth < 640;
  
  // PC端不执行任何操作（侧边栏始终展开）
  if (!isMobile) {
    return;
  }
  
  // 移动端：直接用 -translate-x-full 判断状态
  const isClosed = $aside.hasClass('-translate-x-full');

  if (isClosed) {
    // 打开抽屉
    $aside.removeClass('-translate-x-full');
    $overlay.removeClass('hidden');
    $('body').css('overflow', 'hidden');
    // 按钮样式：关闭图标
    $toggleAside.html('<i class="fas fa-times"></i>');
    $toggleAside.addClass('text-gray-800');
  } else {
    // 关闭抽屉
    $aside.addClass('-translate-x-full');
    $('body').css('overflow', 'auto');
    $overlay.addClass('hidden');
    // 按钮样式：菜单图标
    $toggleAside.removeClass('text-gray-800');
    $toggleAside.html('<i class="fas fa-bars"></i>');
  }
}

// 需要管理员权限的页面列表
const adminPages = [
  '/admin/views/user-manage/userList/index.html',
  '/admin/views/user-manage/addUser/index.html',
];

// 检查是否为管理员页面
const isAdminPage = () => {
  const currentUrl = window.location.pathname;
  return adminPages.some(page => currentUrl.includes(page));
};

// 管理员权限判断（菜单控制）
const isAdmin = (tokenData) => {
  if (tokenData?.role === 'admin') {
    $('#nav-user-admin').removeClass('hidden');
  } else {
    $('#nav-user-admin').addClass('hidden');
  }
};

// 权限验证（页面级别）
const checkPermission = (tokenData) => {
  // 如果是管理员页面且用户不是管理员
  if (isAdminPage() && tokenData?.role !== 'admin') {
    alert('您没有权限访问此页面');
    window.location.href = '/admin/views/home/index.html';
    return false;
  }
  return true;
};



// 渲染视图方法
const loadView=async (activeId)=> {
  // 检查登录状态
  const user = isLogin();
  if (!user) {
    window.location.href = '/admin/views/login/index.html';
    return;
  }

  // 获取用户数据
  let tokenData = null;
  try {
    tokenData = JSON.parse(user);
  } catch (e) {
    console.error('解析 user 失败:', e);
    window.location.href = '/admin/views/login/index.html';
    return;
  }

  // 页面级别权限验证
  if (!checkPermission(tokenData)) {
    return;
  }

  // 并行加载所有组件
  try {
    const [asideResponse, topBarResponse] = await Promise.all([
      fetch('/admin/components/aside/index.html'),
      fetch('/admin/components/topBar/index.html')
    ]);

    // Promise.all
    // 并行处理多个 Promise，等待所有 Promise 都完成
    const [asideHtml, topBarHtml] = await Promise.all([

      asideResponse.text(),
      topBarResponse.text()
    ]);

    // 渲染组件
    $('#aside').html(asideHtml);
    $('#topBar').html(topBarHtml);

    // 渲染 aside 数据和激活状态
    renderAside(tokenData);
    asideActive(activeId);



  } catch (error) {
    console.error('加载组件失败:', error);
  }

  // 侧边栏切换事件
  $('#toggleAside').on('click', toggleAside);
  
  // 点击遮罩层关闭抽屉
  $('#drawer-overlay').on('click', toggleAside);

  // 管理员权限判断
  isAdmin(tokenData);
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

export { loadView, isLogin, showToast, showConfirm };
