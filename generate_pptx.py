import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def create_presentation():
    prs = Presentation()
    # 16:9 widescreen slides
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    # NASA Deep Space Palette
    BG_DARK = RGBColor(5, 11, 24)        # #050B18
    NAVY_CARD = RGBColor(11, 22, 44)     # #0B162C
    CYAN = RGBColor(111, 231, 238)       # #6FE7EE
    AMBER = RGBColor(245, 158, 11)       # #F59E0B
    WHITE = RGBColor(255, 255, 255)
    MUTED = RGBColor(148, 163, 184)      # #94A3B8
    LINK_COLOR = RGBColor(56, 189, 248)  # #38BDF8 Sky Blue

    blank_layout = prs.slide_layouts[6] # Blank slide layout

    def set_slide_background(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_DARK
        bg.line.fill.background()
        return bg

    def add_header(slide, slide_num, title, subtitle):
        tb = slide.shapes.add_textbox(Inches(0.8), Inches(0.45), Inches(11.733), Inches(1.2))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p0 = tf.paragraphs[0]
        p0.text = f"ASTRA MISSION TRAINER · NASA SPACE APPS 2026   |   SLIDE {slide_num} OF 7"
        p0.font.size = Pt(11)
        p0.font.bold = True
        p0.font.color.rgb = CYAN

        p1 = tf.add_paragraph()
        p1.text = title
        p1.font.size = Pt(28)
        p1.font.bold = True
        p1.font.color.rgb = WHITE
        p1.space_before = Pt(4)

        if subtitle:
            p2 = tf.add_paragraph()
            p2.text = subtitle
            p2.font.size = Pt(13)
            p2.font.color.rgb = MUTED
            p2.space_before = Pt(2)

    def add_card(slide, left, top, width, height, title, items, accent_color=CYAN):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = NAVY_CARD
        card.line.color.rgb = accent_color
        card.line.width = Pt(1.2)

        tb = slide.shapes.add_textbox(left + Inches(0.3), top + Inches(0.25), width - Inches(0.6), height - Inches(0.5))
        tf = tb.text_frame
        tf.word_wrap = True

        p_title = tf.paragraphs[0]
        p_title.text = title
        p_title.font.size = Pt(16)
        p_title.font.bold = True
        p_title.font.color.rgb = accent_color

        for item in items:
            p = tf.add_paragraph()
            p.space_before = Pt(7)

            if isinstance(item, tuple):
                # (label, url, description)
                label, url, desc = item
                r_bullet = p.add_run()
                r_bullet.text = "•  "
                r_bullet.font.size = Pt(11.5)
                r_bullet.font.color.rgb = WHITE

                r_label = p.add_run()
                r_label.text = f"{label}: "
                r_label.font.size = Pt(11.5)
                r_label.font.bold = True
                r_label.font.color.rgb = WHITE

                r_link = p.add_run()
                r_link.text = url
                r_link.font.size = Pt(11.5)
                r_link.font.bold = True
                r_link.font.underline = True
                r_link.font.color.rgb = LINK_COLOR
                r_link.hyperlink.address = url

                if desc:
                    r_desc = p.add_run()
                    r_desc.text = f"  ({desc})"
                    r_desc.font.size = Pt(10.5)
                    r_desc.font.color.rgb = MUTED
            else:
                r = p.add_run()
                r.text = f"•  {item}"
                r.font.size = Pt(11.5)
                r.font.color.rgb = WHITE

    # -------------------------------------------------------------
    # SLIDE 1: Title & Overview with Clickable Quick Links
    # -------------------------------------------------------------
    s1 = prs.slides.add_slide(blank_layout)
    set_slide_background(s1)

    tb1 = s1.shapes.add_textbox(Inches(1.0), Inches(1.0), Inches(11.333), Inches(5.8))
    tf1 = tb1.text_frame
    tf1.word_wrap = True

    p = tf1.paragraphs[0]
    p.text = "2026 NASA SPACE APPS CHALLENGE SUBMISSION  ·  PROJECT ID: astra-mission-trainer"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = CYAN

    p = tf1.add_paragraph()
    p.text = "astra-mission-trainer"
    p.font.size = Pt(46)
    p.font.bold = True
    p.font.color.rgb = WHITE
    p.space_before = Pt(8)

    p = tf1.add_paragraph()
    p.text = "ASTRA: Junior Astronaut Mission Trainer"
    p.font.size = Pt(22)
    p.font.color.rgb = CYAN
    p.space_before = Pt(4)

    p = tf1.add_paragraph()
    p.text = "A High-Fidelity Closed-Loop ECLSS Outpost Simulation & Astronaut Decision Training Platform"
    p.font.size = Pt(14)
    p.font.color.rgb = MUTED
    p.space_before = Pt(4)

    p = tf1.add_paragraph()
    p.text = "Mission Station: Artemis Base Beta · Mare Tranquillitatis (LAT 0.67°N, LONG 23.47°E)\nTarget Challenge: 90-Sol Closed-Loop Survival Cycle · Strict 4/4 Crew Survival Mandate"
    p.font.size = Pt(12)
    p.font.color.rgb = WHITE
    p.space_before = Pt(14)

    # Interactive Links Card on Title Slide
    p_links_hdr = tf1.add_paragraph()
    p_links_hdr.text = "PROJECT LINKS & DEPLOYMENTS:"
    p_links_hdr.font.size = Pt(12)
    p_links_hdr.font.bold = True
    p_links_hdr.font.color.rgb = AMBER
    p_links_hdr.space_before = Pt(18)

    links_data = [
        ("🌐 Live Web App (Vercel)", "https://astra-mission-trainer.vercel.app", "Interactive Single Page App"),
        ("⚡ Production API (Render)", "https://astra-mission-trainer-api.onrender.com", "FastAPI Simulation Engine"),
        ("📑 Interactive API Docs", "https://astra-mission-trainer-api.onrender.com/docs", "OpenAPI / Swagger Spec"),
        ("📦 Source Code (GitHub)", "https://github.com/shivavaibhav200407/nasa", "Full Stack Open Source"),
    ]

    for label, url, desc in links_data:
        p_lnk = tf1.add_paragraph()
        p_lnk.space_before = Pt(5)

        r_lbl = p_lnk.add_run()
        r_lbl.text = f"{label}: "
        r_lbl.font.size = Pt(12)
        r_lbl.font.bold = True
        r_lbl.font.color.rgb = WHITE

        r_url = p_lnk.add_run()
        r_url.text = url
        r_url.font.size = Pt(12)
        r_url.font.bold = True
        r_url.font.underline = True
        r_url.font.color.rgb = LINK_COLOR
        r_url.hyperlink.address = url

        r_d = p_lnk.add_run()
        r_d.text = f"   [{desc}]"
        r_d.font.size = Pt(11)
        r_d.font.color.rgb = MUTED

    # -------------------------------------------------------------
    # SLIDE 2: The Challenge & Mission Objective
    # -------------------------------------------------------------
    s2 = prs.slides.add_slide(blank_layout)
    set_slide_background(s2)
    add_header(s2, 2, "Challenge & Mission Objective", "Bridging aerospace ECLSS life-support physics with student STEM mission training.")

    add_card(s2, Inches(0.8), Inches(1.9), Inches(5.6), Inches(5.0), "The Deep-Space Challenge", [
        "Closed-Loop Mass Constraint: Lunar outposts cannot rely on frequent Earth resupply. Every drop of water and breath of oxygen must be recycled.",
        "Non-Regenerative Physics: Oxygen electrolysis consumes power and water; water recycling incurs irreversible losses.",
        "Catastrophic Cascades: A single subsystem failure (e.g. radiator dust accumulation or power shortage) triggers multi-system blackout.",
        "Educational Barrier: Real ECLSS concepts are often trapped in dense aerospace whitepapers without intuitive student interfaces."
    ], CYAN)

    add_card(s2, Inches(6.9), Inches(1.9), Inches(5.6), Inches(5.0), "The ASTRA Solution", [
        "90-Sol Command Role: Students assume the role of Mission Commander overseeing 4 specialist astronauts at Artemis Base Beta.",
        "Authentic Physical Realism: Governed by aerospace conservation laws (Sabatier reaction, water recovery loss fractions, cosmic ray shielding).",
        "Educational AI Co-Pilot: Explorer Mode provides dynamic pedagogical hints; Commander Mode provides unassisted flight operations.",
        "Strict Survival Invariant: Mission completes only if all 4 crew members survive the entire 90-day expedition."
    ], AMBER)

    # -------------------------------------------------------------
    # SLIDE 3: System Architecture & Coupled ECLSS Loops
    # -------------------------------------------------------------
    s3 = prs.slides.add_slide(blank_layout)
    set_slide_background(s3)
    add_header(s3, 3, "The 6 Coupled Life-Support Subsystems", "Physical modeling of closed-loop habitat mass balance and power distribution.")

    col_w = Inches(3.64)
    row_h = Inches(2.35)
    top_r1 = Inches(1.9)
    top_r2 = Inches(4.5)

    add_card(s3, Inches(0.8), top_r1, col_w, row_h, "1. Atmospheric O₂ Loop", [
        "21.0% O₂ target floor.",
        "Bosch/Sabatier CO₂ scrubbers.",
        "Water electrolysis feed consumption."
    ])
    add_card(s3, Inches(4.84), top_r1, col_w, row_h, "2. Hydrological Recovery", [
        "Greywater/urine distillation.",
        "Strict 10% unrecoverable loss fraction.",
        "Electrolysis & crew drinking demand."
    ])
    add_card(s3, Inches(8.88), top_r1, col_w, row_h, "3. Power & Microgrid Bus", [
        "PV solar array generation.",
        "120 kWh battery night storage.",
        "45 kW microgrid allocation."
    ])

    add_card(s3, Inches(0.8), top_r2, col_w, row_h, "4. Biological Food Production", [
        "15-day hydroponic crop cycle.",
        "Demands continuous light & water feed.",
        "Zero calories until harvest day."
    ], AMBER)
    add_card(s3, Inches(4.84), top_r2, col_w, row_h, "5. Radiation Attenuation", [
        "Regolith storm shelter posture.",
        "80% solar particle attenuation.",
        "Cosmic ray background dosimetry."
    ], AMBER)
    add_card(s3, Inches(8.88), top_r2, col_w, row_h, "6. Crew Biometrics", [
        "4 Specialist astronauts.",
        "Heart rate, vitals, stress, radiation.",
        "Mission fails if any astronaut dies."
    ], AMBER)

    # -------------------------------------------------------------
    # SLIDE 4: Mission Control Operations & HMI
    # -------------------------------------------------------------
    s4 = prs.slides.add_slide(blank_layout)
    set_slide_background(s4)
    add_header(s4, 4, "Mission Control Operations & HMI", "A cinematic, accessibility-compliant HUD modeled after NASA flight operations.")

    add_card(s4, Inches(0.8), Inches(1.9), Inches(5.6), Inches(5.0), "Mission Control Console", [
        "12-Channel Annunciator Panel: MIL-STD master caution and warning alarm system with auditory cues.",
        "2.5D Isometric Habitat Schematic: Interactive outpost view with live fluid and power conduit states.",
        "Subsystem Radial Gauges: Direct readout of oxygen, water, power, food, radiation, and crew health.",
        "Crew Biotelemetry Cards: Real-time monitoring of Dr. Elena Rostova, Marcus Chen, Sarah Jenkins, and Dr. Tariq Al-Mansoor."
    ], CYAN)

    add_card(s4, Inches(6.9), Inches(1.9), Inches(5.6), Inches(5.0), "Interactive Operations & Modes", [
        "Engineering Reallocation: Precise sliders for distributing power and water across subsystems.",
        "Dynamic Emergency Hazards: Solar particle events, ECLSS pump cavitation, and lunar dust storms with consequence trade-offs.",
        "Technical Flight Manual: Embedded reference manual detailing ECLSS loop equations and recovery protocols.",
        "Universal Accessibility: Full WCAG 2.1 AA compliance, high-contrast HUD, and reduce-motion options."
    ], CYAN)

    # -------------------------------------------------------------
    # SLIDE 5: Simulation Engine & Mathematical Realism
    # -------------------------------------------------------------
    s5 = prs.slides.add_slide(blank_layout)
    set_slide_background(s5)
    add_header(s5, 5, "Simulation Engine & Mathematical Realism", "Backend architecture ensuring deterministic physical integrity and zero hallucination.")

    add_card(s5, Inches(0.8), Inches(1.9), Inches(5.6), Inches(5.0), "Mathematical Invariants", [
        "Conservation of Mass: dO2/dt and dH2O/dt strictly balance crew metabolic consumption and electrolysis output.",
        "Irreversible Thermodynamic Losses: Recycled water always incurs minimum 10% brine loss.",
        "Biological Delay: Crops cannot be expedited; requires 15 continuous sols of watering and lighting.",
        "Dosimetry Accumulation: Cumulative radiation exposure linearly damages crew health and increases stress."
    ], CYAN)

    add_card(s5, Inches(6.9), Inches(1.9), Inches(5.6), Inches(5.0), "Backend Engine Architecture", [
        "FastAPI & Python 3.11: Sub-50ms REST execution for state advancement and telemetry polling.",
        "Verifiable Determinism: Seed-based pseudo-random event engine allows exact repeatability for classroom tournaments.",
        "Automated Quality Assurance: 24 comprehensive pytest tests enforcing physical invariants and edge-case survival.",
        "State Hash Verification: Checksum validation guarantees zero client-side state tampering."
    ], CYAN)

    # -------------------------------------------------------------
    # SLIDE 6: STEM Educational Pedagogy & Scoring
    # -------------------------------------------------------------
    s6 = prs.slides.add_slide(blank_layout)
    set_slide_background(s6)
    add_header(s6, 6, "STEM Educational Pedagogy & Scoring", "Empowering the next generation of Artemis explorers and life-support scientists.")

    add_card(s6, Inches(0.8), Inches(1.9), Inches(5.6), Inches(5.0), "Dual Educational Tiers", [
        "Explorer Mode (Beginner / STEM Classroom):",
        "  • Interactive AI Flight Assistant provides real-time warnings.",
        "  • Contextual educational popups explain stoichiometry and Sabatier physics.",
        "  • Forgiving margins designed for grades 6-12 inquiry-based learning.",
        "Commander Mode (Advanced / Flight Ready):",
        "  • Zero hints or AI handholding; unassisted flight manual execution.",
        "  • Harsh realistic penalties for power mismanagement or dehydration."
    ], AMBER)

    add_card(s6, Inches(6.9), Inches(1.9), Inches(5.6), Inches(5.0), "Comprehensive Mission Report", [
        "End-of-Mission Debriefing: Detailed performance analysis upon Sol 90 completion or premature failure.",
        "Scoring Metric: Evaluated on Crew Survival (0-4), Resource Efficiency (%), and Crisis Management score.",
        "Historical Telemetry Charts: Full 90-day time-series graphs of oxygen, water, power, and food.",
        "NASA Scientific Disclaimer: Clear notification that simulation uses educational gameplay approximations."
    ], AMBER)

    # -------------------------------------------------------------
    # SLIDE 7: Technology Stack & Official Submission Links
    # -------------------------------------------------------------
    s7 = prs.slides.add_slide(blank_layout)
    set_slide_background(s7)
    add_header(s7, 7, "Technology Stack & Official Submission Links", "Production-grade, cloud-deployed, and open-source under MIT License.")

    add_card(s7, Inches(0.8), Inches(1.9), Inches(5.6), Inches(5.0), "Production Tech Stack", [
        "Frontend Architecture:",
        "  • React 19, TypeScript, Tailwind CSS.",
        "  • Recharts for live telemetry analytics, Framer Motion animations.",
        "  • Web Audio API synthesizer for spatial alerts and mil-spec chimes.",
        "Backend Architecture:",
        "  • FastAPI, Python 3.11, Pydantic v2 schemas.",
        "  • SQLAlchemy + SQLite database persistence with automated migrations.",
        "  • 100% test pass rate (24 backend pytest + 21 frontend vitest tests)."
    ], CYAN)

    add_card(s7, Inches(6.9), Inches(1.9), Inches(5.6), Inches(5.0), "Official Submission Links (Clickable)", [
        ("Live Web App (Vercel)", "https://astra-mission-trainer.vercel.app", "Main Interactive Client"),
        ("Production API (Render)", "https://astra-mission-trainer-api.onrender.com", "Live Simulation Engine"),
        ("OpenAPI Documentation", "https://astra-mission-trainer-api.onrender.com/docs", "Interactive Swagger UI"),
        ("GitHub Repository", "https://github.com/shivavaibhav200407/nasa", "Full Source Code"),
        ("Space Apps Challenge", "https://www.spaceappschallenge.org/", "Official Event Portal"),
        "28-Second Demo Video: ASTRA_30s_SpaceApps_Demo.webm included in submission bundle."
    ], CYAN)

    output_path = r"c:\Users\Vaibhav\nasa\ASTRA_NASA_SpaceApps_Presentation.pptx"
    prs.save(output_path)
    print(f"Presentation saved successfully with active hyperlinks to {output_path}")

if __name__ == "__main__":
    create_presentation()
