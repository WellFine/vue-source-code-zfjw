import { mergeOptions } from "./utils"

/**
 * 为 Vue 扩展全局 api，如 mixin
 */
export function initGlobalAPI (Vue) {
  Vue.options = {}  // 全局选项

  /**
   * 将传入的选项混入到全局选项中
   * @param {object} mixin 要混合的选项
   * @returns 返回 Vue，可以链式调用
   */
  Vue.mixin = function (mixin) {
    this.options = mergeOptions(this.options, mixin)  // 将 mixin 混入到 Vue.options 中
    return this  // 返回 Vue 可以链式调用
  }
}