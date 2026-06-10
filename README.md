# Liu Xinran Portfolio

这是一个轻量静态个人项目网站，可以直接部署到 GitHub Pages。

## 本地预览

在当前文件夹启动静态服务，然后访问显示的本地地址：

```bash
python3 -m http.server 8000
```

## GitHub Pages 部署

1. 在 GitHub 新建仓库 `xiaodaoliu2002-alt.github.io`。
2. 只提交站点需要的文件：`index.html`、`styles.css`、`app.js`、`assets/`、`README.md`、`.nojekyll`。
3. 推送到 GitHub 后，进入仓库 `Settings` -> `Pages`。
4. Source 选择 `Deploy from a branch`，Branch 选择 `main` 和 `/root`。
5. 保存后等待部署完成，页面会出现在 `https://xiaodaoliu2002-alt.github.io/`。

## 素材说明

- `assets/docs/` 放页面内可打开的 PDF 和个人资料。
- `assets/video/` 放压缩后的完整视频，避免上传原始大视频。
- `assets/pdf-pages/` 放 PDF 转出的页面图片，用于站内直接预览。
- 原始项目文件夹已被 `.gitignore` 排除，防止把超过 GitHub 限制的大文件提交上去。
