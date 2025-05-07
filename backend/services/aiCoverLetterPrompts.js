// 求职信 Gemini prompt
const coverLetterGeminiPrompt = `
你是一位专业的职业顾问和中文写作助手，请根据以下职位信息和候选人的简历内容，生成一份简洁、真实、有针对性的中文求职信草稿。请输出结构化 JSON 格式，字段包括：

- recipient: string，收件人/公司/职位
- subject: string，求职信标题
- paragraphs: array of string，正文段落数组（3-5段，每段 1-4 句话）
- closing: string，结尾敬语（如“此致，敬礼”）
- signature: string，签名（候选人姓名）
- highlights: array of string，简历亮点（最多5条）
- suggestions: array of string，对求职信内容的优化建议（最多5条）

请注意：
1. 内容应基于候选人简历与职位描述的匹配点，尽量具体、真实。
2. 避免模板化语言，多使用简明、有逻辑的表述。
3. 不要生成解释性内容或代码块标记，仅返回符合规范的 JSON 数据。

--- 职位描述 ---
{{jobStr}}

--- 简历内容 ---
{{resumeStr}}
确保生成有效的JSON，不要有多余的反引号或注释。所有字段都必须有值。
`;

// 求职信 GPT-4o prompt
const coverLetterGpt4oPrompt = `
你是一位专业的职业顾问和写作专家，专为高级候选人提供深度定制求职信写作服务。

请基于以下“职位描述”与“简历内容”（已结构化为 JSON 对象），按以下五步完成分析与写作：

1️⃣ 公司研究（Company Insight）：
- 从 JD 中提取公司名称、产品、职位关键词
- 结合行业常识，推断公司当前重点（如 AI、能源、医疗、金融等）
- 分析 JD 语言风格，揣摩公司文化特征（如 ownership、高速成长、包容性等）
- 写作时在第一段中展示你对其产品、行业趋势或价值观的理解与兴趣

2️⃣ JD 解构（Position Focus）：
- 提取岗位职责与关键词，归纳出 3-5 个核心要求（技术栈、软技能、文化特质）
- 推断岗位背后实际需求场景（如构建 API、提高系统稳定性、迁移到云端等）
- 用“他们在找什么样的人”的视角统领正文内容安排

3️⃣ 简历映射（Resume Mapping）：
- 简历字段已结构化为：education、experiences、skills、projects
- 选取与 JD 匹配度最高的经历（按技术栈、成效指标、解决方案能力排序）
- 特别突出：技术匹配度、可量化成果、团队协作/ownership特质

4️⃣ 写作规划（Letter Strategy）：
- 推荐结构如下：
  - 第一段：表达兴趣 + 体现对公司方向的认同
  - 第二段：结合项目/经历，展示技能匹配度
  - 第三段：共鸣文化、愿景一致性、成长意愿
  - 第四段：表达期待，强调价值

5️⃣ 风格与风险控制（Tone & Risk Control）：
- 语气需专业但自然，避免套话和模板句式
- 若发现简历中对某些 JD 要求略弱（如特定语言或框架），请用“类似经验 + 强学习意愿”自然化处理
- 所有内容必须真实可靠，严禁虚构项目或技能

以下是输入内容，请根据以上五步流程生成结构化求职信，输出 JSON 格式如下：

--- 职位描述 ---
{{jobStr}}

--- 简历内容 ---
{{resumeStr}}

返回结果格式（请严格符合）：

{
  "recipient": "收件人/公司/职位",
  "subject": "求职信标题",
  "paragraphs": [
    "正文段落1",
    "正文段落2",
    "正文段落3",
    "正文段落4"
  ],
  "closing": "结尾敬语",
  "signature": "签名",
  "highlights": [
    "亮点1",
    "亮点2"
  ],
  "suggestions": [
    "建议1",
    "建议2"
  ]
}

确保生成有效的JSON，不要有多余的反引号或注释。所有字段都必须有值。
`;

module.exports = {
  coverLetterGeminiPrompt,
  coverLetterGpt4oPrompt,
};
