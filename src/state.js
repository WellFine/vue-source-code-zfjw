/**
 * 用于初始化状态
 */
export function initState (vm) {
  const opts = vm.$options
  if (opts.data) {
    initData(vm)    // 初始化数据
  }
}

/**
 * 用于初始化数据
 */
function initData (vm) {
  let data = vm.$options.data   // 这个 data 就是 new Vue 时传入的 data，可能是函数也可能是对象
  data = typeof data === 'function' ? data.call(vm) : data  // 如果是函数则执行函数拿到返回值
}
