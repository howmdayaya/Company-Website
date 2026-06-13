// 引入公共模块
import { loadView, isLogin, showToast, showConfirm } from '/admin/utils/load_view.js';

// 加载视图
loadView('nav-article-list');

// 获取url参数id
const updateId = new URL(window.location.href).searchParams.get('id');
// console.log(updateId);



let coverfile = []
let content = ''

// =========wangEditor 初始化  start=========
const { createEditor, createToolbar } = window.wangEditor

// 编辑器配置
const editorConfig = {
  placeholder: 'Type here...',
  autoFocus: false,
  onChange(editor) {
    const html = editor.getHtml()
    content = html
  },
  MENU_CONF: {
    // 配置上传图片（base64方式）
    uploadImage: {
      // 自定义上传函数，转为base64
      async customUpload(file, insertFn) {
        try {
          // 检查文件类型
          if (!file.type.startsWith('image/')) {
            showToast('请选择图片文件', 'warning')
            return
          }
          
          // 检查文件大小（限制2MB）
          if (file.size > 2 * 1024 * 1024) {
            showToast('图片大小不能超过2MB', 'warning')
            return
          }
          
          // 转换为base64
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


// 设置默认发布时间为当前时间
const setDefaultPublishTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  $('#publishTime').val(`${year}-${month}-${day}T${hours}:${minutes}`);
};

// 页面加载时设置默认发布时间
setDefaultPublishTime();

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

// coverfile 上传（带预览，追加模式，允许重复选择相同图片）
$('#coverfile').change(function (e) {
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
          coverfile = [...coverfile, ...results];
          renderCoverPreviews(coverfile);
          $('#coverUrl').val('');
          // 重置 input，允许重复选择相同文件
          $('#coverfile').val('');
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
    $('#coverfile').val('');
    coverfile = urls;
  } else {
    renderCoverPreviews([]);
    coverfile = [];
  }
});

// 删除单张预览图片
$(document).on('click', '.remove-cover-btn', function() {
  const index = $(this).data('index');
  coverfile.splice(index, 1);
  $('#coverUrl').val('');
  renderCoverPreviews(coverfile);
});


// 加载分类列表
const loadCategories = async () => {
  try {
    const response = await fetch('http://localhost:5050/article_categorys');
    const categories = await response.json();
    
    // 更新文章表单的分类选择器
    updateCategorySelect(categories);
    
    // 更新分类管理的父级选择器
    updateParentCategorySelect(categories);
    
    // 渲染分类列表
    renderCategoryList(categories);
  } catch (error) {
    console.error('加载分类失败:', error);
    $('#categoryList').html('<div class="text-gray-500 text-center py-8">加载失败</div>');
  }
};

// 更新文章表单的分类选择器
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

// 更新分类管理的父级选择器（支持所有分类作为父级）
const updateParentCategorySelect = (categories) => {
  const $select = $('#parentCategory');
  $select.html('<option value="0">顶级分类</option>');
  
  // 递归添加分类选项
  const addOptions = (items, parentId = 0) => {
    items.filter(item => item.parent_id === parentId).forEach(item => {
      $select.append(`<option value="${item.id}">${item.name}</option>`);
      // 递归添加子分类
      const children = categories.filter(c => c.parent_id === item.id);
      if (children.length > 0) {
        addOptions(categories, item.id);
      }
    });
  };
  
  addOptions(categories);
};

// 渲染分类列表（支持折叠）
const renderCategoryList = (categories) => {
  if (categories.length === 0) {
    $('#categoryList').html('<div class="text-gray-500 text-center py-12">暂无分类</div>');
    return;
  }
  
  // 构建树形结构
  const buildTree = (items, parentId = 0) => {
    return items
      .filter(item => item.parent_id === parentId)
      .map(item => {
        const children = buildTree(items, item.id);
        return { ...item, children };
      });
  };
  
  const tree = buildTree(categories);
  
  // 渲染树形结构（支持折叠）
  const renderTree = (items, level = 0) => {
    if (items.length === 0) return '';
    
    return items.map(item => {
      const hasChildren = item.children && item.children.length > 0;
      const paddingLeft = level * 16;
      
      const levelPadding = level * 24;
      
      return `
        <div class="category-item" data-id="${item.id}">
          <div class="flex items-center gap-3 py-3 hover:bg-gray-50 transition-colors" style="padding-left: ${6 + levelPadding}px;">
            <!-- 折叠/展开按钮 -->
            <button class="collapse-btn w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 ${hasChildren ? '' : 'invisible'}" 
              data-id="${item.id}" title="${hasChildren ? '点击折叠' : ''}">
              <i class="fas fa-angle-right transition-transform duration-200"></i>
            </button>
            <!-- 分类名称和ID -->
            <span class="text-gray-700 flex-grow">${item.name}</span>
            <span class="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded flex-shrink-0">${item.id}</span>
            <!-- 操作按钮 -->
            <div class="flex items-center gap-1 flex-shrink-0">
              <button class="add-subcategory-btn p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" 
                data-id="${item.id}" data-name="${item.name}" title="添加子分类">
                <i class="fas fa-plus-circle"></i>
              </button>
              <button class="edit-category-btn p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" 
                data-id="${item.id}" data-name="${item.name}" data-parent-id="${item.parent_id}" title="编辑">
                <i class="fas fa-edit"></i>
              </button>
              <button class="delete-category-btn p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" 
                data-id="${item.id}" data-name="${item.name}" title="删除">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          <!-- 子分类（默认展开） -->
          ${hasChildren ? `
            <div class="children-container" data-parent-id="${item.id}">
              ${renderTree(item.children, level + 1)}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  };
  
  $('#categoryList').html(renderTree(tree));
};

// 折叠/展开分类
$(document).on('click', '.collapse-btn', function() {
  const parentId = $(this).data('id');
  const $children = $(`.children-container[data-parent-id="${parentId}"]`);
  const $icon = $(this).find('i');
  
  if ($children.is(':visible')) {
    $children.hide();
    $icon.removeClass('rotate-90');
  } else {
    $children.show();
    $icon.addClass('rotate-90');
  }
});

// 添加分类
$('#addCategoryBtn').click(async () => {
  const name = $('#newCategoryName').val().trim();
  const parent_id = parseInt($('#parentCategory').val());
  
  if (!name) {
    showToast('请输入分类名称', 'warning');
    return;
  }
  
  try {
    await fetch('http://localhost:5050/article_categorys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, parent_id })
    });
    
    $('#newCategoryName').val('');
    $('#parentCategory').val('0');
    await loadCategories();
    showToast('添加成功', 'success');
  } catch (error) {
    console.error('添加分类失败:', error);
    showToast('添加失败', 'error');
  }
});

// 添加子分类弹窗
const addSubcategoryModal = `
  <div id="addSubcategory" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 hidden">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">添加子分类</h3>
      <input type="hidden" id="subcategoryParentId">
      <div class="mb-4">
        <label for="subcategoryName" class="block text-sm font-medium text-gray-700 mb-2">子分类名称</label>
        <input type="text" id="subcategoryName" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">上级分类</label>
        <div class="text-gray-600 bg-gray-50 px-4 py-2.5 rounded-lg" id="subcategoryParentName"></div>
      </div>
      <div class="flex gap-3">
        <button id="cancelAddSubcategory" class="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors">
          取消
        </button>
        <button id="saveAddSubcategory" class="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
          添加
        </button>
      </div>
    </div>
  </div>
`;

// 添加子分类弹窗到页面
$('body').append(addSubcategoryModal);

// 添加子分类按钮点击事件
$(document).on('click', '.add-subcategory-btn', function() {
  const parentId = $(this).data('id');
  const parentName = $(this).data('name');
  
  $('#subcategoryParentId').val(parentId);
  $('#subcategoryParentName').text(parentName);
  $('#subcategoryName').val('');
  $('#addSubcategory').removeClass('hidden');
  $('body').css('overflow', 'hidden');
});

// 取消添加子分类
$('#cancelAddSubcategory').click(() => {
  $('#addSubcategory').addClass('hidden');
  $('body').css('overflow', 'auto');
});

// 保存子分类
$('#saveAddSubcategory').click(async () => {
  const parentId = parseInt($('#subcategoryParentId').val());
  const name = $('#subcategoryName').val().trim();
  
  if (!name) {
    showToast('请输入子分类名称', 'warning');
    return;
  }
  
  try {
    await fetch('http://localhost:5050/article_categorys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, parent_id: parentId })
    });
    
    $('#addSubcategory').addClass('hidden');
    $('body').css('overflow', 'auto');
    await loadCategories();
    showToast('添加成功', 'success');
  } catch (error) {
    console.error('添加子分类失败:', error);
    showToast('添加失败', 'error');
  }
});

// 点击遮罩关闭子分类弹窗
$('#addSubcategory').click(function(e) {
  if (e.target === this) {
    $('#addSubcategory').addClass('hidden');
    $('body').css('overflow', 'auto');
  }
});

// 删除分类
$(document).on('click', '.delete-category-btn', async function() {
  const id = $(this).data('id');
  const name = $(this).data('name');
  
  if (!await showConfirm({
    title: '删除确认',
    content: `确定要删除分类 "${name}" 吗？`,
    confirmText: '删除',
    cancelText: '取消',
    type: 'danger'
  })) {
    return;
  }
  
  try {
    // 检查是否有子分类
    const categoriesResponse = await fetch('http://localhost:5050/article_categorys');
    const categories = await categoriesResponse.json();
    const hasChildren = categories.some(cat => cat.parent_id === id);
    
    if (hasChildren) {
      showToast('该分类下存在子分类，无法删除', 'warning');
      return;
    }
    
    // 检查是否有文章使用该分类
    const articlesResponse = await fetch('http://localhost:5050/articles');
    const articles = await articlesResponse.json();
    const hasArticles = articles.some(article => article.article_category_id === id);
    
    if (hasArticles) {
      showToast('该分类下存在文章，无法删除', 'warning');
      return;
    }
    
    const deleteResponse = await fetch(`http://localhost:5050/article_categorys/${id}`, { method: 'DELETE' });
    if (!deleteResponse.ok) {
      throw new Error(`删除失败，状态码: ${deleteResponse.status}`);
    }
    await loadCategories();
    showToast('删除成功', 'success');
  } catch (error) {
    console.error('删除分类失败:', error);
    showToast('删除失败: ' + error.message, 'error');
  }
});

// 编辑分类弹窗
const editCategoryModal = `
  <div id="editCategoryModalOverlay" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 hidden">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">编辑分类</h3>
      <input type="hidden" id="editCategoryId">
      <div class="mb-4">
        <label for="editCategoryName" class="block text-sm font-medium text-gray-700 mb-2">分类名称</label>
        <input type="text" id="editCategoryName" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
      </div>
      <div class="mb-4">
        <label for="editParentCategory" class="block text-sm font-medium text-gray-700 mb-2">上级分类</label>
        <select id="editParentCategory" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white">
          <option value="0">顶级分类</option>
        </select>
      </div>
      <div class="flex gap-3">
        <button id="cancelEditCategory" class="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors">
          取消
        </button>
        <button id="saveEditCategory" class="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
          保存
        </button>
      </div>
    </div>
  </div>
`;

// 添加编辑弹窗到页面
$('body').append(editCategoryModal);

// 更新编辑弹窗的上级分类选项（支持所有分类作为父级）
const updateEditParentCategorySelect = (categories, currentId) => {
  const $select = $('#editParentCategory');
  $select.html('<option value="0">顶级分类</option>');
  
  // 递归添加所有分类选项（排除当前编辑的分类）
  const addOptions = (items, parentId = 0) => {
    items.filter(item => item.parent_id === parentId && item.id != currentId).forEach(item => {
      $select.append(`<option value="${item.id}">${item.name}</option>`);
      // 递归添加子分类
      const children = categories.filter(c => c.parent_id === item.id);
      if (children.length > 0) {
        addOptions(categories, item.id);
      }
    });
  };
  
  addOptions(categories);
};

// 编辑分类
$(document).on('click', '.edit-category-btn', async function() {
  const id = $(this).data('id');
  const name = $(this).data('name');
  const parentId = $(this).data('parent-id');
  
  // 加载分类数据并更新编辑弹窗的上级分类选项
  try {
    const response = await fetch('http://localhost:5050/article_categorys');
    const categories = await response.json();
    updateEditParentCategorySelect(categories, id);
  } catch (error) {
    console.error('加载分类失败:', error);
  }
  
  $('#editCategoryId').val(id);
  $('#editCategoryName').val(name);
  $('#editParentCategory').val(parentId);
  $('#editCategoryModalOverlay').removeClass('hidden');
  $('body').css('overflow', 'hidden');
});

// 取消编辑
$('#cancelEditCategory').click(() => {
  $('#editCategoryModalOverlay').addClass('hidden');
  $('body').css('overflow', 'auto');
});

// 保存编辑
$('#saveEditCategory').click(async () => {
  const id = $('#editCategoryId').val();
  const name = $('#editCategoryName').val().trim();
  const parentId = parseInt($('#editParentCategory').val());
  
  if (!name) {
    showToast('请输入分类名称', 'warning');
    return;
  }
  
  try {
    await fetch(`http://localhost:5050/article_categorys/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, parent_id: parentId })
    });
    
    $('#editCategoryModalOverlay').addClass('hidden');
    $('body').css('overflow', 'auto');
    await loadCategories();
    showToast('更新成功', 'success');
  } catch (error) {
    console.error('更新分类失败:', error);
    showToast('更新失败', 'error');
  }
});

// 点击遮罩关闭弹窗
$('#editCategoryModalOverlay').click(function(e) {
  if (e.target === this) {
    $('#editCategoryModalOverlay').addClass('hidden');
    $('body').css('overflow', 'auto');
  }
});

// 提交文章
$('#editArticleForm').on('submit', async (e) => {
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
    const response = await fetch(`http://localhost:5050/articles/${updateId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: $('#title').val(),
        intro: $('#intro').val(),
        article_category_id: parseInt(categoryId),
        article_category_name: categoryName,
        coverfile: coverfile,
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
        is_show: parseInt($('input[name="isShow"]:checked').val()) || 1
      })
    });
    
    const newArticle = await response.json();
    
    // 根据 ID 更新 link 字段
    if (newArticle.id) {
      await fetch(`http://localhost:5050/articles/${newArticle.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          link: `article_${newArticle.id}.html`
        })
      });
    }
    
    window.location.href = '/admin/views/article-manage/articleList/index.html';
  } catch (error) {
    console.error('编辑文章失败:', error);
    showToast('编辑失败', 'error');
  }
});

// 页面加载时加载分类
loadCategories();


// 获取当前id的文章数据
const render=async ()=>{
  const article = await fetch(`http://localhost:5050/articles/${updateId}`).then(res=>res.json());
  console.log(article);

  // 填充表单数据
  $('#title').val(article.title);
  $('#intro').val(article.intro);
  $('#category').val(article.article_category_id);
  $('#author').val(article.author);
  $('#labels').val(article.labels);
  $('#publishTime').val(article.publish_time);
  $('#sortIndex').val(article.sort_index);
  $('#isTop').val(article.is_top);
  $('#isShow').val(article.is_show);
  $('#outLink').val(article.out_link);
  $('#arg1').val(article.arg1);
  $('#arg2').val(article.arg2);
  $('#arg3').val(article.arg3);
  
  // 填充封面图
  if (article.coverfile) {
    // 兼容数组和字符串两种格式
    coverfile = Array.isArray(article.coverfile) ? article.coverfile.filter(img => img && img.trim()) : [article.coverfile].filter(img => img && img.trim());
    renderCoverPreviews(coverfile);
  }
  

  // 填充内容
  editor.setHtml(article.content);
  content = article.content;
}

render();