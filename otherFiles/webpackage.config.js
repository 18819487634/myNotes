const path = require('path');
const webpack = require('webpack');

module.exports = {
    mode: 'development',
    entry: [
        "babel-polyfill",
        path.join(__dirname, './src/index.js')
    ],
    output: {
        path: path.join(__dirname, './bundle'),
        filename: 'bundle.js'
    },
    //module是配置所有模块要经过什么处理
    //test:处理什么类型的文件,use:用什么,include:处理这里的,exclude:不处理这里的
    module: {
        rules: [
            {
                test: /\.js$/,
                use: ['babel-loader'],
                exclude: /node_modules/,
                include: path.join(__dirname, 'src')
            }
        ]
    }
}