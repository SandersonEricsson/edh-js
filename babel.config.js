
const presets = [
    ['@babel/preset-env', {targets: {node: 'current'}}],
    ['@babel/preset-react', {targets: {node: 'current'}}] // add this
  ];
  
const plugins = [
  '@babel/plugin-transform-arrow-functions',
  '@babel/plugin-proposal-class-properties',
  '@babel/plugin-transform-object-assign'
];

module.exports = { presets, plugins };