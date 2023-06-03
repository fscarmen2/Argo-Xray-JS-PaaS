const username = process.env.WEB_USERNAME || "admin";
const password = process.env.WEB_PASSWORD || "password";
const url = "http://127.0.0.1";
const port = process.env.PORT || 3000; /* 当容器平台分配不规则端口时,此处需修改为分配端口 */
const express = require("express");
const app = express();
var exec = require("child_process").exec;
const os = require("os");
const { legacyCreateProxyMiddleware } = require("http-proxy-middleware");
var request = require("request");
var fs = require("fs");
var path = require("path");
const auth = require("basic-auth");

app.get("/", function (req, res) {
  res.send("hello world");
});

// 页面访问密码
app.use((req, res, next) => {
  const user = auth(req);
  if (user && user.name === username && user.pass === password) {
    return next();
  }
  res.set("WWW-Authenticate", 'Basic realm="Node"');
  return res.status(401).send();
});

//获取系统进程表
app.get("/status", function (req, res) {
  let cmdStr = "ps -ef";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.type("html").send("<pre>命令行执行错误：\n" + err + "</pre>");
    }
    else {
      res.type("html").send("<pre>获取系统进程表：\n" + stdout + "</pre>");
    }
  });
});

//获取系统监听端口
app.get("/listen", function (req, res) {
    let cmdStr = "ss -nltp";
    exec(cmdStr, function (err, stdout, stderr) {
      if (err) {
        res.type("html").send("<pre>命令行执行错误：\n" + err + "</pre>");
      }
      else {
        res.type("html").send("<pre>获取系统监听端口：\n" + stdout + "</pre>");
      }
    });
  });


//获取节点数据
app.get("/list", function (req, res) {
    let cmdStr = "cat list";
    exec(cmdStr, function (err, stdout, stderr) {
      if (err) {
        res.type("html").send("<pre>命令行执行错误：\n" + err + "</pre>");
      }
      else {
        res.type("html").send("<pre>节点数据：\n\n" + stdout + "</pre>");
      }
    });
  });

//获取系统版本、内存信息
app.get("/info", function (req, res) {
  let cmdStr = "cat /etc/*release | grep -E ^NAME";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.send("命令行执行错误：" + err);
    }
    else {
      res.send(
        "命令行执行结果：\n" +
          "Linux System:" +
          stdout +
          "\nRAM:" +
          os.totalmem() / 1000 / 1000 +
          "MB"
      );
    }
  });
});

//文件系统只读测试
app.get("/test", function (req, res) {
  let cmdStr = 'mount | grep " / " | grep "(ro," >/dev/null';
  exec(cmdStr, function (error, stdout, stderr) {
    if (error !== null) {
      res.send("系统权限为---非只读");
    } else {
      res.send("系统权限为---只读");
    }
  });
});

// keepalive begin
//web保活
function keep_web_alive() {
  // 1.请求主页，保持唤醒
  exec("curl -m8 " + url + ":" + port, function (err, stdout, stderr) {
    if (err) {
      console.log("保活-请求主页-命令行执行错误：" + err);
    } else {
      console.log("保活-请求主页-命令行执行成功，响应报文:" + stdout);
    }
  });

  // 2.请求服务器进程状态列表，若web没在运行，则调起
  exec("pgrep -laf web.js", function (err, stdout, stderr) {
    // 1.查后台系统进程，保持唤醒
    if (stdout.includes("./web.js -c ./config.json")) {
      console.log("web 正在运行");
    }
    else {
      //web 未运行，命令行调起
      exec(
        "chmod +x web.js && ./web.js -c ./config.json >/dev/null 2>&1 &", function (err, stdout, stderr) {
          if (err) {
            console.log("保活-调起web-命令行执行错误:" + err);
          }
          else {
            console.log("保活-调起web-命令行执行成功!");
          }
        }
      );
    }
  });
}
setInterval(keep_web_alive, 10 * 1000);

//Argo保活
function keep_argo_alive() {
  exec("pgrep -laf cloudflared", function (err, stdout, stderr) {
    // 1.查后台系统进程，保持唤醒
    if (stdout.includes("./cloudflared")) {
      console.log("Argo 正在运行");
    }
    else {
      //Argo 未运行，命令行调起
      exec(
        "bash argo.sh 2>&1 &", function (err, stdout, stderr) {
          if (err) {
            console.log("保活-调起Argo-命令行执行错误:" + err);
          }
          else {
            console.log("保活-调起Argo-命令行执行成功!");
          }
        }
      );
    }
  });
}
setInterval(keep_argo_alive, 30 * 1000);

//哪吒保活
function keep_nezha_alive() {
  exec("pgrep -laf nezha-agent", function (err, stdout, stderr) {
    // 1.查后台系统进程，保持唤醒
    if (stdout.includes("./nezha-agent")) {
      console.log("哪吒正在运行");
    }
    else {
      //哪吒未运行，命令行调起
      exec(
        "bash nezha.sh 2>&1 &", function (err, stdout, stderr) {
          if (err) {
            console.log("保活-调起哪吒-命令行执行错误:" + err);
          }
          else {
            console.log("保活-调起哪吒-命令行执行成功!");
          }
        }
      );
    }
  });
}
setInterval(keep_nezha_alive, 45 * 1000);
// keepalive end

//下载web可执行文件
app.get("/download", function (req, res) {
  download_web((err) => {
    if (err) {
      res.send("下载文件失败");
    }
    else {
      res.send("下载文件成功");
    }
  });
});


app.use( /* 具体配置项迁移参见 https://github.com/chimurai/http-proxy-middleware/blob/master/MIGRATION.md */
  legacyCreateProxyMiddleware({
    target: 'http://127.0.0.1:8080/', /* 需要跨域处理的请求地址 */
    ws: true, /* 是否代理websocket */
    changeOrigin: true, /* 是否需要改变原始主机头为目标URL,默认false */ 
    on: {  /* http代理事件集 */ 
      proxyRes: function proxyRes(proxyRes, req, res) { /* 处理代理请求 */
        // console.log('RAW Response from the target', JSON.stringify(proxyRes.headers, true, 2)); //for debug
        // console.log(req) //for debug
        // console.log(res) //for debug
      },
      proxyReq: function proxyReq(proxyReq, req, res) { /* 处理代理响应 */
        // console.log(proxyReq); //for debug
        // console.log(req) //for debug
        // console.log(res) //for debug
      },
      error: function error(err, req, res) { /* 处理异常  */
        console.warn('websocket error.', err);
      }
    },
    pathRewrite: {
      '^/': '/', /* 去除请求中的斜线号  */
    },
    // logger: console /* 是否打开log日志  */
  })
);

//初始化，下载web
function download_web(callback) {
  let fileName = "web.js";
  let web_url =
    "https://github.com/fscarmen2/Argo-X-Container-PaaS/raw/main/files/web.js";
  let stream = fs.createWriteStream(path.join("./", fileName));
  request(web_url)
    .pipe(stream)
    .on("close", function (err) {
      if (err) {
        callback("下载文件失败");
      }
      else {
        callback(null);
      }
    });
}

download_web((err) => {
  if (err) {
    console.log("初始化-下载web文件失败");
  }
  else {
    console.log("初始化-下载web文件成功");
  }
});

//启动核心脚本运行web,哪吒和argo
exec("bash entrypoint.sh", function (err, stdout, stderr) {
  if (err) {
    console.error(err);
    return;
  }
  console.log(stdout);
});

console.log(`Username is: ${username}`);
console.log(`Password is: ${password}`);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
