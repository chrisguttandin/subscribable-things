# subscribable-things

**A collection of reactive wrappers for various browser APIs.**

[![tests](https://img.shields.io/travis/chrisguttandin/subscribable-things/master.svg?style=flat-square)](https://travis-ci.org/chrisguttandin/subscribable-things)
[![dependencies](https://img.shields.io/david/chrisguttandin/subscribable-things.svg?style=flat-square)](https://www.npmjs.com/package/subscribable-things)
[![version](https://img.shields.io/npm/v/subscribable-things.svg?style=flat-square)](https://www.npmjs.com/package/subscribable-things)

```js
import { mediaQueryMatches } from 'subscribable-things';

const subscribe = mediaQueryMatches('(max-width:600px)');

const unsubscribe = subscribe((isMatching) => console.log(isMatching));

unsubscribe();
```

```js
import { from } from 'rxjs';
import { mediaQueryMatches } from 'subscribable-things';

const mediaQueryMatches$ = from(mediaQueryMatches('(max-width:600px)'));

const subscription = mediaQueryMatches$.subscribe((isMatching) => console.log(isMatching));

subscription.unsubscribe();
```
