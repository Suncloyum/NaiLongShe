# 奶龙社群传送门

[奶龙社.com](https://奶龙社.com)
一个支持社群搜索、滚动展示、随机访问和随机壁纸的导航页面。

## 社群信息

数据保存在 `communities/`，每个社群一个 JSON 文件。新增、修改、删除对应文件即可维护列表。

```json
{
  "name": "社群名称",
  "description": "社群简介",
  "url": "https://example.com",
  "type": "site",
  "keywords": ["游戏", "校园"]
}
```

`name` 必填；网站必须填写 `url`，QQ群聊必须填写 `qqNumber`，群链接可留空。`type` 为 `site`（网站）或 `group`（QQ群聊）；可选填 `organization`（学校/单位）和 `qqNumber`（群号）。

网页申请通过 PR 审核，合并后自动更新,可在界面内填写或自行提交PR。

- 壁纸来自 [Nailong-Studio/wallpaper](https://github.com/Nailong-Studio/wallpaper)。

## 许可证

本项目代码采用 [WTFPL](LICENSE)。第三方图片遵循其原有授权。
