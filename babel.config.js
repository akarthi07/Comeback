module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // VisionCamera frame processors + the pose plugin run on a worklet thread.
    // This plugin compiles functions marked 'worklet' so they can run there.
    plugins: [['react-native-worklets-core/plugin']],
  };
};
