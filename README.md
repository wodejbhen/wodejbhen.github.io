# 作品集预览（临时）

这是 `wodejbhen/wodejbhen.github.io` 的优化预览分支：在不动线上 `main` 的前提下，把整理好的
视觉/动效/移动端改动先在独立分支上跑一遍。

- 新增文件：`polish.css`、`polish.js`（在原有构建产物之后加载，只做叠加，不改文案与链接）
- 修改文件：`index.html`（head 元信息、viewport、相对路径、无障碍标签、加载 polish 层）
- 线上正式站 `main` 未做任何改动；合并回主站只需带上这三个文件。

删除预览分支：

    git push origin --delete preview
