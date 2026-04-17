// FlClash 修复循环引用版 - 已解决代理组循环问题
// 修复内容：消除 全局直连 ↔ 节点选择 的循环引用

// 常量定义 - FlClash移动优化版
const test_interval = 3600; // 1小时检查一次（移动设备省电）
const test_tolerance = 100;  // 增加容错值，减少频繁切换
const groupBaseOption = {
  "interval": 3600,         // 1小时检查间隔
  "timeout": 5000,          // 增加超时时间
  "url": "https://www.gstatic.com/generate_204",
  "lazy": true,
  "max-failed-times": 2,    // 增加失败容忍次数
  "hidden": false
};

const regionConfig = [
  {
      name: "🇺🇸 美国",
      matcher: "美国|🇺🇸|US|United States|America",
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/us.svg"
  },
  {
      name: "🇯🇵 日本",
      matcher: "日本|🇯🇵|JP|Japan",
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/jp.svg"
  },
  {
      name: "🇸🇬 新加坡",
      matcher: "新加坡|🇸🇬|SG|狮城|Singapore",
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/sg.svg"
  },
  {
      name: "🇭🇰 香港",
      matcher: "香港|🇭🇰|HK|Hong Kong|HongKong",
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/hk.svg"
  },
  {
      name: "🇬🇧 英国",
      matcher: "英|🇬🇧|uk|united kingdom|great britain",
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/gb.svg"
  },
  {
      name: "🇰🇷 韩国",
      matcher: "韩|🇰🇷|kr|korea",
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/kr.svg"
  },
  {
      name: "🇹🇼 台湾",
      matcher: "台湾|🇹🇼|tw|taiwan|tai wan",
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/tw.svg"
  },
  {
      name: "🇨🇦 加拿大",
      matcher: "加拿大|🇨🇦|CA|Canada",
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/ca.svg"
  },
  {
      name: "🇦🇺 澳大利亚",
      matcher: "澳大利亚|🇦🇺|AU|Australia",
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/au.svg"
  },
  {
      name: "🇩🇪 德国",
      matcher: "德国|🇩🇪|DE|germany",
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/de.svg"
  },
  {
      name: "🇫🇷 法国",
      matcher: "法国|🇫🇷|FR|France",
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/fr.svg"
  },
  {
      name: "🌐 其他",
      icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Global.png"
  }
];

// FlClash优化DNS配置
const dnsConfig = {
  "enable": true,
  "listen": "0.0.0.0:1053",
  "ipv6": false,              // 移动设备关闭IPv6省电
  "prefer-h3": false,         // 禁用HTTP/3减少开销
  "respect-rules": true,
  "use-system-hosts": false,
  "cache-algorithm": "arc",
  "enhanced-mode": "fake-ip",
  "fake-ip-range": "198.18.0.1/24",  // 缩小范围减少内存占用
  "fake-ip-filter": [
    "+.lan",
    "+.local",
    "+.msftconnecttest.com",
    "+.msftncsi.com",
    "localhost.ptlogin2.qq.com",
    "localhost.sec.qq.com",
    "+.in-addr.arpa", 
    "+.ip6.arpa",
    "time.*.com",
    "time.*.gov",
    "pool.ntp.org",
    "localhost.work.weixin.qq.com",
    // FlClash移动端优化
    "+.apple.com",            // Apple服务直连
    "+.icloud.com",           // iCloud服务直连
    "+.googleapis.com"        // Google服务优化
  ],
  "default-nameserver": [
    "223.5.5.5",
    "119.29.29.29"
  ],
  "nameserver": [
    "https://1.1.1.1/dns-query",
    "https://8.8.8.8/dns-query"
  ],
  "proxy-server-nameserver": [
    "https://223.5.5.5/dns-query",
    "https://doh.pub/dns-query"
  ],
  "nameserver-policy": {
    "geosite:private,cn": [
      "https://223.5.5.5/dns-query",
      "https://doh.pub/dns-query"
    ]
  },
  // FlClash移动优化
  "cache-size": 8192,        // 适中缓存大小
  "dns-cache": true,         // 启用DNS缓存
  "dns-hijack": ["8.8.8.8:53", "8.8.4.4:53"],  // DNS劫持优化
  "fallback": ["https://1.1.1.1/dns-query", "https://8.8.8.8/dns-query"],
  "fallback-filter": {
    "geoip": true,
    "geoip-code": "CN",
    "ipcidr": ["240.0.0.0/4"]
  }
};

// FlClash规则集 - 精简版
const ruleProviderCommon = {
  "type": "http",
  "format": "yaml",
  "interval": 259200,      // 3天更新一次（移动端优化）
  "behavior": "domain"
};

const ruleProviders = {
  "reject": {
    ...ruleProviderCommon,
    "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/reject.txt",
    "path": "./ruleset/loyalsoldier/reject.yaml"
  },
  "icloud": {
    ...ruleProviderCommon,
    "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/icloud.txt",
    "path": "./ruleset/loyalsoldier/icloud.yaml"
  },
  "apple": {
    ...ruleProviderCommon,
    "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/apple.txt",
    "path": "./ruleset/loyalsoldier/apple.yaml"
  },
  "google": {
    ...ruleProviderCommon,
    "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/google.txt",
    "path": "./ruleset/loyalsoldier/google.yaml"
  },
  "proxy": {
    ...ruleProviderCommon,
    "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/proxy.txt",
    "path": "./ruleset/loyalsoldier/proxy.yaml"
  },
  "direct": {
    ...ruleProviderCommon,
    "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/direct.txt",
    "path": "./ruleset/loyalsoldier/direct.yaml"
  },
  "private": {
    ...ruleProviderCommon,
    "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/private.txt",
    "path": "./ruleset/loyalsoldier/private.yaml"
  },
  "gfw": {
    ...ruleProviderCommon,
    "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/gfw.txt",
    "path": "./ruleset/loyalsoldier/gfw.yaml"
  },
  "tld-not-cn": {
    ...ruleProviderCommon,
    "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/tld-not-cn.txt",
    "path": "./ruleset/loyalsoldier/tld-not-cn.yaml"
  },
  "telegramcidr": {
    ...ruleProviderCommon,
    "behavior": "ipcidr",
    "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/telegramcidr.txt",
    "path": "./ruleset/loyalsoldier/telegramcidr.yaml"
  },
  "cncidr": {
    ...ruleProviderCommon,
    "behavior": "ipcidr",
    "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/cncidr.txt",
    "path": "./ruleset/loyalsoldier/cncidr.yaml"
  },
  "lancidr": {
    ...ruleProviderCommon,
    "behavior": "ipcidr",
    "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/lancidr.txt",
    "path": "./ruleset/loyalsoldier/lancidr.yaml"
  }
};

// FlClash精简规则
const rules = [
  // 基础自定义规则
  "DOMAIN-SUFFIX,googleapis.cn,节点选择",
  "DOMAIN-SUFFIX,gstatic.com,节点选择",
  "DOMAIN-SUFFIX,xn--ngstr-lra8j.com,节点选择",
  "DOMAIN-SUFFIX,github.io,节点选择",
  
  // 核心规则集
  "RULE-SET,reject,REJECT",
  "RULE-SET,private,DIRECT",
  "RULE-SET,apple,苹果服务",
  "RULE-SET,icloud,微软服务",
  "RULE-SET,google,谷歌服务",
  "RULE-SET,proxy,节点选择",
  "RULE-SET,gfw,节点选择",
  "RULE-SET,tld-not-cn,节点选择",
  "RULE-SET,direct,DIRECT",
  "RULE-SET,lancidr,DIRECT,no-resolve",
  "RULE-SET,cncidr,DIRECT,no-resolve",
  "RULE-SET,telegramcidr,节点选择,no-resolve",
  
  // 地理规则
  "GEOSITE,CN,DIRECT",
  "GEOIP,LAN,DIRECT,no-resolve",
  "GEOIP,CN,DIRECT,no-resolve",
  
  // 默认规则
  "MATCH,漏网之鱼"
];

// 添加地区分组
function addRegions(config) {
  let regions = [];
  if (!config.proxies) {
      if (!config["proxy-providers"]) return;
      const providers = Object.keys(config["proxy-providers"]);
      if (providers.length === 0) return;
      let exclude = "";
      for (const region of regionConfig) {
          if (!region.name) continue;
          if (region.matcher) {
              exclude += (exclude === "" ? region.matcher : `|${region.matcher}`)
              config["proxy-groups"].push({
                  ...groupBaseOption,
                  name: region.name,
                  type: "url-test",
                  interval: test_interval,
                  tolerance: test_tolerance,
                  use: providers,
                  filter: region.matcher,
                  icon: region.icon,
              });
          } else {
              config["proxy-groups"].push({
                  ...groupBaseOption,
                  name: region.name,
                  type: "url-test",
                  use: providers,
                  interval: test_interval,
                  tolerance: test_tolerance,
                  "exclude-filter": exclude,
                  icon: region.icon,
              });
          }
          regions.push(region.name)
      }
  } else {
      let names = config.proxies.map(p => p.name).filter(Boolean);
      if (names.length === 0) return;
      for (const region of regionConfig) {
          let proxies = [], noproxies = [];
          if (!region.matcher) {
              proxies = [...names];
              noproxies = [];
          } else {
              const matches = region.matcher.split("|");
              if (matches.length === 0) continue;
              const result = names.reduce((acc, name) => {
                  (matches.some(m => name.includes(m)) ? acc.proxies : acc.noproxies).push(name);
                  return acc;
              }, { proxies: [], noproxies: [] });
              proxies = result.proxies;
              noproxies = result.noproxies;
          }
          if (proxies.length === 0) continue;
          config["proxy-groups"].push({
              ...groupBaseOption,
              name: region.name,
              type: "url-test",
              interval: test_interval,
              tolerance: test_tolerance,
              proxies: proxies,
              icon: region.icon,
          });
          regions.push(region.name);
          if (noproxies.length === 0) break;
          names = noproxies;
      }
  }
  if (regions.length === 0) return;
  const entries = config["proxy-groups"];
  for (const entry of entries) {
      if (!entry || !entry.proxies) continue;
      if (entry.name === "节点选择") {
          if (entry.proxies.length > 1) {
              entry.proxies.splice(2, 0, "地区选择");
          }
      } else if (entry.name === "全局直连") {
          entry.proxies.push("地区选择");
      } else if (entry.type === "select" && !entry.hasOwnProperty("include-all")) {
          entry.proxies.push(...regions)
      }
  }
  if (entries.length > 0) {
      entries.splice(1, 0, {
          ...groupBaseOption,
          name: "地区选择",
          type: "select",
          proxies: regions,
          icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/World_Map.png",
      })
  }
  config["proxy-groups"] = entries;
}

// FlClash主函数 - 修复循环引用版
function main(config) {
  const proxyCount = config?.proxies?.length ?? 0;
  const proxyProviderCount =
    typeof config?.["proxy-providers"] === "object" ? Object.keys(config["proxy-providers"]).length : 0;
  if (proxyCount === 0 && proxyProviderCount === 0) {
    throw new Error("配置文件中未找到任何代理");
  }

  // 覆盖DNS配置
  config["dns"] = dnsConfig;

  // 修复循环引用：消除 全局直连 ↔ 节点选择 的循环
  config["proxy-groups"] = [
    {
      ...groupBaseOption,
      "name": "节点选择",
      "type": "select",
      // 修复：移除"全局直连"，避免循环引用
      "proxies": ["延迟选优", "故障转移", "DIRECT"],
      "filter": "^(?!.*(官网|套餐|流量|异常|剩余)).*$",
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/adjust.svg"
    },
    {
      ...groupBaseOption,
      "name": "延迟选优",
      "type": "url-test",
      interval: test_interval,
      tolerance: test_tolerance,
      "include-all": true,
      "filter": "^(?!.*(官网|套餐|流量|异常|剩余)).*$",
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/speed.svg"
    },
    {
      ...groupBaseOption,
      "name": "故障转移",
      "type": "fallback",
      "include-all": true,
      "filter": "^(?!.*(官网|套餐|流量|异常|剩余)).*$",
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/ambulance.svg"
    },
    {
      ...groupBaseOption,
      "name": "谷歌服务",
      "type": "select",
      // 修复：改为"节点选择"而不是"全局直连"，避免循环
      "proxies": ["节点选择", "延迟选优", "故障转移"],
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/google.svg"
    },
    {
      ...groupBaseOption,
      "name": "电报消息",
      "type": "select",
      // 修复：改为"节点选择"而不是"全局直连"，避免循环
      "proxies": ["节点选择", "延迟选优", "故障转移"],
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/telegram.svg"
    },
    {
      ...groupBaseOption,
      "name": "微软服务",
      "type": "select",
      // 修复：改为"DIRECT"作为主要选项，避免循环
      "proxies": ["DIRECT", "节点选择"],
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/microsoft.svg"
    },
    {
      ...groupBaseOption,
      "name": "苹果服务",
      "type": "select",
      // 修复：改为"DIRECT"作为主要选项，避免循环
      "proxies": ["DIRECT", "节点选择"],
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/apple.svg"
    },
    {
      ...groupBaseOption,
      "name": "广告过滤",
      "type": "select",
      "proxies": ["REJECT", "DIRECT"],
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/bug.svg"
    },
    {
      ...groupBaseOption,
      "name": "全局直连",
      "type": "select",
      // 修复：移除"节点选择"，只保留DIRECT，避免循环
      "proxies": ["DIRECT"],
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/link.svg"
    },
    {
      ...groupBaseOption,
      "name": "漏网之鱼",
      "type": "select",
      // 修复：移除"全局直连"，避免循环
      "proxies": ["节点选择", "延迟选优", "故障转移"],
      "filter": "^(?!.*(官网|套餐|流量|异常|剩余)).*$",
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/fish.svg"
    }
  ];

  // 覆盖规则
  config["rule-providers"] = ruleProviders;
  config["rules"] = rules;
  
  // 添加地区分组
  addRegions(config);
  
  // FlClash节点优化
  config["proxies"].forEach(proxy => {
    proxy.udp = true;
    // FlClash移动端优化
    if (!proxy.hasOwnProperty("skip-cert-verify")) {
      proxy["skip-cert-verify"] = false; // 默认不跳过证书验证
    }
  });

  // FlClash额外优化配置
  config["experimental"] = {
    "ignore-resolve-err": true,    // 忽略解析错误
    "sniff-tls-sni": true          // TLS SNI嗅探
  };

  // 返回修改后的配置
  return config;
}
