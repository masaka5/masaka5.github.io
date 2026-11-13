// Presets use Breeze's voice-design instructions, with stable seeds. A supplied
// reference clip takes precedence over the designed timbre in the model itself.
export const VOICES=[
 {id:'natural',name:'清禾',label:'自然女声',seed:42,instruction:'A young adult woman with a clear, natural, conversational voice. Calm, friendly and articulate.'},
 {id:'warm',name:'知夏',label:'温柔女声',seed:137,instruction:'An adult woman with a warm, soft, gentle voice. Speak calmly, with a reassuring tone and a relaxed pace.'},
 {id:'news',name:'远山',label:'沉稳男声',seed:256,instruction:'An adult man with a warm, deep, steady voice. Clear pronunciation, measured pacing, professional newsreader delivery.'},
 {id:'story',name:'听澜',label:'故事旁白',seed:512,instruction:'An adult woman with a warm, rich storytelling voice. Expressive but natural narration, smooth phrasing and gentle pauses.'},
 {id:'energetic',name:'星野',label:'活力男声',seed:729,instruction:'A young adult man with a bright, energetic, friendly voice. Clear and lively delivery with natural enthusiasm.'}
];
export function voiceSettings(id,language='zh',direction=''){
 const voice=VOICES.find(v=>v.id===id);
 const languageNote=language==='en'?'Speak in natural English.':'Speak in standard Mandarin Chinese with clear pronunciation.';
 return {seed:voice?.seed||42,instruction:[voice?.instruction,languageNote,direction.trim()].filter(Boolean).join(' ')};
}
