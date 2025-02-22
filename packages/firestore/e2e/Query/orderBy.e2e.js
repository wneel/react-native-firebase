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
const COLLECTION = 'firestore';
const { wipe } = require('../helpers');
describe('firestore().collection().orderBy()', function () {
  before(function () {
    return wipe();
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

    it('throws if fieldPath is not valid', function () {
      try {
        firebase.firestore().collection(COLLECTION).orderBy(123);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'fieldPath' must be a string or instance of FieldPath");
        return Promise.resolve();
      }
    });

    it('throws if fieldPath string is invalid', function () {
      try {
        firebase.firestore().collection(COLLECTION).orderBy('.foo.bar');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'fieldPath' Invalid field path");
        return Promise.resolve();
      }
    });

    it('throws if direction string is not valid', function () {
      try {
        firebase.firestore().collection(COLLECTION).orderBy('foo', 'up');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'directionStr' must be one of 'asc' or 'desc'");
        return Promise.resolve();
      }
    });

    it('throws if a startAt()/startAfter() has already been set', async function () {
      try {
        const doc = firebase.firestore().doc(`${COLLECTION}/startATstartAfter`);
        await doc.set({ foo: 'bar' });
        const snapshot = await doc.get();

        firebase.firestore().collection(COLLECTION).startAt(snapshot).orderBy('foo');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql('You must not call startAt() or startAfter()');
        return Promise.resolve();
      }
    });

    it('throws if a endAt()/endBefore() has already been set', async function () {
      try {
        const doc = firebase.firestore().doc(`${COLLECTION}/endAtendBefore`);
        await doc.set({ foo: 'bar' });
        const snapshot = await doc.get();

        firebase.firestore().collection(COLLECTION).endAt(snapshot).orderBy('foo');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql('You must not call endAt() or endBefore()');
        return Promise.resolve();
      }
    });

    it('throws if duplicating the order field path', function () {
      try {
        firebase.firestore().collection(COLLECTION).orderBy('foo.bar').orderBy('foo.bar');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql('Order by clause cannot contain duplicate fields');
        return Promise.resolve();
      }
    });

    it('orders by a value ASC', async function () {
      const colRef = firebase
        .firestore()
        // Firestore caches aggressively, even if you wipe the emulator, local documents are cached
        // between runs, so use random collections to make sure `tests:*:test-reuse` works while iterating
        .collection(`${COLLECTION}/${Utils.randString(12, '#aA')}/order-asc`);

      await colRef.add({ value: 1 });
      await colRef.add({ value: 3 });
      await colRef.add({ value: 2 });

      const snapshot = await colRef.orderBy('value', 'asc').get();
      const expected = [1, 2, 3];

      snapshot.forEach((docSnap, i) => {
        docSnap.data().value.should.eql(expected[i]);
      });
    });

    it('orders by a value DESC', async function () {
      const colRef = firebase
        .firestore()
        // Firestore caches aggressively, even if you wipe the emulator, local documents are cached
        // between runs, so use random collections to make sure `tests:*:test-reuse` works while iterating
        .collection(`${COLLECTION}/${Utils.randString(12, '#aA')}/order-desc`);

      await colRef.add({ value: 1 });
      await colRef.add({ value: 3 });
      await colRef.add({ value: 2 });

      const snapshot = await colRef
        .orderBy(new firebase.firestore.FieldPath('value'), 'desc')
        .get();
      const expected = [3, 2, 1];

      snapshot.forEach((docSnap, i) => {
        docSnap.data().value.should.eql(expected[i]);
      });
    });
  });

  describe('modular', function () {
    it('throws if fieldPath is not valid', function () {
      const { getFirestore, collection, query, orderBy } = firestoreModular;
      try {
        query(collection(getFirestore(), COLLECTION), orderBy(123));
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'fieldPath' must be a string or instance of FieldPath");
        return Promise.resolve();
      }
    });

    it('throws if fieldPath string is invalid', function () {
      const { getFirestore, collection, query, orderBy } = firestoreModular;
      try {
        query(collection(getFirestore(), COLLECTION), orderBy('.foo.bar'));
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'fieldPath' Invalid field path");
        return Promise.resolve();
      }
    });

    it('throws if direction string is not valid', function () {
      const { getFirestore, collection, query, orderBy } = firestoreModular;
      try {
        query(collection(getFirestore(), COLLECTION), orderBy('foo', 'up'));
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'directionStr' must be one of 'asc' or 'desc'");
        return Promise.resolve();
      }
    });

    it('throws if a startAt()/startAfter() has already been set', async function () {
      const { getFirestore, collection, doc, setDoc, getDoc, query, startAt, orderBy } =
        firestoreModular;
      const db = getFirestore();
      try {
        const docRef = doc(db, `${COLLECTION}/startATstartAfter`);
        await setDoc(docRef, { foo: 'bar' });
        const snapshot = await getDoc(docRef);

        query(collection(db, COLLECTION), startAt(snapshot), orderBy('foo'));
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql('You must not call startAt() or startAfter()');
        return Promise.resolve();
      }
    });

    it('throws if a endAt()/endBefore() has already been set', async function () {
      const { getFirestore, collection, doc, setDoc, getDoc, query, endAt, orderBy } =
        firestoreModular;
      const db = getFirestore();
      try {
        const docRef = doc(db, `${COLLECTION}/endAtendBefore`);
        await setDoc(docRef, { foo: 'bar' });
        const snapshot = await getDoc(docRef);

        query(collection(db, COLLECTION), endAt(snapshot), orderBy('foo'));
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql('You must not call endAt() or endBefore()');
        return Promise.resolve();
      }
    });

    it('throws if duplicating the order field path', function () {
      const { getFirestore, collection, query, orderBy } = firestoreModular;
      try {
        query(collection(getFirestore(), COLLECTION), orderBy('foo.bar'), orderBy('foo.bar'));
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql('Order by clause cannot contain duplicate fields');
        return Promise.resolve();
      }
    });

    it('orders by a value ASC', async function () {
      const { getFirestore, collection, addDoc, getDocs, query, orderBy } = firestoreModular;
      const colRef = collection(
        getFirestore(),
        // Firestore caches aggressively, even if you wipe the emulator, local documents are cached
        // between runs, so use random collections to make sure `tests:*:test-reuse` works while iterating
        `${COLLECTION}/${Utils.randString(12, '#aA')}/order-asc`,
      );

      await addDoc(colRef, { value: 1 });
      await addDoc(colRef, { value: 3 });
      await addDoc(colRef, { value: 2 });

      const snapshot = await getDocs(query(colRef, orderBy('value', 'asc')));
      const expected = [1, 2, 3];

      snapshot.forEach((docSnap, i) => {
        docSnap.data().value.should.eql(expected[i]);
      });
    });

    it('orders by a value DESC', async function () {
      const { getFirestore, collection, addDoc, getDocs, query, orderBy, FieldPath } =
        firestoreModular;
      const colRef = collection(
        getFirestore(),
        // Firestore caches aggressively, even if you wipe the emulator, local documents are cached
        // between runs, so use random collections to make sure `tests:*:test-reuse` works while iterating
        `${COLLECTION}/${Utils.randString(12, '#aA')}/order-desc`,
      );

      await addDoc(colRef, { value: 1 });
      await addDoc(colRef, { value: 3 });
      await addDoc(colRef, { value: 2 });

      const snapshot = await getDocs(query(colRef, orderBy(new FieldPath('value'), 'desc')));
      const expected = [3, 2, 1];

      snapshot.forEach((docSnap, i) => {
        docSnap.data().value.should.eql(expected[i]);
      });
    });
  });
});
