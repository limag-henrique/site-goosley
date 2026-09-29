import {
  buildProfileSections,
  getBirthYear,
  type PersonIndexEntry,
  type PersonProfileResult,
} from "@/lib/criminalidadefacial-profile";
import { GENERATED_PEOPLE } from "@/server/criminalidadefacial/pessoas.generated";

type BirthYearChallenge =
  | { status: "not-found" }
  | { status: "missing-birth-year" }
  | { status: "ready"; birthYear: number; years: [number, number, number] };

type BirthYearVerification =
  | { status: "not-found" }
  | { status: "missing-birth-year" }
  | { status: "wrong-year" }
  | { status: "verified"; profile: PersonProfileResult };

function findPerson(id: string) {
  return GENERATED_PEOPLE.find((person) => person.id === id);
}

function orderedChallengeYears(id: string, birthYear: number): [number, number, number] {
  const years = [birthYear - 1, birthYear, birthYear + 1];
  const rotation = [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0) % years.length;
  return [...years.slice(rotation), ...years.slice(0, rotation)] as [number, number, number];
}

export function getPeopleIndex(): PersonIndexEntry[] {
  return GENERATED_PEOPLE.map((person) => ({
    id: person.id,
    fullName: person.fullName,
    hasBirthYear: getBirthYear(person.raw) !== undefined,
  }));
}

export function getBirthYearChallenge(id: string): BirthYearChallenge {
  const person = findPerson(id);
  if (!person) return { status: "not-found" };
  const birthYear = getBirthYear(person.raw);
  if (birthYear === undefined) return { status: "missing-birth-year" };
  return { status: "ready", birthYear, years: orderedChallengeYears(id, birthYear) };
}

export function verifyBirthYear(id: string, year: number): BirthYearVerification {
  const person = findPerson(id);
  if (!person) return { status: "not-found" };
  const birthYear = getBirthYear(person.raw);
  if (birthYear === undefined) return { status: "missing-birth-year" };
  if (year !== birthYear) return { status: "wrong-year" };

  return {
    status: "verified",
    profile: {
      id: person.id,
      fullName: person.fullName,
      sections: buildProfileSections(person.raw),
    },
  };
}
