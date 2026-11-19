/*
 * ============ 游戏数据：新增游戏只需在这里加一条 ============
 * id        唯一标识
 * title     中文名            en       英文副标题
 * url       游戏地址（相对游戏大厅首页）
 * desc      简介（卡片与推荐位共用）
 * category  画面维度：3D / 2D，会自动生成筛选按钮
 * genre     游戏类型，必须是 GENRES 里的一项（类型筛选按钮按 GENRES 顺序生成）
 * tags      标签数组
 * added     本站上架日期 YYYY-MM-DD（用于排序）
 * colors    封面渐变 [主色, 副色]，主色也是推荐位的强调色
 * glyph     封面大字
 * cover     可选：封面图片地址，填写后替代自动生成的封面
 * preview   仅供预览的条目设为 true，可玩游戏自动进入「即刻开玩」轮播
 */
/* 游戏类型：name 为筛选按钮与卡片上显示的中文名，en 为业内通用缩写，desc 用于按钮悬停说明 */
const GENRES = [
  { name: "竞速", en: "RAC", desc: "Racing：赛车、卡丁车、开放世界驾驶" },
  { name: "射击", en: "STG", desc: "Shooting：大逃杀、坦克对战、载具射击" },
  { name: "平台跳跃", en: "ACT", desc: "Platformer：横版跑跳闯关" },
  { name: "肉鸽", en: "Roguelite", desc: "Roguelite：随机构筑、类幸存者割草" },
  { name: "模拟经营", en: "SIM", desc: "Simulation：农场、小镇建设与经营" },
  { name: "塔防", en: "TD", desc: "Tower Defense：布阵种植、守住防线" },
  { name: "派对乱斗", en: "PARTY", desc: "Party Brawler：多人同屏、短局对战的欢乐乱斗" }
];

// 仅列出已上架的游戏。
const GAMES = [
  {
    id: "tanke3d",
    title: "坦克大战 3D",
    en: "BATTLE CITY 3D",
    url: "tanke3d.html",
    cover: "covers/tanke3d.webp",
    desc: "在立体战场中守卫鹰徽基地，单人或同屏双人迎战 35 关。可旋转视角，也可切换俯视。",
    category: "3D",
    genre: "射击",
    tags: ["坦克", "基地防守", "同屏双人"],
    added: "2026-11-19",
    colors: ["#3ee6ff", "#2f5bd8"],
    glyph: "坦"
  },
  {
    id: "tank2d",
    title: "坦克大战 2D",
    en: "BATTLE CITY",
    url: "tank2d.html",
    cover: "covers/tank2d.webp",
    desc: "守住鹰徽基地，打穿砖墙，在 35 个关卡中迎击敌军。支持单人、同屏双人和手机触控。",
    category: "2D",
    genre: "射击",
    tags: ["坦克", "基地防守", "同屏双人", "支持手机"],
    added: "2026-11-19",
    colors: ["#c6f432", "#2f9e44"],
    glyph: "坦"
  }
];
