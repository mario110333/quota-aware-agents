# quota-aware-agents

**简体中文** · [English](README.en.md)

面向 Codex 的按需分工 Skill：先判断任务是否值得交给子代理，再选择合适的模型和推理强度。简单工作直接完成，复杂工作按边界处理；分工要计入上下文、协调、等待、验收和返工的总成本。

**作者：malioe** · **当前版本：1.4.0** · **许可证：[MIT](LICENSE)**

[安装与首次使用](#安装与首次使用) · [已安装时更新](#已安装时更新) · [使用示例](#使用示例) · [分工规则](#分工规则) · [常见问题](#常见问题) · [详细文档](#详细文档)

适用于 Codex 中的 OpenAI 模型及当前会话可用的代理工具，可用于实现、分析、翻译和批量审查。Skill 提供工作指引；模型访问权限和运行能力取决于实际环境。

## 安装与首次使用

在 Codex 中输入：

```text
请使用 $skill-installer 从 https://github.com/mario110333/quota-aware-agents/tree/main/quota-aware-agents 安装这个 Skill。
```

安装完成后，在任务中提及 `$quota-aware-agents` 即可。Codex 也可以在任务匹配描述时选择它；是否分工仍需按实际任务判断。

也可以手动安装：

- **Windows：**下载 [main 分支 ZIP](https://github.com/mario110333/quota-aware-agents/archive/refs/heads/main.zip)，解压后在仓库根目录运行 `./Install.ps1`。脚本核对完整 Skill 文件清单与 [checksums.json](checksums.json)，无需管理员权限；目标目录已存在时会停止。
- **Windows / macOS / Linux：**将完整的 `quota-aware-agents` 文件夹复制到 `~/.agents/skills/`。更新前，将旧副本备份并移出 Skill 搜索目录。

具体命令、更新、卸载和排查步骤见[安装说明](安装说明.md)。当前 1.4.0 从 main 分支获取；[Releases](https://github.com/mario110333/quota-aware-agents/releases) 保留历史版本。安装 Skill 不会扩大文件、工具或外部操作的授权范围。

## 已安装时更新

把下面这一句话发给 Codex：

```text
请将已安装的 quota-aware-agents 从 https://github.com/mario110333/quota-aware-agents 更新到 main 最新版：核对实际安装位置，先在 Skill 搜索目录外备份，保留本地定制和目录链接，校验完整包后更新原位置并报告版本；已是最新则无需重装。
```

更新流程包括来源与完整文件比对、备份、校验和现有安装的替换。安装器会保护已有目录，具体的临时下载、本地定制及目录链接处理见[更新方法](安装说明.md#更新与卸载)。更新后在下一轮使用；若未显示，按[官方说明](https://learn.chatgpt.com/docs/build-skills)重启 Codex。

## 1.4.0 调整

入口只保留分工判断、交接和验收的核心规则；模型识别、速度协议及用量核算按需要读取。缺少速度控制接口时明确限制并继续合适的工作，避免无效探测；保留反复切换时的最新设置确认、Sol/high 例外和 Astra 30 秒授权约定。

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

数量、引用和精确匹配等确定性检查优先用脚本；有明确规则、足够规模且容易核验的语义批次，可以考虑 Luna。若只需要分工建议，可在请求中注明“只做计划，不启动子代理或执行任务”。

## 分工规则

**先决定是否值得分工，再决定用哪个模型。** 子代理应承担有边界、验收标准和独占归属的完整工作包，包含必要的调查、执行、普通调试、验证和记录。主代理同时推进另一项必要工作，最终负责整合与验收。

| 工作类型 | 处理方式 |
| --- | --- |
| 简单问答、小修改、普通实现 | 主代理直接完成；Sol 主代理默认从零个子代理开始 |
| 极难但紧密耦合的问题 | 留在主代理，保持推理和决策连贯；难度本身不触发拆分 |
| 值得并行的独立工作包 | 可交给 Sol；主代理为 Sol 时，通常沿用已核实且工具支持的主代理推理强度。Sol/high 仅作为有明确理由的例外 |
| 机械批量处理 | 优先使用确定性工具或脚本 |
| 足够规模、规则明确、易核验的语义批次 | 可考虑 `gpt-6-luna` / `max`；歧义或返工抵消收益时直接处理 |
| 关键判断需要第二意见 | 围绕具体问题咨询 `gpt-6-astra`，通常使用 `xhigh`，范围限定为只读讨论 |

Astra 作为主代理时，可将值得并行的独立执行包交给 Sol/xhigh。其他或未知主模型按实际能力和任务风险判断。模型或推理强度不可用时，选择工具支持的合适组合，或继续直接处理；用户明确指定的模型优先。

共享接口尚未稳定时，先完成并验证一个有代表性的端到端流程。阶段变化、子代理完成或出现关键新证据后重新判断，验收通过后停止，避免重复调查和固定的多轮审阅链。

### Astra 咨询与授权

Astra 用于具体关键问题的第二意见。实现与验收由任务负责人负责，咨询不自动扩展为持续监督或执行。

自动提出咨询计划时，先通过交互通知说明问题、范围和模型，并留出 **30 秒反馈窗口**。只有你此前明确授权“未回应按计划执行”，才能在窗口结束后继续。批准可提前执行，拒绝取消，提问或调整暂停计划；新范围需要新通知。直接请求这次有界咨询时，无需重复等待。完整的授权、取消与迟到回复处理见 [Astra 咨询规则](quota-aware-agents/references/astra-consultation.md)。

### 跟随主代理速度

速度、模型和推理强度分别处理。每次派发或续用前，刷新主代理当前的 Standard / Fast / Ultrafast 选择；观察到切换时及时更新，来回切换时拒绝旧设置的确认，并保留仍有效的工作。

实际同步依赖宿主提供的速度控制或已核实的继承能力。任务说明和消息不能改变执行速度；工具无法设置或核实时，应明确报告限制。Skill 不安装后台监视器，也不能保证正在运行的子代理立即切速。详见[速度跟随规则](quota-aware-agents/references/speed-following.md)。

## 常见问题

**主代理已经是 Sol/xhigh，还需要子代理吗？**

通常可以直接完成。只有独立工作包与必要的并行工作能抵消交接、等待、验收和返工成本时，才值得分工。不会因为主代理是 xhigh，就默认增加一个 Sol/high 子代理。

**会自动改主模型、全局设置或权限吗？**

不会。安装和使用 Skill 不授予新的模型权限、文件修改、外部操作或递归分工权限；自动 Astra 咨询也遵循上面的授权条件。

**能保证省钱或更快吗？**

没有固定比例保证。更便宜的模型可能因协调和返工增加总成本；需要在相同质量要求下比较实际结果。

**安装后找不到 Skill 怎么办？**

确认 `~/.agents/skills/quota-aware-agents/SKILL.md` 存在，移除搜索目录中的重复副本，仍未出现时重启 Codex。详见[安装排查](安装说明.md)。

**中英文页面的规则是否一样？**

一样。两份 README 说明同一套规则，Skill 与参考文件以英文编写。可见进展和汇总跟随主对话语言，交付物遵循用户要求或项目约定。

## 详细文档

- [SKILL.md](quota-aware-agents/SKILL.md)：核心工作流程、任务卡和验收。
- [模型路由](quota-aware-agents/references/model-routing.md)：模型与推理强度、Sol/high 例外及不可用时的处理。
- [可选模型识别](quota-aware-agents/references/model-identification.md)：需要识别时的绑定、脚本与未知回退。
- [Astra 咨询](quota-aware-agents/references/astra-consultation.md)：通知窗口、授权、范围调整和取消。
- [速度跟随](quota-aware-agents/references/speed-following.md)：当前设置刷新、反复切换和宿主能力限制。
- [执行证据](quota-aware-agents/references/execution-evidence.md)：共享运行资源、观察有效性和停止条件。
- [费用与用量](quota-aware-agents/references/cost-model.md)：核算口径及可选工具的使用限制。

Skill 指引本身不依赖 Node.js。可选的[模型识别脚本](quota-aware-agents/scripts/resolve-main-model.mjs)和[用量统计脚本](quota-aware-agents/scripts/summarize-usage.mjs)需要支持只读 `node:sqlite` 的 Node.js。统计工具只读本地 Codex 记录，将报告写入新的指定目录，不上传数据；报告可能包含本地路径和会话标识，分享前请检查。Token、API 等价金额、Codex credits、实际扣费和订阅用量是不同口径，统计不能直接当作账单或节省证明。

## 反馈与许可证

欢迎通过 [GitHub Issues](https://github.com/mario110333/quota-aware-agents/issues) 反馈问题，或提出有实际证据的路由建议。请附预期行为、实际结果和必要复现步骤，公开前移除私有路径、会话标识、凭据和聊天内容。

本项目采用 [MIT 许可证](LICENSE)，独立安装的 Skill 文件夹也携带同一份许可。Copyright (c) 2026 malioe。
