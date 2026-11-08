/** Every puzzle prototype, in the order the page lists them (by room). */
import type { Proto } from '../kit';
import {
  cauldron,
  fairylights,
  goldenegg,
  icepop,
  loveletter,
  pumpkinpie,
  tree,
} from './christmas';
import { clause } from './clause';
import { cornucopia, eggtree, flag, ghost, gingerbread, hutch, rose } from './easter';
import { bow, broom, chocobunny, finale, harvestcorn, snowglobe, sparklers } from './fourth';
import { chick, chocolates, cobwebs, gravyboat, picnic, starlights, web } from './halloween';
import { breadboard, candycorn, feast, hotdog, jellybeans, locket, stocking } from './thanksgiving';
import { basket, candycane, jack, lovenotes, mailbox, watermelon, wishbone } from './valentines';
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
  mailbox,
  jack,
  basket,
  watermelon,
  wishbone,
  candycane,
  // Easter
  hutch,
  eggtree,
  flag,
  cornucopia,
  rose,
  ghost,
  gingerbread,
  // Fourth of July
  sparklers,
  finale,
  bow,
  broom,
  chocobunny,
  harvestcorn,
  snowglobe,
  // Halloween
  cobwebs,
  web,
  chocolates,
  starlights,
  chick,
  picnic,
  gravyboat,
  // Thanksgiving
  breadboard,
  feast,
  hotdog,
  stocking,
  locket,
  jellybeans,
  candycorn,
  // Christmas
  fairylights,
  tree,
  goldenegg,
  pumpkinpie,
  loveletter,
  icepop,
  cauldron,
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
