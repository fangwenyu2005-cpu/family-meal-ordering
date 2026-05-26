# 家庭点餐小程序

咖啡馆/茶饮/烘焙店扫码点餐系统，包含顾客点餐小程序、商家管理网页端、Node.js 后端、Neon PostgreSQL 数据库。

## 项目结构

```
├── miniprogram/              # 微信小程序（顾客点餐端）
│   ├── app.js                # 应用入口，全局状态管理
│   ├── app.json              # 页面注册 & 窗口配置
│   ├── app.wxss              # 全局样式（深色主题）
│   ├── utils/api.js          # API 请求封装
│   ├── components/
│   │   └── spec-selector/    # 规格选择组件（杯型/温度/糖量）
│   └── pages/
│       ├── index/            # 桌号确认页
│       ├── menu/             # 菜单浏览页
│       ├── cart/             # 购物车
│       ├── checkout/         # 提交订单
│       └── order/            # 订单状态
├── server/                   # Node.js 后端 API
│   ├── prisma/
│   │   ├── schema.prisma     # 数据模型定义
│   │   └── seed.js           # 种子数据脚本
│   ├── src/
│   │   ├── index.js          # Express 入口
│   │   ├── config.js         # 环境配置
│   │   ├── middleware/
│   │   │   ├── auth.js       # JWT 认证中间件
│   │   │   └── errorHandler.js
│   │   └── routes/
│   │       ├── categories.js # 分类接口
│   │       ├── products.js   # 商品接口
│   │       ├── tables.js     # 桌号接口
│   │       ├── orders.js     # 订单接口（顾客端）
│   │       ├── admin.js      # 管理端接口
│   │       └── stats.js      # 统计接口
│   ├── Dockerfile
│   └── .env                  # 环境变量（不提交）
├── admin/                    # React 商家管理端
│   └── src/
│       ├── App.jsx           # 路由 & 布局
│       ├── utils/api.js      # Axios 封装
│       └── pages/
│           ├── Login.jsx     # 登录页
│           ├── Dashboard.jsx # 仪表盘
│           ├── Orders.jsx    # 订单管理
│           ├── Menu.jsx      # 菜单管理
│           ├── Stats.jsx     # 流水统计
│           └── Tables.jsx    # 桌号管理
└── docs/                     # 设计文档
    └── superpowers/
        ├── specs/            # 设计方案
        └── plans/            # 实施计划
```

## 技术栈

| 层级 | 技术 |
|------|------|
| 点餐端 | 原生微信小程序（WXML / WXSS / JS） |
| 商家端 | React + Ant Design + Vite |
| 后端 | Node.js + Express + Prisma ORM |
| 数据库 | Neon PostgreSQL（Serverless） |
| 部署 | 微信云托管 + Docker |

## 功能概要

### 顾客点餐端
- 扫码自动获取桌号（微信小程序码 `?table=xxx`）
- 分类浏览菜单，商品卡片含图片
- 规格选择：杯型（影响价格）、温度、糖量
- 购物车：改数量、删单品
- 提交订单：选择堂食/打包 → 到店付款
- 订单状态实时追踪

### 商家管理端
- 仪表盘：今日订单数、营业额、待处理订单提醒
- 订单管理：确认接单 → 制作中 → 完成，可取消
- 菜单管理：分类、单品 CRUD，规格关联，上下架
- 流水统计：日/周/月报表，单品销量排行
- 桌号管理：创建桌号，生成小程序码

### 订单状态流转
```
已提交 → 已确认 → 制作中 → 已完成
   └── 已取消（仅已提交状态可取消）
```

## 快速开始

### 1. 前置条件

- Node.js 20+
- 微信小程序 AppID（注册地址：https://mp.weixin.qq.com）
- 微信开发者工具（下载：https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html）
- GitHub 账号
- 微信云托管（可选，用于部署后端和商家端）

### 2. 克隆项目

```bash
git clone https://github.com/fangwenyu2005-cpu/family-meal-ordering.git
cd family-meal-ordering
```

### 3. 后端开发环境

```bash
cd server

# 安装依赖
npm install

# 配置环境变量（复制 .env 并修改）
# DATABASE_URL=你的 Neon 数据库连接字符串
# JWT_SECRET=随机密钥
# ADMIN_USERNAME=admin
# ADMIN_PASSWORD=你的密码

# 初始化数据库（如使用已有 Neon 项目则跳过，直接连）
npx prisma migrate dev --name init

# 填充种子数据
npx prisma db seed

# 启动开发服务器
npm run dev
```

访问 `http://localhost:3000/api/health` 确认服务运行。

### 4. 商家端开发环境

```bash
cd admin

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

开发模式下，Vite 自动将 `/api` 请求代理到 `http://localhost:3000`。

### 5. 小程序开发环境

1. 打开**微信开发者工具**
2. 选择「导入项目」
3. 选择 `miniprogram/` 目录
4. 填入你的 AppID
5. 在 `miniprogram/app.js` 中将 `apiBase` 改为你的 API 地址
6. 点击「编译」预览

## 部署指南

### 后端部署（微信云托管）

#### Step 1: 开通微信云托管

1. 登录 [微信云托管控制台](https://cloud.weixin.qq.com)
2. 创建环境，选择「云托管」
3. 开通 MySQL 或自带数据库（本项目使用 Neon PostgreSQL，无需开通数据库）

#### Step 2: 配置环境变量

在云托管控制台的「服务设置 → 环境变量」中添加：

```
DATABASE_URL=postgresql://...
JWT_SECRET=你的随机密钥（建议 32 位以上）
ADMIN_USERNAME=admin
ADMIN_PASSWORD=你的密码
PORT=3000
```

#### Step 3: 关联 GitHub 仓库

1. 云托管控制台 → 服务管理 → 新建服务
2. 选择「关联 GitHub 仓库」
3. 授权并选择 `family-meal-ordering`
4. 构建目录设为 `server/`
5. 选择包含 `Dockerfile` 的构建方式

#### Step 4: 自动部署

每次 `git push` 到 main 分支，云托管自动：
1. 检测到 `server/Dockerfile`
2. 构建 Docker 镜像
3. 部署到线上
4. 提供 HTTPS 域名

#### Dockerfile 说明

```dockerfile
FROM node:20-alpine          # 轻量 Node.js 镜像
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production # 仅安装生产依赖
COPY . .
RUN npx prisma generate      # 生成 Prisma Client
EXPOSE 3000
CMD ["node", "src/index.js"]
```

### 商家端部署

#### 方式一：部署到云托管（推荐）

在云托管中再创建一个服务，构建目录设为 `admin/`。

商家端是纯静态文件，但需要 Nginx 来托管。在 `admin/` 目录下添加一个 `Dockerfile`：

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

添加 `admin/nginx.conf`：

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
    location /api/ {
        proxy_pass https://你的后端域名;
    }
}
```

#### 方式二：部署到 CDN / 静态托管

```bash
cd admin
npm run build
# 将 dist/ 目录上传到任意静态托管服务
# （腾讯云 COS、阿里云 OSS、Vercel 等）
```

注意：静态托管需要将 `/api/` 请求代理到后端。如果使用 CDN，需要在后端启用 CORS + 商家端配置 API 地址。

### 小程序发布

发布到微信小程序商店的流程：

1. **注册小程序**
   - 访问 https://mp.weixin.qq.com
   - 需要：营业执照、法人身份证、对公账户
   - 审核时间：1-7 个工作日

2. **配置服务器域名**
   - 登录小程序后台 → 开发管理 → 服务器域名
   - 将云托管域名添加到 `request合法域名`

3. **上传代码**
   - 微信开发者工具中点击「上传」
   - 填写版本号和备注

4. **提交审核**
   - 小程序后台 → 版本管理
   - 选择已上传的版本 → 提交审核
   - 审核时间：1-3 个工作日

5. **发布上线**
   - 审核通过后 → 点击「发布」

### 桌号二维码生成

1. 在商家端「桌号管理」页面创建桌号（如 A1、A2）
2. 生成对应的小程序码
3. 调用微信 `wxacode.getUnlimited` API，传入 `scene` 参数为桌号
4. 二维码会贴在对应桌上

> **开发阶段**：桌子数据已通过种子脚本填充（A1-A3, B1-B3），API 已可用。二维码功能需 AppID 和微信 API 对接后启用。

## 数据库说明

### 表结构

| 表名 | 用途 |
|------|------|
| categories | 商品分类（经典咖啡、茶饮、甜品） |
| products | 商品/单品（含基础价、图片） |
| spec_groups | 规格组（杯型、温度、糖量） |
| spec_options | 规格选项（中杯+0、大杯+4 等） |
| product_specs | 商品-规格关联（多对多） |
| tables | 桌号 |
| orders | 订单主表 |
| order_items | 订单明细 |
| order_item_specs | 订单明细的规格选择 |

### 定价逻辑

- 商品有 `base_price`（默认中杯价）
- 规格选项有 `price_delta`，杯型（中杯 0，大杯 +4），温度/糖量 = 0
- 下单时单价 = base_price + Σ(所选规格加价)

### 预设数据

运行 `npx prisma db seed` 会填充：

- **3 个规格组**：杯型（必选）、温度、糖量
- **3 个分类**、**15 款单品**（含咖啡、茶饮、甜品）
- **6 张桌号**：A1-A3、B1-B3
- 完整的商品-规格关联关系

## API 接口

### 公开接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/categories` | 分类列表 |
| GET | `/api/products?category=1` | 菜单列表（含规格） |
| GET | `/api/products/:id` | 单品详情 |
| GET | `/api/tables/:code` | 验证桌号 |
| POST | `/api/orders` | 提交订单 |
| GET | `/api/orders/:id` | 查询订单 |
| PATCH | `/api/orders/:id/cancel` | 取消订单 |

### 管理接口（需 Bearer Token）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/admin/login` | 商家登录 |
| GET | `/api/admin/orders` | 订单列表 |
| PATCH | `/api/admin/orders/:id/status` | 更新订单状态 |
| POST | `/api/admin/products` | 新增单品 |
| PUT | `/api/admin/products/:id` | 编辑单品 |
| DELETE | `/api/admin/products/:id` | 删除单品 |
| POST | `/api/admin/tables` | 创建桌号 |
| GET | `/api/admin/tables` | 桌号列表 |
| GET | `/api/stats/overview` | 流水概览 |
| GET | `/api/stats/ranking` | 销量排行 |

## 许可证

MIT
