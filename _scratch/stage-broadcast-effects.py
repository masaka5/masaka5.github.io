"""Copy only the studio runtime and verify every staged artifact."""
from pathlib import Path
import subprocess,shutil,json,hashlib,re,sys
ROOT=Path(__file__).resolve().parent.parent;SITE=ROOT/'toolbox-site';REPO=ROOT/'_scratch/masaka5-toolbox-upstream'
archive=sys.argv[1];assert re.fullmatch('[a-f0-9]{40}',archive)
folder=SITE/'tools/broadcast'
manifest=json.loads((folder/'manifest.json').read_text(encoding='utf8'))
manifest['references'][0]['sourceArchive']='https://raw.githubusercontent.com/masaka5/masaka5.github.io/'+archive+'/licenses/broadcast-source.zip'
names=['tools/broadcast/'+p.name for p in sorted(folder.iterdir())if p.is_file()]
for name in names:
 target=REPO/name
 if target.name=='manifest.json':target.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
 else:shutil.copyfile(SITE/name,target)
subprocess.run(['git','-c','core.autocrlf=false','add','--',*names],cwd=REPO,check=True)
for row in manifest['files']:
 data=subprocess.check_output(['git','show',':tools/broadcast/'+row['file']],cwd=REPO)
 assert hashlib.sha256(data).hexdigest()==row['sha256']and len(data)==row['bytes'],row['file']
staged=subprocess.check_output(['git','diff','--cached','--name-only'],cwd=REPO,text=True).splitlines()
assert set(staged)<=set(names),staged
assert not(REPO/'licenses').exists()and not(REPO/'docs').exists()
print(json.dumps({'staged':staged,'runtimeHashes':True,'archiveDirectoriesNotRestored':True}))
