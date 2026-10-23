import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ease, Reveal } from "./visuals";

// Editorial illustrations of capabilities, not a replica of interactive UI.
export const Icon = ({
  kind,
  size = 72,
}: {
  kind: "ads" | "people" | "case" | "review" | "download";
  size?: number;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {kind === "ads" && (
      <>
        <path d="M12 26h12L49 14v36L24 38H12zM23 38l5 16h-9l-5-16M55 25v14" />
        <path d="M24 26v12" />
      </>
    )}
    {kind === "people" && (
      <>
        <circle cx="27" cy="22" r="9" />
        <path d="M9 53v-5c0-10 8-16 18-16s18 6 18 16v5M46 14a9 9 0 0 1 0 17M51 36c6 3 9 8 9 16" />
      </>
    )}
    {kind === "case" && (
      <>
        <rect x="9" y="23" width="46" height="31" rx="4" />
        <path d="M23 23v-8h18v8M9 35q23 12 46 0M32 36v8" />
      </>
    )}
    {kind === "review" && (
      <>
        <circle cx="28" cy="28" r="18" />
        <path d="m42 42 14 14M20 28l6 6 12-13" />
      </>
    )}
    {kind === "download" && (
      <>
        <path d="M32 7v35m-12-12 12 12 12-12M12 43v13h40V43" />
      </>
    )}
  </svg>
);
export const CampaignIllustration = () => (
  <div style={{ display: "flex", gap: 28 }}>
    {(
      [
        { kind: "ads", label: "Anúncios", bg: "#e4eabf", ink: "#39452e" },
        { kind: "people", label: "Contatos", bg: "#d9e6df", ink: "#315747" },
        { kind: "case", label: "Contratações", bg: "#e3dfed", ink: "#4a4666" },
      ] as const
    ).map((item, i) => (
      <Reveal
        key={item.kind}
        delay={0.15 + i * 0.12}
        style={{
          width: 535,
          height: 330,
          borderRadius: 22,
          background: item.bg,
          color: item.ink,
          padding: "58px 52px",
          boxSizing: "border-box",
        }}
      >
        <Icon kind={item.kind} />
        <div style={{ fontSize: 42, marginTop: 48, fontWeight: 500 }}>
          {item.label}
        </div>
      </Reveal>
    ))}
  </div>
);
export const BudgetIllustration = () => {
  const f = useCurrentFrame(),
    { fps } = useVideoConfig();
  return (
    <div style={{ width: 950, height: 400, position: "relative" }}>
      <Reveal
        delay={0.15}
        style={{
          position: "absolute",
          left: 240,
          top: 0,
          width: 610,
          height: 285,
          borderRadius: 20,
          background: "#e8d8c1",
          padding: "44px 48px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ fontSize: 35, color: "#685039" }}>Despesas</div>
        <div
          style={{
            marginTop: 40,
            width: 410,
            height: 10,
            borderRadius: 5,
            background: "#ccb79c",
          }}
        />
        <div
          style={{
            marginTop: 24,
            width: 285,
            height: 10,
            borderRadius: 5,
            background: "#ccb79c",
          }}
        />
      </Reveal>
      <Reveal
        delay={0.35}
        style={{
          position: "absolute",
          left: 0,
          top: 110,
          width: 650,
          height: 270,
          borderRadius: 20,
          background: "#fcfcf9",
          border: "1px solid #deddd5",
          boxShadow: "0 24px 50px #292a2912",
          padding: "42px 48px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            color: "#493b2c",
          }}
        >
          <Icon kind="ads" size={50} />
          <div style={{ fontSize: 38 }}>Anúncios</div>
        </div>
        <div
          style={{
            marginTop: 42,
            height: 10,
            background: "#e5e7dd",
            borderRadius: 5,
          }}
        >
          <div
            style={{
              width: interpolate(f, [0.5 * fps, 1.6 * fps], [0, 280], ease),
              height: 10,
              background: "#9ba980",
              borderRadius: 5,
            }}
          />
        </div>
      </Reveal>
    </div>
  );
};
export const ReviewIllustration = () => (
  <div
    style={{ display: "flex", alignItems: "center", gap: 28, color: "#d0dfd1" }}
  >
    <div
      style={{
        border: "1px solid #4c5b4e",
        borderRadius: 18,
        padding: "26px 32px",
        fontSize: 30,
      }}
    >
      Análise por IA
    </div>
    <svg
      width="58"
      height="22"
      viewBox="0 0 58 22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M0 11h54m-10-9 10 9-10 9" />
    </svg>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        border: "1px solid #4c5b4e",
        borderRadius: 18,
        padding: "26px 32px",
        fontSize: 30,
      }}
    >
      <Icon kind="review" size={38} />
      Revisão por outra IA
    </div>
  </div>
);
export const ReportIllustration = () => (
  <div style={{ position: "relative", width: 1070, height: 310 }}>
    <div
      style={{
        position: "absolute",
        left: 23,
        top: 12,
        width: 690,
        height: 250,
        background: "#45485a",
        borderRadius: 16,
        transform: "rotate(-4deg)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 690,
        height: 250,
        background: "#d7d8ed",
        color: "#333544",
        borderRadius: 16,
        padding: "36px 42px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ fontSize: 38, fontWeight: 500 }}>Relatório</div>
      <div
        style={{
          height: 9,
          width: 470,
          background: "#a6aac5",
          borderRadius: 5,
          marginTop: 34,
        }}
      />
      <div
        style={{
          height: 9,
          width: 360,
          background: "#a6aac5",
          borderRadius: 5,
          marginTop: 19,
        }}
      />
      <div
        style={{
          height: 9,
          width: 420,
          background: "#a6aac5",
          borderRadius: 5,
          marginTop: 19,
        }}
      />
    </div>
    <div
      style={{
        position: "absolute",
        left: 792,
        top: 61,
        width: 124,
        height: 124,
        border: "1px solid #65756c",
        borderRadius: "50%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "#c4d9c9",
      }}
    >
      <Icon kind="download" size={62} />
    </div>
  </div>
);
