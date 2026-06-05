import { describe, expect, it } from "vitest";
import { parseStoredVector, serializeVector } from "@/lib/supabase/vector";

describe("supabase vector utilities", () => {
  it("serializes vectors into JSON strings", () => {
    expect(serializeVector([0.1, 0.2, 0.3])).toBe("[0.1,0.2,0.3]");
  });

  it("parses stored vector JSON strings", () => {
    expect(parseStoredVector("[0.1,0.2,0.3]")).toEqual([0.1, 0.2, 0.3]);
  });

  it("returns vectors unchanged when already parsed", () => {
    expect(parseStoredVector([0.1, 0.2, 0.3])).toEqual([0.1, 0.2, 0.3]);
  });

  it("returns null for invalid stored vector values", () => {
    expect(parseStoredVector("not-a-vector")).toBeNull();
    expect(parseStoredVector(null)).toBeNull();
  });
});
