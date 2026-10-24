import content from '../template/content.json' with { type: 'json' };
export const environmentName = content.identity.title;
export const homeIntroduction = { description: content.identity.introduction, thesisTitle: content.identity.researchTitle };
export const people = content.people;
export const environmentGoals = content.environmentGoals;
export const modules = content.modules;
