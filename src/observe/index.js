class Observer {
  constructor (data) {
    this.walk(data)  // 对 data 进行遍历，劫持属性
  }

  /**
   * 循环 data 对象，对属性进行劫持，为 data 对象 “重新定义” 属性
   * @param {object} data 要循环劫持属性的对象
   */
  walk (data) {
    Object.keys(data).forEach(key => defineReactive(data, key, data[key]))
  }
}

/**
 * 对属性进行劫持
 * @param {object} target 劫持对象
 * @param {string} key 劫持属性
 * @param {*} value 属性值
 */
export function defineReactive (target, key, value) {  // 下面的 get 和 set 是闭包，在读取或设置 target[key] 时 value 不会销毁
  observe(value)  // 递归对所有的对象进行属性劫持，递归结束条件在 observe 函数中

  Object.defineProperty(target, key, {
    get () {  // 取值执行 get
      return value
    },
    set (newValue) {  // 设置执行 set
      if (newValue === value) return
      observe(newValue)  // 如果设置的值是对象，还得对这个对象进行劫持
      // 这里将新值赋值给 value，这样当取值执行 get 时拿到的就是新值，因为闭包不会销毁
      value = newValue
    }
  })
}

/**
 * 对数据对象进行劫持，给其属性添加 getter 和 setter
 * @param {object} data 要劫持的数据对象
 */
export function observe (data) {
  if (typeof data !== 'object' || data == null) {
    return  // 只对对象进行劫持
  }

  // 如果一个对象被劫持过了，就不需要再被劫持
  // 而要判断一个对象是否被劫持过，可以增添一个实例，用实例来判断
  return new Observer(data)
}
