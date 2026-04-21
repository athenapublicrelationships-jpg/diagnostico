import { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const COLORS = {
  bg: "#f8f7f3",
  accent: "#fa5170",
  black: "#111111",
  white: "#ffffff",
  gray: "#6b6b6b",
  lightGray: "#e8e7e2",
};

const fontTitle = "'Playfair Display', serif";
const fontBody = "'League Spartan', sans-serif";

const cssStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=League+Spartan:wght@300;400;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #f8f7f3; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
  .btn-scale { flex: 1; padding: 14px 0; border-radius: 4px; font-weight: 800; font-size: 18px; cursor: pointer; transition: all 0.15s; border: 2px solid; font-family: 'League Spartan', sans-serif; }
  @media (max-width: 600px) {
    .grid-2 { grid-template-columns: 1fr !important; }
    .intro-card { padding: 28px 20px !important; }
    .intro-title { font-size: 28px !important; }
    .module-header { padding: 20px 20px !important; }
    .module-header h2 { font-size: 20px !important; }
    .module-body { padding: 20px 16px 20px !important; }
    .scale-row { gap: 6px !important; }
    .btn-scale { padding: 12px 0 !important; font-size: 16px !important; }
    .results-header { padding: 28px 20px !important; }
    .results-header h1 { font-size: 24px !important; }
    .results-score { font-size: 56px !important; }
    .results-body { padding: 20px !important; }
    .nav-btns { flex-direction: column !important; }
    .tags-wrap { gap: 6px !important; }
    .tag { font-size: 11px !important; padding: 4px 10px !important; }
  }
`;

const SHEETS_URL = "https://script.google.com/macros/s/AKfycbwrHwg2WkLE88MmKg1hympZXMlKMy_gtU8CxpH2J0cZ7O23qi_jIV1H4U5dIDbMLA_dbQ/exec";
const moduleColors = ["#fa5170","#111111","#fa5170","#111111","#fa5170","#111111"];

const CONSULTORA = {
  nombre: "ATHENA PR",
  descripcion: "Consultora de Relaciones Públicas & Comunicación",
  telefono: "+54 9 280 441-5599",
  email: "hola@athenapr.com.ar",
  web: "www.athenapr.com.ar",
  direccion: "Marcos A. Zar 523, Puerto Madryn, Argentina",
};

const modules = [
  {
    id: 1, title: "Comunicación Interna", icon: "🏢",
    questions: [
      { id: "ci1", text: "¿La empresa cuenta con canales formales de comunicación interna (newsletter, intranet, reuniones periódicas)?", type: "scale" },
      { id: "ci2", text: "¿Los empleados reciben información clara y oportuna sobre decisiones y cambios organizacionales?", type: "scale" },
      { id: "ci3", text: "¿Existe un espacio formal para que los empleados expresen sus opiniones o sugerencias?", type: "scale" },
      { id: "ci4", text: "¿Con qué frecuencia se realizan reuniones de equipo o asambleas internas?", type: "choice", options: ["Diariamente", "Semanalmente", "Mensualmente", "Esporádicamente", "No se realizan"] },
      { id: "ci5", text: "¿Qué canales de comunicación interna utiliza principalmente la empresa?", type: "multi", options: ["Email", "WhatsApp / Telegram", "Intranet / plataforma interna", "Reuniones presenciales", "Videoconferencias", "Cartelería física"] },
    ]
  },
  {
    id: 2, title: "Comunicación Externa", icon: "📢",
    questions: [
      { id: "ce1", text: "¿La empresa tiene definido un mensaje institucional claro hacia sus públicos externos?", type: "scale" },
      { id: "ce2", text: "¿Se comunican de manera proactiva novedades, logros o cambios relevantes a clientes y proveedores?", type: "scale" },
      { id: "ce3", text: "¿Existe coherencia entre la comunicación que se emite por los distintos canales externos?", type: "scale" },
      { id: "ce4", text: "¿La empresa tiene identificados y segmentados a sus públicos externos?", type: "choice", options: ["Sí, claramente definidos", "Parcialmente", "Están en proceso de definición", "No están definidos"] },
      { id: "ce5", text: "¿Con qué frecuencia se emiten comunicados o contenidos hacia el exterior?", type: "choice", options: ["Diariamente", "Varias veces por semana", "Mensualmente", "Cuando surge algo importante", "Raramente"] },
    ]
  },
  {
    id: 3, title: "Relaciones Públicas y Reputación", icon: "🤝",
    questions: [
      { id: "rp1", text: "¿La empresa mantiene vínculos activos con medios de comunicación?", type: "scale" },
      { id: "rp2", text: "¿Se trabaja activamente en la construcción y cuidado de la imagen institucional?", type: "scale" },
      { id: "rp3", text: "¿La empresa participa en eventos, asociaciones o espacios de su sector o comunidad?", type: "scale" },
      { id: "rp4", text: "¿Cómo evaluaría la reputación actual de la empresa en su sector?", type: "choice", options: ["Muy buena", "Buena", "Regular", "Necesita mejoras", "No lo sabemos"] },
      { id: "rp5", text: "¿La empresa cuenta con un vocero o portavoz oficial ante los medios?", type: "choice", options: ["Sí, hay un vocero designado", "Lo hace el/la CEO o director/a", "No hay un vocero definido", "Depende de la situación"] },
    ]
  },
  {
    id: 4, title: "Gestión de Crisis", icon: "🛡️",
    questions: [
      { id: "gc1", text: "¿La empresa cuenta con un protocolo o manual de gestión de crisis comunicacional?", type: "scale" },
      { id: "gc2", text: "¿El equipo directivo está capacitado para comunicar en situaciones de crisis?", type: "scale" },
      { id: "gc3", text: "¿Se realizan simulacros o ejercicios de preparación ante posibles crisis?", type: "scale" },
      { id: "gc4", text: "¿Ha atravesado la empresa una crisis de comunicación en los últimos 3 años?", type: "choice", options: ["Sí, y fue gestionada exitosamente", "Sí, y no fue bien gestionada", "No hemos tenido crisis", "Tuvimos situaciones menores"] },
      { id: "gc5", text: "¿Qué áreas están involucradas en la gestión de una posible crisis?", type: "multi", options: ["Alta dirección", "Comunicación / RRPP", "Legal", "RRHH", "Operaciones", "No está definido"] },
    ]
  },
  {
    id: 5, title: "Presencia Digital", icon: "🌐",
    questions: [
      { id: "pd1", text: "¿La empresa tiene una presencia digital activa y coherente con su identidad institucional?", type: "scale" },
      { id: "pd2", text: "¿Se monitorea la reputación online y las menciones de la marca en internet?", type: "scale" },
      { id: "pd3", text: "¿Existe una estrategia de contenidos para redes sociales y/o sitio web?", type: "scale" },
      { id: "pd4", text: "¿En qué plataformas digitales tiene presencia activa la empresa?", type: "multi", options: ["Sitio web propio", "LinkedIn", "Instagram", "Facebook", "X / Twitter", "YouTube", "TikTok", "Google Business"] },
      { id: "pd5", text: "¿Con qué frecuencia se publica contenido en redes sociales?", type: "choice", options: ["Diariamente", "Varias veces por semana", "Semanalmente", "Mensualmente", "Sin frecuencia definida"] },
    ]
  },
  {
    id: 6, title: "Estrategia y Planificación", icon: "📊",
    questions: [
      { id: "ep1", text: "¿La empresa cuenta con un plan de comunicación formal y actualizado?", type: "scale" },
      { id: "ep2", text: "¿Se definen objetivos de comunicación alineados a los objetivos del negocio?", type: "scale" },
      { id: "ep3", text: "¿Se mide el impacto de las acciones de comunicación realizadas?", type: "scale" },
      { id: "ep4", text: "¿Existe un área o responsable exclusivo de comunicación y RRPP?", type: "choice", options: ["Sí, hay un área dedicada", "Hay una persona responsable", "Lo maneja Marketing", "Lo maneja la dirección", "No hay un responsable definido"] },
      { id: "ep5", text: "¿Con qué presupuesto cuenta la empresa para comunicación y RRPP?", type: "choice", options: ["Presupuesto anual definido", "Presupuesto flexible según necesidad", "Presupuesto muy limitado", "No hay presupuesto asignado"] },
    ]
  }
];

const scaleLabels = ["Muy bajo", "Excelente"];

export default function App() {
  const [step, setStep] = useState("intro");
  const [currentModule, setCurrentModule] = useState(0);
  const [answers, setAnswers] = useState({});
  const [companyName, setCompanyName] = useState("");
  const [sector, setSector] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState("");
  const [dataSent, setDataSent] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const mod = modules[currentModule];
  const modColor = moduleColors[currentModule];

  const allAnswered = mod?.questions.every(q => {
    if (q.type === "multi") return answers[q.id]?.length > 0;
    return answers[q.id] !== undefined && answers[q.id] !== "";
  });

  const setScale = (id, val) => setAnswers(a => ({ ...a, [id]: val }));
  const setChoice = (id, val) => setAnswers(a => ({ ...a, [id]: val }));
  const toggleMulti = (id, opt) => setAnswers(a => {
    const prev = a[id] || [];
    return { ...a, [id]: prev.includes(opt) ? prev.filter(x => x !== opt) : [...prev, opt] };
  });

  const calcScores = () => modules.map((m, i) => {
    const scaleQs = m.questions.filter(q => q.type === "scale");
    const total = scaleQs.reduce((sum, q) => sum + (answers[q.id] || 0), 0);
    const max = scaleQs.length * 5;
    return { title: m.title, icon: m.icon, score: max > 0 ? Math.round((total / max) * 100) : 0 };
  });

  const getLevel = score => {
    if (score >= 80) return { label: "Avanzado", color: "#111111" };
    if (score >= 70) return { label: "En desarrollo", color: "#fa5170" };
    if (score >= 40) return { label: "Básico", color: "#fa5170" };
    return { label: "Crítico", color: "#fa5170" };
  };

  const totalScore = () => Math.round(calcScores().reduce((s, m) => s + m.score, 0) / modules.length);

  const saveToSheets = (data) => {
    fetch(SHEETS_URL, {
      method: "POST", mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).catch(e => console.error("Sheets error:", e));
  };

  const saveLeadToSheets = () => saveToSheets({
    company_name: companyName, sector: sector || "No especificado",
    contact_name: contactName, contact_email: email,
    total_score: "—", global_level: "Diagnóstico iniciado",
    score_1: "—", score_2: "—", score_3: "—", score_4: "—", score_5: "—", score_6: "—",
    priority_areas: "Aún no completado",
  });

  const saveResultToSheets = (scores, total) => {
    if (dataSent) return;
    const level = getLevel(total);
    const priorities = scores.filter(s => s.score < 70);
    saveToSheets({
      company_name: companyName, sector: sector || "No especificado",
      contact_name: contactName, contact_email: email,
      total_score: total + "%", global_level: level.label,
      score_1: scores[0].score + "%", score_2: scores[1].score + "%",
      score_3: scores[2].score + "%", score_4: scores[3].score + "%",
      score_5: scores[4].score + "%", score_6: scores[5].score + "%",
      priority_areas: priorities.length === 0 ? "Sin áreas críticas" : priorities.map(s => s.title + ": " + s.score + "%").join(" | "),
    });
    setDataSent(true);
  };

  const generatePDF = async (scores, total, level) => {
    setPdfLoading(true);
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const W = 210, pad = 18;

      // Header negro
      doc.setFillColor(17, 17, 17);
      doc.rect(0, 0, W, 48, "F");

      // Logo ATHENA PR
      doc.setTextColor(250, 81, 112);
      doc.setFontSize(24); doc.setFont("helvetica", "bold");
      doc.text("ATHENA PR", pad, 22);
      doc.setFontSize(9); doc.setFont("helvetica", "normal");
      doc.setTextColor(255, 255, 255);
      doc.text(CONSULTORA.descripcion, pad, 30);

      // Fecha
      doc.setFontSize(8); doc.setTextColor(150, 150, 150);
      doc.text(new Date().toLocaleDateString("es-AR", { year: "numeric", month: "long", day: "numeric" }), W - pad, 22, { align: "right" });

      // Titulo informe
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11); doc.setFont("helvetica", "bold");
      doc.text("DIAGNÓSTICO DE COMUNICACIÓN & RELACIONES PÚBLICAS", pad, 42);

      // Datos empresa
      let y = 58;
      doc.setFillColor(248, 247, 243);
      doc.roundedRect(pad, y, W - pad * 2, 26, 2, 2, "F");
      doc.setTextColor(17, 17, 17);
      doc.setFontSize(8); doc.setFont("helvetica", "bold");
      doc.text("EMPRESA EVALUADA", pad + 5, y + 7);
      doc.setFont("helvetica", "normal"); doc.setFontSize(11);
      doc.text(companyName, pad + 5, y + 15);
      doc.setFontSize(8); doc.setTextColor(107, 107, 107);
      doc.text((sector ? sector + "   |   " : "") + "Contacto: " + contactName + "   |   " + email, pad + 5, y + 22);

      // Puntaje global
      y += 34;
      doc.setFillColor(17, 17, 17);
      doc.roundedRect(pad, y, 75, 32, 2, 2, "F");
      doc.setTextColor(250, 81, 112);
      doc.setFontSize(32); doc.setFont("helvetica", "bold");
      doc.text(total + "%", pad + 6, y + 22);
      doc.setFontSize(7); doc.setTextColor(200, 200, 200);
      doc.setFont("helvetica", "normal");
      doc.text("PUNTAJE GLOBAL", pad + 6, y + 29);
      doc.setFillColor(250, 81, 112);
      doc.roundedRect(pad + 80, y + 8, 55, 12, 2, 2, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9); doc.setFont("helvetica", "bold");
      doc.text(level.label.toUpperCase(), pad + 107, y + 16, { align: "center" });

      // Módulos
      y += 42;
      doc.setTextColor(17, 17, 17);
      doc.setFontSize(7); doc.setFont("helvetica", "bold");
      doc.text("PUNTAJE POR MÓDULO", pad, y);
      y += 5;
      scores.forEach((s, i) => {
        const bw = W - pad * 2 - 35;
        doc.setFillColor(232, 231, 226);
        doc.roundedRect(pad, y + 3, bw, 4, 1, 1, "F");
        if (i % 2 === 0) doc.setFillColor(250, 81, 112);
        else doc.setFillColor(17, 17, 17);
        doc.roundedRect(pad, y + 3, bw * s.score / 100, 4, 1, 1, "F");
        doc.setTextColor(17, 17, 17);
        doc.setFontSize(8); doc.setFont("helvetica", "normal");
        doc.text(s.icon + " " + s.title, pad, y);
        doc.setFont("helvetica", "bold");
        doc.text(s.score + "%", W - pad, y + 6, { align: "right" });
        y += 13;
      });

      // Áreas prioritarias
      const priorities = scores.filter(s => s.score < 70);
      if (priorities.length > 0) {
        y += 4;
        doc.setFillColor(255, 240, 242);
        doc.roundedRect(pad, y, W - pad * 2, 10 + priorities.length * 9, 2, 2, "F");
        doc.setTextColor(250, 81, 112);
        doc.setFontSize(7); doc.setFont("helvetica", "bold");
        doc.text("ÁREAS PRIORITARIAS DE MEJORA", pad + 5, y + 7);
        priorities.forEach((s, i) => {
          doc.setTextColor(17, 17, 17);
          doc.setFont("helvetica", "normal"); doc.setFontSize(8);
          doc.text("→  " + s.title + " — " + s.score + "%", pad + 5, y + 14 + i * 9);
        });
        y += 10 + priorities.length * 9;
      }

      // CTA
      y += 8;
      doc.setFillColor(17, 17, 17);
      doc.roundedRect(pad, y, W - pad * 2, 38, 2, 2, "F");
      doc.setTextColor(250, 81, 112);
      doc.setFontSize(10); doc.setFont("helvetica", "bold");
      doc.text("¿Necesitás acompañamiento estratégico?", pad + 5, y + 10);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8); doc.setFont("helvetica", "normal");
      doc.text("En Athena PR te ayudamos a desarrollar una estrategia de comunicación y", pad + 5, y + 18);
      doc.text("relaciones públicas corporativa a medida de tu organización.", pad + 5, y + 24);
      doc.setTextColor(250, 81, 112);
      doc.setFontSize(8); doc.setFont("helvetica", "bold");
      doc.text(CONSULTORA.email + "   |   " + CONSULTORA.telefono + "   |   " + CONSULTORA.web, pad + 5, y + 33);

      // Footer
      doc.setFillColor(250, 81, 112);
      doc.rect(0, 282, W, 15, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7); doc.setFont("helvetica", "normal");
      doc.text("ATHENA PR  —  " + CONSULTORA.descripcion, pad, 291);
      doc.text(CONSULTORA.direccion, W - pad, 291, { align: "right" });

      doc.save("Diagnostico_AthenaPR_" + companyName.replace(/\s+/g, "_") + ".pdf");
    } catch (e) {
      alert("Error al generar el PDF. Intentá de nuevo.");
      console.error(e);
    }
    setPdfLoading(false);
  };

  const inp = (val, set, placeholder, type, hasError) => (
    <input value={val} onChange={e => set(e.target.value)} placeholder={placeholder} type={type || "text"}
      style={{ border: "1.5px solid " + (hasError ? COLORS.accent : COLORS.lightGray), borderRadius: 8, padding: "14px 16px", fontSize: 16, fontFamily: fontBody, fontWeight: 400, outline: "none", color: COLORS.black, background: COLORS.white, width: "100%" }} />
  );

  if (step === "intro") return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: fontBody }}>
      <style>{cssStyle}</style>
      <div className="intro-card" style={{ background: COLORS.white, borderRadius: 4, padding: 40, maxWidth: 540, width: "100%", boxShadow: "0 4px 40px rgba(0,0,0,0.08)", border: "1px solid " + COLORS.lightGray }}>
        {/* Logo */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ background: COLORS.black, borderRadius: 4, padding: "10px 16px", display: "inline-block" }}>
            <span style={{ fontFamily: fontBody, fontWeight: 800, fontSize: 20, color: COLORS.accent, letterSpacing: 2 }}>ATHENA PR</span>
          </div>
        </div>
        <span style={{ fontWeight: 800, fontSize: 11, letterSpacing: 3, color: COLORS.accent, textTransform: "uppercase" }}>Herramienta de diagnóstico</span>
        <h1 className="intro-title" style={{ fontFamily: fontTitle, fontSize: 34, fontWeight: 900, color: COLORS.black, lineHeight: 1.2, margin: "8px 0" }}>
          Comunicación<br />& Relaciones Públicas
        </h1>
        <div style={{ width: 48, height: 3, background: COLORS.accent, marginBottom: 20 }} />
        <p style={{ color: COLORS.gray, lineHeight: 1.8, marginBottom: 24, fontSize: 15, fontWeight: 300 }}>
          Conocé el estado actual de la comunicación en tu organización en <strong style={{ fontWeight: 700, color: COLORS.black }}>6 dimensiones clave</strong> y obtené un diagnóstico personalizado.
        </p>
        <div className="tags-wrap" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
          {modules.map(m => (
            <span key={m.id} className="tag" style={{ background: COLORS.bg, borderRadius: 2, padding: "5px 12px", fontSize: 12, fontWeight: 600, color: COLORS.black, border: "1px solid " + COLORS.lightGray }}>{m.icon} {m.title}</span>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 8 }}>
          {inp(companyName, setCompanyName, "Nombre de la empresa *", "text", formError && !companyName)}
          {inp(sector, setSector, "Sector o industria", "text", false)}
          {inp(contactName, setContactName, "Nombre de contacto *", "text", formError && !contactName)}
          {inp(email, setEmail, "Email de contacto *", "email", formError && !email)}
        </div>
        {formError && <p style={{ color: COLORS.accent, fontSize: 13, fontWeight: 600, marginBottom: 10 }}>{formError}</p>}
        <p style={{ fontSize: 11, color: COLORS.gray, marginBottom: 20, fontWeight: 300 }}>* Campos obligatorios</p>
        <button onClick={() => {
          const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
          if (!companyName || !contactName || !email) { setFormError("Por favor completá todos los campos obligatorios."); return; }
          if (!emailValid) { setFormError("Ingresá un email válido."); return; }
          setFormError(""); saveLeadToSheets(); setStep("survey");
        }} style={{ width: "100%", background: COLORS.accent, color: COLORS.white, border: "none", borderRadius: 4, padding: "16px", fontSize: 15, fontWeight: 800, fontFamily: fontBody, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer" }}>
          Comenzar diagnóstico →
        </button>
        <p style={{ textAlign: "center", color: COLORS.gray, fontSize: 12, marginTop: 14, fontWeight: 300 }}>⏱ Duración estimada: 8–10 minutos</p>
      </div>
    </div>
  );

  if (step === "results") {
    const scores = calcScores();
    const total = totalScore();
    const level = getLevel(total);
    if (!dataSent) saveResultToSheets(scores, total);
    return (
      <div style={{ minHeight: "100vh", background: COLORS.bg, fontFamily: fontBody, padding: 16 }}>
        <style>{cssStyle}</style>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div className="results-header" style={{ background: COLORS.black, borderRadius: 4, padding: "36px 32px", color: COLORS.white, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ background: COLORS.accent, borderRadius: 3, padding: "5px 12px" }}>
                <span style={{ fontWeight: 800, fontSize: 13, letterSpacing: 2 }}>ATHENA PR</span>
              </div>
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 3, color: COLORS.accent, textTransform: "uppercase", opacity: 0.8 }}>Resultado del diagnóstico</span>
            </div>
            {companyName && <p style={{ opacity: 0.5, margin: "0 0 4px", fontSize: 13, fontWeight: 300 }}>{companyName}{sector ? " · " + sector : ""}</p>}
            <h1 style={{ fontFamily: fontTitle, fontSize: 28, fontWeight: 900, margin: "8px 0 20px", lineHeight: 1.2 }}>Tu Diagnóstico de<br />Comunicación & RRPP</h1>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
              <div>
                <div className="results-score" style={{ fontSize: 64, fontWeight: 900, lineHeight: 1, color: COLORS.accent }}>{total}%</div>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: COLORS.white, opacity: 0.6, marginTop: 4 }}>Puntuación global</div>
              </div>
              <div style={{ background: COLORS.accent, borderRadius: 4, padding: "8px 20px", marginBottom: 4 }}>
                <span style={{ fontWeight: 800, fontSize: 13, letterSpacing: 1, textTransform: "uppercase" }}>{level.label}</span>
              </div>
            </div>
          </div>

          <div className="grid-2">
            {scores.map((s, i) => {
              const lvl = getLevel(s.score);
              return (
                <div key={s.title} className="results-body" style={{ background: COLORS.white, borderRadius: 4, padding: 18, border: "1px solid " + COLORS.lightGray }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.black, lineHeight: 1.3, maxWidth: "70%" }}>{s.icon} {s.title}</span>
                    <span style={{ fontWeight: 900, color: i % 2 === 0 ? COLORS.accent : COLORS.black, fontSize: 20, fontFamily: fontTitle }}>{s.score}%</span>
                  </div>
                  <div style={{ background: COLORS.bg, borderRadius: 2, height: 5, overflow: "hidden" }}>
                    <div style={{ width: s.score + "%", height: "100%", background: i % 2 === 0 ? COLORS.accent : COLORS.black }} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: lvl.color, marginTop: 6, display: "block" }}>{lvl.label}</span>
                </div>
              );
            })}
          </div>

          <div style={{ background: COLORS.white, borderRadius: 4, padding: 24, border: "1px solid " + COLORS.lightGray, marginBottom: 16 }}>
            <span style={{ fontWeight: 800, fontSize: 10, letterSpacing: 3, color: COLORS.accent, textTransform: "uppercase" }}>Áreas prioritarias</span>
            <h3 style={{ fontFamily: fontTitle, fontSize: 20, margin: "8px 0 16px", color: COLORS.black }}>Dónde enfocar la energía</h3>
            {scores.filter(s => s.score < 70).length === 0
              ? <p style={{ color: "#059669", fontWeight: 700 }}>✅ No se detectaron áreas críticas. ¡Excelente trabajo!</p>
              : scores.filter(s => s.score < 70).sort((a, b) => a.score - b.score).map(s => (
                <div key={s.title} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, padding: "12px 14px", background: COLORS.bg, borderRadius: 4, borderLeft: "3px solid " + COLORS.accent }}>
                  <span style={{ fontSize: 20 }}>{s.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, color: COLORS.black, fontSize: 14 }}>{s.title}</div>
                    <div style={{ color: COLORS.accent, fontSize: 12, fontWeight: 600 }}>Requiere atención prioritaria · {s.score}%</div>
                  </div>
                </div>
              ))
            }
          </div>

          {/* CTA Athena PR */}
          <div style={{ background: COLORS.black, borderRadius: 4, padding: 24, marginBottom: 16 }}>
            <span style={{ fontWeight: 800, fontSize: 10, letterSpacing: 3, color: COLORS.accent, textTransform: "uppercase" }}>¿Necesitás acompañamiento?</span>
            <h3 style={{ fontFamily: fontTitle, fontSize: 20, margin: "8px 0 12px", color: COLORS.white, lineHeight: 1.3 }}>Desarrollá tu estrategia de comunicación con Athena PR</h3>
            <p style={{ color: "#aaa", fontSize: 14, lineHeight: 1.7, marginBottom: 16, fontWeight: 300 }}>
              Si los resultados muestran áreas de mejora, podemos ayudarte a construir una estrategia de comunicación y relaciones públicas corporativa a medida de tu organización.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
              <a href={"mailto:" + CONSULTORA.email} style={{ background: COLORS.accent, color: COLORS.white, borderRadius: 4, padding: "10px 18px", fontSize: 13, fontWeight: 800, textDecoration: "none", letterSpacing: 0.5 }}>✉ {CONSULTORA.email}</a>
              <a href={"https://wa.me/5492804415599"} style={{ background: "#25D366", color: COLORS.white, borderRadius: 4, padding: "10px 18px", fontSize: 13, fontWeight: 800, textDecoration: "none", letterSpacing: 0.5 }}>📲 WhatsApp</a>
              <a href={"https://" + CONSULTORA.web} style={{ background: COLORS.white, color: COLORS.black, borderRadius: 4, padding: "10px 18px", fontSize: 13, fontWeight: 800, textDecoration: "none", letterSpacing: 0.5 }}>🌐 {CONSULTORA.web}</a>
            </div>
            <p style={{ color: "#666", fontSize: 12, fontWeight: 300 }}>{CONSULTORA.direccion}</p>
          </div>

          <div className="nav-btns" style={{ display: "flex", gap: 12 }}>
            <button onClick={() => { setAnswers({}); setCurrentModule(0); setDataSent(false); setStep("intro"); }} style={{ flex: 1, background: COLORS.white, color: COLORS.black, border: "1.5px solid " + COLORS.lightGray, borderRadius: 4, padding: 14, fontSize: 13, fontWeight: 800, fontFamily: fontBody, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer" }}>
              Reiniciar
            </button>
            <button onClick={() => generatePDF(scores, total, level)} disabled={pdfLoading} style={{ flex: 2, background: pdfLoading ? COLORS.lightGray : COLORS.accent, color: pdfLoading ? COLORS.gray : COLORS.white, border: "none", borderRadius: 4, padding: 14, fontSize: 13, fontWeight: 800, fontFamily: fontBody, letterSpacing: 1, textTransform: "uppercase", cursor: pdfLoading ? "not-allowed" : "pointer" }}>
              {pdfLoading ? "Generando PDF..." : "Descargar informe PDF"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, fontFamily: fontBody, padding: 16 }}>
      <style>{cssStyle}</style>
      <div style={{ maxWidth: 660, margin: "0 auto" }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
            {modules.map((m, i) => (
              <div key={m.id} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= currentModule ? (i % 2 === 0 ? COLORS.accent : COLORS.black) : COLORS.lightGray, transition: "background 0.3s" }} />
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: modColor }}>{mod.icon} {mod.title}</span>
            <span style={{ fontSize: 11, color: COLORS.gray }}>Módulo {currentModule + 1} de {modules.length}</span>
          </div>
        </div>

        <div style={{ background: COLORS.white, borderRadius: 4, overflow: "hidden", border: "1px solid " + COLORS.lightGray }}>
          <div className="module-header" style={{ background: modColor, padding: "24px 28px" }}>
            <span style={{ fontWeight: 800, fontSize: 10, letterSpacing: 3, color: modColor === COLORS.accent ? "rgba(255,255,255,0.7)" : COLORS.accent, textTransform: "uppercase" }}>Módulo {currentModule + 1}</span>
            <h2 style={{ fontFamily: fontTitle, color: COLORS.white, margin: "6px 0 0", fontSize: 22, fontWeight: 900 }}>{mod.title}</h2>
          </div>

          <div className="module-body" style={{ padding: "28px 28px 24px" }}>
            {mod.questions.map((q, qi) => (
              <div key={q.id} style={{ marginBottom: 28, paddingBottom: 28, borderBottom: qi < mod.questions.length - 1 ? "1px solid " + COLORS.bg : "none" }}>
                <p style={{ fontWeight: 600, color: COLORS.black, marginBottom: 14, lineHeight: 1.6, fontSize: 15 }}>
                  <span style={{ color: modColor, fontWeight: 800 }}>{qi + 1}. </span>{q.text}
                </p>
                {q.type === "scale" && (
                  <>
                    <div className="scale-row" style={{ display: "flex", gap: 8 }}>
                      {[1,2,3,4,5].map(v => (
                        <button key={v} className="btn-scale" onClick={() => setScale(q.id, v)}
                          style={{ flex: 1, padding: "14px 0", borderRadius: 4, border: "2px solid " + (answers[q.id] === v ? modColor : COLORS.lightGray), background: answers[q.id] === v ? modColor : COLORS.white, color: answers[q.id] === v ? COLORS.white : COLORS.gray, fontWeight: 800, fontSize: 18, fontFamily: fontBody, cursor: "pointer" }}>
                          {v}
                        </button>
                      ))}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                      <span style={{ fontSize: 11, color: COLORS.gray, fontWeight: 300 }}>1 — {scaleLabels[0]}</span>
                      <span style={{ fontSize: 11, color: COLORS.gray, fontWeight: 300 }}>5 — {scaleLabels[1]}</span>
                    </div>
                  </>
                )}
                {q.type === "choice" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {q.options.map(opt => (
                      <button key={opt} onClick={() => setChoice(q.id, opt)}
                        style={{ textAlign: "left", padding: "14px 16px", borderRadius: 4, border: "2px solid " + (answers[q.id] === opt ? modColor : COLORS.lightGray), background: answers[q.id] === opt ? (modColor === COLORS.accent ? "#fff0f2" : "#f0f0f0") : COLORS.white, color: answers[q.id] === opt ? modColor : COLORS.gray, fontWeight: answers[q.id] === opt ? 700 : 400, cursor: "pointer", fontSize: 15, fontFamily: fontBody }}>
                        <span style={{ marginRight: 8 }}>{answers[q.id] === opt ? "●" : "○"}</span>{opt}
                      </button>
                    ))}
                  </div>
                )}
                {q.type === "multi" && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {q.options.map(opt => {
                      const sel = (answers[q.id] || []).includes(opt);
                      return (
                        <button key={opt} onClick={() => toggleMulti(q.id, opt)}
                          style={{ padding: "10px 16px", borderRadius: 4, border: "2px solid " + (sel ? modColor : COLORS.lightGray), background: sel ? modColor : COLORS.white, color: sel ? COLORS.white : COLORS.gray, fontWeight: sel ? 700 : 400, cursor: "pointer", fontSize: 14, fontFamily: fontBody }}>
                          {sel ? "✓ " : ""}{opt}
                        </button>
                      );
                    })}
                    <p style={{ width: "100%", fontSize: 12, color: COLORS.gray, fontWeight: 300, marginTop: 4 }}>Podés seleccionar más de una opción</p>
                  </div>
                )}
              </div>
            ))}
            <div className="nav-btns" style={{ display: "flex", gap: 10 }}>
              {currentModule > 0 && (
                <button onClick={() => setCurrentModule(m => m - 1)}
                  style={{ flex: 1, background: COLORS.white, color: COLORS.black, border: "1.5px solid " + COLORS.lightGray, borderRadius: 4, padding: 16, fontSize: 14, fontWeight: 800, fontFamily: fontBody, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer" }}>
                  ← Anterior
                </button>
              )}
              <button onClick={() => currentModule < modules.length - 1 ? setCurrentModule(m => m + 1) : setStep("results")}
                disabled={!allAnswered}
                style={{ flex: 2, background: allAnswered ? modColor : COLORS.lightGray, color: allAnswered ? COLORS.white : COLORS.gray, border: "none", borderRadius: 4, padding: 16, fontSize: 14, fontWeight: 800, fontFamily: fontBody, letterSpacing: 1, textTransform: "uppercase", cursor: allAnswered ? "pointer" : "not-allowed" }}>
                {currentModule < modules.length - 1 ? "Siguiente módulo →" : "Ver diagnóstico →"}
              </button>
            </div>
            {!allAnswered && <p style={{ textAlign: "center", fontSize: 12, color: COLORS.gray, marginTop: 10, fontWeight: 300 }}>Respondé todas las preguntas para continuar</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
