from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    Flowable,
    Image,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "pdf"
OUT.mkdir(parents=True, exist_ok=True)
PDF_PATH = OUT / "ui-design-agent-kit-大创项目计划书.pdf"
LOGO_PATH = OUT / "ui-design-agent-kit-logo.png"
FONT_PATH = "/Library/Fonts/Arial Unicode.ttf"
if not Path(FONT_PATH).exists():
    FONT_PATH = "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"
pdfmetrics.registerFont(TTFont("CN", FONT_PATH))

PAGE_W, PAGE_H = A4
INK = colors.HexColor("#14231E")
MUTED = colors.HexColor("#62736B")
PAPER = colors.HexColor("#F5F7F3")
GREEN = colors.HexColor("#177656")
GREEN_LIGHT = colors.HexColor("#D9EEE3")
CORAL = colors.HexColor("#E95048")
CORAL_LIGHT = colors.HexColor("#FBE1DE")
BLUE = colors.HexColor("#416E8A")
LINE = colors.HexColor("#D7E0DA")

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="BodyCN", fontName="CN", fontSize=9.2, leading=16, textColor=INK, spaceAfter=5))
styles.add(ParagraphStyle(name="SmallCN", fontName="CN", fontSize=7.5, leading=11, textColor=MUTED, spaceAfter=3))
styles.add(ParagraphStyle(name="Label", fontName="CN", fontSize=7.5, leading=11, textColor=GREEN, spaceAfter=2))
styles.add(ParagraphStyle(name="H1CN", fontName="CN", fontSize=22, leading=29, textColor=INK, spaceAfter=9))
styles.add(ParagraphStyle(name="H2CN", fontName="CN", fontSize=14, leading=19, textColor=INK, spaceBefore=5, spaceAfter=7))
styles.add(ParagraphStyle(name="H3CN", fontName="CN", fontSize=10.5, leading=15, textColor=GREEN, spaceBefore=3, spaceAfter=3))
styles.add(ParagraphStyle(name="CoverTitle", fontName="CN", fontSize=29, leading=37, textColor=INK))
styles.add(ParagraphStyle(name="CoverSub", fontName="CN", fontSize=12, leading=19, textColor=MUTED))
styles.add(ParagraphStyle(name="TableHead", fontName="CN", fontSize=8.1, leading=12, textColor=colors.white))
styles.add(ParagraphStyle(name="TableBody", fontName="CN", fontSize=8, leading=12, textColor=INK))
styles.add(ParagraphStyle(name="CenterSmall", fontName="CN", fontSize=7.5, leading=11, textColor=MUTED, alignment=TA_CENTER))


def P(text, style="BodyCN"):
    return Paragraph(text, styles[style])


def cell(text, style="TableBody"):
    return P(text.replace("\n", "<br/>"), style)


def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(PAPER)
    canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.5)
    canvas.line(18 * mm, 14 * mm, PAGE_W - 18 * mm, 14 * mm)
    canvas.setFont("CN", 7)
    canvas.setFillColor(MUTED)
    canvas.drawString(18 * mm, 8.5 * mm, "UI Design Agent Kit · 项目计划书")
    canvas.drawRightString(PAGE_W - 18 * mm, 8.5 * mm, f"{doc.page:02d}")
    canvas.restoreState()


class ProcessDiagram(Flowable):
    def __init__(self, width=174 * mm, height=55 * mm):
        super().__init__()
        self.width = width
        self.height = height

    def wrap(self, avail_width, avail_height):
        return self.width, self.height

    def draw(self):
        c = self.canv
        c.saveState()
        stages = [("01", "需求", GREEN), ("02", "参考", BLUE), ("03", "契约", CORAL), ("04", "实现", GREEN), ("05", "验收", BLUE), ("06", "交付", CORAL)]
        x0, gap, box_w, box_h = 5 * mm, 2 * mm, 25 * mm, 22 * mm
        y = 20 * mm
        c.setStrokeColor(LINE)
        c.setLineWidth(1.3)
        c.line(x0 + box_w, y + box_h / 2, x0 + 5 * (box_w + gap) - gap, y + box_h / 2)
        for i, (num, label, color) in enumerate(stages):
            x = x0 + i * (box_w + gap)
            c.setFillColor(colors.white)
            c.setStrokeColor(color)
            c.roundRect(x, y, box_w, box_h, 2 * mm, fill=1, stroke=1)
            c.setFillColor(color)
            c.setFont("Helvetica-Bold", 8)
            c.drawCentredString(x + box_w / 2, y + box_h - 7 * mm, num)
            c.setFillColor(INK)
            c.setFont("CN", 9)
            c.drawCentredString(x + box_w / 2, y + 7 * mm, label)
        c.setFillColor(MUTED)
        c.setFont("CN", 7.5)
        c.drawCentredString(self.width / 2, 8 * mm, "每一阶段都有明确输入、处理方式和可复核输出")
        c.restoreState()


class ArchitectureDiagram(Flowable):
    def __init__(self, width=174 * mm, height=61 * mm):
        super().__init__()
        self.width = width
        self.height = height

    def wrap(self, avail_width, avail_height):
        return self.width, self.height

    def draw(self):
        c = self.canv
        c.saveState()
        layers = [
            ("输入层", "口语需求 · 参考页面 · 项目约束", GREEN_LIGHT, GREEN),
            ("智能体层", "主提示词 · 技能路由 · 设计契约", CORAL_LIGHT, CORAL),
            ("执行层", "界面实现 · 状态设计 · 真实浏览器检查", colors.white, BLUE),
            ("证据层", "截图 · 测试 · 来源 · README 交付", GREEN_LIGHT, GREEN),
        ]
        y = 5 * mm
        for label, body, fill, stroke in layers:
            c.setFillColor(fill)
            c.setStrokeColor(stroke)
            c.roundRect(4 * mm, y, self.width - 8 * mm, 10 * mm, 1.5 * mm, fill=1, stroke=1)
            c.setFillColor(stroke)
            c.setFont("CN", 8)
            c.drawString(10 * mm, y + 3.3 * mm, label)
            c.setFillColor(INK)
            c.setFont("CN", 8)
            c.drawString(38 * mm, y + 3.3 * mm, body)
            y += 13 * mm
        c.restoreState()


def section(kicker, title, intro):
    return [P(kicker, "Label"), P(title, "H1CN"), P(intro, "BodyCN"), Spacer(1, 3 * mm)]


def callout(title, body, fill=GREEN_LIGHT, accent=GREEN, width=174 * mm):
    t = Table([[P(title, "H3CN")], [P(body, "BodyCN")]], colWidths=[width])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), fill), ("BOX", (0, 0), (-1, -1), 0.6, accent),
        ("LINEBEFORE", (0, 0), (0, -1), 4, accent), ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10), ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    return t


def figure(path, width, height):
    return Image(str(path), width=width, height=height)


def build():
    doc = BaseDocTemplate(str(PDF_PATH), pagesize=A4, leftMargin=18 * mm, rightMargin=18 * mm, topMargin=16 * mm, bottomMargin=19 * mm, title="UI Design Agent Kit 大创项目计划书", author="UI Design Agent Kit")
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="main")
    doc.addPageTemplates([PageTemplate(id="main", frames=[frame], onPage=header_footer)])
    story = []

    # 1. Cover
    story.extend([Spacer(1, 22 * mm), Spacer(1, 10 * mm)])
    story.append(P("大创项目计划书", "Label"))
    story.append(P("UI Design Agent Kit", "CoverTitle"))
    story.append(P("面向 AI 界面开发的可验收设计工作流", "CoverSub"))
    story.append(Spacer(1, 13 * mm))
    story.append(P("项目定位", "H3CN"))
    story.append(P("将需求理解、界面设计、技术实现与浏览器验收组织为一条可复用的项目级工作流，帮助团队稳定地产出可运行、可检查、可复盘的界面方案。", "BodyCN"))
    story.append(Spacer(1, 18 * mm))
    cover = Table([[cell("项目定位"), cell("人工智能辅助设计与软件工程方法"), cell("计划周期"), cell("10 个月")], [cell("服务对象"), cell("高校创新团队、独立开发者、小型技术团队"), cell("文档类型"), cell("项目计划书正文")], [cell("核心问题"), cell("AI 生成界面缺少需求、边界与验收闭环"), cell("核心方法"), cell("需求 - 设计 - 实现 - 验收")]], colWidths=[24 * mm, 62 * mm, 24 * mm, 64 * mm])
    cover.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), colors.white), ("BACKGROUND", (0, 0), (0, -1), GREEN_LIGHT), ("BACKGROUND", (2, 0), (2, -1), GREEN_LIGHT), ("GRID", (0, 0), (-1, -1), 0.45, LINE), ("VALIGN", (0, 0), (-1, -1), "MIDDLE"), ("LEFTPADDING", (0, 0), (-1, -1), 6), ("RIGHTPADDING", (0, 0), (-1, -1), 6), ("TOPPADDING", (0, 0), (-1, -1), 8), ("BOTTOMPADDING", (0, 0), (-1, -1), 8)]))
    story.append(cover)
    story.append(Spacer(1, 19 * mm))
    story.append(P("本计划书围绕项目本身的背景、方案、技术、实施与风险展开。", "SmallCN"))
    story.append(PageBreak())

    # 2. Summary
    story.extend(section("01 · 项目摘要", "把一次生成变成一套可复用方法", "本项目针对 AI 生成界面过程中“需求说不清、设计难复盘、代码难验收”的连续问题，提出一套项目级工作流。"))
    summary = "UI Design Agent Kit 面向需要快速完成产品界面探索的高校创新团队、独立开发者和小型技术团队，提供从口语需求到可验收界面的完整方法。项目把工作拆为需求整理、参考调研、设计契约、界面实现、浏览器验收和文档交付六个阶段，使 AI 不再只是一次性输出页面，而是在明确目标、约束和检查标准后参与项目。项目当前以可安装的智能体指令、项目级技能和 React/Vite 成果展厅为主要载体，已有多类型界面案例、截图和验收记录作为方法验证基础。后续将通过校内创新项目和开发者社群试用，收集真实反馈，完善中文文档、模板和评价标准。项目预期形成一套可复用的 AI 界面开发流程，降低早期产品验证的沟通成本，提升界面交付的可解释性和可检查性。"
    story.append(callout("项目摘要", summary, colors.white, GREEN))
    story.append(Spacer(1, 8 * mm))
    grid = Table([[callout("研究目标", "建立一套可执行、可复盘、可验收的 AI 界面设计工作流", GREEN_LIGHT, GREEN, 82 * mm), callout("应用目标", "服务高校创新实践和早期产品验证，帮助团队更快形成可运行界面", CORAL_LIGHT, CORAL, 82 * mm)], [callout("方法目标", "把设计决策转成结构、token、状态和验收标准", colors.white, BLUE, 82 * mm), callout("评价目标", "以截图、测试、来源和用户反馈共同判断一次交付是否完成", colors.white, MUTED, 82 * mm)]], colWidths=[87 * mm, 87 * mm])
    grid.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 4), ("TOPPADDING", (0, 0), (-1, -1), 0), ("BOTTOMPADDING", (0, 0), (-1, -1), 5)]))
    story.append(grid)
    story.append(PageBreak())

    # 3. Background and demand
    story.extend(section("02 · 行业与用户需求", "AI 会写界面，不等于项目能交付", "项目从真实开发流程中的断点出发，关注的是“生成之后如何判断、如何修改、如何留下证据”。"))
    pain = Table([[cell("常见断点"), cell("具体表现"), cell("项目的应对方式")], [cell("需求断点"), cell("自然语言目标没有转成用户、任务、范围和非目标"), cell("先形成需求摘要和关键问题，再进入设计")], [cell("参考断点"), cell("参考页面、素材和授权边界没有被记录"), cell("按用途寻找参考，记录来源、使用位置和边界")], [cell("设计断点"), cell("页面好看但缺少结构、响应式和交互状态说明"), cell("建立设计契约，明确 token、组件、状态和动效规则")], [cell("验收断点"), cell("只看桌面截图，忽略移动、键盘、错误态和减少动效"), cell("使用真实浏览器检查关键状态，并保留证据")]], colWidths=[34 * mm, 67 * mm, 73 * mm], repeatRows=1)
    pain.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), INK), ("GRID", (0, 0), (-1, -1), 0.45, LINE), ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F0F5F1")]), ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 6), ("RIGHTPADDING", (0, 0), (-1, -1), 6), ("TOPPADDING", (0, 0), (-1, -1), 7), ("BOTTOMPADDING", (0, 0), (-1, -1), 7)]))
    story.append(pain)
    story.append(Spacer(1, 9 * mm))
    story.append(P("目标用户", "H2CN"))
    users = Table([[callout("高校创新团队", "需要在有限周期内把想法变成可展示、可评审的产品原型", GREEN_LIGHT, GREEN, 82 * mm), callout("独立开发者", "需要快速探索产品方向，同时保持代码和界面可以继续迭代", colors.white, BLUE, 82 * mm)], [callout("小型技术团队", "需要让产品、设计和开发之间有共同的交付标准", CORAL_LIGHT, CORAL, 82 * mm), callout("设计与开发协作者", "需要查看参考、设计依据和验收记录，而不是只接收最终截图", colors.white, MUTED, 82 * mm)]], colWidths=[87 * mm, 87 * mm])
    users.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 4), ("TOPPADDING", (0, 0), (-1, -1), 0), ("BOTTOMPADDING", (0, 0), (-1, -1), 5)]))
    story.append(users)
    story.append(PageBreak())

    # 4. Overall solution
    story.extend(section("03 · 项目总体方案", "一条可复用的证据链", "项目把一次界面任务拆解为六个相互衔接的阶段，上一阶段的输出成为下一阶段的输入。"))
    story.append(ProcessDiagram())
    story.append(Spacer(1, 5 * mm))
    stage_table = Table([[cell("阶段"), cell("输入"), cell("处理"), cell("输出")], [cell("需求整理"), cell("用户想法、业务目标"), cell("提炼用户、任务、范围、非目标"), cell("需求摘要、问题清单")], [cell("参考调研"), cell("目标场景、参考页面"), cell("比较结构、交互、素材和授权边界"), cell("参考短名单、采用边界")], [cell("设计契约"), cell("需求与参考结论"), cell("定义 Mission、token、组件、状态"), cell("设计契约、验收标准")], [cell("实现交互"), cell("契约、项目技术栈"), cell("完成界面、响应式和关键交互"), cell("可运行页面、状态样例")], [cell("浏览器验收"), cell("运行页面、检查清单"), cell("验证桌面、移动、键盘、错误态"), cell("截图、问题清单、修复记录")], [cell("文档交付"), cell("全部过程证据"), cell("整理运行方法、来源、限制和结果"), cell("README、项目交付包")]], colWidths=[26 * mm, 45 * mm, 60 * mm, 43 * mm], repeatRows=1)
    stage_table.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), GREEN), ("GRID", (0, 0), (-1, -1), 0.45, LINE), ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F0F5F1")]), ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 5), ("RIGHTPADDING", (0, 0), (-1, -1), 5), ("TOPPADDING", (0, 0), (-1, -1), 6), ("BOTTOMPADDING", (0, 0), (-1, -1), 6)]))
    story.append(stage_table)
    story.append(PageBreak())

    # 5. Product functions
    story.extend(section("04 · 产品功能设计", "六个模块，共同完成一次交付", "产品不是单一页面生成器，而是一组围绕项目任务组织的工作模块。"))
    function_table = Table([[cell("模块"), cell("功能说明"), cell("用户能得到什么")], [cell("需求整理"), cell("将口语描述整理为目标用户、核心任务、首版范围、非目标和待确认问题"), cell("一份能被团队共同确认的需求摘要")], [cell("参考分析"), cell("根据任务寻找成熟页面、组件或素材，区分观察、采用和待确认内容"), cell("有来源、有边界的参考清单")], [cell("设计契约"), cell("定义视觉方向、语义颜色、字体、布局、动效、响应式和可访问性约束"), cell("能指导实现和复查的设计规则")], [cell("实现指导"), cell("根据项目技术栈组织页面结构、组件状态、交互逻辑和数据边界"), cell("可运行的界面与关键状态")], [cell("浏览器验收"), cell("检查真实渲染结果，覆盖桌面、移动、键盘、错误态和减少动效"), cell("截图、问题记录和修复依据")], [cell("项目文档"), cell("将功能、运行方法、截图、限制、素材来源和验证记录写入 README"), cell("可复用、可交接的项目资料")]], colWidths=[31 * mm, 91 * mm, 52 * mm], repeatRows=1)
    function_table.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), INK), ("GRID", (0, 0), (-1, -1), 0.45, LINE), ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F0F5F1")]), ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 6), ("RIGHTPADDING", (0, 0), (-1, -1), 6), ("TOPPADDING", (0, 0), (-1, -1), 7), ("BOTTOMPADDING", (0, 0), (-1, -1), 7)]))
    story.append(function_table)
    story.append(Spacer(1, 7 * mm))
    workflow_img = ROOT / "showcase" / "products" / "screenshots" / "workflow.webp"
    story.append(figure(workflow_img, 174 * mm, 63.7 * mm))
    story.append(P("图 1 · 工作流输出示意：不同类型界面由同一套过程组织，但保留各自的内容和视觉表达。", "SmallCN"))
    story.append(PageBreak())

    # 6. Technical plan
    story.extend(section("05 · 技术方案", "让方法可以被项目真正执行", "技术方案以现有仓库能力为基础，重点保证流程可复用、边界可说明、结果可验证。"))
    story.append(ArchitectureDiagram())
    story.append(Spacer(1, 6 * mm))
    tech = Table([[cell("技术层"), cell("方案"), cell("选择理由")], [cell("指令与技能"), cell("项目级 SKILL.md、参考资料、任务模板和工具路由"), cell("把复杂设计经验变成可重复调用的工作步骤")], [cell("前端实现"), cell("React、TypeScript、Vite，沿用目标项目既有技术栈"), cell("适合快速构建交互页面，便于本地运行和验证")], [cell("展示与案例"), cell("独立成果展厅、案例卡片、截图和体验入口"), cell("将抽象方法转成可理解的界面证据")], [cell("验收与记录"), cell("Playwright/真实浏览器检查、截图、测试和来源台账"), cell("避免只凭口头描述判断完成度")], [cell("数据边界"), cell("当前以本地演示数据为主，不依赖账号、后台或真实业务数据"), cell("降低早期试验成本，明确项目能力边界")]], colWidths=[31 * mm, 78 * mm, 65 * mm], repeatRows=1)
    tech.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), GREEN), ("GRID", (0, 0), (-1, -1), 0.45, LINE), ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F0F5F1")]), ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 6), ("RIGHTPADDING", (0, 0), (-1, -1), 6), ("TOPPADDING", (0, 0), (-1, -1), 7), ("BOTTOMPADDING", (0, 0), (-1, -1), 7)]))
    story.append(tech)
    story.append(Spacer(1, 7 * mm))
    story.append(callout("技术原则", "不把 AI 输出直接当成最终产品；所有关键页面都要经过项目约束、响应式检查和浏览器验收。外部参考只影响观察和方法，不直接复制未经确认的代码或素材。", CORAL_LIGHT, CORAL))
    story.append(PageBreak())

    # 7. Innovation and application
    story.extend(section("06 · 项目创新点", "创新不在于多生成一张图，而在于改变交付方式", "项目将 AI 的生成能力放进一个有顺序、有边界、有反馈的工程流程中。"))
    innovations = Table([[callout("创新一：从生成页面到生成过程", "把需求、参考、设计、实现和验收拆开，降低单次提示词质量对结果的影响", GREEN_LIGHT, GREEN, 82 * mm), callout("创新二：把设计变成契约", "用 Mission、token、状态、响应式和动效规则描述界面，便于团队协作和后续修改", CORAL_LIGHT, CORAL, 82 * mm)], [callout("创新三：把验收前置", "把桌面、移动、键盘、错误态和减少动效纳入交付标准，而不是发布后才发现问题", colors.white, BLUE, 82 * mm), callout("创新四：保留证据链", "记录截图、来源、限制和修复结果，让一次项目可以被复盘和复用", colors.white, MUTED, 82 * mm)]], colWidths=[87 * mm, 87 * mm])
    innovations.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 4), ("TOPPADDING", (0, 0), (-1, -1), 0), ("BOTTOMPADDING", (0, 0), (-1, -1), 5)]))
    story.append(innovations)
    story.append(Spacer(1, 8 * mm))
    story.append(P("适用场景", "H2CN"))
    apply_table = Table([[cell("场景"), cell("使用方式"), cell("主要价值")], [cell("课程与大创项目"), cell("从选题说明开始，逐阶段形成需求、原型和验收材料"), cell("过程可记录，便于指导和评审")], [cell("早期产品验证"), cell("用工作流快速试验不同页面方向和用户流程"), cell("减少返工，快速发现任务和状态问题")], [cell("开发者个人项目"), cell("把零散想法整理成可运行页面和项目 README"), cell("降低从想法到可交互原型的门槛")], [cell("团队协作交接"), cell("用设计契约和验收证据连接产品、设计和开发"), cell("减少信息遗漏和口头依赖")]], colWidths=[37 * mm, 76 * mm, 61 * mm], repeatRows=1)
    apply_table.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), INK), ("GRID", (0, 0), (-1, -1), 0.45, LINE), ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F0F5F1")]), ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 6), ("RIGHTPADDING", (0, 0), (-1, -1), 6), ("TOPPADDING", (0, 0), (-1, -1), 7), ("BOTTOMPADDING", (0, 0), (-1, -1), 7)]))
    story.append(apply_table)
    story.append(Spacer(1, 7 * mm))
    story.append(figure(ROOT / "showcase" / "products" / "media" / "nodegrid.webp", 84 * mm, 45.2 * mm))
    story.append(P("图 2 · 界面输出示意：复杂信息可被组织成可观察的交互页面。图片仅用于说明界面形态，不代表业务数据。", "SmallCN"))
    story.append(PageBreak())

    # 8. Implementation plan
    story.extend(section("07 · 项目实施计划", "十个月，四个阶段，逐步验证", "实施节奏围绕“先理解问题，再完善流程，最后扩大试用”展开。"))
    schedule = Table([[cell("阶段"), cell("时间"), cell("工作内容"), cell("阶段交付")], [cell("第一阶段：调研与定义"), cell("第 1-2 月"), cell("访谈 3-5 个目标用户；整理典型任务、失败案例和评价维度"), cell("需求报告、用户任务清单")], [cell("第二阶段：流程与原型"), cell("第 3-4 月"), cell("完善六阶段工作流、模板、设计契约和基础案例"), cell("工作流 v1、模板、原型")], [cell("第三阶段：试用与迭代"), cell("第 5-7 月"), cell("邀请 2-3 个校内或社群项目试用；记录过程和反馈"), cell("试用记录、问题日志、修订版")], [cell("第四阶段：总结与发布"), cell("第 8-10 月"), cell("整理案例、截图、验收标准、使用手册和项目总结"), cell("工作流 v2、使用手册、结项材料")]], colWidths=[37 * mm, 23 * mm, 76 * mm, 38 * mm], repeatRows=1)
    schedule.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), GREEN), ("GRID", (0, 0), (-1, -1), 0.45, LINE), ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F0F5F1")]), ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 6), ("RIGHTPADDING", (0, 0), (-1, -1), 6), ("TOPPADDING", (0, 0), (-1, -1), 7), ("BOTTOMPADDING", (0, 0), (-1, -1), 7)]))
    story.append(schedule)
    story.append(Spacer(1, 8 * mm))
    story.append(P("计划指标", "H2CN"))
    targets = Table([[cell("指标类别"), cell("计划目标"), cell("核验方式")], [cell("流程验证"), cell("完成至少 3 个不同类型任务的完整工作流记录"), cell("过程文件、截图和复盘记录")], [cell("用户验证"), cell("收集 3-5 个试用团队的结构化反馈"), cell("访谈纪要、问卷和问题日志")], [cell("交付质量"), cell("每个试点保留桌面、移动和关键状态检查证据"), cell("浏览器验收记录")], [cell("方法沉淀"), cell("形成 1 套中文使用手册、模板和评价清单"), cell("版本记录和最终文档")]], colWidths=[37 * mm, 80 * mm, 57 * mm], repeatRows=1)
    targets.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), INK), ("GRID", (0, 0), (-1, -1), 0.45, LINE), ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F0F5F1")]), ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 6), ("RIGHTPADDING", (0, 0), (-1, -1), 6), ("TOPPADDING", (0, 0), (-1, -1), 7), ("BOTTOMPADDING", (0, 0), (-1, -1), 7)]))
    story.append(targets)
    story.append(PageBreak())

    # 9. Risks
    story.extend(section("08 · 风险与保障措施", "把不确定性写进项目管理", "项目将风险视为工作流设计的一部分，通过边界、记录和复查来控制影响。"))
    risks = Table([[cell("风险"), cell("可能影响"), cell("保障措施")], [cell("AI 输出不稳定"), cell("同一需求得到差异较大的界面或代码"), cell("固定需求摘要和设计契约；把验收作为必经环节；保留修改记录")], [cell("过度追求视觉效果"), cell("页面好看但任务、内容和状态不清晰"), cell("先验证用户任务和信息层级，再做视觉表达")], [cell("案例被误读为真实业务"), cell("无法区分演示页面与真实产品"), cell("所有演示数据和历史截图明确标注，禁止编造客户或营收信息")], [cell("外部参考授权不清"), cell("公开发布时存在素材或代码合规风险"), cell("建立来源台账；未确认的内容只作参考，不进入交付包")], [cell("用户使用门槛较高"), cell("团队只使用生成环节，跳过设计和验收"), cell("提供中文模板、示例任务和分阶段检查清单")]], colWidths=[37 * mm, 58 * mm, 79 * mm], repeatRows=1)
    risks.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), CORAL), ("GRID", (0, 0), (-1, -1), 0.45, LINE), ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#FFF4F2")]), ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 6), ("RIGHTPADDING", (0, 0), (-1, -1), 6), ("TOPPADDING", (0, 0), (-1, -1), 7), ("BOTTOMPADDING", (0, 0), (-1, -1), 7)]))
    story.append(risks)
    story.append(Spacer(1, 9 * mm))
    story.append(P("质量保障闭环", "H2CN"))
    story.append(ProcessDiagram())
    story.append(Spacer(1, 4 * mm))
    story.append(callout("项目边界", "本项目不承诺无人监督地自动完成商业系统，不依赖真实客户数据，不将生成结果直接视为最终交付。项目的核心评价是流程是否可理解、页面是否可运行、关键状态是否可检查、过程是否能复盘。", CORAL_LIGHT, CORAL))
    story.append(PageBreak())

    # 10. Outputs and conclusion
    story.extend(section("09 · 预期项目产出", "形成一套能被使用和复盘的方法", "项目结项时，交付重点是可复用的工作流、文档和验证标准。"))
    outputs = Table([[cell("产出"), cell("内容"), cell("用途")], [cell("工作流文件"), cell("六阶段流程、需求模板、设计契约和验收清单"), cell("指导新项目从需求进入到验收")], [cell("技能与提示词"), cell("项目级角色说明、技能路由、任务模板和边界规则"), cell("让 AI 按项目上下文执行，而不是只做一次回答")], [cell("案例与截图"), cell("不同类型界面任务的过程记录和关键状态截图"), cell("帮助新用户理解抽象方法如何落到页面")], [cell("使用手册"), cell("安装方法、使用步骤、常见问题和限制说明"), cell("降低团队第一次使用的学习成本")], [cell("评价标准"), cell("需求清晰度、界面可用性、响应式、可访问性和证据完整度"), cell("支持自查、指导和项目复盘")]], colWidths=[35 * mm, 83 * mm, 56 * mm], repeatRows=1)
    outputs.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), GREEN), ("GRID", (0, 0), (-1, -1), 0.45, LINE), ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F0F5F1")]), ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 6), ("RIGHTPADDING", (0, 0), (-1, -1), 6), ("TOPPADDING", (0, 0), (-1, -1), 7), ("BOTTOMPADDING", (0, 0), (-1, -1), 7)]))
    story.append(outputs)
    story.append(Spacer(1, 11 * mm))
    story.append(P("结论", "H2CN"))
    story.append(P("AI 正在降低界面开发的门槛，但真正决定项目质量的，仍然是问题是否被理解、设计是否有依据、实现是否符合约束、结果是否经过检查。UI Design Agent Kit 以项目级工作流为核心，把这些容易被忽略的环节连接起来，为高校创新实践和早期产品验证提供一套轻量、可复用、可复盘的方法。通过持续试用和反馈迭代，项目将逐步完善模板、案例和评价标准，使 AI 参与的界面开发从“生成一个页面”走向“完成一次有证据的项目交付”。", "BodyCN"))
    story.append(Spacer(1, 7 * mm))
    story.append(callout("事实与素材说明", "文中技术栈、工作流结构和界面截图基于现有项目仓库资料；截图中的案例、商品、库存、文章和节点数据均为演示或历史记录，不代表真实客户、营收或业务规模。", GREEN_LIGHT, GREEN))
    story.append(Spacer(1, 8 * mm))
    story.append(P("项目说明、媒体来源和验收记录作为本计划书的编写依据。", "SmallCN"))

    doc.build(story)
    print(PDF_PATH)


if __name__ == "__main__":
    build()
