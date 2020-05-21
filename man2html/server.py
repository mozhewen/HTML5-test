import http.server
from http import HTTPStatus
import urllib.parse
import subprocess

PORT = 12345

class MyHandler(http.server.BaseHTTPRequestHandler):
    server_version = "MAN2HTML/" + http.server.__version__

    def do_GET(self):
        """  处理 GET 请求所调用的方法 """
        parts = urllib.parse.urlsplit(self.path) # parts.path = "/.../..."
        try: 
            # 判断请求的内容
            # 1. 请求样式表文件: http://localhost:12345/style.css
            if parts.path == "/style.css":
                # 打开文件
                f = open("." + parts.path, "rb")
                content = f.read()
                # 写响应头部
                self.send_response(HTTPStatus.OK)
                self.end_headers()
                # 写响应正文
                self.wfile.write(content)
                # 关闭文件
                f.close()
            else:
                command = parts.path.split("/")
                # 2. 请求 man page: http://localhost:12345/man/<arg1>/[arg2]/...
                if command[1] == "man":
                    # 执行 man 命令，获取输出
                    content = subprocess.check_output(
                        ["man", "-Thtml"] + list(map(urllib.parse.unquote, command[2:])),
                        stderr = subprocess.PIPE
                    ).decode()
                    # 写响应头部
                    self.send_response(HTTPStatus.OK)
                    self.end_headers()
                    # 写响应正文
                    idx = content.find("</head>")
                    #   在 html 的 <head> 中添加对 style.css 的引用
                    content = content[:idx] \
                        + '<link rel="stylesheet" type="text/css" href="/style.css">\n' \
                        + content[idx:]
                    self.wfile.write(content.encode())
                else: raise OSError
        # 返回执行 man 的错误信息
        except subprocess.CalledProcessError as e:
            self.send_response(HTTPStatus.OK)
            self.end_headers()
            print(e.cmd)
            self.wfile.writelines([
                b'\nExit Code: ' + str(e.returncode).encode(),
                b'\n\n',
                e.stderr
            ])
        # 404 Not Found
        except (OSError, IndexError):
            self.send_error(HTTPStatus.NOT_FOUND)
        return

# 开始监听本地的 PORT 端口
ser = http.server.HTTPServer(("localhost", PORT), MyHandler)
ser.serve_forever()
