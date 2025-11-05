
import * as IMG from '../data/images.js'
export function getSources(key){
  const v = IMG[key]
  return Array.isArray(v) ? v : [v]
}
