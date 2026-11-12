export const platforms=[
 {name:'哔哩哔哩',domains:['bilibili.com','biliapi.net','biliapi.com','bilivideo.com','bilivideo.cn','hdslb.com','b23.tv'],referer:'https://www.bilibili.com/'},
 {name:'YouTube',domains:['youtube.com','youtu.be','youtube-nocookie.com','googlevideo.com','ytimg.com','youtubei.googleapis.com','jnn-pa.googleapis.com'],referer:'https://www.youtube.com/'},
 {name:'Vimeo',domains:['vimeo.com','vimeocdn.com'],referer:'https://vimeo.com/'},
 {name:'SoundCloud',domains:['soundcloud.com','sndcdn.com','soundcloud.cloud'],referer:'https://soundcloud.com/'},
 {name:'Dailymotion',domains:['dailymotion.com','dmcdn.net','dai.ly'],referer:'https://www.dailymotion.com/'},
 {name:'Internet Archive',domains:['archive.org'],referer:'https://archive.org/'},
 {name:'TikTok',domains:['tiktok.com','tiktokv.com','tiktokcdn.com','tiktokcdn-us.com','muscdn.com','musical.ly'],referer:'https://www.tiktok.com/'},
 {name:'抖音',domains:['douyin.com','douyinvod.com','douyinpic.com','byteimg.com','ibytedtos.com','ixigua.com','ixiguavideo.com','snssdk.com'],referer:'https://www.douyin.com/'},
 {name:'微博',domains:['weibo.com','weibo.cn','weibocdn.com','sinaimg.cn','miaopai.com'],referer:'https://weibo.com/'},
 {name:'Twitter / X',domains:['twitter.com','x.com','twimg.com'],referer:'https://x.com/'},
 {name:'Reddit',domains:['reddit.com','redd.it','redditmedia.com','redditstatic.com'],referer:'https://www.reddit.com/'},
];
export function platformFor(host){return platforms.find(p=>p.domains.some(d=>host===d||host.endsWith('.'+d)));}
