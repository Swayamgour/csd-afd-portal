import React from "react";
import { Calendar, IdCard } from "lucide-react";
import { Field, Section } from "./RegisterField.jsx";

export const EMPLOYMENT = ["Serving", "Retired", "Defence Civilian"];
export const ORGS = ["Army", "Navy", "Air Force", "Defence Civilian / Other"];
export const ENTITLEMENT = [
  "Serving - Armed Forces",
  "Retired - Armed Forces",
  "Serving - Defence Civilian",
  "Retired - Defence Civilian",
];
export const PAY_LEVELS = Array.from({ length: 18 }, (_, i) => `Level ${i + 1}`);

export function RegisterServiceSection({ f, shown, set }) {
  return (
    <Section n="2" title="Service details">
      <div className="reg-grid">
        <Field
          id="employment"
          label="Employment status"
          req
          err={shown("employment")}
        >
          <select
            id="employment"
            value={f.employment}
            onChange={set("employment")}
          >
            <option value="">Select</option>
            {EMPLOYMENT.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </Field>
        <Field id="org" label="Organization" req err={shown("org")}>
          <select id="org" value={f.org} onChange={set("org")}>
            <option value="">Select</option>
            {ORGS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </Field>
        <Field id="dob" label="Date of birth" req err={shown("dob")}>
          <div className="fld">
            <Calendar size={18} aria-hidden />
            <input
              id="dob"
              type="date"
              value={f.dob}
              onChange={set("dob")}
            />
          </div>
        </Field>
        <Field
          id="doe"
          label="Date of Enrollment/Commissioning"
          req
          err={shown("doe")}
          hint="( It is date of joining service. Not Date of Promotion to JCO. Not Date of Joining DSC/other service. )"
        >
          <div className="fld">
            <Calendar size={18} aria-hidden />
            <input
              id="doe"
              type="date"
              value={f.doe}
              onChange={set("doe")}
            />
          </div>
        </Field>
        <Field id="dor" label="Date of retirement" req err={shown("dor")}>
          <div className="fld">
            <Calendar size={18} aria-hidden />
            <input
              id="dor"
              type="date"
              value={f.dor}
              onChange={set("dor")}
            />
          </div>
        </Field>
        <Field
          id="ent"
          label="Entitlement category* Serving & Retired (Armed Forces/Defence Civilians)"
          req
          err={shown("entitlement")}
        >
          <select
            id="ent"
            value={f.entitlement}
            onChange={set("entitlement")}
          >
            <option value="">Select</option>
            {ENTITLEMENT.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </Field>
        <Field id="pl" label="Pay Level" req err={shown("payLevel")}>
          <select id="pl" value={f.payLevel} onChange={set("payLevel")}>
            <option value="">Select</option>
            {PAY_LEVELS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </Field>
        <Field id="ppo" label="PPO/Discharge No. (Ex. Servicemen)">
          <div className="fld">
            <IdCard size={18} aria-hidden />
            <input id="ppo" value={f.ppo} onChange={set("ppo")} />
          </div>
        </Field>
      </div>
    </Section>
  );
}

export default RegisterServiceSection;
