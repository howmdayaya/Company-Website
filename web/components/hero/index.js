
  /**
   * 初始化Hero组件
   * 仅支持通过data-config JSON配置
   * @param {Object} options - 配置选项
   * @param {string} options.title - 页面标题
   * @param {string} options.breadcrumb - 面包屑显示文本
   * @param {string} options.subtitle - 副标题显示文本
   * @param {string} options.bg - 背景图片URL
   */

  const initHero = function() {
    const $heroContainer = $('#hero');
    
    if (!$heroContainer.length) {
      console.warn('Hero组件容器#hero未找到');
      return;
    }

    // 从data-config读取JSON配置
    let config;
    try {
      config = $heroContainer.data('config') || {};
    } catch (e) {
      console.warn('data-config解析失败', e);
      config = {};
    }

    // 设置默认值
    const defaults = {
      title: '页面标题',
      breadcrumb: '当前页面',
      subtitle: '',
      bg: ''
    };
    
    config = $.extend(defaults, config);

    const { title, breadcrumb, subtitle, bg } = config;

    // 设置背景（如果有背景图片）
    const $heroBg = $('#heroBackground');
    if ($heroBg.length) {
      if (bg) {
        // 使用背景图片
        $heroBg.css({
          'background-image': `url(${bg})`,
          'background-size': 'cover',
          'background-position': 'center',
          'background-color': 'transparent'
        });
        // 添加渐变遮罩
        const $overlay = $('<div>');
        $overlay.css({
          'position': 'absolute',
          'inset': '0',
          'background': 'linear-gradient(to bottom, rgba(74,103,35,0.85), rgba(44,58,50,0.85))'
        });
        $heroBg.append($overlay);
      } else {
        // 使用纯色背景
        $heroBg.css({
          'background-image': 'none',
          'background-color': '#4a6723'
        });
      }
    }

    // 设置标题
    const $titleEl = $('#heroTitle');
    if ($titleEl.length) {
      $titleEl.text(title);
    }

    // 设置副标题
    const $subtitleEl = $('#heroSubtitle');
    if ($subtitleEl.length) {
      if (subtitle) {
        $subtitleEl.text(subtitle).removeClass('hidden');
      } else {
        $subtitleEl.addClass('hidden');
      }
    }

    // 设置面包屑
    const $breadcrumbEl = $('#heroBreadcrumbText');
    if ($breadcrumbEl.length) {
      $breadcrumbEl.text(breadcrumb);
    }

    // 设置页面title标签
    document.title = `${title} - HZZ`;
  };


  // 页面加载后自动初始化
  $(document).ready(function() {
    const $heroContainer = $('#hero');
    if ($heroContainer.length && $heroContainer.data('config')) {
      initHero();
    }
  });

