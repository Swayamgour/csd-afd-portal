import React from "react";
import { User, CreditCard, IdCard, Eye, EyeOff } from "lucide-react";
import { Field, Section } from "./RegisterField.jsx";

export function RegisterCardSection({
  f,
  shown,
  set,
  upper,
  checkSingleDuplicate,
  showCardId,
  setShowCardId,
  showChip,
  setShowChip,
}) {
  return (
    <Section n="1" title="Card details">
      <Field
        id="name"
        label="Name as printed on front face of grocery canteen card"
        req
        err={shown("name")}
      >
        <div className="fld">
          <User size={18} aria-hidden />
          <input
            id="name"
            placeholder="(Only Alphabets allowed)"
            value={f.name}
            onChange={set("name")}
            aria-invalid={!!shown("name")}
          />
        </div>
      </Field>
      <div className="reg-grid">
        <Field
          id="cardId"
          label="Card ID printed on front face of the grocery card"
          req
          err={shown("cardId")}
          hint="( Alphanumeric no. starting with GA/GB/GC/GE/GM/GR like grocery card id GA01052027551000J00. Third last is alphabet not number. )"
        >
          <div className="fld has-eye">
            <CreditCard size={18} aria-hidden />
            <input
              id="cardId"
              autoComplete="off"
              type={showCardId ? "text" : "password"}
              placeholder="(19 digit Alphanumeric)"
              maxLength={19}
              value={f.cardId}
              onChange={upper("cardId")}
              onBlur={() => checkSingleDuplicate("cardId", f.cardId)}
              aria-invalid={!!shown("cardId")}
            />
            <button
              type="button"
              className="eye"
              aria-label={showCardId ? "Hide Card ID" : "Show Card ID"}
              onClick={() => setShowCardId(!showCardId)}
            >
              {showCardId ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>
        <Field
          id="chip"
          label="Chip number printed on back of canteen card or printed on the grocery bill"
          req
          err={shown("chip")}
          hint="( 16 Digit No. (5312120004689336). Given on reverse of grocery card at bottom right. Also given on grocery bill.)"
        >
          <div className="fld has-eye">
            <IdCard size={18} aria-hidden />
            <input
              id="chip"
              type={showChip ? "text" : "password"}
              autoComplete="off"
              inputMode="numeric"
              placeholder="(16 digit Numeric)"
              maxLength={16}
              value={f.chip}
              onChange={set("chip")}
              onBlur={() => checkSingleDuplicate("chipNumber", f.chip)}
              aria-invalid={!!shown("chip")}
            />
            <button
              type="button"
              className="eye"
              aria-label={showChip ? "Hide Chip number" : "Show Chip number"}
              onClick={() => setShowChip(!showChip)}
            >
              {showChip ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>
      </div>
    </Section>
  );
}

export default RegisterCardSection;
