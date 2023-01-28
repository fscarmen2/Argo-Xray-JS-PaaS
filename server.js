const app_url = "https://eggplant-glitter-spinach.glitch.me";
const express = require("express");
const app = express();
const port = 3000;
var exec = require("child_process").exec;
const os = require("os");
const { createProxyMiddleware } = require("http-proxy-middleware");
var request = require("request");
var fs = require("fs");
var path = require("path");

app.get("/", (req, res) => {
  res.send("hello world");
});

//获取系统进程表
app.get("/status", (req, res) => {
  let cmdStr = "ps -ef";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.type("html").send("<pre>命令行执行错误：\n" + err + "</pre>");
    } else {
      res.type("html").send("<pre>获取系统进程表：\n" + stdout + "</pre>");
    }
  });
});

//获取系统监听端口
app.get("/listen", (req, res) => {
    let cmdStr = "ss -nltp";
    exec(cmdStr, function (err, stdout, stderr) {
      if (err) {
        res.type("html").send("<pre>命令行执行错误：\n" + err + "</pre>");
      } else {
        res.type("html").send("<pre>获取系统监听端口：\n" + stdout + "</pre>");
      }
    });
  });


//获取节点数据
app.get("/list", (req, res) => {
    let cmdStr = "cat list";
    exec(cmdStr, function (err, stdout, stderr) {
      if (err) {
        res.type("html").send("<pre>命令行执行错误：\n" + err + "</pre>");
      } else {
        res.type("html").send("<pre>节点数据：\n\n" + stdout + "</pre>");
      }
    });
  });

  
//启动web
app.get("/start", (req, res) => {
  let cmdStr =
    "[ -e entrypoint.sh ] && /bin/bash entrypoint.sh; chmod +x ./web.js && ./web.js -c ./config.json >/dev/null 2>&1 &";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.send("Web 执行错误：" + err);
    } else {
      res.send("Web 执行结果：" + "启动成功!");
    }
  });
});

//启动argo
app.get("/argo", (req, res) => {
  let cmdStr =
    "/bin/bash argo.sh >/dev/null 2>&1 &";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.send("Argo 部署错误：" + err);
    } else {
      res.send("Argo 执行结果：" + "启动成功!");
    }
  });
});

//启动哪吒
app.get("/nezha", (req, res) => {
  let cmdStr =
    "/bin/bash nezha.sh >/dev/null 2>&1 &";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.send("哪吒部署错误：" + err);
    } else {
      res.send("哪吒执行结果：" + "启动成功!");
    }
  });
});

//获取系统版本、内存信息
app.get("/info", (req, res) => {
  let cmdStr = "cat /etc/*release | grep -E ^NAME";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.send("命令行执行错误：" + err);
    } else {
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
app.get("/test", (req, res) => {
  fs.writeFile("./test.txt", "这里是新创建的文件内容!", function (err) {
    if (err) res.send("创建文件失败，文件系统权限为只读：" + err);
    else res.send("创建文件成功，文件系统权限为非只读：");
  });
});

// keepalive begin
//web保活
function keep_web_alive() {
  // 1.请求主页，保持唤醒
  exec("curl " + app_url, function (err, stdout, stderr) {
    if (err) {
      console.log("保活-请求主页-命令行执行错误：" + err);
    } else {
      console.log("保活-请求主页-命令行执行成功，响应报文:" + stdout);
    }
  });

  // 2.请求服务器进程状态列表，若web没在运行，则调起
  exec("curl " + app_url + "/status", function (err, stdout, stderr) {
    if (!err) {
      if (stdout.indexOf("./web.js -c ./config.json") != -1) {
        console.log("web正在运行");
      } else {
        //web未运行，命令行调起
        exec(
          "chmod +x ./web.js && ./web.js -c ./config.json >/dev/null 2>&1 &",
          function (err, stdout, stderr) {
            if (err) {
              console.log("保活-调起web-命令行执行错误：" + err);
            } else {
              console.log("保活-调起web-命令行执行成功!");
            }
          }
        );
      }
    } else console.log("web保活-请求服务器进程表-命令行执行错误: " + err);
  });
}
setInterval(keep_web_alive, 10 * 1000);

//Argo保活
function keep_argo_alive() {
  exec("curl " + app_url + "/status", function (err, stdout, stderr) {
    // 1.请求主页，保持唤醒
    if (!err) {
      if (stdout.indexOf("cloudflared-linux-amd64") != -1) {
        console.log("Argo 正在运行");
      } else {
        //Argo 未运行，命令行调起
        exec(
          "/bin/bash argo.sh >/dev/null 2>&1 &",
          function (err, stdout, stderr) {
            if (err) {
              console.log("保活-调起Argo-命令行执行错误：" + err);
            } else {
              console.log("保活-调起Argo-命令行执行成功!");
            }
          }
        );
      }
    } else console.log("Argo保活-请求服务器进程表-命令行执行错误: " + err);
  });
}
setInterval(keep_argo_alive, 30 * 1000);


//哪吒保活
function keep_nezha_alive() {
  exec("curl " + app_url + "/status", function (err, stdout, stderr) {
    // 1.请求主页，保持唤醒
    if (!err) {
      if (stdout.indexOf("nezha-agent") != -1) {
        console.log("哪吒正在运行");
      } else {
        //哪吒未运行，命令行调起
        exec(
          "/bin/bash nezha.sh >/dev/null 2>&1 &",
          function (err, stdout, stderr) {
            if (err) {
              console.log("保活-调起哪吒-命令行执行错误：" + err);
            } else {
              console.log("保活-调起哪吒-命令行执行成功!");
            }
          }
        );
      }
    } else console.log("哪吒保活-请求服务器进程表-命令行执行错误: " + err);
  });
}
setInterval(keep_nezha_alive, 45 * 1000);
// keepalive end 

//下载web可执行文件
app.get("/download", (req, res) => {
  download_web((err) => {
    if (err) res.send("下载文件失败");
    else res.send("下载文件成功");
  });
});

app.use(
  "/",
  createProxyMiddleware({
    target: "http://127.0.0.1:8080/", // 需要跨域处理的请求地址
    changeOrigin: true, // 默认false，是否需要改变原始主机头为目标URL
    ws: true, // 是否代理websockets
    pathRewrite: {
      // 请求中去除/
      "^/": "/",
    },
    onProxyReq: function onProxyReq(proxyReq, req, res) {},
  })
);

//初始化，下载web
function download_web(callback) {
  let fileName = "web.js";
  let url =
    "https://github.com/fscarmen2/Argo-X-Container-PaaS/raw/main/web.js";
  let stream = fs.createWriteStream(path.join("./", fileName));
  request(url)
    .pipe(stream)
    .on("close", function (err) {
      if (err) callback("下载文件失败");
      else callback(null);
    });
}

download_web((err) => {
  if (err) console.log("初始化-下载web文件失败");
  else console.log("初始化-下载web文件成功");
});

//启动核心脚本运行web,哪吒和argo
exec('/bin/bash entrypoint.sh', (err, stdout, stderr) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(stdout);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
