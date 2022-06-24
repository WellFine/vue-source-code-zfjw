import babel from 'rollup-plugin-babel'
import resolve from '@rollup/plugin-node-resolve'

// rollup 默认可以导出一个对象，作为打包的配置对象
export default {
  input: './src/index.js', // 入口文件
  output: {
    file: './dist/vue.js', // 出口文件
    name: 'Vue', // 打包后会在全局 global 上添加一个 Vue 属性
    // format 设置打包格式，有 esm 模块（es6）；commonjs 模块（node）；iife 模块（自执行函数）；umd 模块（兼容 commonjs 和 amd）
    format: 'umd',
    sourcemap: true // true 表示可以调试源代码
  },
  plugins: [ // 需要用到的插件如 babel，插件都是函数，直接执行
    babel({ // 执行 babel 函数时会加载配置文件 .babelrc
      exclude: 'node_modules/**' // 排除 node_modules 中的所有文件
    }),
    resolve()  // 解决导入时需要手动添加 index.js 问题
  ]
}
