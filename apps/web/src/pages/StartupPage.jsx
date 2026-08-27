import { useEffect, useState } from "react";
import { getHealth } from "../services/api-client.js";

export function StartupPage() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getHealth()
      .then((result) => {
        if (active) {
          setHealth(result);
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.message);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="startup-page">
      <section className="startup-card" aria-labelledby="startup-title">
        <p className="eyebrow">GHOST AI / FOUNDATION</p>
        <h1 id="startup-title">Workspace startup check</h1>
        <p className="intro">
          The initial frontend, API, and database connection are being verified.
        </p>

        {error ? <p className="status status-error">API request failed: {error}</p> : null}

        {!health && !error ? <p className="status">Checking services...</p> : null}

        {health ? (
          <dl className="service-list">
            <div>
              <dt>API</dt>
              <dd className={health.httpOk ? "status-ok" : "status-error"}>
                {health.httpOk ? "Connected" : "Unavailable"}
              </dd>
            </div>
            <div>
              <dt>PostgreSQL</dt>
              <dd className={health.database === "ok" ? "status-ok" : "status-error"}>
                {health.database === "ok" ? "Connected" : "Unavailable"}
              </dd>
            </div>
          </dl>
        ) : null}
      </section>
    </main>
  );
}
