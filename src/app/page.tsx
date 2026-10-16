import { FloatingChrome } from "@/components/chrome/FloatingChrome";
import { MobileDock } from "@/components/chrome/MobileDock";
import { ProgressPill } from "@/components/chrome/ProgressPill";
import { IntroTile } from "@/components/tiles/intro/IntroTile";
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
        <Tile index={0}>
          <IntroTile />
        </Tile>
        {tiles.slice(1).map((t, j) => (
          <Tile key={t.id} index={j + 1}>
            <div className="tile-content justify-center">
              <p className="eyebrow reveal">{t.label}</p>
              <h2 className="h2-tile reveal mt-4 max-w-[16ch]">{t.label}</h2>
            </div>
          </Tile>
        ))}
      </main>
    </>
  );
}
