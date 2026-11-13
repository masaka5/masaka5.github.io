"""Archive tested studio sources independently of the Pages runtime branch."""
from pathlib import Path
import subprocess,os,tempfile,json,sys
ROOT=Path(__file__).resolve().parent.parent;REPO=ROOT/'_scratch/masaka5-toolbox-upstream'
BRANCH='source-archive-20261113'
def git(*args,env=None,input=None):return subprocess.check_output(['git',*args],cwd=REPO,env=env,input=input)
remote=git('ls-remote','--heads','origin','refs/heads/'+BRANCH).decode().split()[0]
git('fetch','origin','refs/heads/'+BRANCH)
with tempfile.TemporaryDirectory(prefix='broadcast-effects-source-')as temporary:
 env={**os.environ,'GIT_INDEX_FILE':str(Path(temporary)/'index')}
 git('read-tree',remote,env=env)
 names=['tools/broadcast/'+p.name for p in sorted((ROOT/'toolbox-site/tools/broadcast').iterdir())if p.is_file()]
 names+=['licenses/broadcast-source.zip']
 for name in names:
  blob=git('hash-object','-w','--stdin',input=(ROOT/'toolbox-site'/name).read_bytes()).decode().strip()
  git('update-index','--add','--cacheinfo','100644',blob,name,env=env)
 extra=[ROOT/'_scratch/broadcast-interaction-plan.md',ROOT/'_scratch/broadcast-low-latency-plan.md',ROOT/'_scratch/archive-broadcast-effects.py',ROOT/'_scratch/stage-broadcast-effects.py']
 extra += sorted((ROOT/'_scratch').glob('broadcast-latency-final-*.json'))
 extra += [ROOT/'_scratch/broadcast-latency-edge.json',ROOT/'_scratch/broadcast-latency-firefox.json',ROOT/'_scratch/broadcast-latency-features.json']
 extra += [ROOT/'_scratch'/name for name in ['broadcast-stability-report.md','broadcast-srs-observe.json','broadcast-srs-stability-final.json','broadcast-background-before.json','broadcast-background-final.json','broadcast-latency-stability-final.json','broadcast-stability-summary.json','summarize-broadcast-stability.py']]
 extra += [ROOT/'_scratch'/name for name in ['broadcast-bitrate-plan.md','broadcast-teams-design.md','broadcast-bitrate-report.md','broadcast-bitrate-before.json','broadcast-bitrate-after.json','broadcast-bitrate-engine.json','broadcast-bitrate-engine-blocks.json']]
 for path in extra:
  blob=git('hash-object','-w','--stdin',input=path.read_bytes()).decode().strip()
  git('update-index','--add','--cacheinfo','100644',blob,path.relative_to(ROOT).as_posix(),env=env)
 tree=git('write-tree',env=env).decode().strip()
 commit=git('-c','user.name=Codex','-c','user.email=codex@openai.com','commit-tree',tree,'-p',remote,'-m',sys.argv[1]if len(sys.argv)>1 else'Archive studio transforms, GPU effects, fades and keyboard editing with tests').decode().strip()
 git('push','origin',commit+':refs/heads/'+BRANCH)
 print(json.dumps({'archiveBranch':BRANCH,'commit':commit,'updatedFiles':len(names)+len(extra)}))
