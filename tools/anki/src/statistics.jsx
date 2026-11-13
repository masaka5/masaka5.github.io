import React from'react';import{Card,Statistic,Table,Empty,Progress}from'antd';
const number=new Intl.NumberFormat('zh-CN');
function Bars({values,title}){
 const max=Math.max(1,...values.map(v=>v.count));return<Card title={title} size="small" className="chart-card"><div className="chart-bars" role="img" aria-label={title}>{values.map(v=><div className="chart-column" key={v.time}><div style={{height:Math.max(2,v.count/max*110)}} title={`${new Date(v.time).toLocaleDateString()} · ${v.count} 次`}/><span>{new Date(v.time).getDate()}</span></div>)}</div></Card>;
}
export function Statistics({value}){
 if(!value)return<Empty description="暂无学习记录"/>;
 const dailyMap=new Map(value.daily.map(d=>[new Date(d.time).toLocaleDateString(),d])),days=Array.from({length:28},(_,i)=>{const date=new Date();date.setDate(date.getDate()-27+i);return{time:date.getTime(),count:dailyMap.get(date.toLocaleDateString())?.count||0};});
 return<div className="statistics-content"><div className="stat-cards">
  <Card><Statistic title="累计复习" value={value.reviews} suffix="次"/></Card><Card><Statistic title="记住率" value={value.reviews?Math.round(value.correct/value.reviews*100):0} suffix="%"/></Card><Card><Statistic title="连续学习" value={value.streak} suffix="天"/></Card><Card><Statistic title="成熟卡片" value={value.mature}/></Card>
 </div><div className="chart-row"><Bars title="近 28 天复习" values={days}/><Bars title="未来 14 天到期" values={value.nextDays}/></div>
 <Card size="small" title="学习进度"><div className="progress-copy"><span>已学习 {number.format(value.summary.studied)} / {number.format(value.summary.total)}</span><span>累计用时 {Math.round(value.duration/60000)} 分钟</span></div><Progress percent={Math.round(value.summary.studied/Math.max(1,value.summary.total)*10000)/100} showInfo={false}/></Card>
 <Card size="small" title="最近复习" className="recent-card"><Table size="small" rowKey="id" dataSource={value.recent} pagination={{pageSize:5,size:'small',showSizeChanger:false}} columns={[{title:'词条',dataIndex:'front',ellipsis:true},{title:'评分',dataIndex:'rating',render:n=>['','重来','困难','良好','简单'][n]},{title:'时间',dataIndex:'time',render:n=>new Date(n).toLocaleString('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'})}]}/></Card></div>;
}
