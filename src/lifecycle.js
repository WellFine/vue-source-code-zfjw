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
    console.log('_update')
  }

  Vue.prototype._render = function () {
    console.log('_render')
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
  // vm._render 方法通过 vm.$options.render 方法生成虚拟 DOM
  // vm._update 方法根据虚拟 DOM 产生真实 DOM
  vm._update(vm._render())
}
