import { mergeOptions } from "./utils"

/**
 * 为 Vue 扩展全局 api，如 mixin
 */
export function initGlobalAPI (Vue) {
  Vue.options = {
    _base: Vue
  }  // 全局选项

  /**
   * 将传入的选项混入到全局选项中
   * @param {object} mixin 要混合的选项
   * @returns 返回 Vue，可以链式调用
   */
  Vue.mixin = function (mixin) {
    this.options = mergeOptions(this.options, mixin)  // 将 mixin 混入到 Vue.options 中
    return this  // 返回 Vue 可以链式调用
  }

  /**
   * 根据用户的参数，返回一个基于 Vue 的构造函数
   * 可以手动创造组件进行挂载
   */
  Vue.extend = function (options) {
    function Sub (options = {}) {
      this._init(options)  // 子类初始化
    }
    Sub.prototype = Object.create(Vue.prototype)  // Sub.prototype.__proto__ 指向 Vue.prototype
    Sub.prototype.constructor = Sub  // _init() 中合并 options 时用的是 this.constructor.options
    Sub.options = mergeOptions(Vue.options, options)  // 合并全局选项和 Vue.extend 传入的选项，可以用于提升局部组件优先级
    return Sub
  }

  Vue.options.components = {}  // 存放全局组件
  /**
   * 用于声明全局组件，内部会用 Vue.extend 包装组件定义
   * @param {string} id 组件名
   * @param {any} definition 组件定义，可以是定义对象，内部会用 Vue.extend 包装这个对象，也可以是用户自己用 Vue.extend 包装后的函数
   */
  Vue.components = function (id, definition) {
    // 如果 definition 是函数证明用户自己调用了 Vue.extend
    definition = typeof definition === 'function' ? definition : Vue.extend(definition)
    Vue.options.components[id] = definition
  }
}