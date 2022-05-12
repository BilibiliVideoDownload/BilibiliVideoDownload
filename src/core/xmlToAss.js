// ==UserScript==
// @name        bilibili ASS Danmaku Downloader
// @namespace   https://github.com/tiansh
// @description 以 ASS 格式下载 bilibili 的弹幕
// @include     http://www.bilibili.com/video/av*
// @include     http://bangumi.bilibili.com/movie/*
// @updateURL   https://tiansh.github.io/us-danmaku/bilibili/bilibili_ASS_Danmaku_Downloader.meta.js
// @downloadURL https://tiansh.github.io/us-danmaku/bilibili/bilibili_ASS_Danmaku_Downloader.user.js
// @version     1.11
// @grant       GM_addStyle
// @grant       GM_xmlhttpRequest
// @run-at      document-start
// @author      田生
// @copyright   2014+, 田生
// @license     Mozilla Public License 2.0; http://www.mozilla.org/MPL/2.0/
// @license     CC Attribution-ShareAlike 4.0 International; http://creativecommons.org/licenses/by-sa/4.0/
// @connect-src comment.bilibili.com
// @connect-src interface.bilibili.com
// ==/UserScript==

/*
 * Common
 */

// 设置项
let config = {
  'playResX': 560,           // 屏幕分辨率宽（像素）
  'playResY': 420,           // 屏幕分辨率高（像素）
  'fontlist': [              // 字形（会自动选择最前面一个可用的）
    'Microsoft YaHei UI',
    'Microsoft YaHei',
    '文泉驿正黑',
    'STHeitiSC',
    '黑体',
  ],
  'font_size': 1.0,          // 字号（比例）
  'r2ltime': 8,              // 右到左弹幕持续时间（秒）
  'fixtime': 4,              // 固定弹幕持续时间（秒）
  'opacity': 0.6,            // 不透明度（比例）
  'space': 0,                // 弹幕间隔的最小水平距离（像素）
  'max_delay': 6,            // 最多允许延迟几秒出现弹幕
  'bottom': 50,              // 底端给字幕保留的空间（像素）
  'use_canvas': null,        // 是否使用canvas计算文本宽度（布尔值，Linux下的火狐默认否，其他默认是，Firefox bug #561361）
  'debug': false,            // 打印调试信息
};

export const setConfig = (resolution) => {
  config = {
    ...config,
    ...resolution
  }
}

export const debug = config.debug ? console.log.bind(console) : function () { };

export const parseFile = function (content) {
  content = content.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '');
  return parseXML(content);
}

// 将字典中的值填入字符串
export const fillStr = function (str) {
  var dict = Array.apply(Array, arguments);
  return str.replace(/{{([^}]+)}}/g, function (r, o) {
    var ret;
    dict.some(function (i) { return ret = i[o]; });
    return ret || '';
  });
};

// 将颜色的数值化为十六进制字符串表示
export const RRGGBB = function (color) {
  var t = Number(color).toString(16).toUpperCase();
  return (Array(7).join('0') + t).slice(-6);
};

// 将可见度转换为透明度
export const hexAlpha = function (opacity) {
  var alpha = Math.round(0xFF * (1 - opacity)).toString(16).toUpperCase();
  return Array(3 - alpha.length).join('0') + alpha;
};

// 字符串
export const funStr = function (fun) {
  return fun.toString().split(/\r\n|\n|\r/).slice(1, -1).join('\n');
};

// 平方和开根
export const hypot = Math.hypot ? Math.hypot.bind(Math) : function () {
  return Math.sqrt([0].concat(Array.apply(Array, arguments))
    .reduce(function (x, y) { return x + y * y; }));
};

// 创建下载
export const startDownload = function (data, filename) {
  var blob = new Blob([data], { type: 'application/octet-stream' });
  var url = window.URL.createObjectURL(blob);
  var saveas = document.createElement('a');
  saveas.href = url;
  saveas.style.display = 'none';
  document.body.appendChild(saveas);
  saveas.download = filename;
  saveas.click();
  setTimeout(function () { saveas.parentNode.removeChild(saveas); }, 1000)
  document.addEventListener('unload', function () { window.URL.revokeObjectURL(url); });
};

// 计算文字宽度
export const calcWidth = (function () {

  // 使用Canvas计算
  var calcWidthCanvas = function () {
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    return function (fontname, text, fontsize) {
      context.font = 'bold ' + fontsize + 'px ' + fontname;
      return Math.ceil(context.measureText(text).width + config.space);
    };
  }

  // 使用Div计算
  var calcWidthDiv = function () {
    var d = document.createElement('div');
    d.setAttribute('style', [
      'all: unset', 'top: -10000px', 'left: -10000px',
      'width: auto', 'height: auto', 'position: absolute',
    '',].join(' !important; '));
    var ld = function () { document.body.parentNode.appendChild(d); }
    if (!document.body) document.addEventListener('DOMContentLoaded', ld);
    else ld();
    return function (fontname, text, fontsize) {
      d.textContent = text;
      d.style.font = 'bold ' + fontsize + 'px ' + fontname;
      return d.clientWidth + config.space;
    };
  };

  // 检查使用哪个测量文字宽度的方法
  if (config.use_canvas === null) {
    if (navigator.platform.match(/linux/i) &&
    !navigator.userAgent.match(/chrome/i)) config.use_canvas = false;
  }
  debug('use canvas: %o', config.use_canvas !== false);
  if (config.use_canvas === false) return calcWidthDiv();
  return calcWidthCanvas();

}());

// 选择合适的字体
export const choseFont = function (fontlist) {
  // 检查这个字串的宽度来检查字体是否存在
  var sampleText =
    'The quick brown fox jumps over the lazy dog' +
    '7531902468' + ',.!-' + '，。：！' +
    '天地玄黄' + '則近道矣';
  // 和这些字体进行比较
  var sampleFont = [
    'monospace', 'sans-serif', 'sans',
    'Symbol', 'Arial', 'Comic Sans MS', 'Fixed', 'Terminal',
    'Times', 'Times New Roman',
    '宋体', '黑体', '文泉驿正黑', 'Microsoft YaHei'
  ];
  // 如果被检查的字体和基准字体可以渲染出不同的宽度
  // 那么说明被检查的字体总是存在的
  var diffFont = function (base, test) {
    var baseSize = calcWidth(base, sampleText, 72);
    var testSize = calcWidth(test + ',' + base, sampleText, 72);
    return baseSize !== testSize;
  };
  var validFont = function (test) {
    var valid = sampleFont.some(function (base) {
      return diffFont(base, test);
    });
    debug('font %s: %o', test, valid);
    return valid;
  };
  // 找一个能用的字体
  var f = fontlist[fontlist.length - 1];
  fontlist = fontlist.filter(validFont);
  debug('fontlist: %o', fontlist);
  return fontlist[0] || f;
};

// 从备选的字体中选择一个机器上提供了的字体
export const initFont = (function () {
  var done = false;
  return function () {
    if (done) return; done = true;
    calcWidth = calcWidth.bind(window,
      config.font = choseFont(config.fontlist)
    );
  };
}());

export const generateASS = function (danmaku, info) {
  var assHeader = fillStr(funStr(function () {/*! ASS弹幕文件文件头
[Script Info]
Title: {{title}}
Original Script: 根据 {{ori}} 的弹幕信息，由 https://github.com/tiansh/us-danmaku 生成
ScriptType: v4.00+
Collisions: Normal
PlayResX: {{playResX}}
PlayResY: {{playResY}}
Timer: 10.0000

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Fix,{{font}},25,&H{{alpha}}FFFFFF,&H{{alpha}}FFFFFF,&H{{alpha}}000000,&H{{alpha}}000000,1,0,0,0,100,100,0,0,1,2,0,2,20,20,2,0
Style: R2L,{{font}},25,&H{{alpha}}FFFFFF,&H{{alpha}}FFFFFF,&H{{alpha}}000000,&H{{alpha}}000000,1,0,0,0,100,100,0,0,1,2,0,2,20,20,2,0

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text

  */}), config, info, {'alpha': hexAlpha(config.opacity) });
  // 补齐数字开头的0
  var paddingNum = function (num, len) {
    num = '' + num;
    while (num.length < len) num = '0' + num;
    return num;
  };
  // 格式化时间
  var formatTime = function (time) {
    time = 100 * time ^ 0;
    var l = [[100, 2], [60, 2], [60, 2], [Infinity, 0]].map(function (c) {
      var r = time % c[0];
      time = (time - r) / c[0];
      return paddingNum(r, c[1]);
    }).reverse();
    return l.slice(0, -1).join(':') + '.' + l[3];
  };
  // 格式化特效
  var format = (function () {
    // 适用于所有弹幕
    var common = function (line) {
      var s = '';
      var rgb = line.color.split(/(..)/).filter(function (x) { return x; })
        .map(function (x) { return parseInt(x, 16); });
      // 如果不是白色，要指定弹幕特殊的颜色
      if (line.color !== 'FFFFFF') // line.color 是 RRGGBB 格式
        s += '\\c&H' + line.color.split(/(..)/).reverse().join('');
      // 如果弹幕颜色比较深，用白色的外边框
      var dark = rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114 < 0x30;
      if (dark) s += '\\3c&HFFFFFF';
      if (line.size !== 25) s += '\\fs' + line.size;
      return s;
    };
    // 适用于从右到左弹幕
    var r2l = function (line) {
      return '\\move(' + [
        line.poss.x, line.poss.y, line.posd.x, line.posd.y
      ].join(',') + ')';
    };
    // 适用于固定位置弹幕
    var fix = function (line) {
      return '\\pos(' + [
        line.poss.x, line.poss.y
      ].join(',') + ')';
    };
    var withCommon = function (f) {
      return function (line) { return f(line) + common(line); };
    };
    return {
      'R2L': withCommon(r2l),
      'Fix': withCommon(fix),
    };
  }());
  // 转义一些字符
  var escapeAssText = function (s) {
    // "{"、"}"字符libass可以转义，但是VSFilter不可以，所以直接用全角补上
    return s.replace(/{/g, '｛').replace(/}/g, '｝').replace(/\r|\n/g, '');
  };
  // 将一行转换为ASS的事件
  var convert2Ass = function (line) {
    return 'Dialogue: ' + [
      0,
      formatTime(line.stime),
      formatTime(line.dtime),
      line.type,
      ',20,20,2,,',
    ].join(',')
      + '{' + format[line.type](line) + '}'
      + escapeAssText(line.text);
  };
  return assHeader +
    danmaku.map(convert2Ass)
    .filter(function (x) { return x; })
    .join('\n');
};

/*

下文字母含义：
0       ||----------------------x---------------------->
           _____________________c_____________________
=        /                     wc                      \      0
|       |                   |--v--|                 wv  |  |--v--|
|    d  |--v--|               d f                 |--v--|
y |--v--|  l                                         f  |  s    _ p
|       |              VIDEO           |--v--|          |--v--| _ m
v       |              AREA            (x ^ y)          |

v: 弹幕
c: 屏幕

0: 弹幕发送
a: 可行方案

s: 开始出现
f: 出现完全
l: 开始消失
d: 消失完全

p: 上边缘（含）
m: 下边缘（不含）

w: 宽度
h: 高度
b: 底端保留

t: 时间点
u: 时间段
r: 延迟

并规定
ts := t0s + r
tf := wv / (wc + ws) * p + ts
tl := ws / (wc + ws) * p + ts
td := p + ts

*/

// 滚动弹幕
export const normalDanmaku = (function (wc, hc, b, u, maxr) {
  return function () {
    // 初始化屏幕外面是不可用的
    var used = [
      { 'p': -Infinity, 'm': 0, 'tf': Infinity, 'td': Infinity, 'b': false },
      { 'p': hc, 'm': Infinity, 'tf': Infinity, 'td': Infinity, 'b': false },
      { 'p': hc - b, 'm': hc, 'tf': Infinity, 'td': Infinity, 'b': true },
    ];
    // 检查一些可用的位置
    var available = function (hv, t0s, t0l, b) {
      var suggestion = [];
      // 这些上边缘总之别的块的下边缘
      used.forEach(function (i) {
        if (i.m > hc) return;
        var p = i.m;
        var m = p + hv;
        var tas = t0s;
        var tal = t0l;
        // 这些块的左边缘总是这个区域里面最大的边缘
        used.forEach(function (j) {
          if (j.p >= m) return;
          if (j.m <= p) return;
          if (j.b && b) return;
          tas = Math.max(tas, j.tf);
          tal = Math.max(tal, j.td);
        });
        // 最后作为一种备选留下来
        suggestion.push({
          'p': p,
          'r': Math.max(tas - t0s, tal - t0l),
        });
      });
      // 根据高度排序
      suggestion.sort(function (x, y) { return x.p - y.p; });
      var mr = maxr;
      // 又靠右又靠下的选择可以忽略，剩下的返回
      suggestion = suggestion.filter(function (i) {
        if (i.r >= mr) return false;
        mr = i.r;
        return true;
      });
      return suggestion;
    };
    // 添加一个被使用的
    var use = function (p, m, tf, td) {
      used.push({ 'p': p, 'm': m, 'tf': tf, 'td': td, 'b': false });
    };
    // 根据时间同步掉无用的
    var syn = function (t0s, t0l) {
      used = used.filter(function (i) { return i.tf > t0s || i.td > t0l; });
    };
    // 给所有可能的位置打分，分数是[0, 1)的
    var score = function (i) {
      if (i.r > maxr) return -Infinity;
      return 1 - hypot(i.r / maxr, i.p / hc) * Math.SQRT1_2;
    };
    // 添加一条
    return function (t0s, wv, hv, b) {
      var t0l = wc / (wv + wc) * u + t0s;
      syn(t0s, t0l);
      var al = available(hv, t0s, t0l, b);
      if (!al.length) return null;
      var scored = al.map(function (i) { return [score(i), i]; });
      var best = scored.reduce(function (x, y) {
        return x[0] > y[0] ? x : y;
      })[1];
      var ts = t0s + best.r;
      var tf = wv / (wv + wc) * u + ts;
      var td = u + ts;
      use(best.p, best.p + hv, tf, td);
      return {
        'top': best.p,
        'time': ts,
      };
    };
  };
}(config.playResX, config.playResY, config.bottom, config.r2ltime, config.max_delay));

// 顶部、底部弹幕
export const sideDanmaku = (function (hc, b, u, maxr) {
  return function () {
    var used = [
      { 'p': -Infinity, 'm': 0, 'td': Infinity, 'b': false },
      { 'p': hc, 'm': Infinity, 'td': Infinity, 'b': false },
      { 'p': hc - b, 'm': hc, 'td': Infinity, 'b': true },
    ];
    // 查找可用的位置
    var fr = function (p, m, t0s, b) {
      var tas = t0s;
      used.forEach(function (j) {
        if (j.p >= m) return;
        if (j.m <= p) return;
        if (j.b && b) return;
        tas = Math.max(tas, j.td);
      });
      return { 'r': tas - t0s, 'p': p, 'm': m };
    };
    // 顶部
    var top = function (hv, t0s, b) {
      var suggestion = [];
      used.forEach(function (i) {
        if (i.m > hc) return;
        suggestion.push(fr(i.m, i.m + hv, t0s, b));
      });
      return suggestion;
    };
    // 底部
    var bottom = function (hv, t0s, b) {
      var suggestion = [];
      used.forEach(function (i) {
        if (i.p < 0) return;
        suggestion.push(fr(i.p - hv, i.p, t0s, b));
      });
      return suggestion;
    };
    var use = function (p, m, td) {
      used.push({ 'p': p, 'm': m, 'td': td, 'b': false });
    };
    var syn = function (t0s) {
      used = used.filter(function (i) { return i.td > t0s; });
    };
    // 挑选最好的方案：延迟小的优先，位置不重要
    var score = function (i, is_top) {
      if (i.r > maxr) return -Infinity;
      var f = function (p) { return is_top ? p : (hc - p); };
      return 1 - (i.r / maxr * (31/32) + f(i.p) / hc * (1/32));
    };
    return function (t0s, hv, is_top, b) {
      syn(t0s);
      var al = (is_top ? top : bottom)(hv, t0s, b);
      if (!al.length) return null;
      var scored = al.map(function (i) { return [score(i, is_top), i]; });
      var best = scored.reduce(function (x, y) {
        return x[0] > y[0] ? x : y;
      })[1];
      use(best.p, best.m, best.r + t0s + u)
      return { 'top': best.p, 'time': best.r + t0s };
    };
  };
}(config.playResY, config.bottom, config.fixtime, config.max_delay));

// 为每条弹幕安置位置
export const setPosition = function (danmaku) {
  var normal = normalDanmaku(), side = sideDanmaku();
  return danmaku
    .sort(function (x, y) { return x.time - y.time; })
    .map(function (line) {
      var font_size = Math.round(line.size * config.font_size);
      var width = calcWidth(line.text, font_size);
      switch (line.mode) {
        case 'R2L': return (function () {
          var pos = normal(line.time, width, font_size, line.bottom);
          if (!pos) return null;
          line.type = 'R2L';
          line.stime = pos.time;
          line.poss = {
            'x': config.playResX + width / 2,
            'y': pos.top + font_size,
          };
          line.posd = {
            'x': -width / 2,
            'y': pos.top + font_size,
          };
          line.dtime = config.r2ltime + line.stime;
          return line;
        }());
        case 'TOP': case 'BOTTOM': return (function (isTop) {
          var pos = side(line.time, font_size, isTop, line.bottom);
          if (!pos) return null;
          line.type = 'Fix';
          line.stime = pos.time;
          line.posd = line.poss = {
            'x': Math.round(config.playResX / 2),
            'y': pos.top + font_size,
          };
          line.dtime = config.fixtime + line.stime;
          return line;
        }(line.mode === 'TOP'));
        default: return null;
      };
    })
    .filter(function (l) { return l; })
    .sort(function (x, y) { return x.stime - y.stime; });
};

/*
 * bilibili
 */

// 获取xml
export const fetchXML = function (cid, callback) {
  GM_xmlhttpRequest({
    'method': 'GET',
    'url': 'http://comment.bilibili.com/{{cid}}.xml'.replace('{{cid}}', cid),
    'onload': function (resp) {
      var content = resp.responseText.replace(/(?:[\0-\x08\x0B\f\x0E-\x1F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/g, "");
      callback(content);
    }
  });
};

export const fetchDanmaku = function (cid, callback) {
  fetchXML(cid, function (content) {
    callback(parseXML(content));
  });
};

export const parseXML = function (content) {
  var data = (new DOMParser()).parseFromString(content, 'text/xml');
  return Array.apply(Array, data.querySelectorAll('d')).map(function (line) {
    var info = line.getAttribute('p').split(','), text = line.textContent;
    return {
      'text': text,
      'time': Number(info[0]),
      'mode': [undefined, 'R2L', 'R2L', 'R2L', 'BOTTOM', 'TOP'][Number(info[1])],
      'size': Number(info[2]),
      'color': RRGGBB(parseInt(info[3], 10) & 0xffffff),
      'bottom': Number(info[5]) > 0,
      // 'create': new Date(Number(info[4])),
      // 'pool': Number(info[5]),
      // 'sender': String(info[6]),
      // 'dmid': Number(info[7]),
    };
  });
};

// 获取当前cid
export const getCid = function (callback) {
  debug('get cid...');
  var cid = null, src = null;
  try {
    src = document.querySelector('#bofqi iframe, #moviebofqi iframe').src.replace(/^.*\?/, '');
    cid = Number(src.match(/cid=(\d+)/)[1]);
  } catch (e) { }
  if (!cid) try {
    src = document.querySelector('#bofqi embed, #moviebofqi embed').getAttribute('flashvars');
    cid = Number(src.match(/cid=(\d+)/)[1]);
  } catch (e) { }
  if (!cid) try {
    src = document.querySelector('#bofqi object param[name="flashvars"], #moviebofqi object param[name="flashvars"]').getAttribute('value');
    cid = Number(src.match(/cid=(\d+)/)[1]);
  } catch (e) { }
  if (cid) setTimeout(callback, 0, cid);
  else if (src) GM_xmlhttpRequest({
    'method': 'GET',
    'url': 'http://interface.bilibili.com/player?' + src,
    'onload': function (resp) {
      try { cid = Number(resp.responseText.match(/<chatid>(\d+)<\/chatid>/)[1]); }
      catch (e) { }
      setTimeout(callback, 0, cid || undefined);
    },
    'onerror': function () { setTimeout(callback, 0); }
  }); else {
    setTimeout(getCid, 100, callback);
  }
};

// 下载的主程序
export const mina = function (cid0) {
  getCid(function (cid) {
    cid = cid || cid0;
    fetchDanmaku(cid, function (danmaku) {
      var name;
      try { name = document.querySelector('.viewbox h1, .viewbox h2').textContent; }
      catch (e) { name = '' + cid; }
      debug('got xml with %d danmaku', danmaku.length);
      var ass = generateASS(setPosition(danmaku), {
        'title': document.title,
        'ori': location.href,
      });
      startDownload('\ufeff' + ass, name + '.ass');
    });
  });
};

// 显示出下载弹幕按钮
export const showButton = function (count) {
  GM_addStyle('.arc-toolbar .block.fav { margin-right: 0 } .arc-toolbar .block { padding: 0 18px; }');
  var favbar = document.querySelector('.arc-toolbar .block.fav');
  var assdown = document.createElement('div');
  assdown.innerHTML = '<div id="assdown" class="block ass"><span class="t ass_btn"><i style="display: block; width: 80px; height: 80px; background-position: 0px 0px; background-image: url(&quot;data:image/png;base64,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&quot;);" class="b-icon b-icon-a b-icon-anim-ass" title="弹幕下载"></i><div class="t-right"><span class="t-right-top">弹幕下载</span><span class="t-right-bottom">' + count + '</span></div></span></div>';
  assdown = assdown.firstChild;
  favbar.parentNode.insertBefore(assdown, favbar.nextSibling);
  var timer = null, frame = 0;
  assdown.addEventListener('mouseenter', function () { frame = 0; timer = setTimeout(anim, 0); });
  assdown.addEventListener('mouseleave', function () { clearTimeout(timer); timer = null; });
  var anim = function () {
    if (frame === 16) { timer = null; return; }
    frame++;
    assdown.querySelector('i').style.backgroundPosition = '-' + (frame * 80) + 'px 0';
    setTimeout(anim, 1000 / 16);
  };
};

// 初始化按钮
export const initButton = (function () {
  var done = false;
  return function () {
    debug('init button');
    if (!document.querySelector('.arc-toolbar .block.fav')) return;
    getCid(function (cid) {
      debug('cid = %o', cid);
      if (!cid || done) return; else done = true;
      fetchDanmaku(cid, function (danmaku) {
        showButton(danmaku.length);
        document.querySelector('#assdown').addEventListener('click', function (e) {
          e.preventDefault();
          mina(cid);
        });
      });
    });
  };
}());

/*
 * Common
 */

 // 初始化
// var init = function () {
//   initFont();
//   initButton();
// };

// if (document.body) init();
// else window.addEventListener('DOMContentLoaded', init);
