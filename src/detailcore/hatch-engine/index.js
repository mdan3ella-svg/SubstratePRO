export const HATCHES={Concrete:{color:'#a5c1c7',pattern:'diagonal'},Steel:{color:'#8fabb1',pattern:'cross'},Masonry:{color:'#cfbca2',pattern:'brick'},Timber:{color:'#d5b38c',pattern:'horizontal'},Glass:{color:'#b4e2e8',pattern:'solid'},Default:{color:'#c9d7da',pattern:'solid'}};
export function hatchFor(material){return HATCHES[material]||HATCHES.Default}
