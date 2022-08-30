import SelectMap from './selecting-module'

function ExistingShapeSelect ($item) {
  SelectMap.call(this, $item)
}

ExistingShapeSelect.prototype = Object.create(SelectMap.prototype)
ExistingShapeSelect.prototype.constructor = SelectMap

ExistingShapeSelect.prototype.onBaseMapLoaded = function (e) {
  console.log('default base map loaded event triggered from ExistingShapeSelect', e)
}

export default ExistingShapeSelect
