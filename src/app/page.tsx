import { FloatingChrome } from "@/components/chrome/FloatingChrome";
import { MobileDock } from "@/components/chrome/MobileDock";
import { ProgressPill } from "@/components/chrome/ProgressPill";
import { FeaturesTile } from "@/components/tiles/features/FeaturesTile";
import { HowItWorksTile } from "@/components/tiles/howitworks/HowItWorksTile";
import { IntroTile } from "@/components/tiles/intro/IntroTile";
import { SafetyTile } from "@/components/tiles/safety/SafetyTile";
import { SameDataTile } from "@/components/tiles/samedata/SameDataTile";
import { Tile } from "@/components/tiles/Tile";
import { TileController } from "@/components/tiles/TileController";
import { UseCasesTile } from "@/components/tiles/usecases/UseCasesTile";
import { tiles } from "@/config/tiles";

function Placeholder({ index }: { index: number }) {
  return (
    <div className="tile-content justify-center">
      <p className="eyebrow reveal">{tiles[index].label}</p>
      <h2 className="h2-tile reveal mt-4 max-w-[16ch]">{tiles[index].label}</h2>
    </div>
  );
}

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
        <Tile index={1}>
          <UseCasesTile />
        </Tile>
        <Tile index={2}>
          <SameDataTile />
        </Tile>
        <Tile index={3}>
          <HowItWorksTile />
        </Tile>
        <Tile index={4}>
          <SafetyTile />
        </Tile>
        <Tile index={5}>
          <FeaturesTile />
        </Tile>
        {[6, 7, 8].map((i) => (
          <Tile key={i} index={i}>
            <Placeholder index={i} />
          </Tile>
        ))}
      </main>
    </>
  );
}
