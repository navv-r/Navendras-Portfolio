import { PROJECTS, TECH, CHANNELS } from './data/site';

test('site data is populated', () => {
  expect(PROJECTS.length).toBeGreaterThan(0);
  expect(TECH.length).toBeGreaterThan(0);
  expect(CHANNELS.length).toBe(3);
});
