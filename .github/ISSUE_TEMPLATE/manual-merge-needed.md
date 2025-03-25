# 需要手动合并上游仓库更新

GitHub Actions检测到上游仓库 [noro6/kc-web](https://github.com/noro6/kc-web) 有新的更新，但无法自动合并到当前仓库的main分支。

## 原因

可能的原因包括：
- 上游仓库的更改与本地的更改存在冲突
- 分支历史不兼容，无法进行快进合并

## 建议操作

1. 在本地克隆仓库：
   ```bash
   git clone <your-repo-url>
   cd <repo-directory>
   ```

2. 添加上游仓库作为远程引用：
   ```bash
   git remote add upstream https://github.com/noro6/kc-web.git
   ```

3. 获取上游更新：
   ```bash
   git fetch upstream main
   ```

4. 查看冲突文件：
   ```bash
   git checkout main
   git diff upstream/main
   ```

5. 手动合并更改：
   ```bash
   git merge upstream/main
   ```
   
   如果出现冲突，Git会标记有冲突的文件。请编辑这些文件解决冲突，然后：
   ```bash
   git add <冲突文件>
   git commit -m "Merge upstream changes and resolve conflicts"
   ```

6. 推送更改：
   ```bash
   git push origin main
   ```

完成手动合并后，请关闭此Issue。

## 上游新提交信息

以下是上游仓库中新增的提交：

```
 