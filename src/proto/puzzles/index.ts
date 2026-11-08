/** Every puzzle prototype, in the order the page lists them (by room). */
import type { Proto } from '../kit';
import { cornucopia, eggtree, flag, hutch } from './easter';
import { bow, broom, finale, sparklers } from './fourth';
import { chocolates, cobwebs, starlights, web } from './halloween';
import { fairylights, goldenegg, pumpkinpie, tree } from './christmas';
import { clause } from './clause';
import { breadboard, feast, hotdog, stocking } from './thanksgiving';
import { basket, jack, lovenotes, mailbox } from './valentines';
import {
  carvingWorkshop,
  hopsWorkshop,
  lightsWorkshop,
  picturesWorkshop,
  webWorkshop,
  wordsWorkshop,
} from './workshop';

export const PROTOS: Proto[] = [
  // Valentine's
  lovenotes,
  jack,
  basket,
  mailbox,
  // Easter
  hutch,
  flag,
  cornucopia,
  eggtree,
  // Fourth of July
  sparklers,
  bow,
  broom,
  finale,
  // Halloween
  cobwebs,
  chocolates,
  starlights,
  web,
  // Thanksgiving
  breadboard,
  hotdog,
  stocking,
  feast,
  // Christmas
  fairylights,
  goldenegg,
  pumpkinpie,
  tree,
  // Finale
  clause,
  // Generated in the browser
  webWorkshop,
  carvingWorkshop,
  wordsWorkshop,
  hopsWorkshop,
  lightsWorkshop,
  picturesWorkshop,
];
