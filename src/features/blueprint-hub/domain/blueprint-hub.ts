// src/features/blueprint-hub/domain/blueprint-hub.ts

export interface BlueprintProject {
  name: string;
  architecture: string;
  stack: Record<string, unknown>;
  featureCount: number;
  features: string[];
  fileMetrics: {
    totalFiles: number;
    codeFiles: number;
    testFiles: number;
    testRatio: number;
  };
  governance: {
    hasCursorRules: boolean;
    hasAgentsMd: boolean;
    rulesCount: number;
    hasSnapshot: boolean;
  };
  gitMetrics: {
    commits: number;
    hasRemote: boolean;
  };
}

export interface CreateBlueprintInput {
  blueprintVersion: string;
  generatedAt?: string;
  project: BlueprintProject;
}

export interface BlueprintEntity {
  id: string;
  blueprintId: string;
  blueprintVersion: string;
  projectName: string;
  architecture: string;
  stack: Record<string, unknown>;
  featureCount: number;
  features: string[];
  fileMetrics: Record<string, unknown>;
  governance: Record<string, unknown>;
  gitMetrics: Record<string, unknown>;
  createdAt: Date;
}
