module.exports = [
  {
    input: 'src/javascripts/la-map.js',
    output: {
      file: 'application/static/javascripts/la-map.js',
      format: 'iife'
    }
  },
  {
    input: 'src/javascripts/region-map.js',
    output: {
      file: 'application/static/javascripts/region-map.js',
      format: 'iife'
    }
  }
]
