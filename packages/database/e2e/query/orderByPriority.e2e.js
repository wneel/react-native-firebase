/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

const { PATH, seed, wipe } = require('../helpers');

const TEST_PATH = `${PATH}/orderByPriority`;

describe('database().ref().orderByPriority()', function () {
  before(async function () {
    await seed(TEST_PATH);
  });

  after(async function () {
    await wipe(TEST_PATH);
  });

  describe('v8 compatibility', function () {
    beforeEach(async function beforeEachTest() {
      // @ts-ignore
      globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;
    });

    afterEach(async function afterEachTest() {
      // @ts-ignore
      globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = false;
    });

    it('throws if an orderBy call has already been set', async function () {
      try {
        await firebase.database().ref().orderByChild('foo').orderByPriority();
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("You can't combine multiple orderBy calls");
        return Promise.resolve();
      }
    });

    it('order by priority', async function () {
      const ref = firebase.database().ref(TEST_PATH).child('query');

      await Promise.all([
        ref.child('a').setPriority(2),
        ref.child('b').setPriority(3),
        ref.child('c').setPriority(1),
      ]);

      try {
        const snapshot = await ref.orderByPriority().once('value');

        const expected = ['c', 'a', 'b'];

        snapshot.forEach((childSnapshot, i) => {
          childSnapshot.key.should.eql(expected[i]);
        });

        return Promise.resolve();
      } catch (error) {
        throw error;
      }
    });
  });

  describe('modular', function () {
    it('throws if an orderBy call has already been set', async function () {
      const { getDatabase, ref, orderByChild, orderByPriority, query } = databaseModular;

      try {
        query(ref(getDatabase()), orderByChild('foo'), orderByPriority());
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("You can't combine multiple orderBy calls");
        return Promise.resolve();
      }
    });

    it('order by priority', async function () {
      const { getDatabase, ref, child, setPriority, orderByPriority, get, query } = databaseModular;

      const dbRef = child(ref(getDatabase(), TEST_PATH), 'query');

      await Promise.all([
        setPriority(child(dbRef, 'a'), 2),
        setPriority(child(dbRef, 'b'), 3),
        setPriority(child(dbRef, 'c'), 1),
      ]);

      try {
        const snapshot = await get(query(dbRef, orderByPriority()));

        const expected = ['c', 'a', 'b'];

        snapshot.forEach((childSnapshot, i) => {
          childSnapshot.key.should.eql(expected[i]);
        });

        return Promise.resolve();
      } catch (error) {
        throw error;
      }
    });
  });
});
