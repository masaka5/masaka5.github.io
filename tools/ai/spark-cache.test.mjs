import test from 'node:test';
import assert from 'node:assert/strict';
import {MODEL_PROFILES,isMobileBrowser,selectModelProfile,openModelCache} from './spark-cache.mjs';

const mobile={userAgent:'Mozilla/5.0 (Linux; Android 14; Pixel) Mobile'};
const desktop={userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'};

test('移动端仍选择唯一的 4B 模型配置',()=>{
  assert.equal(isMobileBrowser(mobile),true);
  assert.equal(selectModelProfile(mobile),MODEL_PROFILES.desktop);
  assert.equal(Object.keys(MODEL_PROFILES).length,1);
});

test('移动端使用较小分片，桌面端保留大分片',async()=>{
  const mobileCache=await openModelCache({cache:null,nav:mobile});
  const desktopCache=await openModelCache({cache:null,nav:desktop});
  assert.equal(mobileCache.chunkSize,16*1024*1024);
  assert.equal(desktopCache.chunkSize,64*1024*1024);
});
