import { compilerToFunction } from "./compiler"
import { callHook, mountComponent } from "./lifecycle"
import { initState } from "./state"
import { mergeOptions } from "./utils"

/**
 * 通过方法将 Vue 传递进来，并扩展了 _init 等原型方法
 * @param {object} Vue Vue 构造函数，用于扩展原型方法
 */
export function initMixin (Vue) {
  /**
   * 用于初始化操作
   * @param {object} options 用户选项
   */
  Vue.prototype._init = function (options = {}) {
    const vm = this
    // 将用户选项混入到全局选项中，然后赋值给实例选项，所以实例可以访问到全局的一些东西
    vm.$options = mergeOptions(this.constructor.options, options)

    callHook(vm, 'beforeCreate')  // 依次调用 beforeCreate 生命周期钩子
    initState(vm)   // 初始化状态，包括 data、computed、watch 等
    callHook(vm, 'created')  // 依次调用 created 生命周期钩子

    if (options.el) {
      vm.$mount(options.el)  // $mount 实现数据的挂载，渲染数据
    }
  }

  /**
   * 实现数据的挂载，将数据渲染到指定的元素上
   * @param {string} el 指定的元素，一般为元素 id
   */
  Vue.prototype.$mount = function (el) {
    const vm = this
    el = document.querySelector(el)  // 获取元素
    let ops = vm.$options

    if (!ops.render) {  // 如果用户没有自己写 render 函数
      let template
      if (!ops.template && el) {  // 没有写 template，但是指定了 el 且 el 元素存在
        template = el.outerHTML  // 这里不考虑兼容性细节，直接返回元素字符串
      } else {
        template = ops.template // 用户传了 template
      }

      if (template) {  // 最终拿到了用户传入的 template 或是由 el 转化的 template 字符串
        const render = compilerToFunction(template)  // 对模板进行编译
        ops.render = render
      }
    }

    mountComponent(vm, el)  // 组件的挂载
  }
}
