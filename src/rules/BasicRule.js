import LinkedList from '@loupthibault/linkedlist';

class BasicRule {

  // _______________________________________________________ constructor
  // -
  constructor(options = {}) {

    /** @private */
    this._cachedItems = new LinkedList();

    this._getTransformVertival = this._getTransformVertival.bind(this);
    this._getTransformHorizontal = this._getTransformHorizontal.bind(this);

    /** @private */
    this._config = null;

    /** @private */
    this._params = {
      query: options.query || '[data-prllx-item]',
      transformFn: this._getTransformVertival
    };

    /** @private */
    this._vars = {
      length: 0
    };

    /** @private */
    this._$ = {
      items: null
    };
  }

  // _______________________________________________________ public
  // -

  init(config) {
    this._config = config;
    this._config.isHorizontal && (this._params.transformFn = this._getTransformHorizontal);
  }

  grabDom() {
    this._$.items = Array.prototype.slice.call(this._config.el.querySelectorAll(this._params.query));
    this._vars.length = this._$.items.length;
  }

  getCache(current) {

    current = this._config.isBasedOnCurrent ? current : 0;

    var ln = this._vars.length;

    while (--ln > -1) {
      this._cachedItems.push(this._createCacheItem(this._$.items[ln], current));
    }
  }

  reset() {
    while (this._cachedItems.length) {
      this._resetCacheItem(this._cachedItems.shift());
    }
  }

  render(current) {
    var node = this._cachedItems.head;

    while (node) {

      this._updateItem(node.data, this._calculateViewPort(node.data, current));

      node = node.next;
    }
  }

  destroy() {
    this.reset();
    this._cachedItems = null;
    this._config = null;
  }

  // _______________________________________________________ private
  // -

  /** @private */
  _createCacheItem(el, current) {

    const params = {
      isBasedScrollTop: el.hasAttribute('data-scroll-top') || el.dataset.scrollTop === true,
      isBasedOnParent: el.hasAttribute('data-based-on-parent'),
      invert: el.hasAttribute('data-invert') || el.dataset.invert === true,
      speed: el.dataset.speed !== undefined ? parseFloat(el.dataset.speed) : 1,
      deltaStart: el.dataset.deltaStart || 0,
      deltaEnd: el.dataset.deltaEnd || 0
    };

    // Check the validity of parameters
    this._checkParamsValidity(params);

    // Get the bounding to watch
    const bounding = params.isBasedOnParent
                     ? el.parentElement.getBoundingClientRect()
                     : el.getBoundingClientRect();

    //  Calculate Observed item datas
    const observedDatas = this._calculateObservedDatas(bounding, params, current);

    // Calculate values of item to translate
    // - if not based on parent, it's the same item
    var deltaStart       = observedDatas.deltaStart,
        deltaTranslation = observedDatas.deltaTranslation;

    // - if based on parent, update deltas
    if (params.isBasedOnParent) {
      const elBounding = el.getBoundingClientRect();
      const size = el.getAttribute('data-based-on-parent');
      const deltaFromParent = parseInt((size - 100) / size * 100);
      const deltaStartFromParent = params.invert ? 0 : - deltaFromParent;
      const deltaEndFromParent = params.invert ? - deltaFromParent : 0;

      deltaStart       = elBounding[this._config.units.size] * deltaStartFromParent / 100;
      deltaTranslation = (elBounding[this._config.units.size] * deltaEndFromParent / 100) - deltaStart;
    }

    const cache = {
      el: el,
      width: bounding.width,
      height: bounding.height,

      speed: params.speed,
      isBasedScrollTop: params.isBasedScrollTop,

      observed: observedDatas,

      deltaStart: deltaStart,
      deltaTranslation: deltaTranslation,

      state: true
    };

    return cache;
  }

  /** @private */
  _checkParamsValidity(params) {

    var error = null;

    if (params.speed !== 1 && (params.deltaStart !== 0 || params.deltaStart !== 0)) {
      error = 'Setting speed and deltaStart or deltaEnd can provide an unwanted effect';
    }

    if (params.isBasedOnParent && params.speed !== 1) {
      error = 'If item is based on parent, speed should not be set';
    }

    if (error !== null) {
      console.warn('Parallax - ' + error);
    }
  }

  /** @private */
  _calculateObservedDatas(bounding, params, current) {

    const height = bounding[this._config.units.size];

    // Calculate deltas of the element to watch
    const deltaStart       = this._getDelta(params.deltaStart, height);
    const deltaEnd         = this._getDelta(params.deltaEnd, height);
    const deltaTranslation = deltaEnd - deltaStart;

    // Calculate positions depending on scroll
    const startPosition  = bounding[this._config.units.start] + current + deltaStart;
    const endPosition    = bounding[this._config.units.end] + current + deltaEnd;
    const deltaTranslate = endPosition - startPosition;

    return {
      deltaStart: deltaStart,
      deltaEnd: deltaEnd,
      deltaTranslation: deltaTranslation,
      startPosition: startPosition,
      min: params.isBasedScrollTop ? startPosition : this._config.size,
      max: -deltaTranslate,
      fullHeight: deltaTranslate + this._config.size
    };
  }

  /** @private */
  _getDelta(value, height) {

    if (typeof(value) !== 'string') return value;

    const ln = value.length;
    if (value[ln - 1] === 'v') {
      value = parseFloat(value.substr(0, ln - 1));
      return value / 100 * this._config.size;
    }
    else if (value[ln - 1] === '%') {
      return height * parseInt(value) / 100;
    }

    return height * parseInt(value) / 100;
  }

  /** @private */
  _resetCacheItem(cache) {
    cache.el.style.removeProperty('transform');
    cache.el.classList.remove(this._config.hiddenClass);
  }

  /* -------- CalculateViewPorts -------- */

  /** @private */
  _calculateViewPort(cache, current) {

    const speed    = cache.speed;
    const observed = cache.observed;

    const itemPositionFromTop = observed.startPosition - current;
    const ratio = (itemPositionFromTop - observed.min) / (observed.max - observed.min) * speed;
    const isVisible = ratio >= 0 && ratio <= 1;

    const value = cache.isBasedScrollTop === true
      ? (cache.deltaStart + cache.deltaTranslation * ratio) + current * (1 - cache.speed)
      : (cache.deltaStart + cache.deltaTranslation * ratio) + (-observed.fullHeight + observed.fullHeight / speed) * ratio;

    return {
      ratio: ratio,
      isVisible: isVisible,
      value: value
    };
  }

  /** @private */
  _updateItem(cache, result) {

    if (result.isVisible) {
      cache.el.style.transform = this._params.transformFn(result.value);
      if (!cache.state) {
        cache.el.classList.remove(this._config.hiddenClass);
        cache.state = true;
      }
    }
    else {
      cache.el.classList.add(this._config.hiddenClass);
      cache.state = false;
    }
  }

  /* -------- Transforms Functions -------- */

  /** @protected */
  _getTransformVertival(value) {
    return `matrix(1,0,0,1, 0, ${value.toFixed(this._config.precision)})`;
    // return `translate3d(0, ${value.toFixed(this._config.precision)}px, 0)`;
  }

  /** @protected */
  _getTransformHorizontal(value) {
    return `matrix(1,0,0,1, ${value.toFixed(this._config.precision)}, 0)`;
    // return `translate3d(${value.toFixed(this._config.precision)}px, 0, 0)`;
  }

}

export default BasicRule;
