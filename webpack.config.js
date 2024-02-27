const path = require("path"),
    HtmlWebpackPlugin = require("html-webpack-plugin");

const pages = ["water_tank_widget", "pulley_widget", "ladder_widget", "spring_widget"];

module.exports = {
    entry: pages.reduce((config, page) => {
        config[page] = `./src/widgets/${page}/${page}.js`;
        return config;
    }, {}),
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "dist"),
    },
    optimization: {
        splitChunks: {
            chunks: "all",
        },
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader',
                ],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'static/[hash][ext][query]'
                }
            },
        ],
    },
    plugins: [].concat(
        pages.map(
            (page) =>
                new HtmlWebpackPlugin({
                    inject: true,
                    template: `./src/${page}.html`,
                    filename: `${page}.html`,
                    chunks: [page],
                })
        )
    ),
};
