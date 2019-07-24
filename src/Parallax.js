
import LinkedList from '@loupthibault/linkedlist';

class Parallax {

  // _______________________________________________________ constructor
  // -
  constructor(options = {}) {

    /** @private */
    this._el = options instanceof HTMLElement ? options : (options.el || document.body);

    /** @private */
    this._vars = {
      current: 0,
      isResizing: false
    };

    /** @private */
    this._config = {
      el: this._el,
      size: 0,
      precision: options.precision || 4,
      isHorizontal: (options.isHorizontal === true),
      isBasedOnCurrent: options.isBasedOnCurrent !== false,
      hiddenClass: options.hiddenClass || 'u-hidden',
      units: {
        size: 'height',
        start: 'top',
        end: 'bottom'
      }
    };

    /** @private */
    this._rules = new LinkedList();
  }

  // _______________________________________________________ public
  // -

  /**
   *
   */
  get el() { return this._el; }

  /**
   *
   */
  get current() { return this._vars.current; }
  set current(value) {
    if (this._vars.current === value) return;
    this._vars.current = value;
    if (this._vars.isResizing) return;

    this._update();
  }

  /**
   *
   */
  init() {
    this._vars.isResizing = true;
    this._resetCached();
    this._grabDom();
    this._getCache();
    this._update();
    this._vars.isResizing = false;
  }

  /**
   *
   * @param {*} rule
   */
  addRule(rule) {
    rule.init(this._config);
    this._rules.push(rule);
  }

  /**
   *
   * @param {*} width
   * @param {*} height
   */
  setViewPort(width, height) {
    this._config.size = this._config.isHorizontal ? width : height;
    this._resize();
  }

  /**
   *
   */
  render() {
    this._update();
  }

  /**
   *
   */
  destroy() {
    if (this._rules) {
      while (this._rules.length) {
        this._rules.shift().reset();
      }
    }

    this._el = null;
    this._config = null;
    this._rules = null;
  }

  // _______________________________________________________ private
  // -

  /** @private */
  _grabDom() {
    var node = this._rules.head,
        rule;

    while (node) {
      rule = node.data;
      rule.grabDom();
      node = node.next;
    }
  }

  /** @private */
  _getCache() {
    var node = this._rules.head;
    while (node) {
      node.data.getCache(this._vars.current);
      node = node.next;
    }
  }

  /**
   * Reset all cached item from each rules
   * @private */
  _resetCached() {

    var node = this._rules.head;
    while (node) {
      node.data.reset();
      node = node.next;
    }
  }

  /** @private */
  _resize() {
    this._vars.isResizing = true;

    this._resetCached();
    this._getCache();

    this._vars.isResizing = false;
  }

  /** @private */
  _update() {
    var node = this._rules.head;

    while (node) {
      node.data.render(this._vars.current);
      node = node.next;
    }
  }

}

export default Parallax;
