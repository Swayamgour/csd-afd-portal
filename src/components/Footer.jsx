import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
const a = [['user-manual', 'User Manual'], ['verify-supply-order', 'Verify Supply Order'], ['terms', 'Terms and conditions'], ['contact', 'Contact Us'], ['videos', 'Videos']]
const b = [['faq', 'FAQ'], ['help-desk', 'Help Desk'], ['eligibility', 'Eligibility Criteria'], ['payments', 'How to make online payments?']]
const L = ({ title, x }) => (
  <div>
    <h2>{title}</h2>
    <ul>{x.map(([s, l]) => <li key={s}><Link to={`/info/${s}`}>{l}</Link></li>)}</ul>
  </div>
)
export default function Footer() {
  return (
    <footer className="ftr">
      <div className="ftr-grid">
        <div className="ftr-about">
          <img src='/assets/logo.png' width='300' style={{ borderRadius: '8px' }} />

          {/* <div className="brand light"><span className="brand-mark" aria-hidden>CSD</span><span className="brand-txt"><strong>AFD Online</strong><small>Canteen Stores Department</small></span></div> */}
          <p>Cars, bikes and home appliances for the Armed Forces family, at concessional prices.</p>
          <p className="muted-l">Designed, developed and hosted by National Informatics Centre.</p>
        </div>
        <nav aria-label="Footer" className="ftr-links"><L title="Quick links" x={a} /><L title="Support" x={b} /></nav>
        <section aria-labelledby="vig" className="ftr-vig">
          <h2 id="vig"><ShieldCheck size={18} aria-hidden /> Be vigilant</h2>
          <p>Availing services on CSD-AFD online portal is absolutely free. In case anyone asks for money for registration / filling form on the portal or getting a supply order released, report it immediately to [Official Information To Be Provided]</p>
        </section>
      </div>

      <div>

        <p style={{ fontSize: '0.875rem' , textAlign: 'center' }}>Number of visitors: 1,234,567</p>
      </div>
      <p className="copy">Copyright © 2021 Canteen Stores Departments. All rights reserved. <Link to="/info/privacy">Privacy Policy</Link> | <Link to="/info/disclaimer">Disclaimer</Link>.</p>
    </footer>
  )
}
