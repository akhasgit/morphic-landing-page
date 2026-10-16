import { FloatingChrome } from "@/components/chrome/FloatingChrome";
import { MobileDock } from "@/components/chrome/MobileDock";
import { ProgressPill } from "@/components/chrome/ProgressPill";
import { Tile } from "@/components/tiles/Tile";
import { TileController } from "@/components/tiles/TileController";
import { tiles } from "@/config/tiles";

export default function Home() {
  return (
    <>
      <TileController />
      <FloatingChrome />
      <ProgressPill />
      <MobileDock />
      <main className="tile-stack">
        {tiles.map((t, i) => (
          <Tile key={t.id} index={i}>
            <div className="tile-content justify-center">
              <p className="eyebrow reveal" style={{ ["--i" as string]: 0 }}>
                {String(i + 1).padStart(2, "0")} · {t.label}
              </p>
              <h2 className="h2-tile reveal mt-4 max-w-[16ch]" style={{ ["--i" as string]: 1 }}>
                {t.label}
              </h2>
            </div>
          </Tile>
        ))}
      </main>
    </>
  );
}
