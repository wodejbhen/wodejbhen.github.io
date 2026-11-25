# 作品集 · Apple 风格改版预览

`wodejbhen/wodejbhen.github.io` 的改版预览：按 Apple 的人机界面设计方法（系统字体、
尺寸分级字距、克制的配色、半透明材质、弹簧式反馈、可中断的过渡）重做了整站的版式与交互。

- **内容全部沿用**：五个项目、技能、两段实习、教育背景、证书、联系方式，文案照原文，链接照原地址。
- **文件**：`index.html` + `site.css` + `site.js`，图片从原页面的内联 base64 拆成独立文件（`quiz.jpg`、`shiguang.jpg`、`video-poster.jpg`）。
- 线上正式站 `main` 未做任何改动。
- `mobile-check.html`：把预览页放进 390 / 768 宽度里，用来核对移动端版式。

删除预览分支：

    git push origin --delete preview
