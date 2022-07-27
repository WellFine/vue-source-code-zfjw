import { newArrayProto } from "./array"
import Dep from "./dep"

class Observer {
  /**
   * 为传入的数组或对象添加 dep，方便数组调用劫持方法或对象新增属性时通知 watcher 更新
   * 如果是数组，对数组中的每一项进行 observe 劫持
   * 如果是对象，对对象中的属性进行劫持
   * @param {any} data 数组或对象，要劫持的数据
   */
  constructor (data) {
    /**
     * 给数组本身增加 dep，如果数组新增了某一项，可以让 dep 通知 watcher 渲染
     * 给对象本身增加 dep，如果对象新增了属性，也可以让 dep 通知 watcher 渲染
     */
    this.dep = new Dep()
    
    // 为 data 定义一个不可枚举的属性 __ob__，值 this 就是 Observer 类的实例
    // 这样在 array.js 中就可以调用到 Observer 实例的方法
    // 同时下方的 observe 方法也可以通过判断数据是否有 __ob__ 标识来判断对象是否劫持观测过
    Object.defineProperty(data, '__ob__', {
      value: this,
      enumerable: false  // 将 __ob__ 变为不可枚举
    })

    if (Array.isArray(data)) {
      // 将数组的原型指向我们重写后的新原型，以此保留数组原有方法，同时重写 7 个数组操作方法
      data.__proto__ = newArrayProto

      this.observeArray(data)  // 对 data 数组中的每一项做劫持
    } else {
      this.walk(data)  // 对 data 对象进行遍历，劫持属性
    }
  }

  /**
   * 循环 data 对象，对属性进行劫持，为 data 对象 “重新定义” 属性
   * @param {object} data 要循环劫持属性的对象
   */
  walk (data) {
    Object.keys(data).forEach(key => defineReactive(data, key, data[key]))
  }

  /**
   * 对数组中的每一项进行劫持观测
   * @param {array} data 要劫持观测子项的数组
   */
  observeArray (data) {
    data.forEach(item => observe(item))
  }
}

/**
 * 让数组中为对象或数组的子项进行依赖收集
 * @param {Array} value 要对子项进行依赖收集的数组
 */
function dependArray (value) {
  for (let i = 0; i < value.length; i++) {
    const current = value[i]
    // 数组子项如果是对象或数组就进行依赖收集，方便对象新增属性或数组调用劫持方法通知 watcher 更新渲染
    current.__ob__ && current.__ob__.dep.depend()
    if (Array.isArray(current)) {
      dependArray(current)  // 子项也是数组就再对子数组中元素进行依赖收集
    }
  }
}

/**
 * 对对象的某个属性进行劫持观测，添加 getter 和 setter
 * @param {object} target 劫持观测的对象
 * @param {string} key 劫持观测的对象属性
 * @param {*} value 属性值
 */
export function defineReactive (target, key, value) {  // 下面的 get 和 set 是闭包，在读取或设置 target[key] 时 value 不会销毁
  const childOb = observe(value)  // 递归对对象的属性值也进行劫持，递归结束条件在 observe 函数中
  const dep = new Dep()  // 每个数据都对应一个 dep
  Object.defineProperty(target, key, {
    get () {  // 取值执行 get
      if (Dep.target) {  // 只有在模板里用到的数据，渲染时才会进行依赖收集
        dep.depend()  // 让数据的收集器 dep 收集当前 watcher
        if (childOb) {  // childOb 有值证明 value 是数组或对象
          childOb.dep.depend()  // 让数组和对象本身也进行依赖收集
          if (Array.isArray(value)) {  // 让数组中为对象或数组的子项也进行依赖收集
            dependArray(value)
          }
        }
      }
      return value
    },
    set (newValue) {  // 设置执行 set
      if (newValue === value) return
      observe(newValue)  // 如果设置的值是对象，还得对这个对象进行劫持
      // 这里将新值赋值给 value，这样当取值执行 get 时拿到的就是新值，因为闭包不会销毁
      value = newValue
      dep.notify()  // 数据改变，让 dep 通知 watcher 更新视图
    }
  })
}

/**
 * 对数据对象进行劫持观测，给其属性添加 getter 和 setter
 * @param {object} data 要劫持观测的数据对象
 */
export function observe (data) {
  if (typeof data !== 'object' || data == null) {
    return  // 只对对象进行劫持
  }

  // 如果数据对象上的 __ob__ 标识是 Observer 类的实例，说明已经观测过了
  if (data.__ob__ instanceof Observer) {
    return data.__ob__  // 返回观测过了的 Observer 实例即可
  }

  // 如果一个对象被劫持过了，就不需要再被劫持
  // 而要判断一个对象是否被劫持过，可以增添一个实例，用实例来判断
  return new Observer(data)
}
