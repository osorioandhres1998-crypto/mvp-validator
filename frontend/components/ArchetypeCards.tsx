import type { Archetype } from "../lib/types";

/** Tarjetas con los arquetipos de audiencia generados. */
export default function ArchetypeCards({ archetypes }: { archetypes: Archetype[] }) {
  return (
    <div className="archetypes">
      {archetypes.map((a) => (
        <div className="archetype-card" key={a.name}>
          <div className="archetype-head">
            <strong>{a.name}</strong>
            <span className="chip">{(a.segment_share * 100).toFixed(0)}%</span>
          </div>
          {a.description && <p className="archetype-desc">{a.description}</p>}
          <div className="archetype-meta">
            <span>💰 Sensibilidad precio: {a.price_sensitivity.toFixed(1)}</span>
            <span>📈 Adopción base: {(a.adoption_prob_base * 100).toFixed(0)}%</span>
          </div>
          {a.key_drivers && a.key_drivers.length > 0 && (
            <div className="drivers">
              {a.key_drivers.map((d) => (
                <span className="driver" key={d}>
                  {d}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
