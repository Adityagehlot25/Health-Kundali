import { requestJson } from "@/services/backend";
import { readAuthToken } from "@/services/token-storage";

type SaveRunInput = {
  distanceKm: number;
  durationSeconds: number;
  startedAt: string;
  endedAt: string;
  notes?: string;
};

type SaveRunResponse = {
  message: string;
  run: {
    id: string;
    userId: string;
    distanceKm: number;
    durationSeconds: number;
    startedAt: string;
    endedAt: string;
    averagePaceSecondsPerKm: number | null;
    notes: string;
    createdAt: string;
  };
};

export async function saveRun(input: SaveRunInput) {
  const token = await readAuthToken();

  if (!token) {
    throw new Error("You need to log in again before saving a run.");
  }

  return requestJson<SaveRunResponse>("/runs", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      ...input,
      notes: input.notes || "",
    }),
  });
}