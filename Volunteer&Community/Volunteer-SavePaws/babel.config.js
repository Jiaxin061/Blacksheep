module.exports = function (api) {
    api.cache(true);
    return {
        presets: [
            [
                'babel-preset-expo',
                {
                    jsxRuntime: 'automatic',
                    reactCompiler: false, // Explicitly disable React Compiler
                },
            ],
        ],
    };
};
