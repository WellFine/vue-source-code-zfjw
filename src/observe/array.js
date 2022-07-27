let oldArrayProto = Array.prototype  // 保存数组原来的原型

export let newArrayProto = Object.create(oldArrayProto)  // newArrayProto.__proto__ 指向 oldArrayProto

let methods = [  // 7 个会修改原数组的方法列表
  'push',
  'pop',
  'shift',
  'unshift',
  'reverse',
  'sort',
  'splice'
]

methods.forEach(method => {
  newArrayProto[method] = function (...args) {  // 在这里重写了数组的方法
    const result = oldArrayProto[method].call(this, ...args)  // 内部调用原来的方法，这就是利用切片编程思想的函数劫持操作
    
    let inserted  // 新增的数据数组
    let ob = this.__ob__  // this.__ob__ 保存着 ./index.js 中的 Observer 类实例
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args  // push 和 unshift 方法参数都是新增的内容
        break
      case 'splice':
        // splice 方法第一个参数是起始索引，第二个参数是删除个数，第三个参数开始就是新增的数据
        inserted = args.slice(2)
        break
    }
    if (inserted) {  // 在这里对 push、unshift、splice 三个方法新增的数据进行观测
      ob.observeArray(inserted)  // 观测 inserted 数组的每一项
    }

    ob.dep.notify()  // 数组变化后，通知 watcher 更新渲染
    
    return result
  }
})
