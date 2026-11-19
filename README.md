# quota-aware-agents

**简体中文** · [English](README.en.md)

面向 Codex 的按需分工 Skill：先判断任务是否值得交给子代理，再选择合适的模型和推理强度。目标是减少实质错误、遗漏与返工，缩短从开始到验收完成的总时间，并控制整个任务的资源消耗。简单工作直接完成，分工须计入上下文、协调、等待、整合和验收的开销。

**作者：malioe** · **当前版本：1.7.0** · **许可证：[MIT](LICENSE)**

[安装与首次使用](#安装与首次使用) · [已安装时更新](#已安装时更新) · [使用示例](#使用示例) · [分工规则](#分工规则) · [常见问题](#常见问题) · [详细文档](#详细文档)

适用于 Codex 中的 OpenAI 模型及当前会话可用的代理工具，可用于实现、分析、翻译和批量审查。Skill 提供工作指引；模型访问权限和运行能力取决于实际环境。

## 安装与首次使用

在 Codex 中输入：

```text
请使用 $skill-installer 从 https://github.com/mario110333/quota-aware-agents/tree/v1.7.0/quota-aware-agents 安装这个 Skill。
```

准备委派独立子任务或要求独立复核时，可以点名 `$quota-aware-agents`，Codex 也可按需选用。

也可以手动安装：

- **Windows：**下载 [1.7.0 发布 ZIP](https://github.com/mario110333/quota-aware-agents/archive/refs/tags/v1.7.0.zip)，解压后在仓库根目录运行 `./Install.ps1`。脚本核对完整 Skill 文件清单与 [checksums.json](checksums.json)，无需管理员权限；目标目录已存在时会停止。
- **Windows / macOS / Linux：**将完整的 `quota-aware-agents` 文件夹复制到 `~/.agents/skills/`。更新前，将旧副本备份并移出 Skill 搜索目录。

具体命令、更新、卸载和排查步骤见[安装说明](安装说明.md)。正式版本从[最新 Release](https://github.com/mario110333/quota-aware-agents/releases/latest)获取；main 用于持续开发，安装与更新默认固定正式版本。安装 Skill 不会扩大文件、工具或外部操作的授权范围。

## 已安装时更新

把下面这一句话发给 Codex：

```text
请将已安装的 quota-aware-agents 从 https://github.com/mario110333/quota-aware-agents 更新到最新正式 Release：固定其 tag 和提交，核对实际安装位置，先在 Skill 搜索目录外备份，保留本地定制和目录链接，校验完整包后更新原位置并报告版本；已是最新则无需重装。
```

更新流程包括来源与完整文件比对、备份、校验和现有安装的替换。安装器会保护已有目录，具体的临时下载、本地定制及目录链接处理见[更新方法](安装说明.md#更新与卸载)。更新后在下一轮使用；若未显示，按[官方说明](https://learn.chatgpt.com/docs/build-skills)重启 Codex。

## 1.7.0 调整

在准备委派或需要独立复核时查阅。按子任务选择模型和推理强度，同系列优先最新可用稳定版，使用旧版须有具体理由。独立复核沿用普通委派规则。

## 1.5.1 调整

明确复用未变化且仍在上下文中的指引，重新判断分工无需重读全文；动态任务与模型／速度状态仍按需要刷新。安装与一句话更新默认指向正式 Release；新增[发布流程与核验](RELEASING.md)，只有版本、tag、Latest Release 和实际下载包均核验通过，才算发布完成。

## 1.5.0 调整

采用精简入口、条件参考和少量事件规则：任务卡只保留必要信息，细节按需读取。质量、完成总时间与资源消耗一起参与判断；补充取消后的写入交接、未知操作结果和同源证据边界。默认子代理限定为 6.1 Sol、6 Luna 和 6 Astra，移除旧型号回退；保留 Sol/high 例外、真实速度能力检查和 Astra 30 秒授权约定。

## 使用示例

**实现两个独立模块：**

```text
使用 $quota-aware-agents，按这份规格实现两个独立的导入适配器，并验证整合后的结果。
```

主代理先确认共用数据契约，再判断是否有可独立交付的工作包，以及自己能同时推进的必要工作。两个文件或多个步骤本身不构成分工理由。

**批量审阅翻译：**

```text
使用 $quota-aware-agents，按术语表和原文审阅这 20 份译文。只读审阅，报告重要遗漏或含义变化，并附原文依据。
```

精确匹配优先用脚本。语义审阅可以把一批译文和术语表交给同一个执行者。如只需要分工建议，可注明“只做计划”。

## 分工规则

子代理承担可独立交付、主对话无需重做即可验收的工作。机械处理优先用工具，紧密关联的判断留在一起。用户明确要求独立复核时，即使主对话需要等待，也可以有价值。

按子任务选择模型系列和推理强度。容易核验的工作可选轻量模型，难以核验且影响重大的判断可用更强推理。新建子代理时，同系列优先满足要求的最新可用稳定版，继承配置也应符合这一选择。用户指定确切版本时，仅使用已授权的备选。未指定时，可因兼容、复现或最新合适版本不可用而选用合适旧版。新建和续用都遵守明确排除项。详见[模型选择](quota-aware-agents/references/model-routing.md)。

每个共享文件或受限运行资源同时由一人负责；接管前核实未完成写入与结果未知的操作。对影响结论的主张核对原始证据。

### 跟随主代理速度

速度、模型和推理强度分别处理。每次派发或续用前，刷新主代理当前的 Standard / Fast / Ultrafast 选择；观察到切换时及时更新，来回切换时拒绝旧设置的确认，并保留仍有效的工作。

实际同步依赖宿主提供的速度控制或已核实的继承能力。任务说明和消息不能改变执行速度；工具无法设置或核实时，应明确报告限制。Skill 不安装后台监视器，也不能保证正在运行的子代理立即切速。详见[速度跟随规则](quota-aware-agents/references/speed-following.md)。

## 常见问题

**什么时候留在主对话？**

如果交接需要另一个执行者重读相同证据、重建先前判断，直接完成通常更合适。

**会自动改主模型、全局设置或权限吗？**

不会。安装和使用 Skill 不授予新的模型权限、文件修改、外部操作或递归分工权限。

**能保证省钱或更快吗？**

没有固定比例保证。更便宜的模型可能因协调和返工增加总成本；需要在相同质量要求下比较实际结果。场景验证只能检查规则行为，不能证明实际节省比例或速度提升。

**安装后找不到 Skill 怎么办？**

确认 `~/.agents/skills/quota-aware-agents/SKILL.md` 存在，移除搜索目录中的重复副本，仍未出现时重启 Codex。详见[安装排查](安装说明.md)。

**中英文页面的规则是否一样？**

一样。两份 README 说明同一套规则，Skill 与参考文件以英文编写。可见进展和汇总跟随主对话语言，交付物遵循用户要求或项目约定。

## 详细文档

- [SKILL.md](quota-aware-agents/SKILL.md)：核心工作流程、任务卡和验收。
- [模型路由](quota-aware-agents/references/model-routing.md)：任务匹配、稳定版本与回退条件。
- [可选模型识别](quota-aware-agents/references/model-identification.md)：需要识别时的绑定、脚本与未知回退。
- [速度跟随](quota-aware-agents/references/speed-following.md)：当前设置刷新、反复切换和宿主能力限制。
- [执行证据](quota-aware-agents/references/execution-evidence.md)：共享资源、取消交接、未知操作结果、来源与观察有效性。
- [费用与用量](quota-aware-agents/references/cost-model.md)：核算口径及可选工具的使用限制。

Skill 指引本身不依赖 Node.js。可选的[模型识别脚本](quota-aware-agents/scripts/resolve-main-model.mjs)和[用量统计脚本](quota-aware-agents/scripts/summarize-usage.mjs)需要支持只读 `node:sqlite` 的 Node.js。统计工具只读本地 Codex 记录，将报告写入新的指定目录，不上传数据；报告可能包含本地路径和会话标识，分享前请检查。Token、API 等价金额、Codex credits、实际扣费和订阅用量是不同口径，统计不能直接当作账单或节省证明。

## 反馈与许可证

欢迎通过 [GitHub Issues](https://github.com/mario110333/quota-aware-agents/issues) 反馈问题，或提出有实际证据的路由建议。请附预期行为、实际结果和必要复现步骤，公开前移除私有路径、会话标识、凭据和聊天内容。

本项目采用 [MIT 许可证](LICENSE)，独立安装的 Skill 文件夹也携带同一份许可。Copyright (c) 2026 malioe。
