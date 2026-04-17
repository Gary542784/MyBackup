// ===============================
// 最终 · 不漏 IP · 极致省电稳定版
// 八地区 · UI 全绿 · DIRECT 不进主选择
// ===============================

// ---------- 常量（极致省电） ----------
var TEST_INTERVAL = 3600;    // 1 小时测速
var TEST_TOLERANCE = 150;    // 高容错，减少切换

// ---------- DNS 配置（防泄露 + 省电） ----------
var dnsConfig = {
  enable: true,
  listen: "0.0.0.0:1053",
  ipv6: false,
  ["enhanced-mode"]: "fake-ip",
  ["fake-ip-range"]: "198.18.0.1/24",
  ["respect-rules"]: true,
  ["default-nameserver"]: ["223.5.5.5","119.29.29.29"],
  ["nameserver"]: ["https://1.1.1.1/dns-query"],
  ["proxy-server-nameserver"]: ["https://doh.pub/dns-query"],
  ["fake-ip-filter"]: [
    "+.lan",
    "+.local",
    "+.apple.com",
    "+.icloud.com",
    "+.msftconnecttest.com",
    "+.msftncsi.com",
    "time.*.com",
    "pool.ntp.org"
  ]
};

// ---------- 地区定义 ----------
var regionConfig = [
  { name: "🇭🇰 香港", matcher: "香港|🇭🇰|HK" },
  { name: "🇹🇼 台湾", matcher: "台湾|🇹🇼|TW|Taiwan" },
  { name: "🇯🇵 日本", matcher: "日本|🇯🇵|JP" },
  { name: "🇰🇷 韩国", matcher: "韩国|🇯🇵|KR|Korea" },
  { name: "🇸🇬 新加坡", matcher: "新加坡|🇸🇬|SG" },
  { name: "🇺🇸 美国", matcher: "美国|🇺🇸|US" },
  { name: "🇪🇺 欧洲", matcher: "英国|UK|德国|DE|法国|FR|荷兰|NL|瑞典|SE" },
  { name: "🌐 其他" }
];

// ---------- 规则集 ----------
var ruleProviders = {
  reject:  { type:"http", format:"text", behavior:"domain", interval:259200, path:"./ruleset/reject.txt",  url:"https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/reject.txt" },
  private: { type:"http", format:"text", behavior:"domain", interval:259200, path:"./ruleset/private.txt", url:"https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/private.txt" },
  apple:   { type:"http", format:"text", behavior:"domain", interval:259200, path:"./ruleset/apple.txt",   url:"https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/apple.txt" },
  icloud:  { type:"http", format:"text", behavior:"domain", interval:259200, path:"./ruleset/icloud.txt",  url:"https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/icloud.txt" },
  google:  { type:"http", format:"text", behavior:"domain", interval:259200, path:"./ruleset/google.txt",  url:"https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/google.txt" },
  proxy:   { type:"http", format:"text", behavior:"domain", interval:259200, path:"./ruleset/proxy.txt",   url:"https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/proxy.txt" }
};

// ---------- 规则（已修复泄露） ----------
var rules = [
  "RULE-SET,reject,REJECT",
  "RULE-SET,private,DIRECT",
  "RULE-SET,apple,苹果服务",
  "RULE-SET,icloud,苹果服务",
  "RULE-SET,google,谷歌服务",
  "RULE-SET,proxy,节点选择",
  "MATCH,漏网之鱼"
];

// ---------- 地区分组（不测速，极省电） ----------
function addRegions(config){
  if(!Array.isArray(config.proxies)) return;

  var names = [];
  for(var i=0;i<config.proxies.length;i++){
    if(config.proxies[i].name) names.push(config.proxies[i].name);
  }

  var regionNames = [];

  for(var r=0;r<regionConfig.length;r++){
    var region = regionConfig[r];
    var proxies = [];

    if(region.matcher){
      var matchers = region.matcher.split("|");
      for(var n=0;n<names.length;n++){
        for(var m=0;m<matchers.length;m++){
          if(names[n].indexOf(matchers[m]) !== -1){
            proxies.push(names[n]);
            break;
          }
        }
      }
    } else {
      proxies = names.slice();
    }

    if(!proxies.length) continue;

    config["proxy-groups"].push({
      name: region.name,
      type: "select",
      proxies: proxies
    });

    regionNames.push(region.name);

    for(var k=0;k<proxies.length;k++){
      var idx = names.indexOf(proxies[k]);
      if(idx !== -1) names.splice(idx,1);
    }
  }

  if(regionNames.length){
    config["proxy-groups"].splice(1,0,{
      name: "地区选择",
      type: "select",
      proxies: regionNames
    });
  }
}

// ---------- 主函数 ----------
function main(config){
  var hasProxy = false;
  if(Array.isArray(config.proxies) && config.proxies.length) hasProxy = true;
  if(config["proxy-providers"] && Object.keys(config["proxy-providers"]).length) hasProxy = true;
  if(!hasProxy) throw new Error("未检测到任何代理");

  config.dns = dnsConfig;
  config["rule-providers"] = ruleProviders;
  config.rules = rules;

  config["proxy-groups"] = [
    {
      name:"节点选择",
      type:"select",
      proxies:["地区选择","延迟选优","故障转移"]
    },

    {
      name:"延迟选优",
      type:"url-test",
      interval: TEST_INTERVAL,
      tolerance: TEST_TOLERANCE,
      url:"https://www.gstatic.com/generate_204",
      lazy:true,
      ["include-all"]:true
    },

    {
      name:"故障转移",
      type:"fallback",
      interval:21600,
      url:"https://www.gstatic.com/generate_204",
      lazy:true,
      ["include-all"]:true
    },

    { name:"谷歌服务", type:"select", proxies:["节点选择"] },
    { name:"苹果服务", type:"select", proxies:["DIRECT","节点选择"] },
    { name:"漏网之鱼", type:"select", proxies:["节点选择"] }
  ];

  addRegions(config);

  if(Array.isArray(config.proxies)){
    for(var p=0;p<config.proxies.length;p++){
      config.proxies[p].udp = true;
      if(!("skip-cert-verify" in config.proxies[p])){
        config.proxies[p]["skip-cert-verify"] = false;
      }
    }
  }

  return config;
}
