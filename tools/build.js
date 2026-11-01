// Generates the site's HTML pages. Run: node tools/build.js
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const cssVersion = 6;

// ---------- Zhuyin ----------

// Words are matched first, so polyphonic characters can be read by context.
const WORDS = {
  '分數': 'ㄈㄣ ㄕㄨˋ', '數節': 'ㄕㄨˇ ㄐㄧㄝˊ', '數一': 'ㄕㄨˇ ㄧ', '得幾': 'ㄉㄜˊ ㄐㄧˇ',
  '跳得': 'ㄊㄧㄠˋ ˙ㄉㄜ', '幾乎': 'ㄐㄧ ㄏㄨ', '舒服': 'ㄕㄨ ˙ㄈㄨ', '時候': 'ㄕˊ ˙ㄏㄡ',
  '怎麼': 'ㄗㄣˇ ˙ㄇㄜ', '什麼': 'ㄕㄣˊ ˙ㄇㄜ', '鏡子': 'ㄐㄧㄥˋ ˙ㄗ', '爸爸': 'ㄅㄚˋ ˙ㄅㄚ',
  '媽媽': 'ㄇㄚ ˙ㄇㄚ', '看過': 'ㄎㄢˋ ㄍㄨㄛˋ', '那隻': 'ㄋㄚˋ ㄓ',
};

const CHARS = Object.fromEntries(`
照ㄓㄠˋ 先ㄒㄧㄢ 一ㄧ 三ㄙㄢ 上ㄕㄤˋ 下ㄒㄧㄚˋ 不ㄅㄨˋ 且ㄑㄧㄝˇ 主ㄓㄨˇ 乎ㄏㄨ 互ㄏㄨˋ 五ㄨˇ 人ㄖㄣˊ 什ㄕㄣˊ 件ㄐㄧㄢˋ 以ㄧˇ
休ㄒㄧㄡ 你ㄋㄧˇ 作ㄗㄨㄛˋ 來ㄌㄞˊ 個ㄍㄜˋ 偷ㄊㄡ 像ㄒㄧㄤˋ 兩ㄌㄧㄤˇ 六ㄌㄧㄡˋ 再ㄗㄞˋ 出ㄔㄨ 分ㄈㄣ 到ㄉㄠˋ 動ㄉㄨㄥˋ
加ㄐㄧㄚ 努ㄋㄨˇ 去ㄑㄩˋ 又ㄧㄡˋ 友ㄧㄡˇ 只ㄓˇ 可ㄎㄜˇ 右ㄧㄡˋ 告ㄍㄠˋ 和ㄏㄜˊ 四ㄙˋ 回ㄏㄨㄟˊ 圖ㄊㄨˊ 在ㄗㄞˋ
坐ㄗㄨㄛˋ 多ㄉㄨㄛ 大ㄉㄚˋ 好ㄏㄠˇ 媽ㄇㄚ 學ㄒㄩㄝˊ 完ㄨㄢˊ 家ㄐㄧㄚ 小ㄒㄧㄠˇ 就ㄐㄧㄡˋ 己ㄐㄧˇ 幾ㄐㄧˇ 度ㄉㄨˋ 開ㄎㄞ
影ㄧㄥˇ 往ㄨㄤˇ 很ㄏㄣˇ 得ㄉㄜˊ 從ㄘㄨㄥˊ 心ㄒㄧㄣ 快ㄎㄨㄞˋ 怎ㄗㄣˇ 息ㄒㄧˊ 意ㄧˋ 感ㄍㄢˇ 慢ㄇㄢˋ 懂ㄉㄨㄥˇ 手ㄕㄡˇ
打ㄉㄚˇ 把ㄅㄚˇ 拍ㄆㄞ 拿ㄋㄚˊ 手ㄕㄡˇ 持ㄔˊ 按ㄢˋ 教ㄐㄧㄠ 數ㄕㄨˋ 方ㄈㄤ 新ㄒㄧㄣ 於ㄩˊ 是ㄕˋ 時ㄕˊ
晃ㄏㄨㄤˋ 更ㄍㄥˋ 最ㄗㄨㄟˋ 有ㄧㄡˇ 服ㄈㄨˊ 樂ㄩㄝˋ 樣ㄧㄤˋ 次ㄘˋ 歌ㄍㄜ 步ㄅㄨˋ 歡ㄏㄨㄢ 比ㄅㄧˇ 沒ㄇㄟˊ 法ㄈㄚˇ
注ㄓㄨˋ 滿ㄇㄢˇ 演ㄧㄢˇ 為ㄨㄟˋ 燈ㄉㄥ 片ㄆㄧㄢˋ 玩ㄨㄢˊ 甩ㄕㄨㄞˇ 用ㄩㄥˋ 畫ㄏㄨㄚˋ 的˙ㄉㄜ 直ㄓˊ 看ㄎㄢˋ 眼ㄧㄢˇ
睛ㄐㄧㄥ 知ㄓ 短ㄉㄨㄢˇ 種ㄓㄨㄥˇ 站ㄓㄢˋ 節ㄐㄧㄝˊ 簡ㄐㄧㄢˇ 管ㄍㄨㄢˇ 累ㄌㄟˋ 結ㄐㄧㄝˊ 給ㄍㄟˇ 練ㄌㄧㄢˋ 習ㄒㄧˊ 者ㄓㄜˇ
聽ㄊㄧㄥ 腳ㄐㄧㄠˇ 臂ㄅㄧˋ 自ㄗˋ 舒ㄕㄨ 舞ㄨˇ 色ㄙㄜˋ 蹈ㄉㄠˇ 著˙ㄓㄜ 表ㄅㄧㄠˇ 要ㄧㄠˋ 覺ㄐㄩㄝˊ 認ㄖㄣˋ 訴ㄙㄨˋ
評ㄆㄧㄥˊ 試ㄕˋ 認ㄖㄣˋ 請ㄑㄧㄥˇ 論ㄌㄨㄣˋ 變ㄅㄧㄢˋ 跟ㄍㄣ 距ㄐㄩˋ 跳ㄊㄧㄠˋ 身ㄕㄣ 這ㄓㄜˋ 選ㄒㄩㄢˇ 遊ㄧㄡˊ 道ㄉㄠˋ
遠ㄩㄢˇ 那ㄋㄚˋ 金ㄐㄧㄣ 鏡ㄐㄧㄥˋ 長ㄔㄤˊ 開ㄎㄞ 關ㄍㄨㄢ 難ㄋㄢˊ 電ㄉㄧㄢˋ 非ㄈㄟ 面ㄇㄧㄢˋ 音ㄧㄣ 頁ㄧㄝˋ 首ㄕㄡˇ
高ㄍㄠ 鍵ㄐㄧㄢˋ 驟ㄗㄡˋ 點ㄉㄧㄢˇ 事ㄕˋ 二ㄦˋ 也ㄧㄝˇ 伸ㄕㄣ 價ㄐㄧㄚˋ 做ㄗㄨㄛˋ 停ㄊㄧㄥˊ 候ㄏㄡˋ 其ㄑㄧˊ 前ㄑㄧㄢˊ
單ㄉㄢ 同ㄊㄨㄥˊ 喜ㄒㄧˇ 始ㄕˇ 對ㄉㄨㄟˋ 常ㄔㄤˊ 幕ㄇㄨˋ 想ㄒㄧㄤˇ 戲ㄒㄧˋ 拍ㄆㄞ 會ㄏㄨㄟˋ 機ㄐㄧ 相ㄒㄧㄤ 紀ㄐㄧˋ
重ㄓㄨㄥˋ 錯ㄘㄨㄛˋ 越ㄩㄝˋ 起ㄑㄧˇ 邊ㄅㄧㄢ 過ㄍㄨㄛˋ 還ㄏㄞˊ 隻ㄓ 要ㄧㄠˋ 請ㄑㄧㄥˇ 麼ㄇㄜ 爸ㄅㄚˋ 累ㄌㄟˋ 怕ㄆㄚˋ
`.trim().split(/\s+/).map(s => [s[0], s.slice(1)]));

const used = [];

// Wraps every Chinese character in <ruby>; Latin text and punctuation pass through.
function z(text) {
  let out = '';
  let i = 0;
  while (i < text.length) {
    const word = text.slice(i, i + 2);
    const ch = text[i];
    if (WORDS[word]) {
      WORDS[word].split(' ').forEach((r, n) => { out += ruby(word[n], r); });
      i += 2;
    } else if (/[一-鿿]/.test(ch)) {
      if (!CHARS[ch]) throw new Error(`No zhuyin for "${ch}" in "${text}"`);
      out += ruby(ch, CHARS[ch]);
      i += 1;
    } else {
      out += ch;
      i += 1;
    }
  }
  return out;
}

function ruby(ch, reading) {
  used.push([ch, reading]);
  // Textbook layout: symbols stacked to the right of the character, tone mark beside them.
  const m = reading.match(/^(.*?)([ˊˇˋ]?)$/);
  const tone = m[2] ? `<span class="t">${m[2]}</span>` : '';
  return `<span class="zy">${ch}<span class="b" aria-hidden="true"><span class="s">${m[1]}</span>${tone}</span></span>`;
}

// ---------- Flat icons: one palette, one figure, thick rounded strokes ----------

const C = {
  skin: '#f6c9a0', ink: '#3a3a48', red: '#e8483f', green: '#3fa75f', blue: '#2f8fd0',
  purple: '#7a3e9d', gold: '#f2b705', white: '#ffffff',
  sky: '#d9efff', sand: '#fff0c9', mint: '#e4f7dc', lilac: '#f1e6fb', rose: '#ffe3e0', ice: '#e8f1fb',
};

const icon = (label, bg, body) =>
  `<svg viewBox="0 0 200 130" role="img" aria-label="${label}"><rect width="200" height="130" fill="${bg}"/>${body}</svg>`;

const line = (d, color, w = 8) =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

// The same person everywhere: arms are [x, y] end points relative to the figure's centre.
function person(cx, top, shirt, armL, armR) {
  const sy = top + 36;
  return line(`M${cx - 10} ${sy}L${cx + armL[0]} ${top + armL[1]}`, C.skin)
    + line(`M${cx + 10} ${sy}L${cx + armR[0]} ${top + armR[1]}`, C.skin)
    + line(`M${cx - 7} ${top + 62}V${top + 84}M${cx + 7} ${top + 62}V${top + 84}`, C.ink)
    + `<rect x="${cx - 14}" y="${top + 28}" width="28" height="36" rx="10" fill="${shirt}"/>`
    + `<circle cx="${cx}" cy="${top + 14}" r="14" fill="${C.skin}"/>`;
}

const joycon = (x, y, rot = 0) =>
  `<g transform="rotate(${rot} ${x} ${y})"><rect x="${x - 7}" y="${y - 14}" width="14" height="28" rx="6" fill="${C.red}"/></g>`;

const tv = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${C.ink}"/>`;

const star = (cx, cy, s = 1, fill = C.gold) => {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const r = (i % 2 ? 10 : 24) * s;
    const a = -Math.PI / 2 + i * Math.PI / 5;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return `<polygon points="${pts.join(' ')}" fill="${fill}"/>`;
};

const check = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="17" fill="${C.green}"/>` + line(`M${cx - 8} ${cy}l6 7 11-13`, C.white, 5);
const cross = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="17" fill="${C.red}"/>` + line(`M${cx - 7} ${cy - 7}l14 14m0-14l-14 14`, C.white, 5);

const note = (x, y, color = C.ink) =>
  `<ellipse cx="${x}" cy="${y}" rx="11" ry="9" fill="${color}"/>` + line(`M${x + 9} ${y}V${y - 38}l24 -6`, color, 6);

const arrow = (d, head, color = C.red) => line(d, color, 6) + line(head, color, 6);

const heart = (cx, cy, color = C.red) =>
  `<path d="M${cx} ${cy + 22}C${cx - 34} ${cy - 2} ${cx - 16} ${cy - 24} ${cx} ${cy - 8}C${cx + 16} ${cy - 24} ${cx + 34} ${cy - 2} ${cx} ${cy + 22}z" fill="${color}"/>`;

const I = {
  grip: icon('一隻手緊緊握住 Joy-Con', C.sky,
    `<rect x="82" y="14" width="36" height="102" rx="15" fill="${C.red}"/><circle cx="100" cy="33" r="8" fill="${C.ink}"/>`
    + [52, 68, 84].map(y => `<rect x="66" y="${y}" width="68" height="14" rx="7" fill="${C.skin}"/>`).join('') + check(158, 36)),
  stretch: icon('小朋友把手臂伸得又高又直', C.sand,
    person(100, 24, C.purple, [-28, 72], [48, 4]) + joycon(148, 26, 45)),
  beat: icon('音符和一二三四的節拍', C.mint,
    note(88, 54) + [40, 80, 120, 160].map((x, i) =>
      `<circle cx="${x}" cy="98" r="16" fill="${i ? C.green : C.red}"/><text x="${x}" y="104" font-family="sans-serif" font-size="18" font-weight="700" text-anchor="middle" fill="#fff">${i + 1}</text>`).join('')),
  watch: icon('眼睛看著電視裡的舞者，左下角有小圖', C.lilac,
    tv(38, 8, 124, 84) + `<g transform="translate(100 12) scale(.82) translate(-100 0)">${person(100, 0, C.gold, [-28, 12], [28, 12])}</g>`
    + `<rect x="46" y="62" width="24" height="24" rx="5" fill="#fff"/>` + `<g transform="translate(58 64) scale(.24) translate(-100 0)">${person(100, 0, C.purple, [-28, 12], [28, 12])}</g>`
    + `<path d="M72 112q28-22 56 0q-28 22-56 0z" fill="#fff"/><circle cx="100" cy="112" r="9" fill="${C.purple}"/>`),
  mirror: icon('舞者和你都把手伸向同一邊', C.rose,
    line('M106 8V122', C.white, 4) + person(62, 8, C.purple, [-20, 62], [34, 16]) + person(146, 8, C.blue, [-20, 62], [34, 16])
    + `<text x="62" y="124" font-family="sans-serif" font-size="14" font-weight="700" text-anchor="middle" fill="${C.ink}">舞者</text>`
    + `<text x="146" y="124" font-family="sans-serif" font-size="14" font-weight="700" text-anchor="middle" fill="${C.ink}">你</text>`),
  repeat: icon('金色星星外面有一圈重複的箭頭', C.ice,
    line('M138 40a48 48 0 1 0 10 34', C.blue, 9) + line('M122 38l18 3 3-18', C.blue, 9) + star(100, 66)),
  sense: icon('Joy-Con 感覺到手在動', C.sky,
    `<rect x="84" y="28" width="32" height="76" rx="14" fill="${C.red}"/><circle cx="100" cy="46" r="7" fill="${C.ink}"/>`
    + line('M66 44q-14 22 0 44M48 32q-24 34 0 68', C.blue, 6) + line('M134 44q14 22 0 44M152 32q24 34 0 68', C.blue, 6)),
  compare: icon('你的動作和舞者的動作比一比', C.sand,
    person(60, 22, C.blue, [-24, 68], [30, 6]) + person(146, 22, C.purple, [-24, 68], [30, 6])
    + line('M95 62H111M95 76H111', C.ink, 6)),
  grade: icon('得到一個好評價和星星', C.mint,
    star(62, 66) + star(100, 54, 1.25) + star(138, 66)),
  game: icon('跟著電視裡的舞者跳', C.lilac,
    tv(100, 14, 86, 66) + `<g transform="translate(143 16) scale(.7) translate(-100 0)">${person(100, 0, C.gold, [-28, 10], [28, 10])}</g>` + person(50, 24, C.blue, [-26, 10], [26, 10])),
  song: icon('選一首歌', C.mint, note(82, 86, C.purple) + note(128, 74, C.blue)),
  score: icon('看看得幾分', C.sand, star(100, 64, 1.7)),
  rest: icon('跳累了坐下來休息', C.ice,
    `<circle cx="100" cy="30" r="14" fill="${C.skin}"/><rect x="86" y="44" width="28" height="36" rx="10" fill="${C.green}"/>`
    + line('M92 80H64V112M108 80H136V112', C.ink) + line('M90 52L72 72M110 52L128 72', C.skin)),
  light: icon('打開電燈', C.sand,
    line('M100 0V26', C.ink, 6) + `<path d="M72 44q28-36 56 0z" fill="${C.ink}"/><circle cx="100" cy="62" r="20" fill="${C.gold}"/>`
    + line('M60 62H44M140 62H156M72 92L60 106M128 92L140 106M100 96V114', C.gold, 6)),
  far: icon('站得離電視遠一點', C.rose,
    tv(138, 26, 52, 56) + person(36, 22, C.blue, [-22, 66], [22, 66]) + arrow('M74 66H122', 'M112 56l10 10-10 10', C.green)),
  stop: icon('不舒服就停下來', C.rose,
    `<circle cx="100" cy="65" r="42" fill="${C.red}"/><rect x="74" y="56" width="52" height="18" rx="8" fill="#fff"/>`),
  shake: icon('不要只甩手', C.rose,
    `<rect x="60" y="30" width="32" height="74" rx="14" fill="${C.red}"/>` + line('M108 36l18 14-18 14 18 14-18 14', C.ink, 6) + cross(158, 36)),
  feet: icon('不要只動腳', C.rose,
    line('M72 12V84M112 12V84', C.ink, 12) + `<rect x="54" y="84" width="34" height="18" rx="9" fill="${C.blue}"/><rect x="94" y="84" width="34" height="18" rx="9" fill="${C.blue}"/>` + cross(158, 36)),
  hard: icon('一開始不要選太難的歌', C.rose,
    `<path d="M16 116L74 22l58 94z" fill="${C.ink}"/><path d="M58 48l16-26 16 26-16 10z" fill="${C.white}"/>` + cross(158, 36)),
  firstLook: icon('坐著看舞者跳', C.ice,
    tv(108, 14, 78, 66) + `<g transform="translate(147 16) scale(.65) translate(-100 0)">${person(100, 0, C.gold, [-28, 10], [28, 10])}</g>`
    + `<circle cx="52" cy="34" r="14" fill="${C.skin}"/><rect x="38" y="48" width="28" height="34" rx="10" fill="${C.green}"/>` + line('M44 82H24V110M60 82H84V110', C.ink)),
  handsOnly: icon('先只練手', C.sand, person(100, 24, C.purple, [-44, 8], [44, 8]) + joycon(146, 30, 90)),
  hint: icon('小圖告訴你下一步', C.lilac,
    `<rect x="60" y="16" width="80" height="80" rx="12" fill="#fff"/><g transform="translate(100 24) scale(.72) translate(-100 0)">${person(100, 0, C.purple, [-28, 10], [28, 10])}</g>`
    + arrow('M148 104H184', 'M174 94l10 10-10 10', C.green)),
  addFeet: icon('手和腳一起動', C.mint,
    `<g>${person(100, 18, C.blue, [-42, 8], [42, 8])}</g>` + line('M58 106h-22M142 106h22', C.green, 6)),
  self: icon('今天比昨天進步', C.mint,
    `<rect x="46" y="72" width="32" height="42" rx="6" fill="${C.blue}"/><rect x="92" y="44" width="32" height="70" rx="6" fill="${C.green}"/>` + star(150, 40, .9)),
  family: icon('跟家人一起跳', C.rose,
    person(62, 20, C.purple, [-24, 8], [24, 48]) + `<g transform="translate(132 40) scale(.8) translate(-132 0)">${person(132, 0, C.blue, [-24, 40], [24, 8])}</g>`),
  level: icon('難度從簡單到難', C.ice,
    `<rect x="44" y="80" width="30" height="34" rx="6" fill="${C.green}"/><rect x="85" y="56" width="30" height="58" rx="6" fill="${C.gold}"/><rect x="126" y="24" width="30" height="90" rx="6" fill="${C.red}"/>`),
  preview: icon('大人先看影片', C.lilac,
    tv(38, 16, 124, 90) + `<path d="M86 40v42l36-21z" fill="#fff"/>`),
  choose: icon('選出喜歡的歌', C.rose, heart(70, 66) + note(126, 88, C.purple)),
};

const stars = n => `<svg viewBox="0 0 150 30" class="stars" role="img" aria-label="${n} 顆星">${
  [0, 1, 2, 3, 4].map(i => star(15 + i * 30, 15, 0.55, i < n ? C.gold : '#d5d2c8')).join('')}</svg>`;

// ---------- Page parts ----------

const NAV = [
  ['index.html', '首頁'],
  ['high-score.html', '跳高分'],
  ['scoring.html', '怎麼評分'],
  ['kids.html', '怎麼練習'],
  ['songs.html', '選歌'],
];

const cards = (items, numbered) =>
  `<${numbered ? 'ol' : 'ul'} class="cards">\n${items.map(([svg, title, text]) =>
    `<li>${svg}<h3>${z(title)}</h3>${text ? `<p>${z(text)}</p>` : ''}</li>`).join('\n')}\n</${numbered ? 'ol' : 'ul'}>`;

const conclusion = text =>
  `<div class="key"><span class="label">${z('結論')}</span><p>${z(text)}</p></div>`;

const h2 = text => `<h2>${z(text)}</h2>`;

const photo = (file, w, h, alt, caption, url, author, license) => {
  const links = { 'CC0': 'publicdomain/zero/1.0', 'CC BY 2.0': 'licenses/by/2.0', 'CC BY 4.0': 'licenses/by/4.0', 'CC BY-SA 2.0': 'licenses/by-sa/2.0' };
  return `<figure><img src="images/${file}" width="${w}" height="${h}" alt="${alt}" loading="lazy"><figcaption>${caption}照片：<a href="${url}">${author}</a>，<a href="https://creativecommons.org/${links[license]}/deed.zh-hant">${license}</a>，已縮小尺寸。</figcaption></figure>`;
};

const parents = (summary, body) =>
  `<details class="parent"><summary>給家長看：${summary}</summary>\n${body}\n</details>`;

function page(file, title, description, body, footer) {
  const nav = NAV.map(([href, label]) =>
    `<li><a href="${href}"${href === file ? ' aria-current="page"' : ''}>${z(label)}</a></li>`).join('');
  const html = `<!doctype html>
<html lang="zh-Hant-TW">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <link rel="stylesheet" href="style.css?v=${cssVersion}">
</head>
<body>
  <header>
    <div class="wrap">
      <nav aria-label="主選單"><ul>${nav}</ul></nav>
    </div>
  </header>
  <main class="wrap">
${body}
  </main>
  <footer>
    <div class="wrap">非官方整理，與 Ubisoft 無關。圖示為本站自製。${footer}</div>
  </footer>
</body>
</html>
`;
  fs.writeFileSync(path.join(root, file), html);
}

const CC_NOTE = '照片中的標誌、遊戲畫面與產品設計，權利屬於其各自所有人，創用 CC 授權僅涵蓋照片。';

// ---------- Pages ----------

page('index.html', 'Just Dance 親子指南', '用孩子看得懂的圖和注音，說明 Just Dance 怎麼玩、怎麼跳高分。', `
    <h1>${z('一起跳 Just Dance')}</h1>
    <p class="lead">${z('跟著舞者跳，一起動起來！')}</p>
    ${conclusion('遊戲主要看你拿 Joy-Con 的那隻手。')}
    <p><a class="cta" href="high-score.html">${z('去看怎麼跳高分')} →</a></p>

    ${h2('這是什麼遊戲？')}
    ${cards([
      [I.song, '選一首歌'],
      [I.game, '跟著舞者跳'],
      [I.score, '看看得幾分'],
    ], true)}

    ${h2('玩的時候要注意')}
    ${cards([
      [I.rest, '跳兩三首就休息'],
      [I.light, '打開電燈'],
      [I.far, '站遠一點'],
      [I.stop, '不舒服就停下來'],
    ])}

    ${photo('eb-games-expo-2015.jpg', 960, 720, '展場的發光舞台上，幾位玩家跟著 Just Dance 2016 的大螢幕一起跳舞', '2015 年 EB Games Expo 的舞台。', 'https://commons.wikimedia.org/wiki/File:EB_Games_Expo_2015_-_Just_Dance_2016.JPG', 'Philip Terry Graham', 'CC0')}

    <div class="note"><strong>請家長留意：</strong>如果孩子或家族有癲癇或光敏感病史，玩之前請先問過醫師。如果玩的時候出現抽搐、視線異常或意識恍惚，要立刻停止並就醫。</div>

    ${parents('遊戲介紹與適合度', `
      <p>Just Dance（舞力全開）是 Ubisoft 推出的音樂體感遊戲，第一代在 2009 年登上 Wii，之後幾乎每年都出新版本。各版本玩法大致相同，主要差在歌單和線上服務，所以通常不必每一款都買。Switch 2 也能玩，有評測提到新版 Joy-Con 和舊版玩起來沒有明顯差別。</p>
      <div class="table-scroll"><table>
        <thead><tr><th>偵測方式</th><th>說明</th></tr></thead>
        <tbody>
          <tr><td>Joy-Con</td><td>Switch 上最常見的玩法，主要偵測拿著它的那隻手</td></tr>
          <tr><td>手機 App</td><td>把手機當控制器，適合多人同樂，一個房間最多 6 人</td></tr>
          <tr><td>Camera Controller</td><td>透過手機 App 用鏡頭偵測動作，僅限單人，也不是每首歌都支援</td></tr>
        </tbody>
      </table></div>
      <p>小一、小三左右的孩子不用記按鍵就能玩，但要留意歌詞和舞蹈內容、線上功能（可用 Switch 家長監護限制），以及手足間的分數比較。畫面鮮豔刺眼時，建議一次玩 2 到 3 首、一天約 20 到 30 分鐘，開著室內燈並調低電視亮度。</p>
      ${photo('fan-expo-2014.jpg', 960, 640, '四位玩家單手拿著控制器，看著螢幕一起跳 Just Dance', '玩家單手拿著控制器跟著跳。2014 年 Fan Expo，使用 Wii 系列控制器。', 'https://commons.wikimedia.org/wiki/File:Fan_Expo_2014_-_Just_Dance_(9669642682).jpg', 'jareed', 'CC BY 2.0')}
      ${photo('gamescom-2015.jpg', 960, 700, '兩位穿著騎士盔甲服裝的人，背對鏡頭跟著螢幕跳 Just Dance', '盔甲騎士也能跳。2015 年 Gamescom。', 'https://commons.wikimedia.org/wiki/File:Just_Dance_at_Gamescom_2015_(20241598168).jpg', 'Sergey Galyonkin', 'CC BY-SA 2.0')}
    `)}`, CC_NOTE + '遊戲內容可能隨版本變動，請以遊戲內顯示為準。');

page('high-score.html', 'Just Dance 跳高分', '用注音和扁平圖示，讓小一、小三的孩子看懂跳高分的六個關鍵。', `
    <h1>${z('怎麼跳高分')}</h1>
    <p class="lead">${z('做好這六件事，分數就有機會變高！')}</p>
    ${conclusion('遊戲主要看你拿 Joy-Con 的那隻手，手要做對！')}

    ${h2('跳高分的六個關鍵')}
    ${cards([
      [I.grip, '拿好 Joy-Con', '照畫面教的方法拿好，不要晃來晃去。'],
      [I.stretch, '手伸長長', '手臂伸直，動作做大一點。'],
      [I.beat, '跟上節拍', '聽音樂數一二三四，不要慢一拍。'],
      [I.watch, '看著舞者', '眼睛看舞者，偷看小圖就知道下一步。'],
      [I.mirror, '像照鏡子', '舞者往右邊，你也往右邊。'],
      [I.repeat, '多跳幾次', '同一首歌多跳幾次，金色動作要做好！'],
    ], true)}

    ${h2('不要這樣做')}
    ${cards([
      [I.shake, '只甩手'],
      [I.feet, '只動腳'],
      [I.hard, '一開始就選難歌'],
    ])}

    ${parents('六個關鍵的補充與分數低的原因', `
      <ol>
        <li><strong>拿好 Joy-Con：</strong>依遊戲畫面的指示握好，手腕也要固定好。有玩家反映評分對握法很敏感。</li>
        <li><strong>手伸長長：</strong>每個動作都做得清楚俐落。動作只做一半，是常見的失分原因之一。</li>
        <li><strong>跟上節拍：</strong>看到舞者動了才跟著動，時間點通常會偏晚。先聽熟節拍，並且提前準備下一個動作。</li>
        <li><strong>看著舞者：</strong>舞者告訴你手怎麼移動，圖示則是預告。不要盯著圖示等亮燈才動，那樣通常會來不及。</li>
        <li><strong>像照鏡子：</strong>舞者往畫面右邊伸手，你也往自己的右邊伸手，不用先想舞者用的是哪一隻手。</li>
        <li><strong>多跳幾次：</strong>記住動作後反應會變快。金色動作（Gold Move）有額外加分。</li>
      </ol>
      <p>Ubisoft 在 2023 年調整評分，改成更重視準確度，只靠甩手很難再拿高分。</p>
      <p><strong>孩子分數特別低的可能原因（推測，非官方說法）：</strong>手臂較短使動作訊號較小、手沒有伸到位、看到舞者動了才動所以慢半拍、Joy-Con 握歪或手腕亂轉。分數低不代表跳得不好，因為主要只有手的動作被算進去。</p>
      ${photo('joy-con-2.png', 960, 946, '藍色和橘色的 Switch 2 Joy-Con 2 手把', 'Switch 2 的 Joy-Con 2。', 'https://commons.wikimedia.org/wiki/File:Nintendo_Switch_2_Joy-Con_2_Blue_and_Orange_(transparent_background).png', 'Crisco 1492', 'CC BY 4.0')}
    `)}`, 'Ubisoft 沒有公開完整評分公式，本站的技巧來自官方說明與玩家經驗。' + CC_NOTE);

const RATINGS = [
  ['X', '沒有對到', 0], ['OK', '有一點像', 1], ['Good', '很不錯', 2], ['Super', '非常像', 3], ['Perfect', '幾乎一樣', 5],
];

page('scoring.html', 'Just Dance 評分方式', '用三個扁平圖示步驟，讓孩子看懂 Just Dance 怎麼給評價。', `
    <h1>${z('遊戲怎麼給分')}</h1>
    <p class="lead">${z('三個步驟，一看就懂！')}</p>
    ${conclusion('你的手越像舞者，評價越高。')}

    ${h2('三個步驟')}
    ${cards([
      [I.sense, '感覺你的手', 'Joy-Con 會感覺你的手怎麼動。'],
      [I.compare, '比一比', '遊戲把你的動作跟舞者比一比。'],
      [I.grade, '給你評價', '越像舞者，評價越高。'],
    ], true)}

    ${h2('五種評價')}
    <ul class="ratings">
      ${RATINGS.map(([name, text, n]) => `<li><strong>${name}</strong>${stars(n)}<span>${z(text)}</span></li>`).join('\n      ')}
    </ul>
    <p class="big">${z('金色動作可以多拿分！')}</p>

    ${parents('評分細節與資料來源', `
      <p>Ubisoft 沒有公開完整的評分公式，細節大多是玩家的經驗。系統會一段段比對手部動作和標準動作的軌跡、方向和時間點。有評測指出，Just Dance 2026 Edition 沒有使用 Switch 2 的鏡頭來評分。</p>
      <p>五種評價的星星和說明是為了方便孩子理解的概略比喻，不是官方定義。跳完後，遊戲會依總分給星星和名次。</p>
      <p>Ubisoft 表示，過去有可能靠甩控制器拿到高分，舊的偵測也是以 Wii Remote 為設計基礎；2023 年起改成更重視準確度。</p>
      ${photo('gamescom-2009.jpg', 960, 720, '兩位玩家在舞台上跳舞，後方投影出舞者和兩側的計量條', '舞者兩側看得到計量條。2009 年 Gamescom。', 'https://commons.wikimedia.org/wiki/File:Gamescom_2009_-_Just_Dance.jpg', 'egrenouille', 'CC BY 2.0')}
      <ul>
        <li><a href="https://ubisoft.com/en-ca/game/just-dance/2025/news-updates/6JSYL277Jds6As65yqtAvr/new-era-new-scoring">Ubisoft：New Era, New Scoring</a></li>
        <li><a href="https://3rd-strike.com/just-dance-2026-edition-review">Just Dance 2026 Edition 評測（3rd Strike）</a></li>
        <li><a href="https://www.ludo.guide/guide/just-dance-2024-edition/understanding-scoring-feedback/understanding-the-scoring-system">Just Dance 2024 評分系統說明（ludo.guide）</a></li>
      </ul>
    `)}`, CC_NOTE + '遊戲內容可能隨版本變動，請以遊戲內顯示為準。');

page('kids.html', '陪孩子練 Just Dance', '分四步驟練習 Just Dance，孩子看圖就懂，家長也有陪練建議。', `
    <h1>${z('一步一步學跳舞')}</h1>
    <p class="lead">${z('先練手，再加腳。')}</p>
    ${conclusion('眼睛看舞者，偷看小圖。')}

    ${h2('四個練習步驟')}
    ${cards([
      [I.firstLook, '先看一次', '坐著看舞者跳，一起數節拍。'],
      [I.handsOnly, '只動手', '先不用管腳。'],
      [I.hint, '看小圖', '小圖會告訴你下一步。'],
      [I.addFeet, '加上腳', '手跟腳一起動。'],
    ], true)}

    ${h2('跳得開心最重要')}
    ${cards([
      [I.self, '跟自己比'],
      [I.family, '跟家人互相教'],
      [I.rest, '玩累就休息'],
    ])}

    ${parents('依年紀調整的陪練方法', `
      <p>以下是根據遊戲設計和孩子學動作的經驗整理的建議，不是官方教學。</p>
      <ul>
        <li><strong>小一：</strong>一次只給一個重點，例如這首歌「手伸直」就好。家長可以站在旁邊一起跳，也可以說「照著鏡子跳」。</li>
        <li><strong>小三：</strong>可以開始練習邊看舞者邊瞄圖示，也可以請孩子當小老師，減少互相比較。</li>
        <li><strong>鼓勵方式：</strong>說得具體一點，例如「你剛剛的手舉得好高」，並記錄這次比上次進步多少。</li>
        <li><strong>時間：</strong>每次練 2 到 3 首就夠了，孩子還覺得好玩時就結束。</li>
      </ul>
    `)}`, '遊戲內容可能隨版本變動，請以遊戲內顯示為準。');

page('songs.html', 'Just Dance 親子選歌', '孩子看得懂的選歌三步驟，以及給家長的歌曲把關建議。', `
    <h1>${z('一起來選歌')}</h1>
    <p class="lead">${z('爸爸媽媽先看過，再一起選。')}</p>
    ${conclusion('先選簡單的歌，再慢慢變難。')}

    ${h2('選歌三步驟')}
    ${cards([
      [I.level, '看難度', '從最簡單的開始。'],
      [I.preview, '看舞蹈', '大人先看影片。'],
      [I.choose, '自己選', '選出喜歡的歌。'],
    ], true)}

    ${photo('e3-2011.jpg', 960, 720, '展場舞台上，舞者跟著 Just Dance 3 的大螢幕跳舞，台下觀眾在拍照', '2011 年 E3 的 Just Dance 3 舞台。', 'https://commons.wikimedia.org/wiki/File:E3_2011_-_Just_Dance_3_Demo_2_(5834926206).jpg', '-EMR-', 'CC BY 2.0')}

    ${parents('歌曲把關建議與資料來源', `
      <p>目前查不到官方的「適齡歌單」。下表是依歌名和歌手的印象分類，沒有逐首看過歌詞和舞蹈，建議家長先試玩。</p>
      <div class="table-scroll"><table>
        <thead><tr><th>建議</th><th>Just Dance 2026 Edition 歌曲</th><th>說明</th></tr></thead>
        <tbody>
          <tr><td>可以先試</td><td>All Star（Smash Mouth）</td><td>電影《史瑞克》的知名歌曲，氣氛歡樂</td></tr>
          <tr><td>可以先試</td><td>Big Bad Frog（Austin &amp; Colin）</td><td>歌名很有童趣，但內容未確認，先看一下</td></tr>
          <tr><td>可以先試</td><td>Viva La Vida（Coldplay）</td><td>歌詞沒有不雅內容，但主題較抽象</td></tr>
          <tr><td>家長先看</td><td>APT.（ROSÉ &amp; Bruno Mars）</td><td>很紅也很洗腦，但靈感來自韓國的飲酒遊戲</td></tr>
          <tr><td>家長先看</td><td>Abracadabra、Zombieboy（Lady Gaga）</td><td>風格偏成人或偏暗黑，舞蹈也可能比較成熟</td></tr>
          <tr><td>先跳過</td><td>Thrift Shop（Macklemore &amp; Ryan Lewis）</td><td>原曲有粗話，遊戲版是否修改未查證</td></tr>
          <tr><td>先跳過</td><td>Anxiety（Doechii）</td><td>主題是焦慮，對這個年紀來說偏沉重</td></tr>
        </tbody>
      </table></div>
      <ul>
        <li><strong>迪士尼歌曲：</strong>2018 版有《海洋奇緣》的歌。</li>
        <li><strong>Baby Shark：</strong>資料顯示 2018 版有收錄，但小三孩子可能會覺得太幼稚。</li>
        <li><strong>Kids Mode：</strong>2018 到 2022 版才有。2018 版這個模式的歌是為 3 到 6 歲設計的。</li>
      </ul>
      <ul>
        <li><a href="https://news.ubisoft.com/es-es/article/74alWFzGpVLxk4lfLD0fbx/just-dance-2026-edition-song-list-and-new-mode-details">Ubisoft：Just Dance 2026 Edition 歌單</a></li>
        <li><a href="https://www.nme.com/guides/just-dance-2026-song-list-3881965">NME：Just Dance 2026 song list</a></li>
        <li><a href="https://news.ubisoft.com/en-us/article/2DKs9FAeTIECI2OuLJR9DH/just-dance-2018-kids-mode-tailors-experience-for-children">Ubisoft：Just Dance 2018 Kids Mode</a></li>
      </ul>
    `)}`, CC_NOTE + '歌單可能因版本或地區而異，請以遊戲內顯示為準。');

if (process.env.ZHUYIN_DUMP) {
  fs.writeFileSync(process.env.ZHUYIN_DUMP, JSON.stringify(used));
}
