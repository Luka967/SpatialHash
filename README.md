# SpatialHash
A node.js implementation of a 2D spatial hash.

# Documentation

### Item requirements
Example of an item:

```js
var item = {
    range: {
        x: 0,
        y: 0,
        w: 100,
        h: 150
    },
    __b: undefined
};
```

- Item must contain a `.range` object. The `.range` object also must have `x`, `y`, `w` and `h` variables/properties.
- Item must not have a `.__b` item defined.
- **Functionality is not guaranteed if requirements are not met.**

### Constructor

```js
const SpatialHash = require('spatialhash-2d');
var hash = new SpatialHash(rangeObj, bucketSize);
```

#### `rangeObj`

An object containing `x`, `y`, `w` and `h` variables/properties. The same functionality as `item.range` object.
```js
{
    x: /* X center */,
    y: /* Y center */,
    w: /* Half-width */,
    h: /* Half-height */
}
```

#### `bucketSize`

A number that represents the size of a bucket.

`bucketSize` is used to create the spatial hashes. The hashes are in a dimension of a square and have a half-width of `bucketSize`.

## Variables

#### `.bucketSize`

The second argument passed in the constructor. Changing it will create problems unless proceeded with a `.init()` call.

#### `.itemCount`

The amount of items currently in the map.

The maximum item count is 200 000 000.

#### `.hashes`

The map. See remarks for more info.

### Functions

#### `.init()`

Initializes the spatial hash arrays. Automatically called in the constructor.

Can be called to remove all items.

#### `.insert(item)`

Inserts an item.

See item requirements that need to be met. Functionality is not guaranteed if requirements are not met.

The maximum item count is 200 000 000.

The `.insert(item)` function creates a `.__b` object in the `item`.

#### `.remove(item)`

Removes an item.

The `.remove(item)` function will not remove items that do not have a `.__b` object inside them.

#### `.update(item)`

Removes then inserts the item.

Items that are moving need to be updated.

Calls `.remove(item)` and `.insert(item)`.

#### `.query(rangeObj, [selector])`

Searches the map for items in a specified `rangeObj` then returns an array of found items.

If any item is found to be intersecting the `rangeObj`, the class will call `selector(item)` if `selector` is provided.

If `selector(item)` returns `false` the array will not include the item.

#### `.any(rangeObj)`

Searches the map for items in a specified `rangeObj`.

Returns a boolean whether an item was found or not.

If any item is found to be intersecting the `rangeObj`, it will immediately return `true`. Otherwise returns `false`.

#### `.find(rangeObj, [callback])`

Searches the map for items in a specified `rangeObj`.

If any item is found to be intersecting the `rangeObj`, the class will call `callback(item)` if `callback` is provided.

## Remarks

This implementation's map is a two-dimensional array-like object.

```js
var hash = new SpatialHash({
    x: 0,
    y: 0,
    w: 200,
    h: 200
}, 100);
console.log(hash.hashes);
```

returns

```js
{ '0': { '0': [], '1': [], '2': [], '-2': [], '-1': [] },
  '1': { '0': [], '1': [], '2': [], '-2': [], '-1': [] },
  '2': { '0': [], '1': [], '2': [], '-2': [], '-1': [] },
  '-2': { '0': [], '1': [], '2': [], '-2': [], '-1': [] },
  '-1': { '0': [], '1': [], '2': [], '-2': [], '-1': [] } }
```

The map goes horizontally then vertically, and at the end is an array that will contain objects.

**`.insert(item)` can insert an item into the map multiple times**.

This is because an item can be larger than the bucket size and will sometimes not be found when searching.

This requires for an ID, and that's why there is a maximum item count, 200 000 000, to ensure integer stability.
