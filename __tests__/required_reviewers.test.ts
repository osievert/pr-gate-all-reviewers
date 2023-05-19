import {ReviewGatekeeper} from '../src/review-gatekeeper'

test('Exact', async () => {
  expect(new ReviewGatekeeper([], []).satisfy()).toBeTruthy()

  expect(new ReviewGatekeeper(['user1'], ['user1']).satisfy()).toBeTruthy()

  expect(
    new ReviewGatekeeper(['user1', 'user2'], ['user1', 'user2']).satisfy()
  ).toBeTruthy()

  expect(
    new ReviewGatekeeper(
      ['user1', 'user2', 'user3'],
      ['user1', 'user2', 'user3']
    ).satisfy()
  ).toBeTruthy()
})

test('More', async () => {
  expect(new ReviewGatekeeper([], ['user1']).satisfy()).toBeTruthy()

  expect(
    new ReviewGatekeeper(['user1'], ['user1', 'user2']).satisfy()
  ).toBeTruthy()
})

test('Less', async () => {
  expect(new ReviewGatekeeper(['user1'], []).satisfy()).toBeFalsy()

  expect(
    new ReviewGatekeeper(['user1', 'user2'], ['user1']).satisfy()
  ).toBeFalsy()

  expect(
    new ReviewGatekeeper(['user1', 'user2'], ['user2']).satisfy()
  ).toBeFalsy()

  expect(
    new ReviewGatekeeper(['user1', 'user2'], ['user2', 'user4']).satisfy()
  ).toBeFalsy()
})
