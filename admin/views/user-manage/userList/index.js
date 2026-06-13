// 引入公共模块
import { loadView, showToast, showConfirm } from '/admin/utils/load_view.js';

// 加载视图
loadView('nav-user-list');

// 渲染用户列表
const renderUserList = async () => {
  const userList = $('#userList');
  userList.empty();

  const list = await fetch('http://localhost:5050/users').then(res => res.json());
  
  // 更新用户数量
  $('#userCount').text(`共 ${list.length} 个用户`);

  userList.html(list.map(item => `
    <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 flex items-center gap-4">
      <div class="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
        ${item.photo ? `<img src="${item.photo}" alt="${item.username}" class="w-full h-full object-cover">` : '<i class="fas fa-user"></i>'}
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <span class="font-medium text-gray-800">${item.username}</span>
          <span class="px-2 py-0.5 text-xs text-nowrap rounded-full bg-green-100 text-green-600">${item.default ? '管理员' : '普通用户'}</span>
        </div>
        <div class="text-sm text-gray-500 truncate">${item.email || ''}</div>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-xs text-gray-400">ID: ${item.id}</span>
        <button class="edit-btn p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" data-id="${item.id}" ${item.default ? 'disabled' : ''}>
          <i class="fas fa-edit"></i>
        </button>
        <button class="delete-btn p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" data-id="${item.id}" data-username="${item.username}" ${item.default ? 'disabled' : ''}>
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('\n'));
};

// 获取用户信息预填充并显示模态框
const editUser = async (id) => {
  try {
    const response = await fetch(`http://localhost:5050/users/${id}`);
    const user = await response.json();
    
    // 填充表单数据（密码和图片不填充，留空表示不修改）
    $('#userId').val(user.id);
    $('#username').val(user.username);
    $('#email').val(user.email || '');
    $('#password').val(''); // 密码留空
    $('#modalTitle').text('编辑用户');
    
    // 显示模态框
    $('#editModalOverlay').removeClass('hidden');
    $('body').css('overflow', 'hidden');
  } catch (error) {
    console.error('获取用户信息失败:', error);
    alert('获取用户信息失败');
  }
};

// 更新用户 - 密码和图片留空则不修改
const updateUser = async (e) => {
  e.preventDefault();
  
  const id = $('#userId').val();
  const username = $('#username').val();
  const password = $('#password').val().trim();
  const email = $('#email').val().trim();
  const photoInput = $('#photo')[0];
  
  if (!username) {
    alert('请输入用户名');
    return;
  }
  
  try {
    // 获取现有用户数据（用于保留未修改的字段）
    const existingUserResponse = await fetch(`http://localhost:5050/users/${id}`);
    const existingUser = await existingUserResponse.json();
    
    // 构建更新数据，只包含非空字段
    const updateData = {
      username: username,
      email: email || existingUser.email || ''
    };
    
    // 密码留空则不修改
    if (password) {
      updateData.password = password;
    } else {
      updateData.password = existingUser.password;
    }
    
    // 处理图片上传（留空则不修改）
    if (photoInput.files && photoInput.files[0]) {
      const reader = new FileReader();
      reader.onload = async function(event) {
        updateData.photo = event.target.result;
        await submitUpdate(id, updateData);
      };
      reader.readAsDataURL(photoInput.files[0]);
    } else {
      // 图片留空，保留原图片
      updateData.photo = existingUser.photo || '';
      await submitUpdate(id, updateData);
    }
    
  } catch (error) {
    console.error('更新失败:', error);
    alert('更新失败');
  }
};

// 提交更新请求
const submitUpdate = async (id, data) => {
  try {
    await fetch(`http://localhost:5050/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    alert('更新成功');
    closeModal();
    renderUserList();
  } catch (error) {
    console.error('提交更新失败:', error);
    alert('更新失败');
  }
};

// 删除用户
const deleteUser = async (id, username) => {
  // 确认删除
  if (!await showConfirm({
    title: '删除确认',
    content: `确定要删除用户 "${username}" 吗？`,
    confirmText: '删除',
    cancelText: '取消',
    type: 'danger'
  })) {
    return;
  }
  
  try {
    await fetch(`http://localhost:5050/users/${id}`, { method: 'DELETE' });
    alert('删除成功');
    renderUserList();
  } catch (error) {
    console.error('删除失败:', error);
    alert('删除失败');
  }
};

// 关闭模态框
const closeModal = () => {
  $('#editModalOverlay').addClass('hidden');
  $('body').css('overflow', 'auto');
  $('#editUserForm')[0].reset();
  $('#userId').val('');
};

// 事件委托处理按钮点击
$('#userList').on('click', function(e) {
  // 找一下按钮附近的元素，特别是图标内的点击
  const $editBtn = $(e.target).closest('.edit-btn');
  const $deleteBtn = $(e.target).closest('.delete-btn');
  
  if ($editBtn.length && !$editBtn.is('[disabled]')) {
    editUser($editBtn.data('id'));
  } else if ($deleteBtn.length && !$deleteBtn.is('[disabled]')) {
    deleteUser($deleteBtn.data('id'), $deleteBtn.data('username'));
  }
});

// 关闭模态框事件
$('#closeModal, #cancelBtn').on('click', closeModal);

// 点击遮罩层关闭模态框
$('#editModalOverlay').on('click', function(e) {
  if (e.target === this) {
    closeModal();
  }
});

// 表单提交事件
$('#editUserForm').on('submit', updateUser);

// 渲染用户列表
renderUserList();