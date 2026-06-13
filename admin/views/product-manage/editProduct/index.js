// 引入公共模块
import { loadView, isLogin, showToast, showConfirm } from '/admin/utils/load_view.js';

// 加载视图
loadView('nav-product-list');

// 获取 url 参数 id
const updateId = new URL(window.location.href).searchParams.get('id');

let thumb_img_urls = []
let content = ''

// =========wangEditor 初始化  start=========
const { createEditor, createToolbar } = window.wangEditor

// 编辑器配置
const editorConfig = {
  placeholder: 'Product Description...',
  autoFocus: false,
  onChange(editor) {
    const html = editor.getHtml()
    content = html
  },
  MENU_CONF: {
    // 配置上传图片（base64 方式）
    uploadImage: {
      // 自定义上传函数，转为 base64
      async customUpload(file, insertFn) {
        try {
          // 检查文件类型
          if (!file.type.startsWith('image/')) {
            showToast('请选择图片文件', 'warning')
            return
          }
          
          // 检查文件大小（限制 2MB）
          if (file.size > 2 * 1024 * 1024) {
            showToast('图片大小不能超过 2MB', 'warning')
            return
          }
          
          // 转换为 base64
          const reader = new FileReader()
          reader.onload = (e) => {
            const base64 = e.target.result
            // 插入图片到编辑器
            insertFn(base64, file.name, '')
          }
          reader.onerror = () => {
            showToast('图片读取失败', 'error')
          }
          reader.readAsDataURL(file)
        } catch (error) {
          console.error('处理图片失败:', error)
          showToast('图片处理失败', 'error')
        }
      },
      // 文件类型限制
      allowedFileTypes: ['image/*'],
      // 单个文件大小限制 2M
      maxFileSize: 2 * 1024 * 1024
    }
  }
}

const editor = createEditor({
  selector: '#editor-container',
  html: '<p><br></p>',
  config: editorConfig,
  mode: 'default',
})

// 工具栏配置
const toolbarConfig = {}

const toolbar = createToolbar({
  editor,
  selector: '#toolbar-container',
  config: toolbarConfig,
  mode: 'default',
})
// =========wangEditor 初始化  end ==========

// 渲染图片预览
const renderCoverPreviews = (urls) => {
  const $container = $('#coverPreviewContainer');
  $container.empty();
  
  if (urls.length === 0) {
    $('#coverPreviewWrapper').addClass('hidden');
    return;
  }
  
  $('#coverPreviewWrapper').removeClass('hidden');
  
  urls.forEach((url, index) => {
    if (url.trim()) {
      const encodedUrl = encodeURIComponent(url.trim());
      $container.append(`
        <div class="relative aspect-square border border-gray-200 rounded-lg overflow-hidden bg-gray-50 group">
          <img src="${url.trim()}" class="w-full h-full object-cover" alt="预览图${index + 1}" onerror="this.parentElement.innerHTML='<div class=\\'flex items-center justify-center h-full text-gray-400 text-xs\\'>加载失败</div>'">
          <button type="button" class="remove-cover-btn absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity" data-url="${encodedUrl}" data-index="${index}">
            <i class="fas fa-times"></i>
          </button>
        </div>
      `);
    }
  });
};

// thumb_img_urls 上传（带预览，追加模式，允许重复选择相同图片）
$('#thumb_img_urls').change(function (e) {
  const files = e.target.files;
  if (files.length > 0) {
    const results = [];
    
    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function (e) {
        results.push(e.target.result);
        if (results.length === files.length) {
          // 追加到现有数组（允许重复图片）
          thumb_img_urls = [...thumb_img_urls, ...results];
          renderCoverPreviews(thumb_img_urls);
          $('#thumb_img_urls').val('');
        }
      };
    });
  }
});

// URL输入框变化时显示预览
$('#coverUrl').on('input', function() {
  const value = $(this).val().trim();
  
  if (value) {
    const urls = value.split(',').filter(url => url.trim());
    renderCoverPreviews(urls);
    $('#thumb_img_urls').val('');
    thumb_img_urls = urls;
  } else {
    renderCoverPreviews([]);
    thumb_img_urls = [];
  }
});

// 删除单张预览图片
$(document).on('click', '.remove-cover-btn', function() {
  const index = $(this).data('index');
  thumb_img_urls.splice(index, 1);
  $('#thumb_img_urls').val('');
  renderCoverPreviews(thumb_img_urls);
});

// 加载分类列表到下拉框
const loadCategories = async () => {
  try {
    const response = await fetch('http://localhost:5050/product_categorys');
    const categories = await response.json();
    updateCategorySelect(categories);
  } catch (error) {
    console.error('加载分类失败:', error);
  }
};

// 更新产品表单的分类选择器
const updateCategorySelect = (categories) => {
  const $select = $('#category');
  $select.html('<option value="">请选择分类</option>');
  
  // 递归添加分类（支持多级）
  const addCategoryOption = (items, parentId = 0, level = 0) => {
    const filtered = items.filter(item => item.parent_id === parentId);
    filtered.forEach(item => {
      const prefix = '- '.repeat(level);
      $select.append(`<option value="${item.id}" data-name="${item.name}">${prefix}${item.name}</option>`);
      // 递归添加子分类
      const children = categories.filter(c => c.parent_id === item.id);
      if (children.length > 0) {
        addCategoryOption(categories, item.id, level + 1);
      }
    });
  };
  
  // 从顶级分类开始递归添加
  addCategoryOption(categories, 0, 0);
};

// 提交产品
$('#editProductForm').on('submit', async (e) => {
  e.preventDefault();
  
  const categoryId = $('#category').val();
  const categoryName = $('#category option:selected').data('name');
  
  if (!categoryId) {
    showToast('请选择分类', 'warning');
    return;
  }
  
  const publishTime = $('#publishTime').val();
  const formatPublishTime = publishTime ? publishTime.replace('T', ' ') + ':00' : new Date().toISOString().slice(0, 19).replace('T', ' ');
  
  try {
    const response = await fetch(`http://localhost:5050/products/${updateId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: $('#title').val(),
        intro: $('#intro').val(),
        product_category_id: parseInt(categoryId),
        product_category_name: categoryName,
        thumb_img_urls: thumb_img_urls,
        content: content,
        author: $('#author').val().trim() || JSON.parse(isLogin()).username,
        labels: $('#labels').val(),
        publish_time: formatPublishTime,
        update_time: formatPublishTime,
        click_times: 0,
        link: '',
        out_link: $('#outLink').val(),
        arg1: $('#arg1').val(),
        arg2: $('#arg2').val(),
        arg3: $('#arg3').val(),

        sort_index: parseInt($('#sortIndex').val()) || 0,
        is_top: parseInt($('input[name="isTop"]:checked').val()) || 0,
        is_show: parseInt($('input[name="isShow"]:checked').val()) || 1,
        
        // 产品价格和库存字段
        regular_price: parseFloat($('#regularPrice').val()) || 0,
        sale_price: parseFloat($('#salePrice').val()) || 0,
        stock_count: parseInt($('#stockCount').val()) || 0,
        stock_status: $('#stockStatus').val() || '有货'
      })
    });
    
    const newProduct = await response.json();
    
    // 根据 ID 更新 link 字段
    if (newProduct.id) {
      await fetch(`http://localhost:5050/products/${newProduct.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          link: `product_${newProduct.id}.html`
        })
      });
    }
    
    window.location.href = '/admin/views/product-manage/productList/index.html';
  } catch (error) {
    console.error('编辑产品失败:', error);
    showToast('编辑产品失败', 'error');
  }
});

// 获取当前 id 的产品数据
const render = async () => {
  const product = await fetch(`http://localhost:5050/products/${updateId}`).then(res => res.json());
  console.log(product);

  // 填充表单数据
  $('#title').val(product.title);
  $('#intro').val(product.intro);
  $('#category').val(product.product_category_id);
  $('#author').val(product.author);
  $('#labels').val(product.labels);
  $('#publishTime').val(product.publish_time);
  $('#sortIndex').val(product.sort_index);
  $('#isTop').val(product.is_top);
  $('#isShow').val(product.is_show);
  $('#outLink').val(product.out_link);
  $('#arg1').val(product.arg1);
  $('#arg2').val(product.arg2);
  $('#arg3').val(product.arg3);
  
  // 填充价格和库存字段
  $('#regularPrice').val(product.regular_price || 0);
  $('#salePrice').val(product.sale_price || 0);
  $('#stockCount').val(product.stock_count || 0);
  $('#stockStatus').val(product.stock_status || '有货');
  
  // 填充封面图
  if (product.thumb_img_urls) {
    // 兼容数组和字符串两种格式
    thumb_img_urls = Array.isArray(product.thumb_img_urls) ? product.thumb_img_urls.filter(img => img && img.trim()) : [product.thumb_img_urls].filter(img => img && img.trim());
    renderCoverPreviews(thumb_img_urls);
  }
  
  // 填充内容
  editor.setHtml(product.content);
  content = product.content;
}

// 页面初始化
loadCategories();
render();
