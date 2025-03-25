# 数据文件自动更新工具

这个目录包含了用于自动更新数据文件的脚本。

## 更新数据文件脚本 (update-data-files.js)

该脚本会从Firebase Storage下载最新的`master.json`和`cells.json`文件，并将它们保存到项目的`public/master_bk/`目录下。

### 功能

- 从Firebase Storage下载最新的数据文件
- 获取文件的元数据信息（大小、更新时间）
- 将文件保存到正确的目录结构中

### 手动运行

可以通过以下命令手动运行脚本：

```bash
npm run update-data
```

## GitHub Actions 自动更新与部署

我们设置了一个GitHub Actions工作流，可以自动执行以下任务：

1. 从Firebase Storage下载最新的数据文件
2. 构建项目
3. 如果数据文件有变更，将其提交到仓库
4. 将构建结果部署到GitHub Pages (gh-pages分支)

### 触发方式

工作流可以通过以下方式触发：

- **定时触发**：每天UTC时间凌晨3点自动运行（相当于北京时间上午11点）
- **手动触发**：可以在GitHub Actions页面手动触发工作流

### 手动触发步骤

1. 在GitHub仓库页面，点击顶部的"Actions"标签
2. 在左侧找到"Update Data Files and Deploy"工作流
3. 点击"Run workflow"按钮
4. 点击绿色的"Run workflow"按钮开始执行

## 数据文件说明

- **master.json**：主数据文件，包含游戏核心数据
- **cells.json**：单元数据文件，包含特定功能数据

这些文件将被部署到gh-pages分支的`master_bk/`目录下，可通过以下URL访问：

```
https://<username>.github.io/kc-web/master_bk/master.json
https://<username>.github.io/kc-web/master_bk/cells.json
``` 