import SelectMap from './selecting-module'

function BespokeSelect ($item) {
  SelectMap.call(this, $item)
}

BespokeSelect.prototype = Object.create(SelectMap.prototype)
BespokeSelect.prototype.constructor = SelectMap

BespokeSelect.prototype.onBaseMapLoaded = function (e) {
  console.log('default base map loaded event triggered from BespokeSelect', e)
}

export default BespokeSelect
