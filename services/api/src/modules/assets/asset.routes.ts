import type { FastifyInstance } from "fastify";

type AssetBootstrapItem = {
  id: string;
  name: string;
  imageUrl: string;
  providerKey: string;
};

type AssetBootstrapPayload = {
  garments: AssetBootstrapItem[];
  lipsticks: AssetBootstrapItem[];
  models: AssetBootstrapItem[];
};

const defaultAssetBootstrapPayload: AssetBootstrapPayload = {
  garments: [
    {
      id: "garment_001",
      name: "Classic Blazer",
      imageUrl: "https://cdn.local/assets/garments/classic-blazer.jpg",
      providerKey: "seed"
    }
  ],
  lipsticks: [
    {
      id: "lip_001",
      name: "Rose Bloom",
      imageUrl: "https://cdn.local/assets/lipsticks/rose-bloom.jpg",
      providerKey: "seed"
    }
  ],
  models: [
    {
      id: "model_001",
      name: "Studio Model A",
      imageUrl: "https://cdn.local/assets/models/studio-model-a.jpg",
      providerKey: "seed"
    }
  ]
};

let assetBootstrapProvider = async (): Promise<AssetBootstrapPayload> => defaultAssetBootstrapPayload;

export function setAssetBootstrapProvider(provider: typeof assetBootstrapProvider) {
  assetBootstrapProvider = provider;
}

export function resetAssetBootstrapProvider() {
  assetBootstrapProvider = async () => defaultAssetBootstrapPayload;
}

export async function registerAssetRoutes(app: FastifyInstance) {
  app.get("/assets/bootstrap", async () => {
    return assetBootstrapProvider();
  });
}
