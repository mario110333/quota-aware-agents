# quota-aware-agents

**简体中文** · [English](README.en.md)

### 让每一次代理分工，都有值得承担的工作。

[安装](#安装) · [使用示例](#使用示例) · [默认路由](#默认路由) · [常见问题](#常见问题) · [版本发布](https://github.com/mario110333/quota-aware-agents/releases)

用于 Codex 的按需分工 Skill。先达到用户要求的质量，再比较直接完成与代理分工的总完成成本，包括上下文、协调、验收和返工。作者：**malioe**；版本：**1.0.0**。

适用于有清楚边界的实现、分析、翻译和批量审查。简单问答、小修改和确定性操作直接处理；只有主代理能同时推进有用工作时，才交给代理一个完整工作包。在阶段变化、执行者完成或出现关键新证据后重新判断。

## 它能做什么

| 能力 | 实际做法 |
| --- | --- |
| 判断是否值得分工 | 将任务说明、代理执行、协调、验收与预计返工一起纳入成本 |
| 按任务选择模型 | 根据歧义、失败代价、原始资料依赖和可验证程度选择模型与推理强度 |
| 减少碎片化交接 | 将调查、实现、普通调试、必要验证和相关记录作为完整工作包交付 |
| 控制上下文与冲突 | 使用精简任务卡，明确原始资料、文件归属和共享资源负责人 |
| 保留整体验收责任 | 主代理核对原始要求与关键边界，区分已实现、已验证和未验证的内容 |

共享接口或需求尚未稳定时，先完成并验证一个有代表性的端到端流程，再扩展并行工作。组件分别完成，不代表整体已经验收。

## 默认路由

| 工作 | 起点 |
| --- | --- |
| 日常实现、审查、普通调试及同类写作、翻译、分析 | 6.1 Sol high；约束复杂或判断困难时 xhigh |
| 跨模块实现、持续判断 | 6.1 Sol xhigh，先稳定共享接口再分工 |
| 按明确规则整理、抽取、检查的简单批量任务 | 确定性工具优先；必要时 Luna max |
| 持续推理困难、关键架构或数据保护判断 | Astra，限定具体问题，通常 xhigh |
| 已有 GPT-6 Sol 工作流 | 优先迁至 GPT-6.1 Sol，并核对受影响的验收结果 |

以上是 **2026-09-30** 的起始策略。6.1 Sol 不可用时，适合的工作包可回退到工具支持的 `gpt-6-sol` / `xhigh`，或直接完成。

始终使用 **Standard（正常速度）**。推理强度与速度模式独立；本工作流不启用 Fast / Ultrafast。完整选择条件、不可用时的回退与校准规则见 [模型路由](quota-aware-agents/references/model-routing.md)。

模型与推理强度是否可用，以账号、当前工具和权限为准。Skill 不授予代理额外权限，不自动切换主对话模型或全局配置；工具没有速度选项时，也不能据此声称已经更改速度模式。

## 安装

可以向 Codex 发送下面的安装请求；是否能自动安装取决于当前可用的 `skill-installer` 与权限：

```text
请使用 $skill-installer 从 https://github.com/mario110333/quota-aware-agents/tree/main/quota-aware-agents 安装这个 Skill。
```

Windows 用户也可[下载最新仓库 ZIP](https://github.com/mario110333/quota-aware-agents/archive/refs/heads/main.zip)，解压后在包含 `Install.ps1` 的目录运行 `./Install.ps1`。脚本按 [checksums.json](checksums.json) 校验六个 Skill 文件，无需管理员权限；已有同名目录时停止，不覆盖旧版。

Windows / macOS / Linux 均可手动将内层 `quota-aware-agents` 文件夹整体复制到 `~/.agents/skills/`，最终入口为 `~/.agents/skills/quota-aware-agents/SKILL.md`。更新前先备份并移走旧目录，避免混合版本；如果 Skill 未显示，重启 Codex。完整操作见[中文安装说明](安装说明.md)或 [English installation guide](INSTALL.en.md)。

安装后可以发送：

```text
请使用 $quota-aware-agents 处理这个任务：……
```

Skill 允许按任务自动调用，但调用后仍需判断是否值得分工。它不要求每次请求都派出代理。

## 使用示例

**实现功能并完成必要验证：**

```text
请使用 $quota-aware-agents 完成这个功能：……
先判断哪些工作可独立交付，再选择模型和分工；由主代理整合并验收。
```

**按明确规则审查一批文件：**

```text
请使用 $quota-aware-agents 按以下规则审查这些文件：……
能用脚本确定的检查先用脚本；有歧义的内容保留原文和判断依据。
```

**只评估方案，暂不执行：**

```text
请使用 $quota-aware-agents 为这个任务评估分工方案：……
说明直接完成和委派的取舍。本次只给出方案，不启动代理或修改文件。
```

## 工作流程

1. **判断**：比较直接完成与委派的总成本，先确认任务质量要求。
2. **分包**：写清交付结果、关键约束、原始资料、文件归属、验收要求与输出语言。
3. **执行**：代理负责完整工作包；主代理推进有用的并行工作并处理跨工作包决策。
4. **验收**：按原始需求核对结果与证据，针对缺口修正，通过后停止重复检查。

默认从一个代理开始；只有额外工作独立且有用时才增加，不递归委派。在阶段变化、执行者完成或关键新证据出现后重新判断。

## 费用参考与可选统计

[费用与用量说明](quota-aware-agents/references/cost-model.md)中的费用快照日期是 **2026-09-30**，历史费率分别注明日期。它们是带日期的参考，后续比较应核实适用费率；API 金额、Codex credits、实际收费和订阅用量不能混算。本 Skill 不承诺固定节省百分比，也不把模型价格差直接当作任务节省。

普通使用不需要 Node.js。可选的 [本地统计脚本](quota-aware-agents/scripts/summarize-usage.mjs)需要支持 `node:sqlite` 只读模式的 Node.js，已在 Node.js 24.21.0 验证。仅按需要手动运行，先用 `node <脚本路径> --help` 查看参数。

脚本只读读取本机 Codex 数据库与日志，在指定的新目录写入统计结果，默认输出摘要，不上传数据。输出可能含本机路径与会话标识，公开分享前请检查；仓库不包含作者的会话、账号配置、凭据或旧用量数据。内部日志格式变化或记录缺失会使统计不完整，结果不能当作实际账单、订阅额度或已测得的节省。

## 常见问题

**它会为每个请求启动代理吗？**  
不会。只有工作边界清楚、主代理有有用的并行工作，且预计总成本合适时才委派。

**它会自动切换主对话模型、购买额度或开启加速吗？**  
不会。它提供工作规则，不改变主对话模型、全局配置或权限，也不授予额外模型访问权。

**我的工具没有表中的模型怎么办？**  
按照当前工具支持的组合选择适合的回退，或直接完成任务。官方发布、账号界面与代理工具的可用模型并不必然一致。

**安装后没有显示怎么办？**  
确认内层 Skill 文件夹位于正确目录，入口文件名为 `SKILL.md`，避免重复安装到多个搜索目录；必要时重启 Codex，再显式调用 `$quota-aware-agents`。

**切换页面语言会改变 Skill 行为吗？**  
不会。中英文说明介绍同一套规则；实际执行入口和参考文件统一使用英文。可见汇报跟随主对话语言，交付物遵循用户指定语言或项目约定。

## 文件与反馈

| 文件 | 用途 |
| --- | --- |
| [SKILL.md](quota-aware-agents/SKILL.md) | 分工判断、工作包与验收规则 |
| [model-routing.md](quota-aware-agents/references/model-routing.md) | 模型与推理强度选择 |
| [cost-model.md](quota-aware-agents/references/cost-model.md) | 费用口径与用量核算边界 |
| [summarize-usage.mjs](quota-aware-agents/scripts/summarize-usage.mjs) | 可选的本地只读统计 |
| [安装说明](安装说明.md) / [INSTALL.en.md](INSTALL.en.md) | 中英文安装、更新与卸载 |
| [Install.ps1](Install.ps1) / [checksums.json](checksums.json) | Windows 安装与文件校验 |

欢迎通过 [GitHub Issues](https://github.com/mario110333/quota-aware-agents/issues)反馈问题或建议。请提供预期行为、实际结果、模型可用情况和必要复现步骤；公开前移除私有路径、会话标识、凭据与聊天内容。

## 许可证

采用 [MIT 许可证](LICENSE)。独立安装的 Skill 文件夹也携带同一份许可。Copyright (c) 2026 malioe。
