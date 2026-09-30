# quota-aware-agents

用于 Codex 的按需分工 Skill。先达到用户要求的质量，再比较直接完成与代理分工的总完成成本，包括上下文、协调、验收和返工。作者：**malioe**；版本：**1.0.0**。

适用于有清楚边界的实现、分析、翻译和批量审查。简单问答、小修改和确定性操作直接处理；只有主代理能同时推进有用工作时，才交给代理一个完整工作包。在阶段变化、执行者完成或出现关键新证据后重新判断。

## 默认路由

| 工作 | 起点 |
| --- | --- |
| 日常实现、审查、普通调试及同类写作、翻译、分析 | 6.1 Sol high；约束复杂或判断困难时 xhigh |
| 跨模块实现、持续判断 | 6.1 Sol xhigh，先稳定共享接口再分工 |
| 按明确规则整理、抽取、检查的简单批量任务 | 确定性工具优先；必要时 Luna max |
| 持续推理困难、关键架构或数据保护判断 | Astra，限定具体问题，通常 xhigh |

始终使用 **Standard（正常速度）**。推理强度与速度模式独立；本工作流不启用 Fast / Ultrafast。完整选择条件、不可用时的回退与校准规则见 [模型路由](quota-aware-agents/references/model-routing.md)。

模型与推理强度是否可用，以账号、当前工具和权限为准。Skill 不授予代理额外权限，不自动切换主对话模型或全局配置；工具没有速度选项时，也不能据此声称已经更改速度模式。

## 安装

可以向 Codex 发送下面的安装请求；是否能自动安装取决于当前可用的 `skill-installer` 与权限：

```text
请使用 $skill-installer 从 https://github.com/mario110333/quota-aware-agents/tree/main/quota-aware-agents 安装这个 Skill。
```

Windows 用户也可下载仓库 ZIP，解压后在根目录运行 `./Install.ps1`。脚本按 [checksums.json](checksums.json) 校验六个 Skill 文件，无需管理员权限；已有同名目录时停止，不覆盖旧版。

Windows / macOS / Linux 均可手动将整个 `quota-aware-agents` 文件夹复制到 `~/.agents/skills/`。更新前先备份并移走旧目录，避免混合版本；如果 Skill 未显示，重启 Codex。完整操作见 [安装说明](安装说明.md)。

安装后可以发送：

```text
请使用 $quota-aware-agents 处理这个任务：……
```

Skill 允许按任务自动调用，但调用后仍需判断是否值得分工。它不要求每次请求都派出代理。

## 费用参考与可选统计

[费用与用量说明](quota-aware-agents/references/cost-model.md)中的费用快照日期是 **2026-09-30**，历史费率分别注明日期。它们是带日期的参考，后续比较应核实适用费率；API 金额、Codex credits、实际收费和订阅用量不能混算。本 Skill 不承诺固定节省百分比，也不把模型价格差直接当作任务节省。

普通使用不需要 Node.js。可选的 [本地统计脚本](quota-aware-agents/scripts/summarize-usage.mjs)需要支持 `node:sqlite` 只读模式的 Node.js，已在 Node.js 24.21.0 验证。仅按需要手动运行，先用 `node <脚本路径> --help` 查看参数。

脚本只读读取本机 Codex 数据库与日志，在指定的新目录写入统计结果，默认输出摘要，不上传数据。输出可能含本机路径与会话标识，公开分享前请检查；仓库不包含作者的会话、账号配置、凭据或旧用量数据。内部日志格式变化或记录缺失会使统计不完整，结果不能当作实际账单、订阅额度或已测得的节省。

## 许可证

采用 [MIT 许可证](LICENSE)。独立安装的 Skill 文件夹也携带同一份许可。Copyright (c) 2026 malioe。
