import utils from '../utils.js'
import Map from './map'
import mapHelpers from '../map-helpers'

/* global CustomEvent */

const getBBox = mapHelpers.generateBBox

function PostcodeMap ($mapContainer) {
  this.$mapContainer = $mapContainer
}

PostcodeMap.prototype.init = function (opts) {
  this.setOptions(opts)
  this._sourceLoaded = false
  this._layers = []
  this.observers = []
  this.currentFilter = undefined

  this.mapModule = this.createMap()

  this.viewPanel = this.$mapContainer.querySelector('[data-module="postcode-viewer-panel"]')

  this.setupListeners()
  return this
}

PostcodeMap.prototype.addObserver = function ($el) {
  this.observers.push($el)
}

PostcodeMap.prototype.createMap = function () {
  const boundLoadPostcodeLayer = this.loadPostcodeLayer.bind(this)
  return new Map(this.$mapContainer).init({
    initialMapPosition: this.options.initialMapPosition,
    onLoadCallback: boundLoadPostcodeLayer
  })
}

PostcodeMap.prototype.dispatchSelectionEvent = function (evtName, postcode) {
  if (this.observers.length) {
    const selectionEvent = new CustomEvent(evtName, { detail: { postcode: postcode } })
    this.observers.forEach(function ($el) {
      $el.dispatchEvent(selectionEvent)
    })
  }
}

PostcodeMap.prototype.displayCurrentPostcode = function (features) {
  const postcodes = features.map((feature) => feature.properties.postcode)
  const $label = this.viewPanel.querySelector('.postcode-viewer__label')
  const $area = $label.querySelector('.postcode-viewer__label__area')
  const $subarea = $label.querySelector('.postcode-viewer__label__subarea')
  const parts = postcodes[0].split(' ')
  $area.textContent = parts[0]
  $subarea.textContent = parts[1]
  features.forEach(function (feature) {
    console.log('currently over postcodes in ares:', feature.properties.postcode_area)
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

PostcodeMap.prototype.getCurrentlySelectedPostcodes = function () {
  // check which postcodes have been selected
  const urlParams = (new URL(document.location)).searchParams
  return urlParams.getAll('selected_postcodes')
}

PostcodeMap.prototype.getFeaturesByPoint = function (pt) {
  return this.mapModule.map.queryRenderedFeatures(pt, { layers: ['postcodesVisibleFill'] })
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
    fillColor: this.options.selectedColour,
    fillOpacity: 0.4,
    lineColor: this.options.selectedColour,
    lineOpacity: 0.8,
    lineWidth: 1
  }, false)
  this._layers.push('postcodesFill')
  // add always visible layer
  this.mapModule.addFillLayer('postcodesVisible', 'postcodeAreas', {
    fillColor: '#000',
    fillOpacity: 0.01
  }, false)
  this._layers.push('postcodesVisibleFill')

  this.setupHoverLayer('postcodesVisibleFill')

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

PostcodeMap.prototype.removeSelectionListener = function (e) {
  console.log('remove selection', e.detail.postcode)
  this.showSelected()
}

PostcodeMap.prototype.setupHoverLayer = function (layerToHoverOn) {
  const that = this
  const map = this.mapModule.map

  this.mapModule.addFillLayer('postcodesHover', 'postcodeAreas', {
    fillColor: this.options.hoverColour,
    fillOpacity: 0.4
  }, false)
  this._layers.push('postcodesHoverFill')
  this.mapModule.hideLayer('postcodesHoverFill')

  // show layer when hovering over Wales
  map.on('mouseover', layerToHoverOn, function (e) {
    console.log(e, 'mouse entered the Wales area')
    that.mapModule.addClass('active-mode')
    that.mapModule.showLayer('postcodesHoverFill')
  })

  // hide layer when not over Wales
  map.on('mouseleave', layerToHoverOn, function (e) {
    console.log(e, 'mouse leaving the Wales area')
    that.mapModule.removeClass('active-mode')
    that.mapModule.hideLayer('postcodesHoverFill')
  })

  // track which postcode_area mouse is over
  this.mapModule.map.on('mousemove', layerToHoverOn, function (e) {
    const features = that.getFeaturesByPoint(e.point)
    // const underMouse = map.queryRenderedFeatures(e.point, { layers: [layerToHoverOn] })
    // that.displayFeatureDetails(features)
    that.highlightPostcodeArea(features.map((feature) => feature.properties.postcode_area))
    that.displayCurrentPostcode(features)
  })
}

PostcodeMap.prototype.setupListeners = function () {
  // listen for new selections
  const boundNewSelectionListener = this.newSelectionListener.bind(this)
  this.$mapContainer.addEventListener('newSelection', boundNewSelectionListener)

  // listen for new selections
  const boundRemoveSelectionListener = this.removeSelectionListener.bind(this)
  this.$mapContainer.addEventListener('removeSelection', boundRemoveSelectionListener)

  const that = this

  this.mapModule.map.on('click', function (e) {
    const features = that.getFeaturesByPoint(e.point)

    const postcodes = features.map((feature) => feature.properties.postcode_area)
    if (postcodes.length > 1) {
      console.log('there is more than one postcode in this selection', postcodes)
    }
    const currentlySelected = that.getCurrentlySelectedPostcodes()
    if (!currentlySelected.includes(postcodes[0])) {
      // new selection so trigger that
      console.log('new selection', postcodes[0])
      that.dispatchSelectionEvent('newSelection', postcodes[0])
    } else {
      console.log('remove selection', postcodes[0])
      that.dispatchSelectionEvent('removeSelection', postcodes[0])
    }
  })
}

PostcodeMap.prototype.showPostcodeAreas = function (postcodes) {
  if (this.havePostcodesLoaded) {
    // do we need to make 'postcode_area' configurable?
    const filter = ['match', ['get', 'postcode_area'], postcodes, true, false]
    console.log(filter)
    this.mapModule.map.setFilter('postcodesFill', filter)
    this.currentFilter = filter
  } else {
    console.log('postcode layer not loaded')
  }
}

PostcodeMap.prototype.showSelected = function () {
  // check which postcodes have been selected
  const currentlySelected = this.getCurrentlySelectedPostcodes()
  // size of list of selected postcodes might change so resize map to match it
  this.mapModule.map.resize()
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
  },
  selectedColour: '#29235c',
  hoverColour: '#955'
}

export default PostcodeMap
