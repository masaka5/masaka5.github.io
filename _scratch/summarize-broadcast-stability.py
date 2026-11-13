from pathlib import Path
import json,statistics
root=Path(__file__).resolve().parent
report=json.loads((root/'broadcast-srs-stability-final.json').read_text());rows=report['samples'];normal=[r for r in rows if r['elapsed']>25 and not 45<r['elapsed']<68 and not 84<r['elapsed']<99]
values=lambda key:[r['sender']['stats'][key]for r in normal if isinstance(r['sender']['stats'].get(key),(int,float))]
heaps=[r['sender']['heap']/1048576 for r in rows];summary={'samples':len(rows),'lastDecoded':rows[-1]['receiver']['video'],'flvDecodeExit':report['flvDecode']['exit'],'jsHeapMiB':[round(min(heaps),2),round(max(heaps),2)],'fpsMedian':statistics.median(values('fps')),'encodeMedianMs':statistics.median(values('encodeMs')),'renderMedianMs':statistics.median(r['sender']['render']for r in normal),'events':rows[-1]['sender']['events'],'errors':report['errors']}
print(json.dumps(summary,indent=2,ensure_ascii=False));(root/'broadcast-stability-summary.json').write_text(json.dumps(summary,indent=2,ensure_ascii=False),encoding='utf8')
