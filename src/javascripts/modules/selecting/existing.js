import SelectMap from './selecting-module'

function ExistingShapeSelect ($item) {
  SelectMap.call(this, $item)
}

ExistingShapeSelect.prototype = Object.create(SelectMap.prototype)
ExistingShapeSelect.prototype.constructor = SelectMap

ExistingShapeSelect.prototype.addAllLayers = function () {
  const that = this

  this.$controls.forEach(function ($control) {
    const datasetName = that.getDatasetName($control)
    console.log('layer for ', datasetName)
    const endpoint = that.getDatasetEndpoint($control)
    const layerColour = that.getDatasetColour($control)

    // handle cases where endpoint has been left blank
    // allows data to be loaded/added at a later point
    if (endpoint) {
      that.mapModule.addGeojsonSource(datasetName, endpoint)
      //that.trackDataLoad($control, datasetName)
    }

    // in future might be more than polygon
    that.mapModule.addPolygonLayer(datasetName, datasetName, {
      fillColor: layerColour,
      fillOpacity: 0.4,
      lineColor: layerColour,
      lineOpacity: 0.8,
      lineWidth: 1
    })

    that.layers.push(datasetName)
    that.hideAllLayers()
  })
}

ExistingShapeSelect.prototype.clickMapHandler = function (e) {
  const matches = this.mapModule.getFeaturesByPoint(e.point)
  // matches.forEach(feature => console.log(feature.toJSON().geometry))
  if (matches.length) {
    const geometry = matches[0].toJSON().geometry
    if (geometry.type === 'Polygon') {
      console.log(geometry)
      this.fetchStats(geometry)
    } else {
      // not a polygon so can't get stats
      this.notAPolygon(geometry.type)
    }
  }
}

ExistingShapeSelect.prototype.controlClickHandler = function (e) {
  if (e.target.matches('input')) {
    const layerName = e.target.value
    console.log(e.target, layerName, e)
    this.hideAllLayers()
    this.showLayer(layerName)
  } else {
    console.log('not an input')
  }
}

ExistingShapeSelect.prototype.getDatasetName = function ($control) {
  return $control.dataset.layerControl
}

ExistingShapeSelect.prototype.getDatasetEndpoint = function ($control) {
  return $control.dataset.layerEndpoint
}

ExistingShapeSelect.prototype.getDatasetColour = function ($control) {
  return $control.dataset.layerColour
}

ExistingShapeSelect.prototype.hideAllLayers = function () {
  console.log('hiding layers', this.layers)
  this.layers.forEach(layer => this.mapModule.togglePolygonLayerVisibility(layer, false))
}

ExistingShapeSelect.prototype.onBaseMapLoaded = function (e) {
  console.log('default base map loaded event triggered from ExistingShapeSelect', e)

  this.$controls = this.$component.querySelectorAll('[data-module="option-controls"] li')

  this.$errorTemplate = document.getElementById('not-a-polygon')

  this.layers = []
  this.addAllLayers()

  const boundControlClickHandler = this.controlClickHandler.bind(this)
  this.$controls.forEach(function ($control) {
    $control.addEventListener('click', boundControlClickHandler)
  })

  const boundClickMapHandler = this.clickMapHandler.bind(this)
  this.getMap().on('click', boundClickMapHandler)
}

ExistingShapeSelect.prototype.notAPolygon = function (_type) {
  const $errorResult = this.$errorTemplate.content.cloneNode(true)

  const $type = $errorResult.querySelector('[data-dynamic="shape-type"]')
  $type.textContent = _type

  this.updateResultsContainer($errorResult)
}

ExistingShapeSelect.prototype.showLayer = function (layerName) {
  this.mapModule.togglePolygonLayerVisibility(layerName, true)
}

export default ExistingShapeSelect
