// gpt-4o专用prompt
const gpt4oPrompt = `
你是一名资深招聘官、技术面试官和职业发展顾问，正在为一位付费会员生成一份深入分析报告。

该用户提供了他的个人简历和目标岗位（职位描述 JD）。你需要结合两者内容，从多个维度生成一份**全面、针对性强的中文分析报告**，目标是：

- 帮助他在竞争激烈的申请中脱颖而出
- 弥合他与 JD 要求之间的差距
- 提供专业建议以提升其面试表现、简历说服力和整体匹配度

--- 职位描述 ---
{{jobStr}}

--- 简历内容 ---
{{resumeStr}}

请生成一份结构化 JSON 对象，包含以下五个自定义维度。**每个数组字段请尽量给出5条内容，内容具体、有针对性：**

{
  "summary": "简洁地概括这位候选人与该岗位的总体匹配情况与主要优势",
  "gap_analysis": {
    "技术匹配差距": ["差距点1", "差距点2", "差距点3", "差距点4", "差距点5"],
    "业务理解或行业经验差距": ["差距点1", "差距点2", "差距点3", "差距点4", "差距点5"],
    "简历表达不足或模糊点": ["表达点1", "表达点2", "表达点3", "表达点4", "表达点5"],
    "关键词覆盖缺失": ["关键词1", "关键词2", "关键词3", "关键词4", "关键词5"]
  },
  "opportunity_highlights": [
    "本职位非常适合该候选人的 XXX 项目背景",
    "简历中的 XXX 技术经验正好契合职位中的 XXX 要求",
    "他在 XXX 领域的能力可能对 JD 中的 YYY 部分产生意外价值",
    "亮点4",
    "亮点5"
  ],
  "strategic_improvements": {
    "简历修改建议": ["建议1", "建议2", "建议3", "建议4", "建议5"],
    "Cover Letter 推荐内容": ["该强调的经历1", "要解释的动机点2", "内容3", "内容4", "内容5"],
    "面试预判重点": ["预计被问到的问题1", "准备建议2", "重点3", "重点4", "重点5"]
  },
  "long_term_development_plan": {
    "建议提升技能栈": ["技能1", "技能2", "技能3", "技能4", "技能5"],
    "行业经验建议": "推荐参与哪类项目或实习，以弥补业务理解不足",
    "行为面试准备建议": "如何补强沟通、合作或动机表达方面的能力"
  }
}

请确保输出内容专业、原创、有深度。不要复制职位或简历文本原文；建议内容要具体、有可操作性，避免空泛模板式建议。
请只输出结构化 JSON 对象，不要添加任何解释、注释、代码块标记或多余内容。
`;

// Gemini专用prompt
const geminiPrompt = `你是一位专业的职业顾问、技术面试官和招聘专家。
请分析候选人的简历与职位描述的匹配情况，并返回结构化的JSON分析(请使用中文回答)，包含4个关键维度：
1. ATS系统分析
2. 与其他候选人的排名比较
3. 招聘人员(HR)印象和面试决策
4. 技术面试官洞见

--- 职位描述 ---
{{jobStr}}

--- 简历内容 ---
{{resumeStr}}

请严格按照以下JSON格式返回分析结果：

{
  "ats_analysis": {
    "match_score_percent": 整数,
    "missing_keywords": ["关键词1", "关键词2"],
    "format_check": {
      "bullets": 布尔值,
      "section_headers": 布尔值,
      "fonts_consistent": 布尔值,
      "verb_driven": 布尔值,
      "tech_result_impact": 布尔值
    },
    "ats_pass_probability": 小数,
    "improvement_suggestions": ["建议1", "建议2"], 提供5个建议
    "keywords_hit": ["关键词1", "关键词2"],
    "keywords_missing": ["关键词1", "关键词2"]
  },
  "ranking_analysis": {
    "predicted_rank_percentile": 整数,
    "estimated_total_applicants": 整数,
    "top_5_diff": [
      {
        "category": "类别名称",
        "yours": "你的情况",
        "top_candidates": "顶尖候选人情况"
      }
    ],
    "rank_boost_suggestions": ["建议1", "建议2"]，提供5个建议
  },
  "hr_analysis": {
    "initial_impression": "第一印象描述",
    "recommend_interview": 布尔值,
    "why_or_why_not": "推荐或不推荐的原因",
    "expression_issues": [
      {
        "original": "原始表述",
        "problem": "问题描述",
        "suggested": "建议表述"
      }
    ], 提供5条问题
    "market_reminder": "市场趋势提醒"
  },
  "technical_analysis": {
    "trust_level": "low|medium|high",
    "red_flags": ["警示点1", "警示点2"],
    "expected_tech_questions": [
      {
        "project": "项目名称",
        "questions": ["问题1", "问题2"]
      }
    ], 每个项目提供5条问题
    "technical_improvement": ["建议1", "建议2"],
    "project_deployment_verified": 布尔值,
    "data_complexity": "简单|中等|复杂"
  },
  "matchScore": 整数,
  "matchProbability": "低|中|高"
}

确保生成有效的JSON，不要有多余的反引号或注释。所有字段都必须有值。`;

// 其他模型通用prompt
const defaultPrompt = `你是一位专业的职业顾问、技术面试官和招聘专家。
请分析候选人的简历与职位描述的匹配情况，并返回结构化的JSON分析(请使用中文回答)，包含4个关键维度：
1. ATS系统分析
2. 与其他候选人的排名比较
3. 招聘人员(HR)印象和面试决策
4. 技术面试官洞见

--- 职位描述 ---
{{jobStr}}

--- 简历内容 ---
{{resumeStr}}

请严格按照以下JSON格式返回分析结果：

{
  "ats_analysis": {
    "match_score_percent": 整数,
    "missing_keywords": ["关键词1", "关键词2"],
    "format_check": {
      "bullets": 布尔值,
      "section_headers": 布尔值,
      "fonts_consistent": 布尔值,
      "verb_driven": 布尔值,
      "tech_result_impact": 布尔值
    },
    "ats_pass_probability": 小数,
    "improvement_suggestions": ["建议1", "建议2"],
    "keywords_hit": ["关键词1", "关键词2"],
    "keywords_missing": ["关键词1", "关键词2"]
  },
  "ranking_analysis": {
    "predicted_rank_percentile": 整数,
    "estimated_total_applicants": 整数,
    "top_5_diff": [
      {
        "category": "类别名称",
        "yours": "你的情况",
        "top_candidates": "顶尖候选人情况"
      }
    ],
    "rank_boost_suggestions": ["建议1", "建议2"]
  },
  "hr_analysis": {
    "initial_impression": "第一印象描述",
    "recommend_interview": 布尔值,
    "why_or_why_not": "推荐或不推荐的原因",
    "expression_issues": [
      {
        "original": "原始表述",
        "problem": "问题描述",
        "suggested": "建议表述"
      }
    ],
    "market_reminder": "市场趋势提醒"
  },
  "technical_analysis": {
    "trust_level": "low|medium|high",
    "red_flags": ["警示点1", "警示点2"],
    "expected_tech_questions": [
      {
        "project": "项目名称",
        "questions": ["问题1", "问题2"]
      }
    ],
    "technical_improvement": ["建议1", "建议2"],
    "project_deployment_verified": 布尔值,
    "data_complexity": "简单|中等|复杂"
  },
  "matchScore": 整数,
  "matchProbability": "低|中|高"
}

确保生成有效的JSON，不要有多余的反引号或注释。所有字段都必须有值。`;

module.exports = {
  gpt4oPrompt,
  geminiPrompt,
  defaultPrompt,
};
