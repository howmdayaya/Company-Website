// 引入公共模块
import { loadView, showToast, showConfirm } from '/web/utils/load_view.js';

// 加载视图
loadView('nav-contact');

// DOM加载完成后绑定事件
$(function() {
  // 联系表单提交
  $('#contactForm').submit(function(e) {
    e.preventDefault();

    // 获取表单数据
    const formData = {
      name: $('#name').val().trim(),
      phone: $('#phone').val().trim(),
      email: $('#email').val().trim(),
      message: $('#message').val().trim()
    };

    // 验证表单
    if (!formData.name) {
      showToast('请输入您的姓名', 'warning');
      $('#name').focus();
      return;
    }

    if (!formData.phone) {
      showToast('请输入联系电话', 'warning');
      $('#phone').focus();
      return;
    }

    // 简单的电话格式验证
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      showToast('请输入有效的手机号码', 'warning');
      $('#phone').focus();
      return;
    }

    if (!formData.message) {
      showToast('请输入留言内容', 'warning');
      $('#message').focus();
      return;
    }

    // 模拟提交
    showToast('正在提交...', 'info');
    setTimeout(() => {
      showToast('留言提交成功！我们会尽快联系您。', 'success');
      $('#contactForm')[0].reset();
    }, 1500);
  });

  // 输入框聚焦效果
  $('input, textarea').focus(function() {
    $(this).parent().addClass('focused');
  }).blur(function() {
    $(this).parent().removeClass('focused');
  });
});
