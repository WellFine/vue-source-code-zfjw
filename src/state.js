import Dep from "./observe/dep"
import { observe } from "./observe/index"
import Watcher from "./observe/watcher"

/**
 * 用于初始化状态
 */
export function initState (vm) {
  const opts = vm.$options
  if (opts.data) {
    debugger
    initData(vm)  // 初始化数据
  }
  if (opts.computed) {
    initComputed(vm)  // 初始化计算属性
  }
  if (opts.watch) {
    initWatch(vm)  // 初始化 watch
  }
}

/**
 * 将 vm[key] 代理到 vm[target][key] 上
 * @param {object} vm 上下文
 * @param {string} target 要代理的目标
 * @param {string} key 要代理的属性
 */
function proxy (vm, target, key) {
  Object.defineProperty(vm, key, {
    get () {
      return vm[target][key]  // 访问 vm[key] 返回 vm[target][key]，如 vm.name 返回 vm._data.name
    },
    set (newValue) {
      vm[target][key] = newValue
    }
  })
}

/**
 * 用于初始化数据
 */
function initData (vm) {
  let data = vm.$options.data   // 这个 data 就是 new Vue 时传入的 data，可能是函数也可能是对象
  data = typeof data === 'function' ? data.call(vm) : data  // 如果是函数则执行函数拿到返回值

  vm._data = data  // 将 data 对象缓存到 _data 中
  
  observe(data)  // 劫持 data，为 data 中的属性添加 getter 和 setter

  for (let key in data) {
    proxy(vm, '_data', key)  // 将 vm[key] 代理到 vm._data[key] 上
  }
}

/**
 * 初始化计算属性，劫持属性挂载到实例上
 */
function initComputed (vm) {
  const computed = vm.$options.computed
  // 将计算属性 watcher 保存到 vm 上，方便 createComputedGetter 方法访问计算属性 watcher
  const watchers = vm._computedWatchers = {}
  for (const key in computed) {
    const userDef = computed[key]

    // watcher 要执行的函数就是计算属性的 getter
    const fn = typeof userDef === 'function' ? userDef : userDef.get
    // 第三个参数传入 true 默认就会执行 fn，这里传 lazy: true 告诉 watcher 当取值和数据变化时才执行 fn
    watchers[key] = new Watcher(vm, fn, { lazy: true })  // 将属性和 watcher 对应起来，方便 createComputedGetter 取到

    defineComputed(vm, key, userDef)
  }
}

/**
 * 劫持计算属性并挂载到实例上，通过实例访问计算属性时会走计算属性的 getter 逻辑
 * @param {Vue} target 目标实例
 * @param {string} key 计算属性名
 * @param {any} userDef 计算属性值，可能是函数也可能是包含 get 和 set 的对象
 */
function defineComputed (target, key, userDef) {
  const setter = userDef.set || (() => {})
  Object.defineProperty(target, key, {
    get: createComputedGetter(key),
    set: setter
  })
}

/**
 * 检测是否执行计算属性的 getter
 * @param {string} key 要检测的计算属性名
 * @returns 返回一个函数，该函数中会自动判断是否需要执行 getter 函数获取新值，如果不获取新值就用缓存的值
 */
function createComputedGetter (key) {
  return function () {
    // 这里的 this 对应的是 vm
    const watcher = this._computedWatchers[key]
    if (watcher.dirty) {  // dirty 为 true 表示计算属性依赖的数据改变了，需要重新求值
      watcher.evaluate()  // 求计算属性最新的值，把结果放到 watcher.value 中并将 dirty 置为 false
    }
    if (Dep.target) {
      // 计算属性 watcher 出栈后，如果 Dep.target 还有值，就让计算属性中的数据 dep 收集上一层的 watcher 如渲染 watcher
      watcher.depend()
    }
    return watcher.value
  }
}

/**
 * 初始化 watch
 */
function initWatch (vm) {
  const watch = vm.$options.watch

  for (const key in watch) {
    const handler = watch[key]  // watch 中的值可能为字符串、数组或函数
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i])
      }
    } else {
      createWatcher(vm, key, handler)
    }
  }
}

/**
 * 调用 vm.$watch 方法
 * @param {Vue} vm Vue 实例
 * @param {string} key watch 中的属性名
 * @param {any} handler watch 的处理函数，为字符串时对应 methods 中的同名方法
 * @returns vm.$watch 方法返回值
 */
function createWatcher (vm, key, handler) {
  if (typeof handler === 'string') {  // handler 是字符串时表明要用 methods 中的同名方法
    handler = vm[handler]  // methods 中的方法也会被挂载到 vm 上
  }
  return vm.$watch(key, handler)
}
