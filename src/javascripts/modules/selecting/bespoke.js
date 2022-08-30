import SelectMap from './selecting-module'

/* global MapboxDraw */

function ExistingShapeSelect ($item) {
  SelectMap.call(this, $item)
}

ExistingShapeSelect.prototype = Object.create(SelectMap.prototype)
ExistingShapeSelect.prototype.constructor = SelectMap

ExistingShapeSelect.prototype.addDrawControls = function () {
  const draw = new MapboxDraw({
    displayControlsDefault: false, // Don't add any tools other than those below
    controls: {
      polygon: true,
      trash: true
    }
  })

  const map = this.getMap()
  map.addControl(draw, 'top-left')
  const boundShapeCreatedListener = this.shapeCreatedListener.bind(this)
  map.on('draw.create', boundShapeCreatedListener)
}

ExistingShapeSelect.prototype.onBaseMapLoaded = function (e) {
  console.log('default base map loaded event triggered from ExistingShapeSelect', e)
  this.addDrawControls()
}

ExistingShapeSelect.prototype.shapeCreatedListener = function (e) {
  console.log('shape drawn', e)
  if (e.features[0].geometry.type === 'Polygon') {
    console.log('its a Polygon', e.features[0])
    this.fetchStats(e.features[0].geometry)
  }
}

export default ExistingShapeSelect
