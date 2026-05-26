from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle, Spacer
from reportlab.lib import colors

def create_timeline_pdf(filename):
    doc = SimpleDocTemplate(filename, pagesize=letter)
    elements = []
    
    styles = getSampleStyleSheet()
    title_style = styles['Heading1']
    title_style.alignment = 1 # Center
    
    elements.append(Paragraph("Cloud-Watch: Project Timeline", title_style))
    elements.append(Spacer(1, 20))
    
    data = [
        ["Timeline", "Key Project Activities", "Goals / Milestones"],
        ["Week 1", "System Infrastructure\n& Setup", "Finalize database schema, user roles, geospatial (PostGIS)\nelements. Backend APIs live on staging server."],
        ["Week 2", "AI-Verification\nIntegration", "Implement NSFWJS and Hugging Face pipelines for automated\nimage verification and triage."],
        ["Week 3", "Bot Deployment", "Deploy and test Telegram and WhatsApp webhooks for\nseamless crowdsourced data intake."],
        ["Week 4", "Internal Alpha\nTesting", "Conduct end-to-end data pipeline testing (Bot -> Backend ->\nAI check). Fix bugs and latency issues."],
        ["Week 5", "Dashboard\nEnhancement", "Deploy React-based SOC dashboard with incident mapping,\nreal-time analytics, and role-based auth."],
        ["Week 6", "System Security &\nUAT", "Execute security audits and User Acceptance Testing (UAT).\nRefine UX based on feedback."],
        ["Week 7", "Community Pilot\nPreparation", "Onboard early-adopter local responders/users. Develop\ntraining materials and distribute promotional messages."],
        ["Week 8", "Pilot Launch", "Officially launch the platform to pilot community. Actively\nmonitor systems, server loads, and handle live reports."],
        ["Week 9", "Evaluation &\nReporting", "Analyze system metrics (time-to-alert, reports handled).\nDocument impact and prepare final presentation."],
    ]
    
    table = Table(data, colWidths=[60, 150, 250])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('TOPPADDING', (0, 1), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    
    elements.append(table)
    doc.build(elements)

def create_budget_pdf(filename):
    doc = SimpleDocTemplate(filename, pagesize=letter)
    elements = []
    
    styles = getSampleStyleSheet()
    title_style = styles['Heading1']
    title_style.alignment = 1 # Center
    
    elements.append(Paragraph("Cloud-Watch: Seed Fund Budget", title_style))
    elements.append(Spacer(1, 20))
    
    data = [
        ["Expense Category", "Item Description", "Estimated Cost"],
        ["Cloud Hosting", "Production servers and database hosting\n(e.g., Render/AWS) for 6 months", "$ 150.00"],
        ["Database", "Managed scalable PostgreSQL with PostGIS\ncapabilities for spatial queries", "$ 100.00"],
        ["AI / APIs", "Third-party AI usage (Hugging Face) &\nWhatsApp Business outbound charges", "$ 150.00"],
        ["Marketing &\nOutreach", "SMS credits, social media boosting, printed\nmaterials for pilot launch", "$ 100.00"],
        ["TOTAL", "", "$ 500.00"]
    ]
    
    table = Table(data, colWidths=[100, 260, 100])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, 0), 'LEFT'),
        ('ALIGN', (2, 0), (2, -1), 'RIGHT'), # right align currency
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -2), colors.beige),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
        ('ALIGN', (0, 1), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -2), 1, colors.black),
        ('LINEBELOW', (0, -2), (-1, -2), 2, colors.black), # thick line before total
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('TOPPADDING', (0, 1), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('ALIGN', (2, 1), (2, -1), 'RIGHT'),
    ]))
    
    elements.append(table)
    
    elements.append(Spacer(1, 40))
    elements.append(Paragraph("<b>Other Resources Needed (In-kind / Not covered by Seed Fund):</b>", styles['Normal']))
    elements.append(Spacer(1, 10))
    elements.append(Paragraph("- Personal development time (Sweat equity).", styles['Normal']))
    elements.append(Paragraph("- Open-source libraries and frameworks (React, FastAPI, Docker).", styles['Normal']))
    elements.append(Paragraph("- Volunteer testing from local community tech groups.", styles['Normal']))
    
    doc.build(elements)

if __name__ == "__main__":
    create_timeline_pdf("project_timeline.pdf")
    create_budget_pdf("seed_fund_budget.pdf")
    print("PDFs generated successfully!")
