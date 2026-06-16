import { ImageResponse } from "next/og"

export const alt = "Chase Burkhalter - Senior Data & Analytics Engineer"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #f8fafc 0%, #e0f2fe 48%, #ecfdf5 100%)",
          color: "#0f172a",
          padding: "72px",
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "18px", fontSize: 30, fontWeight: 700 }}>
            <div
              style={{
                width: 68,
                height: 68,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 18,
                background: "#0284c7",
                color: "white",
              }}
            >
              CB
            </div>
            chaseburkhalter.com
          </div>
          <div style={{ color: "#0369a1", fontSize: 26, fontWeight: 700 }}>
            Analytics Engineering
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          <h1
            style={{
              margin: 0,
              maxWidth: 920,
              fontSize: 76,
              lineHeight: 1,
              letterSpacing: "-1px",
              fontWeight: 800,
            }}
          >
            Chase Burkhalter
          </h1>
          <p
            style={{
              margin: 0,
              maxWidth: 950,
              fontSize: 38,
              lineHeight: 1.25,
              color: "#334155",
              fontWeight: 500,
            }}
          >
            Senior Data & Analytics Engineer building trusted metrics, governed dbt models, and production analytics instrumentation.
          </p>
        </div>

        <div style={{ display: "flex", gap: "18px", fontSize: 26, fontWeight: 700, color: "#0f766e" }}>
          <span>Snowflake</span>
          <span>dbt</span>
          <span>Segment</span>
          <span>Amplitude</span>
          <span>GA4</span>
        </div>
      </div>
    ),
    size
  )
}
