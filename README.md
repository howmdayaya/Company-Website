# hzz_web01 技术文档

## 项目概述

hzz_web01 是一个企业官网与后台管理系统，采用前后端分离架构。前台展示网站提供产品展示、新闻动态、公司介绍等功能，后台管理系统支持对用户、文章、产品等内容的管理。是个用 JSON 数据库的简单项目。===是个示例===

## 技术栈

| 类别         | 技术                         | CDN/版本                                                                  |
| ------------ | ---------------------------- | ------------------------------------------------------------------------- |
| 前端框架     | 原生 HTML + CSS + JavaScript | -                                                                         |
| UI 组件      | Tailwind CSS                 | https://cdn.tailwindcss.com                                               |
| 图表库       | ECharts                      | `/admin/lib/js/echarts.js`                                                |
| 后端服务     | json-server                  | 全局安装（无版本锁定）                                                    |
| 图片轮播     | Swiper                       | `/web/components/banner/swiper-bundle.min.js`                             |
| 富文本编辑器 | WangEditor                   | https://unpkg.com/@wangeditor/editor@latest                               |
| 图标库       | Font Awesome                 | https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css |

## 项目结构

```
hzz_web01/
├── admin/                    # 后台管理系统
│   ├── components/           # 公共组件
│   │   ├── aside/           # 侧边导航栏
│   │   └── topBar/          # 顶部栏
│   ├── lib/js/              # 第三方库
│   │   └── echarts.js       # ECharts 图表库
│   ├── utils/                # 工具函数
│   │   └── load_view.js     # 视图加载工具
│   └── views/                # 页面视图
│       ├── article-manage/  # 文章管理
│       │   ├── addArticle/  # 添加文章
│       │   ├── articleList/ # 文章列表
│       │   └── editArticle/ # 编辑文章
│       ├── home/            # 首页仪表盘
│       ├── login/            # 登录页
│       ├── product-manage/  # 产品管理
│       │   ├── addProduct/  # 添加产品
│       │   ├── editProduct/ # 编辑产品
│       │   └── productList/ # 产品列表
│       └── user-manage/     # 用户管理
│           ├── addUser/      # 添加用户
│           └── userList/     # 用户列表
│
├── db/                       # 数据库文件
│   ├── db.json              # JSON 数据库
│   └── public/              # 静态资源
│
├── web/                      # 前台展示网站
│   ├── components/           # 公共组件
│   │   ├── banner/          # 图片轮播
│   │   ├── footer/          # 页脚
│   │   ├── hero/             # 内页顶部图片区域
│   │   └── topBar/          # 顶部导航栏
│   ├── utils/                # 工具函数
│   │   └── load_view.js     # 视图加载工具
│   └── views/                # 页面视图
│       ├── about/           # 关于我们
│       ├── contact/          # 联系方式
│       ├── detail/           # 详情页
│       │   ├── article.html  # 文章详情
│       │   └── product.html  # 产品详情
│       ├── index/            # 首页
│       ├── news/             # 新闻列表
│       └── products/         # 产品列表
│
└── package.json             # 项目配置
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动后端 API 服务

```bash
npm run serve:json
```

后端服务运行在 http://localhost:5050

### 启动前端页面

由于项目使用原生 HTML/CSS/JavaScript，无需构建工具，有两种启动方式：

**方式一：直接打开（推荐用于快速预览）**

```bash
# 1. 启动后端 API
npm run serve:json

# 2. 在浏览器中直接打开 HTML 文件
# 前台首页: /web/views/index/index.html
# 后台登录: /admin/views/login/index.html
```

**方式二：使用 VS Code 插件（推荐）**

安装 **Preview on Web Server** 插件，右键点击 HTML 文件选择 "Preview on Web Server"，插件会自动启动本地服务器并在浏览器中打开预览。

推荐配置：

- 服务器根目录设置为项目根目录 `hzz_web01`
- 默认端口：8080

## API 接口

json-server 提供 RESTful API，数据库资源如下：

| 资源             | 说明     |
| ---------------- | -------- |
| users            | 用户数据 |
| products         | 产品数据 |
| articles         | 文章数据 |
| article_category | 文章分类 |
| product_category | 产品分类 |

### 主要接口示例

```
GET    /users          # 获取用户列表
GET    /products       # 获取产品列表
GET    /articles       # 获取文章列表
POST   /products       # 添加产品
PUT    /products/:id   # 更新产品
DELETE /products/:id   # 删除产品
```

## 前台网站 (web/)

### 页面路由

| 路径                           | 页面     |
| ------------------------------ | -------- |
| /web/views/index/index.html    | 首页     |
| /web/views/products/index.html | 产品列表 |
| /web/views/news/index.html     | 新闻列表 |
| /web/views/about/index.html    | 关于我们 |
| /web/views/contact/index.html  | 联系方式 |
| /web/views/detail/article.html | 文章详情 |
| /web/views/detail/product.html | 产品详情 |

### 公共组件

- **topBar**: 顶部导航栏，包含 Logo 和导航菜单
- **banner**: 图片轮播组件，基于 Swiper
- **hero**: 内页顶部图片区域组件
- **footer**: 页脚组件

#### Hero 组件使用说明

**功能概述**

Hero 组件用于展示内页的顶部区域，包含标题、副标题、面包屑导航和背景装饰。（实习收获）

**使用方式**

在 HTML 页面中添加容器并配置参数：

```html
<div
  id="hero"
  data-config='{"title":"页面标题","breadcrumb":"当前页面","subtitle":"页面描述","bg":""}'
></div>
```

**配置参数**

| 参数       | 类型   | 必填 | 默认值   | 说明                                 |
| ---------- | ------ | ---- | -------- | ------------------------------------ |
| title      | string | 是   | 页面标题 | 页面主标题，同时设置为浏览器标签标题 |
| breadcrumb | string | 是   | 当前页面 | 面包屑导航中的当前页面名称           |
| subtitle   | string | 否   | 空       | 副标题描述文字，为空时不显示         |
| bg         | string | 否   | 空       | 背景图片 URL，为空时使用默认纯色背景 |

**示例**

```html
<!-- 基础用法 -->
<div id="hero" data-config='{"title":"关于我们","breadcrumb":"关于我们"}'></div>

<!-- 带副标题和背景图 -->
<div
  id="hero"
  data-config='{"title":"产品中心","breadcrumb":"产品","subtitle":"探索我们的优质产品系列","bg":"/images/bg.jpg"}'
></div>
```

**组件特性**

- 默认背景色：`#4a6723`（绿色主题）
- 响应式设计，适配各种屏幕尺寸
- 支持背景图片或纯色背景
- 自动设置浏览器标签标题
- 包含装饰性元素（圆形装饰、网格背景）


## 后台管理系统 (admin/)

### 功能模块

#### 首页仪表盘

- 数据统计展示
- ECharts 图表可视化

#### 文章管理

- 文章列表展示
- 添加新文章
- 编辑已有文章
- 文章分类管理

#### 产品管理

- 产品列表展示
- 添加新产品
- 编辑产品信息
- 产品上下架管理

#### 用户管理

- 用户列表展示
- 添加用户
- 编辑用户信息
- 用户权限管理

### 登录页面

路径: `/admin/views/login/index.html`

默认测试账号:

- 用户名: admin
- 密码: 123456

## 数据库模型

### 用户 (users)

```json
{
  "id": 1,
  "username": "admin",
  "password": "123456",
  "email": "admin@example.com",
  "role": "admin",
  "photo": "base64..."
}
```

### 产品 (products)

```json
{
  "id": 1,
  "title": "产品名称",
  "intro": "产品简介",
  "coverfile": ["base64..."],
  "content": "产品详情",
  "category_id": 1,
  "publish_time": "2026-06-10"
}
```

### 文章 (articles)

```json
{
  "id": 1,
  "title": "文章标题",
  "intro": "文章简介",
  "content": "<p>HTML内容</p>",
  "author": "admin",
  "publish_time": "2026-06-10",
  "click_times": 0,
  "is_show": 1
}
```

## 开发指南

### 添加新页面

1. 在对应目录下创建 `index.html` 和 `index.js`
2. 使用 `load_view.js` 加载视图组件
3. 在 topBar 中添加导航链接

### 组件开发规范

- HTML 组件放在各组件目录下的 `index.html`
- 样式文件统一使用 Tailwind CSS
- JavaScript 逻辑放在 `index.js` 文件中

### 静态资源

- 图片等静态资源存放在 `db/public/` 目录
- 通过 json-server 的静态文件服务访问


## 注意事项

1. 生产环境部署时需替换 json-server 为真实后端服务
2. 密码在数据库中为明文存储，生产环境请使用加密存储
3. Base64 图片数据较大，建议在生产环境使用文件存储
4. 依赖导入使用的是 CDN 链接，生产环境请替换为本地文件
5. 文章和产品详情是通过获取url参数id来获取详情数据，不操作文件系统，仅从db.json中读取数据渲染页面，===是个示例===
