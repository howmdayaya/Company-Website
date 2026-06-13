// 引入公共模块
import { loadView, isLogin } from '/admin/utils/load_view.js';

// 加载视图
loadView('nav-home');

// 用户信息
const user = JSON.parse(isLogin());

$('.user-info').html(`
    <img src="${user.photo || ''}" alt="${user.username || ''}" class="w-16 h-16 rounded-full">
    <div>
      <p>用户名：${user.username || ''}</p>
      <p>邮箱：${user.email || ''}</p>
    </div>
  `);

// 初始化图表
const productChart = echarts.init($('#productChart')[0]);
const articleChart = echarts.init($('#articleChart')[0]);

// 默认配置
const defaultOption = {
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: 'left',
    textStyle: {
      fontSize: 12
    }
  },
  series: [{
    type: 'pie',
    radius: ['40%', '70%'],
    avoidLabelOverlap: false,
    itemStyle: {
      borderRadius: 10,
      borderColor: '#fff',
      borderWidth: 2
    },
    label: {
      show: false,
      position: 'center'
    },
    emphasis: {
      label: {
        show: false,
        position: 'center'
      }
    },
    labelLine: {
      show: false
    }
  }]
};

// 设置默认配置
productChart.setOption({ ...defaultOption, title: { text: '产品总数', left: 'center', top: 'center', textStyle: { fontSize: 24, fontWeight: 'bold', color: '#999' } } });
articleChart.setOption({ ...defaultOption, title: { text: '文章总数', left: 'center', top: 'center', textStyle: { fontSize: 24, fontWeight: 'bold', color: '#999' } } });

// 颜色配置
const colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4'];

// 统计分类数据
const countByCategory = (items, categoryField, categoryNameField) => {
  const categoryMap = new Map();
  
  items.forEach(item => {
    const categoryId = item[categoryField];
    const categoryName = item[categoryNameField] || '未分类';
    
    if (!categoryMap.has(categoryId)) {
      categoryMap.set(categoryId, { name: categoryName, count: 0 });
    }
    categoryMap.get(categoryId).count++;
  });
  
  return Array.from(categoryMap.values()).map((item, index) => ({
    value: item.count,
    name: item.name,
    itemStyle: { color: colors[index % colors.length] }
  }));
};

// 并行获取产品和文章数据
const getDataAndRenderCharts = async () => {
  try {
    // 使用 Promise.all 并行获取数据
    const [articlesResponse, productsResponse, productCategoriesResponse, articleCategoriesResponse] = await Promise.all([
      fetch('http://localhost:5050/articles'),
      fetch('http://localhost:5050/products'),
      fetch('http://localhost:5050/product_categorys'),
      fetch('http://localhost:5050/article_categorys')
    ]);
    
    const articles = await articlesResponse.json();
    const products = await productsResponse.json();
    const productCategories = await productCategoriesResponse.json();
    const articleCategories = await articleCategoriesResponse.json();
    
    // 统计产品分类数据
    const productData = countByCategory(products, 'product_category_id', 'product_category_name');
    
    // 统计文章分类数据
    const articleData = countByCategory(articles, 'article_category_id', 'article_category_name');
    
    // 更新产品图表
    productChart.setOption({
      ...defaultOption,
      title: {
        text: products.length,
        subtext: '产品总数',
        left: 'center',
        top: 'center',
        textStyle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
        subtextStyle: { fontSize: 14, color: '#666' }
      },
      series: [{
        ...defaultOption.series[0],
        data: productData.length > 0 ? productData : [{ value: 1, name: '暂无数据', itemStyle: { color: '#ccc' } }]
      }],
      legend: {
        data: productData.map(item => item.name)
      }
    });
    
    // 更新文章图表
    articleChart.setOption({
      ...defaultOption,
      title: {
        text: articles.length,
        subtext: '文章总数',
        left: 'center',
        top: 'center',
        textStyle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
        subtextStyle: { fontSize: 14, color: '#666' }
      },
      series: [{
        ...defaultOption.series[0],
        data: articleData.length > 0 ? articleData : [{ value: 1, name: '暂无数据', itemStyle: { color: '#ccc' } }]
      }],
      legend: {
        data: articleData.map(item => item.name)
      }
    });
    
  } catch (error) {
    console.error('获取数据失败:', error);
  }
};

// 页面加载完成后获取数据并渲染图表
getDataAndRenderCharts();

// 窗口大小变化时重新调整图表
$(window).on('resize', () => {
  productChart.resize();
  articleChart.resize();
});
