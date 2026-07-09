import { ImageResponse } from "next/og"

export const alt = "Chase Burkhalter, Senior Data & Analytics Engineer"
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
          background: "linear-gradient(135deg, #08111f 0%, #101b2e 48%, #1f163f 100%)",
          color: "#dde7f3",
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
                background: "#101b2e",
                border: "3px solid #22c55e",
                color: "#22c55e",
              }}
            >
              CB
            </div>
            chaseburkhalter.com
          </div>
          <div style={{ color: "#f97316", fontSize: 26, fontWeight: 700 }}>
            Data & Analytics Engineering
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
              maxWidth: 980,
              fontSize: 38,
              lineHeight: 1.25,
              color: "#a9b7ca",
              fontWeight: 500,
            }}
          >
            Senior Data & Analytics Engineer building governed, AI-ready data platforms.
          </p>
        </div>

        <div style={{ display: "flex", gap: "18px", fontSize: 26, fontWeight: 700, color: "#22c55e" }}>
          <span>Snowflake</span>
          <span style={{ color: "#8b5cf6" }}>dbt</span>
          <span>Fivetran</span>
          <span style={{ color: "#8b5cf6" }}>Python</span>
          <span style={{ color: "#f97316" }}>Amplitude</span>
          <span>MCP</span>
        </div>
      </div>
    ),
    size
  )
}
