// 引入公共模块
import {loadView} from '/admin/utils/load_view.js';

// 加载视图
loadView('nav-user-add');


let photo = '';
// 缓存用户列表（首次加载时获取）
let cachedUsers = [];

// 初始化时获取用户列表
async function initUsersCache() {
  const response = await fetch('http://localhost:5050/users');
  cachedUsers = await response.json();
}

// 添加用户表单提交（使用缓存）
$('#addUserForm').submit(async function (e) {
  e.preventDefault();
  
  const username = $('#username').val();
  const password = $('#password').val();
  const email = $('#email').val();
  
  // 验证输入
  if (!username || !password || !email) {
    alert('请填写用户名、密码和邮箱');
    return;
  }
  
  try {
    // 1、先从缓存快速判断，避免重复请求
    const existsInCache = cachedUsers.some(user => user.username === username);
    if (existsInCache) {
      alert('该用户名已存在，请使用其他用户名');
      return;
    }
    
    // 2、缓存里没有，再请求后端验证
    const response = await fetch('http://localhost:5050/users');
    const users = await response.json();
    
    // 更新缓存
    cachedUsers = users;
    
    // 检查用户名是否已存在
    const exists = users.some(user => user.username === username);
    
    if (exists) {
      alert('该用户名已存在，请使用其他用户名');
      return;
    }
    
    // 用户名不存在，提交数据
    await fetch('http://localhost:5050/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        password: password,
        photo: photo,
        email: email,
      }),
    });
    
    // 更新缓存（添加新用户）
    cachedUsers.push({ username, password, photo, email }); 
    
    // 提交成功后，跳转到用户列表页面
    window.location.href = '/admin/views/user-manage/userList/index.html';
    
  } catch (error) {
    console.error('请求失败:', error);
    alert('请求失败，请稍后重试');
  }
});

// 页面加载时初始化缓存
initUsersCache();

// photo 上传
$('#photo').change(function (e) {
  // console.log(e.target.files[0]);
  // 转换为 base64 格式
  const reader = new FileReader();
  reader.readAsDataURL(e.target.files[0]);
  reader.onload = function (e) {
    //console.log(e.target.result);
    // 赋值给 photo 输入框
    photo = e.target.result;
  };
});
