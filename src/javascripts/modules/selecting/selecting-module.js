import utils from '../../utils.js'
import Map from '../map'

// set up the module
function SelectMap ($mapContainer) {
  this.$mapContainer = $mapContainer
}

// initiate module with any options
SelectMap.prototype.init = function (opts) {
  this.setOptions(opts)

  this.mapModule = this.createMap()

  return this
}

// function to create the basic map
SelectMap.prototype.createMap = function () {
  const boundOnBaseMapLoaded = this.onBaseMapLoaded.bind(this)
  return new Map(this.$mapContainer).init({
    initialMapPosition: this.options.initialMapPosition,
    onLoadCallback: boundOnBaseMapLoaded,
    mapElementID: this.options.mapElementID
  })
}

// function called once the map has loaded
SelectMap.prototype.onBaseMapLoaded = function (e) {
  console.log('default base map loaded event', e)
}

// merge options provided to init() with defaults
SelectMap.prototype.setOptions = function (opts) {
  const options = opts || {}
  this.options = utils.extend(selectMapDefaults, options)
}

// default options
const selectMapDefaults = {
  initialMapPosition: {
    center: [-3.7, 52.4],
    zoom: 6.39
  },
  mapElementID: 'mapId'
}

export default SelectMap
