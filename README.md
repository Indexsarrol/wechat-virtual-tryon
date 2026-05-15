# wechat-virtual-tryon

一个面向微信小程序场景的虚拟试搭项目，包含两大核心模块：

1. 在线试衣
2. 口红试色

当前仓库已经完成了从 0 到“可演示、可联调、可预览”的基础建设，并在浏览器里提供了接近微信小程序交互方式的 demo 闭环。

## Current Status

当前项目不是最终商用版，但已经具备一套可持续往商用推进的完整基础盘：

- `apps/miniapp`
  - 首页、试衣页、试色页、结果页
  - 浏览器预览链路
  - 本地图片选择
  - 调用本地 API 创建任务与轮询结果
- `apps/admin`
  - 后台骨架
  - 素材管理页面占位
  - 任务监控页骨架
- `services/api`
  - 素材 bootstrap
  - 上传元数据接口
  - 任务创建/轮询
  - cleanup / rate limit / 匿名 smoke
- `services/worker`
  - 试衣 / 试色 provider 抽象
  - 本地 fake provider
  - dispatcher 与测试
- `packages/contracts`
  - 共享任务类型、状态和 schema 校验

## What You Can Preview Now

当前本地可以直接看 demo：

- Miniapp browser preview:
  - `http://127.0.0.1:4173/`
- Local API:
  - `http://127.0.0.1:3000/`

目前的可演示链路是：

1. 进入试衣页或试色页
2. 选择一张本地图片
3. 提交 demo 任务
4. 前端轮询本地 API
5. 结果页展示：
   - 用户原图
   - 模拟效果图
   - 结果摘要
   - 素材信息

说明：

- 当前结果图仍是 demo 数据，不是真实 AI 输出
- 页面已优先走本地 API；API 不可用时才退回前端本地 fallback

## Repository Structure

```text
.
├── apps
│   ├── admin
│   └── miniapp
├── docs
│   ├── runbooks
│   └── superpowers
├── packages
│   └── contracts
├── services
│   ├── api
│   └── worker
└── tests
```

职责划分：

- `apps/miniapp`: 面向用户的小程序前端与浏览器预览入口
- `apps/admin`: 后台管理台骨架
- `services/api`: 上传、素材、任务与本地 demo 联调接口
- `services/worker`: provider 抽象与本地 worker dispatcher
- `packages/contracts`: 共享类型与 schema

## Local Development

### 1. Environment

建议统一使用：

- Node `18.20.8`
- `corepack pnpm`

```sh
source ~/.nvm/nvm.sh
nvm use 18.20.8 >/dev/null
export COREPACK_HOME=/private/tmp/corepack
corepack pnpm install
```

### 2. Start Miniapp Preview

```sh
source ~/.nvm/nvm.sh
nvm use 18.20.8 >/dev/null
export COREPACK_HOME=/private/tmp/corepack
corepack pnpm --filter @virtual-tryon/miniapp dev --host 127.0.0.1 --port 4173
```

### 3. Start API

首次建议先生成 Prisma client：

```sh
source ~/.nvm/nvm.sh
nvm use 18.20.8 >/dev/null
export COREPACK_HOME=/private/tmp/corepack
corepack pnpm --filter @virtual-tryon/api prisma generate
```

再启动 API：

```sh
source ~/.nvm/nvm.sh
nvm use 18.20.8 >/dev/null
export COREPACK_HOME=/private/tmp/corepack
corepack pnpm --filter @virtual-tryon/api exec tsx src/server.ts
```

## Test Commands

### Workspace pieces

```sh
source ~/.nvm/nvm.sh && nvm use 18.20.8 >/dev/null && export COREPACK_HOME=/private/tmp/corepack && corepack pnpm --filter @virtual-tryon/api test
source ~/.nvm/nvm.sh && nvm use 18.20.8 >/dev/null && export COREPACK_HOME=/private/tmp/corepack && corepack pnpm --filter @virtual-tryon/worker test
source ~/.nvm/nvm.sh && nvm use 18.20.8 >/dev/null && export COREPACK_HOME=/private/tmp/corepack && corepack pnpm --filter @virtual-tryon/miniapp test
source ~/.nvm/nvm.sh && nvm use 18.20.8 >/dev/null && export COREPACK_HOME=/private/tmp/corepack && corepack pnpm --filter @virtual-tryon/admin test
```

### Typecheck

```sh
source ~/.nvm/nvm.sh && nvm use 18.20.8 >/dev/null && export COREPACK_HOME=/private/tmp/corepack && corepack pnpm --filter @virtual-tryon/api typecheck
source ~/.nvm/nvm.sh && nvm use 18.20.8 >/dev/null && export COREPACK_HOME=/private/tmp/corepack && corepack pnpm --filter @virtual-tryon/worker typecheck
source ~/.nvm/nvm.sh && nvm use 18.20.8 >/dev/null && export COREPACK_HOME=/private/tmp/corepack && corepack pnpm --filter @virtual-tryon/miniapp typecheck
source ~/.nvm/nvm.sh && nvm use 18.20.8 >/dev/null && export COREPACK_HOME=/private/tmp/corepack && corepack pnpm --filter @virtual-tryon/admin typecheck
```

## Current Platform Bridge

为了让同一套页面逻辑同时兼容浏览器预览与未来微信环境，项目已经抽出了：

- `apps/miniapp/src/services/miniapp-bridge.ts`

当前 bridge 已统一处理：

- 页面导航
- 图片选择
- 保存结果图

当前行为：

- 浏览器下走 fallback
- 小程序下预留 `uni` / `wx` 分支

这意味着后续迁移到微信开发者工具时，主要改 bridge，而不是重写页面主逻辑。

## What Is Still Missing

距离“最终可商用微信小程序”，当前还差这些关键块：

1. 真实微信运行环境适配
- 真正接 `uni.chooseImage` / `wx.chooseImage`
- 真正接 `saveImageToPhotosAlbum`
- 在微信开发者工具中跑通

2. 真实文件上传
- 当前 `/uploads` 仍然是元数据驱动
- 还不是正式的对象存储上传链路

3. 真实 AI provider
- 当前试衣 / 试色结果仍是 demo 图
- 还没接真实 AI 模型和供应商

4. 真实持久化和队列
- 默认仍以本地内存 + fake provider 为主
- 还没切到真实 DB / Redis / BullMQ / 对象存储

5. 商用上线能力
- 内容审核
- 隐私协议与授权链路
- 监控告警
- 正式部署方案

## Commercial Priority

如果按商用优先级排，建议下一步顺序如下：

1. 微信运行环境 bridge 接实
2. 真实文件上传
3. 真实 AI provider 接入
4. 数据库存储 / 队列 / 对象存储
5. 后台真实 CRUD
6. 上线前合规、审核、监控和部署

## Documentation

- Design spec:
  [2026-05-12-uniapp-virtual-tryon-design.md](/Users/indexsarrol/Documents/zeaho/self/docs/superpowers/specs/2026-05-12-uniapp-virtual-tryon-design.md)
- Initial implementation plan:
  [2026-05-12-uniapp-virtual-tryon-implementation-plan.md](/Users/indexsarrol/Documents/zeaho/self/docs/superpowers/plans/2026-05-12-uniapp-virtual-tryon-implementation-plan.md)
- Commercial phase-2 plan:
  [2026-05-14-wechat-commercial-phase-2-plan.md](/Users/indexsarrol/Documents/zeaho/self/docs/superpowers/plans/2026-05-14-wechat-commercial-phase-2-plan.md)
- Local runbook:
  [virtual-tryon-local.md](/Users/indexsarrol/Documents/zeaho/self/docs/runbooks/virtual-tryon-local.md)
