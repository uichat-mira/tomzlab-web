/** Consumer-owned homepage copy, shared by React and the static build. */
export const siteHomeCopy = {
  name: "党靖涛的记事本",
  kicker: "GUANGZHOU / INDEPENDENT / AI PRODUCTS",
  english: "Personal notes, projects & experiments.",
  lede: "写一点生活，记一点工作。多半不是坐在桌前想出来的。",
  entries: [
    {
      id: "01 / NOTES",
      title: "记录与文字",
      description: "关于生活、阅读、随笔，以及一些还没有答案的问题。",
      url: "/notes",
    },
    {
      id: "02 / ENGINEERING",
      title: "工程与产品",
      description: "Mira 的研发实践、产品设计与技术复盘。",
      url: "/engineering",
    },
    {
      id: "03 / WEEKLY",
      title: "见π 周刊",
      description: "每周一期的编辑桌，记录科技、人物与值得琢磨的事情。",
      url: "/weekly",
    },
    {
      id: "04 / PROJECTS",
      title: "项目与实验",
      description: "个人作品、开放项目，还有认真折腾过的小东西。",
      url: "/projects",
    },
  ],
  aboutTitle: "这个站",
  aboutIntro: "这里是我在互联网上留下的一个地址。",
  about: "写下的东西在 tomz.io，做出来的东西在 mira.tomz.io。这里不打算再造一个内容世界，只是把那些写过的、做过的、值得留下的事情，整理成一份可以找到的目录。",
  aboutSecond: "不卖东西，也不靠广告换取注意力。页面或许会变，内容还会增加，但我希望这个地址长久保留。",
  closing: "希望十年后它还在。不管我在不在。",
} as const;
