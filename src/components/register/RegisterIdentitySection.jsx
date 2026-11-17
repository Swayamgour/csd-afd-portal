import React from "react";
import { IdCard, Eye, EyeOff } from "lucide-react";
import { Field, Section } from "./RegisterField.jsx";

export function RegisterIdentitySection({
  f,
  shown,
  upper,
  noPaste,
  checkSingleDuplicate,
  showPan,
  setShowPan,
  showPanC,
  setShowPanC,
}) {
  return (
    <Section n="3" title="Identity">
      <div className="reg-grid">
        <Field id="pan" label="PAN number" req err={shown("pan")}>
          <div className="fld has-eye">
            <IdCard size={18} aria-hidden />
            <input
              id="pan"
              type={showPan ? "text" : "password"}
              autoComplete="off"
              maxLength={10}
              value={f.pan}
              onChange={upper("pan")}
              onBlur={() => checkSingleDuplicate("pan", f.pan)}
              aria-invalid={!!shown("pan")}
            />
            <button
              type="button"
              className="eye"
              aria-label={showPan ? "Hide PAN number" : "Show PAN number"}
              onClick={() => setShowPan(!showPan)}
            >
              {showPan ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>
        <Field
          id="panC"
          label="Confirm PAN number"
          err={shown("panC")}
          hint="( Copy paste is not allowed )"
        >
          <div className="fld has-eye">
            <IdCard size={18} aria-hidden />
            <input
              id="panC"
              type={showPanC ? "text" : "password"}
              maxLength={10}
              autoComplete="off"
              value={f.panC}
              onChange={upper("panC")}
              onPaste={noPaste}
              onDrop={noPaste}
              aria-invalid={!!shown("panC")}
            />
            <button
              type="button"
              className="eye"
              aria-label={
                showPanC ? "Hide Confirm PAN number" : "Show Confirm PAN number"
              }
              onClick={() => setShowPanC(!showPanC)}
            >
              {showPanC ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>
      </div>
    </Section>
  );
}

export default RegisterIdentitySection;
