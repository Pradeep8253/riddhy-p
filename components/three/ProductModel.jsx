'use client';

import { Suspense } from 'react';
import { Center, Float } from '@react-three/drei';
import { SofaModel, BedModel, WardrobeModel, DiningModel, StudyModel } from './models/FurnitureModels';
import { RefrigeratorModel, WasherModel, ACModel, TVModel, MicrowaveModel, ChimneyModel, PurifierModel } from './models/ApplianceModels';
import { MattressModel, DecorModel, StorageModel } from './models/SmallModels';

const MODEL_MAP = {
  sofa: SofaModel, bed: BedModel, wardrobe: WardrobeModel, dining: DiningModel, study: StudyModel,
  mattress: MattressModel, decor: DecorModel, storage: StorageModel, refrigerator: RefrigeratorModel,
  washer: WasherModel, ac: ACModel, tv: TVModel, microwave: MicrowaveModel, chimney: ChimneyModel, purifier: PurifierModel
};

export default function ProductModel({ type = 'sofa', dims, colorway, finish, open = false, explode = 0, float = true }) {
  const Model = MODEL_MAP[type] || SofaModel;
  const width = Number(dims?.width || 100), depth = Number(dims?.depth || 80), height = Number(dims?.height || 100);
  const longest = Math.max(width, depth, height);
  const scale = [width / longest * 2.25, height / longest * 2.25, depth / longest * 2.25];
  const props = { color: colorway, finish, open, explode };
  const model = <group scale={scale}><Model {...props} /></group>;
  return <Suspense fallback={null}><Center><group>{float ? <Float speed={1.15} rotationIntensity={.08} floatIntensity={.12}>{model}</Float> : model}</group></Center></Suspense>;
}
