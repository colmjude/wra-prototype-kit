import Checker from '../checker.js'

function InWales ($item) {
  Checker.call(this, $item)
}

InWales.prototype = Object.create(Checker.prototype)
InWales.prototype.constructor = Checker

InWales.prototype.check = function (features) {
  console.log('relevant features', features)
  this.showItem()
  let statement = 'Location NOT in Wales'
  if (features.length) {
    statement = 'Location in Wales'
  }
  this.$item.textContent = statement
}

InWales.prototype.getRelevantFeatures = function (features) {
  const statisticalGeographyField = 'ctry18cd'
  const statisticalGeographyWales = 'W92000004'
  const dataType = this.options.datasetName
  console.log('going to check', dataType, features)
  return features.filter(function (feature) {
    if (feature.id.includes(dataType)) {
      if (feature.properties[statisticalGeographyField] && feature.properties[statisticalGeographyField] === statisticalGeographyWales) {
        return true
      }
    }
    return false
  })
}

export default InWales
