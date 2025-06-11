// types/index.ts - Updated with wet slider and male-specific poses
export interface AdvancedOptions {
  gender: 'female' | 'male'
  age: number
  bodyType: number // 0-100 scale
  breastSize: number // 0-100 scale
  pose: 'selfie' | 'pants-down' | 'gagging' | 'squirting' | 'hand-on-head' | 'standing-front' | 'standing-back' | 'from above' | 'laying-legs-open' | 'ass-spread' | 'doggystyle' | 'missionary-pov' | 'oral-pov' | 'cumshot' | 'tongue-out' | 'blowjob' | 'shower' | 'sucking' | 'from behind' | 'spread legs'
  skinTone: number // 0-100 dark to light
  wetness: number // 0-100 scale for wet/oily effect (NEW)
}

export interface ConsentChecks {
  terms: boolean;
  age: boolean;
  consent: boolean;
}