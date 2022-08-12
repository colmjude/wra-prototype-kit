import utils from '../utils.js'
import Map from './map'
import mapHelpers from '../map-helpers'

const getBBox = mapHelpers.generateBBox

function PostcodeMap ($mapContainer) {
  this.$mapContainer = $mapContainer
}

PostcodeMap.prototype.init = function (opts) {
  this.setOptions(opts)
  this._sourceLoaded = false
  this._layers = []
  this.currentFilter = undefined

  this.mapModule = this.createMap()

  this.setupListeners()
  return this
}

PostcodeMap.prototype.createMap = function () {
  const boundLoadPostcodeLayer = this.loadPostcodeLayer.bind(this)
  return new Map(this.$mapContainer).init({
    initialMapPosition: this.options.initialMapPosition,
    onLoadCallback: boundLoadPostcodeLayer
  })
}

PostcodeMap.prototype.displayFeatureDetails = function (features) {
  features.forEach(function (feature) {
    console.log(feature.properties.postcode_area)
  })
}

PostcodeMap.prototype.flyToSelected = function () {
  const matchedFeatures = this.filterFeatures()

  if (matchedFeatures.length) {
    const bbox = getBBox(matchedFeatures)
    this.mapModule.map.fitBounds([[bbox[0], bbox[1]], [bbox[2], bbox[3]]])
  }
}

PostcodeMap.prototype.flyToWales = function () {
  const walesBox = [-2.503962800922352, 51.86049502258254, -4.2089010906294675, 51.379339994252945]
  this.mapModule.map.fitBounds([[walesBox[0], walesBox[1]], [walesBox[2], walesBox[3]]])
}

PostcodeMap.prototype.havePostcodesLoaded = function () {
  return this._sourceLoaded
}

PostcodeMap.prototype.highlightPostcodeArea = function (postcodes) {
  console.log('highlight', postcodes)
  const filter = ['match', ['get', 'postcode_area'], postcodes, true, false]
  this.mapModule.map.setFilter('postcodesHoverFill', filter)
}

PostcodeMap.prototype.filterFeatures = function () {
  let matchedFeatures = []
  if (this.currentFilter) {
    matchedFeatures = this.mapModule.map.querySourceFeatures('postcodeAreas', {
      filter: this.currentFilter
    })
  }
  return matchedFeatures
}

PostcodeMap.prototype.loadPostcodeLayer = function (wraMap) {
  const endpoint = this.options.postcodeGeographiesEndpoint
  // track loading of layer
  this.trackPostcodeLoad()

  this.mapModule.addGeojsonSource('postcodeAreas', endpoint)
  this.mapModule.addFillLayer('postcodes', 'postcodeAreas', {
    fillColor: '#088',
    fillOpacity: 0.4,
    lineColor: '#088',
    lineOpacity: 0.8,
    lineWidth: 1
  }, false)
  this._layers.push('postcodesFill')
  // add always visible layer
  this.mapModule.addFillLayer('postcodesVisible', 'postcodeAreas', {
    fillColor: '#000',
    fillOpacity: 0.1
  }, false)
  this._layers.push('postcodesVisibleFill')

  this.mapModule.addFillLayer('postcodesHover', 'postcodeAreas', {
    fillColor: '#955',
    fillOpacity: 0.4
  }, false)
  this._layers.push('postcodesHoverFill')

  this.showSelected()
}

PostcodeMap.prototype.newSelectionListener = function (e) {
  console.log('new selection', e.detail.postcode)
  this.showSelected()
}

// might need to replace this function
PostcodeMap.prototype.removeFilter = function () {
  this.mapModule.map.setFilter('postcodesFill', undefined)
}

PostcodeMap.prototype.setupListeners = function () {
  const boundNewSelectionListener = this.newSelectionListener.bind(this)
  this.$mapContainer.addEventListener('newSelection', boundNewSelectionListener)

  this.mapModule.map.on('mouseover', function (e) {
    console.log('mouseover', e)
  })

  const map = this.mapModule.map
  const that = this
  this.mapModule.map.on('mouseenter', 'postcodesVisibleFill', function (e) {
    const underMouse = map.queryRenderedFeatures(e.point, { layers: ['postcodesVisibleFill'] })
    that.displayFeatureDetails(underMouse)
    that.highlightPostcodeArea(underMouse.map((feature) => feature.properties.postcode_area))
  })

  this.mapModule.map.on('click', function (e) {
    const underMouse = map.queryRenderedFeatures(e.point, { layers: ['postcodesVisibleFill', 'postcodesHoverFill'] })
    console.log(underMouse)
  })
}

PostcodeMap.prototype.showPostcodeAreas = function (postcodes) {
  if (this.havePostcodesLoaded) {
    // do we need to make 'postcode_area' configurable?
    const filter = ['match', ['get', 'postcode_area'], postcodes, true, false]
    console.log(filter)
    console.log(this.mapModule)
    this.mapModule.map.setFilter('postcodesFill', filter)
    this.currentFilter = filter
  } else {
    console.log('postcode layer not loaded')
  }
}

PostcodeMap.prototype.showSelected = function () {
  // check which postcodes have been selected
  const urlParams = (new URL(document.location)).searchParams
  const currentlySelected = urlParams.getAll('selected_postcodes')
  this.removeFilter()
  if (currentlySelected.length > 0) {
    this.showPostcodeAreas(currentlySelected)
  }
}

PostcodeMap.prototype.trackPostcodeLoad = function () {
  this.$mapContainer.classList.add('fetching-data')
  const map = this.mapModule.map
  const that = this

  function loadedHandler (e) {
    if (map.getSource(that.options.sourceName) && map.isSourceLoaded(that.options.sourceName)) {
      console.log(`${that.options.sourceName} source loaded!`)
      that._sourceLoaded = true
      that.$mapContainer.classList.remove('fetching-data')
      map.off('sourcedata', loadedHandler)
    }
  }
  map.on('sourcedata', loadedHandler)
}

PostcodeMap.prototype.setOptions = function (opts) {
  const options = opts || {}
  this.options = utils.extend(PostcodeMapDefaults, options)
}

const PostcodeMapDefaults = {
  postcodeGeographiesEndpoint: 'https://landplatform.azurefd.net/geoserver/test/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=test%3Apostcode_boundaries&maxFeatures=103400&outputFormat=application%2Fjson',
  sourceName: 'postcodeAreas',
  initialMapPosition: {
    center: [-3.7, 52.4],
    zoom: 6.39
  }
}

export default PostcodeMap
