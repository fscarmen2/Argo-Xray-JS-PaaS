# Xray + Argo for Express.js PaaS

在没有公网的平台挖啊挖啊挖，Argo打通各式服务连接千万家。---为 JS 平台而生

* * *

# 目录

- [项目特点](README.md#项目特点)
- [部署](README.md#部署)
- [在 Glitch 部署重点](README.md#在-glitch-部署重点)
- [在 Daki 部署重点](README.md#在-daki-部署重点)
- [ttyd webssh / filebrowser webftp 的部署](README.md#ttyd-webssh--filebrowser-webftp-的部署)
- [鸣谢下列作者的文章和项目](README.md#鸣谢下列作者的文章和项目)
- [免责声明](README.md#免责声明)

* * *

## 项目特点:
* 本项目用于在 Express.js PaaS 平台上部署 Xray，采用的方案为 Argo + Xray + WebSocket + TLS
* 解锁 ChatGPT
* 在浏览器查看系统各项信息，方便直观
* 使用 CloudFlare 的 Argo 隧道，直接优选 + 隧道，CDN 不用再做 workers
* 回流分流，同时支持 Xray 4 种主流协议: vless /  vmess / trojan / shadowsocks
* vmess 和 vless 的 uuid，trojan 和 shadowsocks 的 password，各协议的 ws 路径既可以自定义，又或者使用默认值
* 集成哪吒探针，可以自由选择是否安装
* 前端 js 定时保活，会玩的用户可以根据具体情况修改间隔时间
* 节点信息以 V2rayN / Clash / 小火箭 链接方式输出
* Xray 文件重新编译官方文件增加隐秘性，修改了运行时的显示信息，文件为: https://github.com/XTLS/Xray-core/blob/main/core/core.go
* 可以使用浏览器使用 webssh 和 webftp，更方便管理系统

<img width="718" alt="image" src="https://user-images.githubusercontent.com/92626977/215277537-ff358dc1-7696-481f-b8e4-74f0cdff30f4.png">

## 部署:

### PaaS 平台用到的变量:
 
* 在 `server.js` 文件的第1、2行修改查询网页的用户名和密码
  | 变量名        | 是否必须 | 默认值 | 备注 |
  | ------------ | ------ | ------ | ------ |
  | WEB_USERNAME | 是 | admin | 网页的用户名 |
  | WEB_PASSWORD | 是 | password | 网页的密码 |

<img width="939" alt="image" src="https://user-images.githubusercontent.com/92626977/221387298-4183a1d6-ae14-45f9-b498-1789a4f7117e.png">

* 在 `entrypoint.sh` 文件的前面 4-15 行修改；访问页面的认证在 `server.js` 文件的第1、2行修改必填
  | 变量名        | 是否必须 | 默认值 | 备注 |
  | ------------ | ------ | ------ | ------ |
  | UUID         | 否 | de04add9-5c68-8bab-950c-08cd5320df18 | 可在线生成 https://www.zxgj.cn/g/uuid |
  | WSPATH       | 否 | argo | 勿以 / 开头，各协议路径为 `/WSPATH-协议`，如 `/argo-vless`,`/argo-vmess`,`/argo-trojan`,`/argo-shadowsocks` |
  | NEZHA_SERVER | 否 |        | 哪吒探针服务端的 IP 或域名 |
  | NEZHA_PORT   | 否 |        | 哪吒探针服务端的端口 |
  | NEZHA_KEY    | 否 |        | 哪吒探针客户端专用 Key |
  | NEZHA_TLS    | 否 |        | 哪吒探针是否启用 SSL/TLS 加密 ，如不启用请删除，如要启用填"1" |
  | ARGO_AUTH    | 否 |        | Argo 的 Token 或者 json 值，其中 json 可以通过以下网站，在不需绑卡的情况下轻松获取: https://fscarmen.cloudflare.now.cc/ |
  | ARGO_DOMAIN  | 否 |        | Argo 的域名，须与 ARGO_DOMAIN 必需一起填了才能生效 |
  | SSH_DOMAIN   | 否 |        | webssh 的域名，用户名和密码就是 <WEB_USERNAME> 和 <WEB_PASSWORD> |
  | FTP_DOMAIN   | 否 |        | webftp 的域名，用户名和密码就是 <WEB_USERNAME> 和 <WEB_PASSWORD> |  


<img width="1301" alt="image" src="https://user-images.githubusercontent.com/92626977/226095672-ecbfc8e7-80f3-4821-abb4-df75c4ece483.png">

* 需要应用的 js
  | 命令 | 说明 |
  | ---- |------ |
  | <URL>/list   | 查看节点数据 |
  | <URL>/status | 查看后台进程 |
  | <URL>/listen | 查看后台监听端口 |
  | <URL>/test	 | 测试是否为只读系统 |

## 在 Glitch 部署重点

这里只作重点的展示，更详细可以参考项目: https://github.com/fscarmen2/X-for-Glitch

<img width="1105" alt="image" src="https://user-images.githubusercontent.com/92626977/214567653-768f4f91-13b5-4205-9118-f5510081e260.png">

<img width="1680" alt="image" src="https://user-images.githubusercontent.com/92626977/215279773-d550494e-647b-42e8-b5dc-5d32679fbf9e.jpg">

<img width="322" alt="image" src="https://user-images.githubusercontent.com/92626977/214568380-b07dd83b-a4d6-43fe-9ead-79f1393e909c.png">

## 在 Daki 部署重点

<img width="1198" alt="image" src="https://user-images.githubusercontent.com/92626977/212642015-e84e07de-9f07-466d-b446-8cd8431e7220.png">

<img width="1198" alt="image" src="https://user-images.githubusercontent.com/92626977/212642096-dfcce6d1-d6b2-4b55-9b94-995e5561ac44.png">

<img width="1198" alt="image" src="https://user-images.githubusercontent.com/92626977/212642206-6b12179d-b35a-4a1e-b4e1-963b537c7693.png">

<img width="1547" alt="image" src="https://user-images.githubusercontent.com/92626977/214568691-54cc283b-614f-4fe7-8782-c48ed46cff31.png">

<img width="1664" alt="image" src="https://user-images.githubusercontent.com/92626977/214580345-765231a7-ec63-4564-a188-ceae28308258.png">

<img width="1137" alt="image" src="https://user-images.githubusercontent.com/92626977/215279783-0400e80e-83be-4142-8592-2385c54e36e6.jpg">

<img width="322" alt="image" src="https://user-images.githubusercontent.com/92626977/214580604-8d4f6454-3b78-41a9-b765-cff714b85638.png">

## ttyd webssh / filebrowser webftp 的部署

* 原理
```
+---------+     argo     +---------+     http     +--------+    ssh    +-----------+
| browser | <==========> | CF edge | <==========> |  ttyd  | <=======> | ssh server|
+---------+     argo     +---------+   websocket  +--------+    ssh    +-----------+

+---------+     argo     +---------+     http     +--------------+    ftp    +-----------+
| browser | <==========> | CF edge | <==========> | filebrowser  | <=======> | ftp server|
+---------+     argo     +---------+   websocket  +--------------+    ftp    +-----------+

```

* 使用 Json 方式建的隧道
  
<img width="1643" alt="image" src="https://user-images.githubusercontent.com/92626977/235453084-a8c55417-18b4-4a47-9eef-ee3053564bff.png">

<img width="1303" alt="image" src="https://github.com/fscarmen2/aa/assets/92626977/652ef3ff-c9a9-4771-92c8-bab6c516abeb">

<img width="1001" alt="image" src="https://github.com/fscarmen2/aa/assets/92626977/5b5e0143-ba5a-4b6a-a7fd-e77ef9d0703e">

<img width="1527" alt="image" src="https://github.com/fscarmen2/rrr/assets/92626977/91cece0d-cc61-4681-8eae-03f961a16976">

## 鸣谢下列作者的文章和项目:
* 前端 JS 在大佬 Nike Jeff 的项目 基础上，为了通用性和扩展功能作修改，https://github.com/hrzyang/glitch-trojan
* 后端全部原创，如转载须注明来源。

## 免责声明:
* 本程序仅供学习了解, 非盈利目的，请于下载后 24 小时内删除, 不得用作任何商业用途, 文字、数据及图片均有所属版权, 如转载须注明来源。
* 使用本程序必循遵守部署免责声明。使用本程序必循遵守部署服务器所在地、所在国家和用户所在国家的法律法规, 程序作者不对使用者任何不当行为负责。