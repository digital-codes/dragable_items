import { describe, it, expect } from "vitest";
import { getClasses } from "../src/services/ContextMatch";
import expectedResults from "./expectedResults";

describe("getClasses rule matrix", () => {
  it.each(expectedResults)(
    "features %j should return classes %j",
    (row) => {
      const features = row.features;
      const expected = row.classes;
      const actual = getClasses(features);
      expect(actual).toEqual(expected);
    }
  );
});
