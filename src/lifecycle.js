import { createElement, createTextVNode } from "./vdom"
import { patch } from "./vdom/patch"

/**
 * 扩展 _update、_render 等方法
 * @param {object} Vue 给 Vue 扩展 _update、_render 等方法
 */
export function initLifeCycle (Vue) {
  /**
   * 根据虚拟 DOM 产生真实 DOM
   * @param {object} vnode 虚拟 DOM
   */
  Vue.prototype._update = function (vnode) {
    const vm = this
    const el = vm.$el  // 拿到旧的 DOM 元素

    vm.$el = patch(el, vnode)  // 将新 vnode 转化的 DOM 存到 vm.$el 中，这样下次 patch 可以拿到并将其当成旧节点
  }

  /**
   * 调用 vm.$options.render() 方法生成 vnode，render() => _c() => createElement() => vnode
   * @returns 返回一个 vnode
   */
  Vue.prototype._render = function () {
    return this.$options.render.call(this)
  }

  /**
   * 创建虚拟元素节点
   * @param {string} tag 元素名
   * @param {object} props 属性
   * @param {...any} children 子元素，后面参数都是
   * @returns 一个虚拟的元素 vnode 节点
   */
  Vue.prototype._c = function () {
    return createElement(this, ...arguments)
  }

  /**
   * 创建虚拟文本节点
   * @param {string} text 文本内容
   * @returns 一个虚拟的文本 vnode 节点
   */
  Vue.prototype._v = function () {
    return createTextVNode(this, ...arguments)
  }

  /**
   * 将对象变量进行 JSON.stringify 转义
   * @param {any} value 尝试转义为字符串的变量
   * @returns 转义后的字符串
   */
  Vue.prototype._s = function (value) {
    if (typeof value !== 'object') return value  // 不是对象直接返回
    return JSON.stringify(value)  // 是对象则转义为字符串
  }
}

/**
 * 1. 调用 render 方法产生虚拟 DOM
 * 2. 根据虚拟 DOM 产生真实 DOM
 * 3. 将真实 DOM 插入到 el 元素中
 * @param {object} vm 调用 vm.$options.render 生成 vnode
 * @param {object} el 将 vnode 转化为 dom 后插入到 el 元素中
 */
export function mountComponent (vm, el) {
  vm.$el = el  // 这里的 el 是经过 querySelector 拿到的元素，存起来方便 vm._update 使用

  // vm._render 方法通过 vm.$options.render 方法生成虚拟 DOM
  // vm._update 方法根据虚拟 DOM 产生真实 DOM
  vm._update(vm._render())
}
