import { FloatingChrome } from "@/components/chrome/FloatingChrome";
import { MobileDock } from "@/components/chrome/MobileDock";
import { ProgressPill } from "@/components/chrome/ProgressPill";
import { JsonLd } from "@/components/JsonLd";
import { FaqTile } from "@/components/tiles/faq/FaqTile";
import { FeaturesTile } from "@/components/tiles/features/FeaturesTile";
import { GetMorphicTile } from "@/components/tiles/getmorphic/GetMorphicTile";
import { HowItWorksTile } from "@/components/tiles/howitworks/HowItWorksTile";
import { IntroTile } from "@/components/tiles/intro/IntroTile";
import { PricingTile } from "@/components/tiles/pricing/PricingTile";
import { SafetyTile } from "@/components/tiles/safety/SafetyTile";
import { SameDataTile } from "@/components/tiles/samedata/SameDataTile";
import { Tile } from "@/components/tiles/Tile";
import { TileController } from "@/components/tiles/TileController";
import { UseCasesTile } from "@/components/tiles/usecases/UseCasesTile";

/** The homepage: 9 full-screen snapping tiles (§6). */
export default function Home() {
  return (
    <>
      <JsonLd />
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
        <Tile index={6}>
          <PricingTile />
        </Tile>
        <Tile index={7}>
          <FaqTile />
        </Tile>
        <Tile index={8}>
          <GetMorphicTile />
        </Tile>
      </main>
      <noscript>
        <style>{`.reveal{opacity:1!important;transform:none!important}`}</style>
      </noscript>
    </>
  );
}
