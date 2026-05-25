// src/components/atomic-crm/landing/VinculaLandingPage.tsx
import { useState, useEffect } from 'react';

const primary = '#8b5cf6';
const primaryDark = '#7c3aed';
const accent = '#a78bfa';
const bgDark = '#0d0b14';

// ─── Feature gallery ──────────────────────────────────────────────────────────

const FEATURES = [
  {
    label: 'Contatos & Empresas',
    icon: '👤',
    desc: 'Todos os seus contatos e empresas num só lugar. Histórico de atividades, notas, tarefas e e-mails capturados automaticamente — sem perder nenhuma interação.',
    bullets: ['Histórico completo por contato', 'Captura de e-mails automática', 'Importação e exportação em massa'],
    screenshot: '/img/screenshots/contatos.png',
  },
  {
    label: 'Pipeline de Deals',
    icon: '📊',
    desc: 'Kanban visual do seu funil de vendas. Arraste oportunidades de estágio em estágio, defina probabilidades e acompanhe o forecast em tempo real.',
    bullets: ['Kanban drag-and-drop', 'Forecast por estágio e período', 'Filtros por categoria, tipo e responsável'],
    screenshot: '/img/screenshots/pipeline.png',
  },
  {
    label: 'Empresas & Leads',
    icon: '🏢',
    desc: 'Gerencie empresas em grid visual e acompanhe leads no pipeline. Filtros por setor, tamanho e responsável — visão completa do seu mercado.',
    bullets: ['Grid visual de empresas', 'Pipeline de leads com status', 'Filtros por setor e tamanho'],
    screenshot: '/img/screenshots/empresas.png',
  },
  {
    label: 'Leads & Prospecção',
    icon: '🎯',
    desc: 'Acompanhe cada lead desde o primeiro contato. Status, temperatura, próxima ação e fonte de origem — tudo num só lugar.',
    bullets: ['Status e temperatura do lead', 'Próxima ação programada', 'Fonte de origem rastreada'],
    screenshot: '/img/screenshots/leads.png',
  },
  {
    label: 'Dashboard analítico',
    icon: '📈',
    desc: 'Funil de conversão, metas de vendas e atividade recente — tudo em tempo real. Decisões baseadas em dados, não em feeling.',
    bullets: ['Funil de conversão visual', 'Métricas de propostas', 'Exportação para Excel'],
    screenshot: '/img/screenshots/dashboard-relatorios.png',
  },
];

const FEATURE_INTERVAL = 4000;

function FeatureGallery() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setActive(i => (i + 1) % FEATURES.length), FEATURE_INTERVAL);
    return () => clearTimeout(t);
  }, [active]);

  const f = FEATURES[active];

  return (
    <section style={{ background: '#fafaf9', padding: '72px 24px 80px', borderTop: '1px solid #f0ebe8' }}>
      <style>{`
        @keyframes vProgress { from { width: 0% } to { width: 100% } }
      `}</style>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <p style={{ fontSize: 11, fontWeight: 800, color: '#bbb', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>
          O QUE VOCÊ GANHA
        </p>
        <h2 style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 10px', color: '#111', lineHeight: 1.1 }}>
          Tudo que quem vende precisa.<br />Sem o que atrapalha.
        </h2>
        <p style={{ fontSize: 16, color: '#666', margin: '0 0 32px', lineHeight: 1.6 }}>
          Do primeiro contato à proposta assinada — sem mudar de aba, sem perder contexto.
        </p>

        {/* Card */}
        <div style={{ background: '#fff', border: '1px solid #ede0f8', borderRadius: 16, overflow: 'hidden', boxShadow: '0 32px 80px rgba(139,92,246,0.10), 0 8px 24px rgba(139,92,246,0.05)' }}>
          {/* Chrome bar */}
          <div style={{ background: '#0d0b14', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
            <div style={{ flex: 1, background: '#1a1228', borderRadius: 4, height: 12, margin: '0 12px' }} />
          </div>
          {/* Progress bar */}
          <div style={{ height: 3, background: '#f3eeff', position: 'relative', overflow: 'hidden' }}>
            <div key={active} style={{ position: 'absolute', top: 0, left: 0, height: '100%', background: primary, animation: `vProgress ${FEATURE_INTERVAL}ms linear forwards` }} />
          </div>
          {/* Content area */}
          <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', background: 'linear-gradient(135deg, #faf8ff 0%, #fff 60%)' }}>
            {/* Text col */}
            <div style={{ padding: '44px 40px', borderRight: '1px solid #f0ebff' }}>
              <div style={{ fontSize: 36, marginBottom: 14 }}>{f.icon}</div>
              <h3 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 12px', color: '#111', letterSpacing: '-0.02em' }}>{f.label}</h3>
              <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7, margin: '0 0 20px' }}>{f.desc}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {f.bullets.map(b => (
                  <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#333' }}>
                    <span style={{ color: primary, fontWeight: 900 }}>→</span> {b}
                  </div>
                ))}
              </div>
            </div>
            {/* Screenshot col — full bleed */}
            <div style={{ overflow: 'hidden', background: '#0d0b14' }}>
              <img
                key={f.screenshot}
                src={f.screenshot}
                alt={f.label}
                style={{ width: '100%', display: 'block', objectFit: 'cover', objectPosition: 'top left', height: 380 }}
              />
            </div>
          </div>
          {/* Label bar */}
          <div style={{ padding: '14px 24px', borderTop: `3px solid ${primary}`, background: '#fff', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 34, height: 34, background: primary, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
              {f.icon}
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#111' }}>{f.label}</div>
          </div>
        </div>

        {/* Pills */}
        <div style={{ display: 'flex', gap: 8, marginTop: 20, flexWrap: 'wrap' as const }}>
          {FEATURES.map((feat, i) => (
            <button key={feat.label} onClick={() => setActive(i)} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 18px', border: 'none', borderRadius: 999, cursor: 'pointer',
              fontSize: 13, fontWeight: 700, transition: 'all 0.15s',
              background: active === i ? primary : '#fff',
              color: active === i ? '#fff' : '#555',
              boxShadow: active === i ? `0 4px 14px rgba(139,92,246,0.28)` : '0 1px 4px rgba(0,0,0,0.08)',
            }}>
              <span style={{ opacity: active === i ? 1 : 0.5 }}>{feat.icon}</span>
              {feat.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Main landing ─────────────────────────────────────────────────────────────

export function VinculaLandingPage() {
  const signInUrl = '/login';

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', color: '#0a0a0a', lineHeight: 1.5 }}>
      <style>{`
        .v-cta:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(139,92,246,0.45) !important; }
        .v-cta-sec:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(167,139,250,0.5) !important; }
      `}</style>

      {/* ── Navbar ── */}
      <nav style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.06)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="/appIcon/32.png" alt="Vincula" style={{ width: 22, height: 22, objectFit: 'contain', display: 'block' }} />
          <span style={{ fontSize: 17, fontWeight: 900, letterSpacing: '-0.03em' }}>Vincula</span>
          <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 4 }}>by Prymeira</span>
        </div>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <a href={signInUrl} style={{ fontSize: 13, color: '#666', textDecoration: 'none' }}>Entrar</a>
          <a href={signInUrl} style={{ background: primary, color: '#fff', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>Começar grátis</a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ background: `linear-gradient(155deg, ${bgDark} 0%, #12091e 45%, #1a0d2e 100%)`, padding: '96px 24px 88px', position: 'relative', overflow: 'hidden' }}>
        {/* Ambient glow */}
        <div style={{ position: 'absolute', top: -120, right: -80, width: 600, height: 600, borderRadius: '50%', background: `radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 65%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 400, height: 400, borderRadius: '50%', background: `radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 65%)`, pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: accent }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: accent, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>CRM para quem vende de verdade</span>
            </div>
            <h1 style={{ fontSize: 'clamp(38px, 4.5vw, 62px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: '-0.04em', margin: '0 0 22px', color: '#f6f2ff' }}>
              Do lead ao fechamento,<br /><span style={{ color: accent }}>sem nada se perder.</span>
            </h1>
            <p style={{ fontSize: 17, color: 'rgba(246,242,255,0.55)', lineHeight: 1.72, margin: '0 0 36px', maxWidth: 400 }}>
              Vincula é o CRM que conecta contatos, oportunidades, propostas e automações num só sistema — para times que levam vendas a sério.
            </p>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' as const }}>
              <a href={signInUrl} className="v-cta" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: primary, color: '#fff', borderRadius: 10, padding: '14px 30px', fontSize: 15, fontWeight: 800, textDecoration: 'none', boxShadow: `0 8px 24px rgba(139,92,246,0.32)`, letterSpacing: '-0.01em', transition: 'transform 0.15s, box-shadow 0.15s' }}>
                Começar grátis →
              </a>
              <span style={{ fontSize: 13, color: 'rgba(246,242,255,0.3)' }}>Sem cartão de crédito</span>
            </div>
          </div>

          {/* Right — real app screenshot */}
          <div style={{ position: 'relative' }}>
            {/* Browser chrome frame */}
            <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(139,92,246,0.2)', boxShadow: '0 40px 100px rgba(0,0,0,0.6)' }}>
              <div style={{ background: '#1a1228', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#ff5f57' }} />
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#febc2e' }} />
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#28c840' }} />
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 4, height: 18, margin: '0 10px', display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>app.vincula.com.br</span>
                </div>
              </div>
              <img
                src="/img/screenshots/pipeline.png"
                alt="Vincula CRM — Pipeline de Negócios"
                style={{ width: '100%', display: 'block', objectFit: 'cover', objectPosition: 'top left', maxHeight: 380 }}
              />
            </div>
            {/* Floating badge */}
            <div style={{ position: 'absolute', bottom: -20, right: -16, background: '#fff', borderRadius: 12, padding: '10px 16px', boxShadow: '0 12px 36px rgba(0,0,0,0.2)', border: '1px solid rgba(139,92,246,0.1)' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#aaa', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: 3 }}>Proposta enviada</div>
              <div style={{ fontSize: 15, fontWeight: 900, color: primary }}>✦ MegaCorp · R$ 48k</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <div style={{ background: primary, padding: '20px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 56, alignItems: 'center', flexWrap: 'wrap' as const }}>
          {[
            { num: 'Lead → Fechado', label: 'pipeline completo' },
            { num: 'Propostas', label: 'nativas integradas' },
            { num: 'Automações', label: 'sem código' },
          ].map((s, i) => (
            <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: 56 }}>
              {i > 0 && <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.15)' }} />}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>{s.num}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 3 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Problem ── */}
      <section style={{ padding: '72px 24px 64px', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: '#ddd', letterSpacing: '0.14em', textTransform: 'uppercase' as const, marginBottom: 20 }}>O PROBLEMA</p>
          <h2 style={{ fontSize: 'clamp(26px, 3vw, 40px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 32px', color: '#111' }}>
            Você perde negócios<br />por falta de <em style={{ fontStyle: 'normal', color: primary }}>controle</em>, não por falta de leads.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { num: '01', title: 'Follow-up esquecido', sub: 'O cliente pediu um retorno na sexta. Na quarta seguinte você lembrou — quando ele já fechou com o concorrente.' },
              { num: '02', title: 'Pipeline invisível', sub: 'Ninguém sabe onde estão as oportunidades. Cada vendedor tem sua própria planilha, seu próprio formato, sua própria versão da verdade.' },
              { num: '03', title: 'Proposta fora do contexto', sub: 'Você manda a proposta por e-mail, ela se perde em tópicos, e quando o cliente responde você não lembra do que foi discutido.' },
            ].map(card => (
              <div key={card.num} style={{ background: '#fdf8ff', border: '1px solid #ede0f8', borderRadius: 10, padding: '28px 24px' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: primaryDark, letterSpacing: '0.1em', marginBottom: 14 }}>{card.num}</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: '#111', lineHeight: 1.3, marginBottom: 10 }}>{card.title}</div>
                <div style={{ fontSize: 14, color: '#888', lineHeight: 1.65 }}>{card.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature gallery ── */}
      <FeatureGallery />

      {/* ── Analytics spotlight ── */}
      <section style={{ padding: '80px 24px', background: bgDark, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -100, right: -100, width: 500, height: 500, borderRadius: '50%', background: `radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 65%)`, pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 800, color: `${accent}88`, letterSpacing: '0.14em', textTransform: 'uppercase' as const, marginBottom: 14 }}>INTELIGÊNCIA COMERCIAL</p>
              <h2 style={{ fontSize: 'clamp(26px, 2.8vw, 38px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 18px', color: '#f6f2ff' }}>
                Dados que mostram<br />onde o dinheiro está.
              </h2>
              <p style={{ fontSize: 15, color: 'rgba(246,242,255,0.45)', lineHeight: 1.72, margin: '0 0 28px' }}>
                Dashboard analítico em tempo real com funil de conversão, ranking de vendedores, metas por período e log de atividades. Chega de relatório no fim do mês — você vê agora.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Funil de conversão', desc: 'Visualize onde os deals travam e otimize o processo' },
                  { label: 'Ranking de vendedores', desc: 'Performance individual e comparativa por período' },
                  { label: 'Metas de vendas', desc: 'Defina metas e acompanhe em tempo real' },
                  { label: 'Log de atividades', desc: 'Histórico completo de tudo que aconteceu com cada contato' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{ marginTop: 3, width: 26, height: 26, borderRadius: 6, flexShrink: 0, background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: accent }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#f6f2ff', marginBottom: 2 }}>{item.label}</div>
                      <div style={{ fontSize: 13, color: 'rgba(246,242,255,0.38)' }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Real reports screenshot */}
            <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(139,92,246,0.15)', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
              <div style={{ background: '#1a1228', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff5f57' }} />
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#febc2e' }} />
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#28c840' }} />
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 3, height: 14, margin: '0 8px' }} />
              </div>
              <img
                src="/img/screenshots/dashboard-relatorios.png"
                alt="Vincula CRM — Dashboard analítico"
                style={{ width: '100%', display: 'block', objectFit: 'cover', objectPosition: 'top left', maxHeight: 400 }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Propostas nativas ── */}
      <section style={{ padding: '72px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
            {/* Proposal visual */}
            <div style={{ background: 'linear-gradient(135deg, #faf8ff 0%, #f3eeff 100%)', borderRadius: 16, border: '1px solid #ede0f8', padding: '32px', boxShadow: '0 16px 48px rgba(139,92,246,0.08)' }}>
              <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #ede0f8', padding: '24px', marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: primary, letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: 8 }}>Proposta Comercial</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#111', marginBottom: 4 }}>Implementação — Módulo Enterprise</div>
                <div style={{ fontSize: 12, color: '#999', marginBottom: 16 }}>Para: MegaCorp Ltda · Validade: 15 dias</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[{ desc: 'Setup e configuração', val: 'R$ 4.800' }, { desc: 'Licença anual (10 usuários)', val: 'R$ 28.800' }, { desc: 'Treinamento da equipe', val: 'R$ 1.200' }].map(item => (
                    <div key={item.desc} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '8px 0', borderBottom: '1px solid #f5f0ff' }}>
                      <span style={{ color: '#555' }}>{item.desc}</span>
                      <span style={{ fontWeight: 700, color: '#111' }}>{item.val}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: `2px solid ${primary}` }}>
                  <span style={{ fontWeight: 800, color: '#111' }}>Total</span>
                  <span style={{ fontWeight: 900, fontSize: 18, color: primary }}>R$ 34.800</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1, background: primary, borderRadius: 8, padding: '10px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer' }}>Enviar proposta</div>
                <div style={{ flex: 1, background: '#f3eeff', borderRadius: 8, padding: '10px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: primary, cursor: 'pointer' }}>Ver histórico</div>
              </div>
            </div>

            <div>
              <p style={{ fontSize: 11, fontWeight: 800, color: '#ddd', letterSpacing: '0.14em', textTransform: 'uppercase' as const, marginBottom: 14 }}>PROPOSTAS INTEGRADAS</p>
              <h2 style={{ fontSize: 'clamp(26px, 2.8vw, 38px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 18px', color: '#111' }}>
                Da conversa<br />à proposta,<br />sem mudar de aba.
              </h2>
              <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.72, margin: '0 0 28px' }}>
                Poucos CRMs têm gerenciamento de propostas integrado. No Vincula, você cria, versiona e envia propostas diretamente do deal — com templates prontos e histórico completo.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { num: 'Templates', label: 'prontos para usar' },
                  { num: 'Versionamento', label: 'histórico de versões' },
                  { num: 'Vinculada', label: 'ao deal e ao contato' },
                  { num: 'Histórico', label: 'de visualizações' },
                ].map(s => (
                  <div key={s.num} style={{ background: '#faf8ff', borderRadius: 10, padding: '16px 18px', border: `1px solid #ede0f8` }}>
                    <div style={{ fontSize: 15, fontWeight: 900, color: primary }}>{s.num}</div>
                    <div style={{ fontSize: 12, color: '#888', marginTop: 3 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Quote ── */}
      <section style={{ padding: '72px 24px', background: '#fafaf9', borderTop: '1px solid #f0f0f0' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 28, marginBottom: 16 }}>🔗</div>
          <blockquote style={{ fontSize: 'clamp(20px, 2.4vw, 28px)', fontWeight: 800, lineHeight: 1.35, letterSpacing: '-0.02em', color: '#111', margin: '0 0 20px', fontStyle: 'normal' }}>
            "CRM bom é o que o time<br />realmente abre toda manhã."
          </blockquote>
          <p style={{ fontSize: 15, color: '#888', maxWidth: 460, margin: '0 auto', lineHeight: 1.6 }}>
            O Vincula foi feito para ser simples o suficiente para usar todo dia — e poderoso o suficiente para escalar com o seu negócio.
          </p>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section style={{ background: `linear-gradient(160deg, ${bgDark}, #1a0d2e)`, padding: '104px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, height: 600, borderRadius: '50%', background: `radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 65%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: `${accent}88`, letterSpacing: '0.14em', textTransform: 'uppercase' as const, marginBottom: 16 }}>COMECE AGORA</p>
          <h2 style={{ fontSize: 'clamp(30px, 4vw, 52px)', fontWeight: 900, color: '#f6f2ff', lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 18px' }}>
            Sua equipe de vendas<br />merece uma ferramenta à altura.
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(246,242,255,0.38)', margin: '0 0 36px', lineHeight: 1.6 }}>
            Contatos, pipeline, propostas, automações e dashboard analítico.<br />Tudo conectado. Tudo em português.
          </p>
          <a href={signInUrl} className="v-cta-sec" style={{ background: accent, borderRadius: 10, padding: '15px 40px', fontSize: 16, fontWeight: 900, color: bgDark, textDecoration: 'none', display: 'inline-flex', letterSpacing: '-0.01em', boxShadow: `0 8px 32px rgba(167,139,250,0.32)`, transition: 'transform 0.15s, box-shadow 0.15s' }}>
            Começar grátis →
          </a>
          <div style={{ marginTop: 14, fontSize: 13, color: 'rgba(246,242,255,0.25)' }}>Sem cartão de crédito · Setup em minutos</div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: '#fff', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f0f0f0' }}>
        <span style={{ fontSize: 13, color: '#bbb' }}>© 2026 Prymeira · Vincula CRM</span>
        <span style={{ fontSize: 13, color: '#bbb' }}>Termos · Privacidade</span>
      </footer>
    </div>
  );
}
