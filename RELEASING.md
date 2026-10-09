# 发布与完成核验

发布维护资料；不属于 Skill 的任务执行流程，也不需要每次调用时读取。

一次版本更新依次经过：候选已验证 → main 已同步 → tag 已固定 → 正式 Release 已发布 → 下载与远端核验通过。只完成前几步时，按实际状态汇报，不能称为“发布完成”。本机安装成功也不能代替 GitHub 发布。

## 发布步骤

1. 确定版本，统一 `SKILL.md`、双语 README、安装说明与 `checksums.json`。只有实际变化的规则需要新版本；历史更新段落保留原版本号。
2. 更新完整 Skill 清单与 SHA-256，检查引用和受影响行为。已有、仍适用的验证可以复用；场景决定验证不等于实际提质、加速或节省证明。
3. 冻结完整仓库文件与验证证据。使用预期 head 核对将提交同步到 main，记录完整提交 SHA；遇到并发提交先协调，不强推。
4. 在 GitHub 发布 `v<版本>` 正式 Release，绑定上一步的完整 SHA，设置为 Latest，附变化、验证和安装说明。不能只创建 tag、保存草稿或标记预发布。已存在的 tag 必须先解析并核对，不能覆盖旧 tag。
5. 从完整且干净的候选仓库根目录执行：

   ```text
   python maintenance/verify-release.py --expected-commit <完整提交SHA> --output <仓库外的核验记录.json>
   ```

   核验使用公开 GitHub GET 请求，不需要令牌，不修改远端。它检查 main 的 head、Latest Release 的版本和公开状态、tag 的实际提交、真实下载 ZIP 的完整仓库文件，以及 Skill 清单和 SHA-256。退出码为 0 且 `status` 为 `passed` 才能报告发布完成。
6. 若 main、Release 或实际下载包不一致，先保留未完成状态，定位失败步骤；未知发布结果先查询，不盲目重复发布。无法使用当前工具发布时，明确指出缺少的能力，不能改写成“Releases 只保留历史版本”。公开 API 限流也属于核验未完成，不应改为成功。已有授权 GitHub 连接器可提供实时元数据：通过同一 `verify(..., get=...)` 核验核心适配 GET，保存实际查询来源、下载前后状态和真实 ZIP；不能用自造响应或单次旧快照代替。
7. 若本次也更新本机，再分别报告本机版本、目录链接及安装校验；发布完成不代表已有会话或子代理自动重载。备份、场景原始证据和本地诊断放在 Skill 搜索目录及公开发布包之外。

## 下载与更新约定

README 和安装说明默认指向正式版本。固定版本 ZIP 对应一个不可混用的 tag；一句话更新请求先查 Latest Release，再固定 tag 和提交。main 用于开发，尚未发布的提交需明确标注。无需为了补齐正式发布而重新发布每个历史中间版本。

核验必须读取 Git 引用的实际对象，不能仅凭 Release 的 `target_commitish: main` 推断 tag 指向最新提交。Source code ZIP 不会出现在上传附件 `assets` 的数组中；核验会实际下载 Release 的 `zipball_url`。[GitHub Release API](https://docs.github.com/en/rest/releases/releases)、[发布管理](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository)。

## English

Release maintenance is separate from runtime skill guidance. Completion requires a validated frozen candidate, a verified main commit, a tag pinned to that commit, a public stable Latest Release, and a successful actual archive check. Run the command above from a complete clean candidate; a zero exit code and `status: passed` are required. The verifier uses unauthenticated public GET requests and makes no remote changes. Installation alone, a main-only push, a tag, a draft, or a prerelease is not release completion. Preserve versioned historical notes, do not move existing tags, and report incomplete or unknown outcomes accurately. Default installation and updates use pinned stable Releases; main remains a development channel.
