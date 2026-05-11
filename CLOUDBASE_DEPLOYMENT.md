# 腾讯云 CloudBase 静态托管部署

当前版本已经改成纯前端静态应用，不再依赖 Railway / Vercel / 后端 API。

## 本地构建

```bash
cd frontend
npm run build
```

构建产物目录：

```text
frontend/dist
```

把 `dist` 目录里的文件部署到 CloudBase 静态网站托管即可。

## 控制台上传方式

1. 登录腾讯云控制台。
2. 进入 `云开发 CloudBase`。
3. 创建或进入一个环境。
4. 打开 `静态网站托管`。
5. 如果还没开通，先开通静态网站托管。
6. 选择上传文件或上传文件夹。
7. 上传 `frontend/dist` 目录内的所有文件。
8. 上传完成后，在静态网站托管页面复制默认访问域名。

## CLI 部署方式

先安装并登录 CloudBase CLI：

```bash
npm install -g @cloudbase/cli
tcb login
```

构建并上传：

```bash
cd frontend
npm run build
tcb hosting deploy dist -e 你的环境ID
```

## 费用说明

这个版本是纯静态页面：

- 不需要服务器常驻运行。
- 不需要 Railway 后端。
- 不需要 Vercel。
- 测算逻辑在浏览器本地完成。
- 当前公司名称和测算结果只保存在用户浏览器本地，后续要留资入库时再接 CloudBase 数据库或云函数。

## 后续留资升级

后面如果要保存数据，可以新增：

- CloudBase 云函数：接收表单数据。
- CloudBase 数据库：保存公司名称、产品类型、测算结果。
- 前端提交按钮：测算后引导用户领取完整避坑指南。
