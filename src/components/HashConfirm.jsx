import { useState } from "react";
import Button from "./Button";

// TODO (HashConfirm) — hash confirmation for destructive plans.
//
// 1. Store what the person types in a `typed` state (useState) and show it in the field:
//    controlled input, with value={typed} and an onChange that updates the state.
// 2. The "Approve" button (variant "danger") stays DISABLED until `typed` is exactly
//    equal to `hash`: no prefix, no extra text, no different case.
// 3. On clicking "Approve", call onConfirm() once.
export default function HashConfirm({ hash, onConfirm }) {
  const [typed, setTyped] = useState("");

  return (
    <div className="hash-confirm">
      <label>
        Hash del plan
        <input
          type="text"
          autoComplete="off"
          spellCheck={false}
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
        />
      </label>
      <Button
        variant="danger"
        disabled={typed !== hash}
        onClick={() => onConfirm()}
      >
        Aprobar
      </Button>
    </div>
  );
}
