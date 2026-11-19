const sectionPresets = {
  summary: '个人简介',
  experience: '工作经历',
  education: '教育经历',
  projects: '项目经历',
  skills: '专业技能',
  certificates: '证书荣誉',
  custom: '自定义栏目'
};

const PROFILE_FIELDS = ['name', 'role', 'phone', 'email', 'location', 'website'];
const ITEM_FIELDS = ['title', 'org', 'date', 'details'];

function cleanText(value, limit = 12000) {
  return String(value ?? '').replace(/\r\n?/g, '\n').trim().slice(0, limit);
}

function newId(prefix) {
  return `${prefix}-${globalThis.crypto?.randomUUID?.() || Date.now() + '-' + Math.random().toString(16).slice(2)}`;
}

export function buildGenerationPrompt(requirement) {
  const schema = {
    profile: { name: '', role: '', phone: '', email: '', location: '', website: '' },
    sections: [
      { type: 'summary', title: '个人简介', content: '' },
      { type: 'experience', title: '工作经历', items: [{ title: '', org: '', date: '', details: '- ' }] },
      { type: 'education', title: '教育经历', items: [{ title: '', org: '', date: '', details: '' }] },
      { type: 'projects', title: '项目经历', items: [{ title: '', org: '', date: '', details: '- ' }] },
      { type: 'skills', title: '专业技能', content: '' }
    ]
  };
  return `你是专业中文简历编辑。根据下方需求生成一份可直接投递的简历。\n\n规则：\n1. 只使用用户提供的事实，不虚构公司、学校、日期、证书、联系方式或业绩。\n2. 缺少的信息留空，不要编造。\n3. 个人简介 60-120 字；经历优先使用短句和可验证成果。\n4. 工作与项目详情的每条要点以“- ”开头。\n5. 输出必须是合法 JSON，不要 Markdown、代码围栏、解释或思考过程。\n6. 只输出 profile 与 sections；section.type 只能使用 summary、experience、education、projects、skills、certificates、custom。\n\nJSON 结构示例：\n${JSON.stringify(schema, null, 2)}\n\n用户需求：\n${cleanText(requirement, 12000)}`;
}

export function buildPolishPrompt({ text, style = '专业', context = '' }) {
  const styleRules = {
    专业: '表达专业、准确、克制，适合正式求职。',
    简洁: '压缩冗余表达，保留全部事实，句子简短。',
    成果: '突出可验证的行动、方法和结果；不得新增数字或事实。',
    技术: '突出技术方案、复杂度、工程质量和可量化结果；不得夸大。'
  };
  return `你是资深中文简历编辑。润色下面的简历段落。\n\n规则：\n1. ${styleRules[style] || styleRules.专业}\n2. 保留原有事实、数字、时间、技术栈和列表结构，绝不虚构。\n3. 不添加标题、解释、Markdown 代码围栏或思考过程。\n4. 只输出润色后的正文。\n${context ? `\n上下文：${cleanText(context, 500)}\n` : ''}\n原文：\n${cleanText(text, 12000)}`;
}

export function extractModelJson(raw) {
  const answer = String(raw ?? '')
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  const start = answer.indexOf('{');
  const end = answer.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('模型未返回可用的简历数据');
  try {
    return JSON.parse(answer.slice(start, end + 1));
  } catch {
    throw new Error('简历数据格式无效，请重新生成');
  }
}

export function normalizeGeneratedResume(payload, current) {
  if (!payload || typeof payload !== 'object' || !Array.isArray(payload.sections)) {
    throw new Error('生成结果缺少简历栏目');
  }
  const profile = {};
  for (const field of PROFILE_FIELDS) profile[field] = cleanText(payload.profile?.[field], field === 'website' ? 160 : 100);
  profile.photo = current?.profile?.photo || '';
  if (!profile.name && !profile.role && !payload.sections.length) throw new Error('生成结果内容为空');
  const seen = new Map();
  const sections = payload.sections.slice(0, 20).flatMap((source) => {
    if (!source || !Object.hasOwn(sectionPresets, source.type)) return [];
    const count = (seen.get(source.type) || 0) + 1;
    seen.set(source.type, count);
    const base = sectionPresets[source.type];
    const section = {
      id: newId('section'),
      type: source.type,
      title: cleanText(source.title, 60) || (count > 1 ? `${base} ${count}` : base),
      visible: true,
      content: cleanText(source.content),
      items: []
    };
    if (['experience', 'education', 'projects', 'certificates'].includes(source.type)) {
      section.items = (Array.isArray(source.items) ? source.items : []).slice(0, 20).map((item) => {
        const clean = { id: newId('item') };
        for (const field of ITEM_FIELDS) clean[field] = cleanText(item?.[field], field === 'details' ? 12000 : 160);
        if (clean.details && !/^(- |\d+\. |>\s)/m.test(clean.details)) clean.details = '- ' + clean.details;
        return clean;
      }).filter((item) => item.title || item.org || item.details);
    }
    return section.content || section.items.length ? [section] : [];
  });
  if (!sections.length) throw new Error('生成结果没有可用栏目');
  return {
    profile,
    sections,
    meta: {
      name: profile.name,
      role: profile.role,
      sectionCount: sections.length
    }
  };
}

export function cleanPolishedText(raw) {
  let value = String(raw ?? '').trim();
  value = value.replace(/^```(?:markdown|text)?\s*/i, '').replace(/```\s*$/i, '').trim();
  value = value.replace(/^(润色后的?正文|润色结果|润色后)[:：]\s*/i, '').trim();
  if (!value) throw new Error('模型未返回润色内容');
  return value.slice(0, 12000);
}

export function polishTargets(resume) {
  const targets = [];
  for (const section of resume.sections || []) {
    if (section.type === 'summary' || section.type === 'skills' || section.type === 'custom') {
      if (section.content?.trim()) targets.push({
        value: `section:${section.id}`,
        sectionId: section.id,
        label: section.title,
        context: `${section.title}；目标职位：${resume.profile?.role || ''}`,
        text: section.content
      });
    }
    for (const item of section.items || []) {
      if (!item.details?.trim()) continue;
      targets.push({
        value: `item:${section.id}:${item.id}`,
        sectionId: section.id,
        itemId: item.id,
        label: `${section.title} · ${item.title || item.org || '条目'}`,
        context: `${section.title}；${item.title || ''}；${item.org || ''}；${item.date || ''}`,
        text: item.details
      });
    }
  }
  return targets;
}
