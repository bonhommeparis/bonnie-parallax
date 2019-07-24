# 🐢 bonnie-parallax

A Javascript library.

[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/bonhommeparis/bonnie-parallax/blob/master/LICENSE)


## Getting started

### Install

#### NPM

```sh
npm i @bonhomme/bonnie-parallax
```

#### Browser

```html
<script type="text/javascript" src="https://unpkg.com/@loupthibault/linkedlist@0.1.0/dist/linkedlist.umd.js"></script>
<script type="text/javascript" src="https://unpkg.com/@bonhommeparis/bonnie-parallax@0.1.0/dist/linkedlist.umd.js"></script>
```

### Usage

```js

// For install via npm
import {Parallax, BasicRule} from '@bonhomme/bonnie-parallax';

/**
 * // For install via browser
 * var Parallax = window.bonnieParallax.Parallax;
 * var BasicRule = window.bonnieParallax.BasicRule;
 */
 

const parallax = new Parallax({
  el: document.body
});

parallax.addRule(new BasicRule({
  query: '[data-prllx-item]'
}));

const render = () => {
  parallax.current = document.scrollingElement.scrollTop;
  requestAnimationFrame(render);
};

parallax.init();
parallax.setViewPort(window.innerWidth, window.innerHeight);
requestAnimationFrame(render);

```

```html
...
<div data-prllx-item data-speed='0.9'></div>
<div data-prllx-item data-delta-start='10%'></div>
<div data-prllx-item data-delta-end='-10v'></div>
...
```

#### Browser

```js

var Parallax = window.
```


## Parallax

### Options

| Name    | Type            | Default Value   | Description |
|---------|-----------------|-----------------|-------------|
| `el`      | HTMLElement     | document.body   |             |
| `isHorizontal` | Boolean    | false           |  |
| `hiddenClass` | string | 'u-hidden' | |
| `precision` | Number | 4 | |
| `isBasedOnCurrent` | Boolean | true | |    

### Getters/Setters

#### `parallax.el [Read-Only]`

#### `parallax.current`

### Methods

#### `parallax.init()`

#### `parallax.addRule(rule)`

#### `parallax.setViewPort(width, height)`

#### `parallax.render()`

#### `parallax.destroy()`

## Basic Rule

### Constructor


### Attributes

## License

[MIT](LICENSE).
