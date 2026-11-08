import { CLAUSE_CARVING } from './carving';
import { CLAUSE_HOPS } from './hops';
import { CLAUSE_LIGHTS } from './lights';
import { CLAUSE_PICTURES } from './pictures';
import type { ClauseDef } from './types';
import { CLAUSE_WEBS } from './webs';
import { CLAUSE_WORDS } from './words';

export * from './types';
export { CLAUSE_WEBS, CLAUSE_CARVING, CLAUSE_LIGHTS, CLAUSE_WORDS, CLAUSE_HOPS, CLAUSE_PICTURES };

export const ALL_CLAUSES: readonly ClauseDef<unknown>[] = [
  CLAUSE_WEBS,
  CLAUSE_CARVING,
  CLAUSE_LIGHTS,
  CLAUSE_WORDS,
  CLAUSE_HOPS,
  CLAUSE_PICTURES,
] as const;
