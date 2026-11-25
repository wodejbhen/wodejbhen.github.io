# 作品集 · Apple 风格改版（预览）

`wodejbhen/wodejbhen.github.io` 的改版预览分支。整站按 Apple 的设计方法重做：系统字体与
尺寸分级字距、克制的单一强调色、明暗段落交替、半透明材质导航、可按下的按钮反馈、
尊重 `prefers-reduced-motion` 的入场动效。

## 内容

五个项目（公共营养师刷题页 / 拾光 / 反式脂肪酸短视频 / 校园短视频 / 比格披萨分析）、
四块技能、两段实习、教育背景、证书、联系方式与全部外链均沿用原页面，文案照原文。

## 文件

- `index.html` — 全新的语义化页面结构
- `site.css` — 设计系统（色彩、字号、间距、材质、动效）
- `site.js` — 滚动状态、章节定位、入场动效、移动端菜单
- `quiz.jpg`、`shiguang.jpg`、`video-poster.jpg` — 从原页面的内联 base64 拆出来的图片
- `quiz.html`、`fanzhizhifang.mp4`、`certificate.jpg` — 原作品文件
- `mobile-check.html` — 把页面放进 390 / 768 宽度里核对移动端版式

## 线上

预览分支；线上正式站 `main`（`d1c7105`）未做任何改动。

删除预览分支：

    git push origin --delete preview
