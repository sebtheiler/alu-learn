const path = require("path");

module.exports = {
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  staticDirs: ["../public"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    {
      name: "@storybook/addon-postcss",
      options: {
        cssLoaderOptions: {
          // When you have splitted your css over multiple files
          // and use @import('./other-styles.css')
          importLoaders: 1,
        },
        postcssLoaderOptions: {
          // When using postCSS 8
          implementation: require("postcss"),
        },
      },
    },
  ],
  framework: "@storybook/react",
  core: {
    builder: "@storybook/builder-webpack5",
  },
  webpackFinal: async (config) => {
    config.resolve.modules = [
      ...(config.resolve.modules || []),
      path.resolve(__dirname, ".."),
    ];

    config.resolve.alias = {
      "@/atoms": path.resolve(__dirname, "..", "src", "atoms"),
      "@/components": path.resolve(__dirname, "..", "src", "components"),
      "@/courses": path.resolve(__dirname, "..", "src", "courses"),
      "@/editor": path.resolve(__dirname, "..", "src", "editor"),
      "@/graphql": path.resolve(__dirname, "..", "src", "graphql"),
      "@/helpers": path.resolve(__dirname, "..", "src", "helpers"),
      "@/hooks": path.resolve(__dirname, "..", "src", "hooks"),
      "@/pages": path.resolve(__dirname, "..", "src", "pages"),
      "@/stores": path.resolve(__dirname, "..", "src", "stores"),
      "@/lexicalEditor": path.resolve(__dirname, "..", "src", "lexicalEditor"),
    };

    config.module.rules.push({
      test: /\.scss$/,
      use: ["style-loader", "css-loader", "sass-loader"],
      include: path.resolve(__dirname, "../"),
    });

    return config;
  },
};
