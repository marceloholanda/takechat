import { describe, expect, it } from "vitest";
import { offerDates } from "@/lib/offer-calendar";
describe("offer calendar", () => {
  it("calculates moving Brazilian retail dates each year", () => {
    const dates = offerDates(2026);
    expect(dates.find(x => x.name === "Páscoa")?.date).toBe("2026-04-05");
    expect(dates.find(x => x.name === "Dia das Mães")?.date).toBe("2026-05-10");
    expect(dates.find(x => x.name === "Black Friday")?.date).toBe("2026-11-27");
    expect(offerDates(2027).find(x => x.name === "Black Friday")?.date).toBe("2027-11-26");
  });
});
