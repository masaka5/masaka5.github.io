"""Browser network adapter for the unmodified yt-dlp Python package.

Runs only inside a dedicated Pyodide Worker. Requests obey browser CORS and TLS.
It never forwards credentials to an unconfigured relay or spoofs restricted headers.
"""
import io, json
from js import XMLHttpRequest, Uint8Array
from pyodide.ffi import can_run_sync, run_sync
import browser_network
from yt_dlp.networking.common import RequestHandler, Response
from yt_dlp.networking.exceptions import TransportError, HTTPError


class BrowserStream(io.RawIOBase):
    def __init__(self, response):
        super().__init__()
        self.response, self.pending, self.eof, self.consumed = response, b'', False, 0

    def readable(self):
        return True

    def read(self, size=-1):
        if self.closed:
            raise ValueError('Response is closed')
        unlimited = size is None or size < 0
        try:
            while not self.eof and (unlimited or len(self.pending) < size):
                chunk = bytes(run_sync(self.response.read()).to_py())
                if not chunk:
                    self.eof = True
                    break
                self.pending += chunk
                if self.consumed + len(self.pending) > 32 * 1024 * 1024:
                    self.close()
                    raise TransportError('解析内容超过 32 MB；请使用媒体直链下载')
            count = len(self.pending) if unlimited else size
            output, self.pending = self.pending[:count], self.pending[count:]
            self.consumed += len(output)
            return output
        except TransportError:
            raise
        except Exception as error:
            self.close()
            raise TransportError('读取失败：请求超时、网络中断或跨域访问受限') from error

    def close(self):
        if not self.closed:
            self.response.close()
        super().close()


class BrowserRH(RequestHandler):
    _SUPPORTED_URL_SCHEMES = ('http', 'https')
    _SUPPORTED_PROXY_SCHEMES = ()
    _SUPPORTED_FEATURES = ()

    def _send(self, request):
        if can_run_sync():
            try:
                body = None if request.data is None else Uint8Array.new(request.data)
                result = run_sync(browser_network.open(request.url, request.method,
                    json.dumps(dict(request.headers)), body, self._calculate_timeout(request)))
            except Exception as error:
                raise TransportError('浏览器无法读取该站点：请求超时、网络失败或站点未开放跨域访问') from error
            response = Response(BrowserStream(result), result.url or request.url,
                                json.loads(result.headers), result.status)
            if result.status >= 400:
                raise HTTPError(response)
            return response
        xhr = XMLHttpRequest.new()
        xhr.open(request.method, request.url, False)
        xhr.timeout = int(self._calculate_timeout(request) * 1000)
        xhr.responseType = 'arraybuffer'
        for key, value in request.headers.items():
            lower = key.lower()
            if lower in ('cookie', 'referer', 'user-agent', 'host', 'origin', 'accept-encoding', 'connection', 'content-length'):
                continue
            xhr.setRequestHeader(key, str(value))
        try:
            data = None if request.data is None else Uint8Array.new(request.data)
            xhr.send(data)
        except Exception as error:
            raise TransportError('浏览器无法读取该站点：网络失败或站点未开放跨域访问') from error
        if not xhr.status:
            raise TransportError('站点未返回可读响应，请检查网络与跨域权限')
        headers = dict(line.split(': ', 1) for line in xhr.getAllResponseHeaders().splitlines() if ': ' in line)
        body = bytes(Uint8Array.new(xhr.response).to_py()) if xhr.response is not None else b''
        if len(body) > 32 * 1024 * 1024:
            raise TransportError('解析响应超过 32 MB；请使用媒体直链下载，避免解析阶段读取完整大文件')
        response = Response(io.BytesIO(body), xhr.responseURL or request.url, headers, xhr.status)
        if xhr.status >= 400:
            raise HTTPError(response)
        return response
