import utils from './../utils'

/* global window */

function LayerControls ($module, map) {
  this.$module = $module
  this.wramap = map
}

LayerControls.prototype.init = function (params) {
  this.setOptions(params)
  this._initialLoadWithLayers = false

  // returns a node list so convert to array
  const $controls = this.$module.querySelectorAll(this.options.layerControlSelector)
  this.$controls = Array.prototype.slice.call($controls)

  // find parent
  this.$container = this.$module.closest('.' + this.options.controlsContainerClass)
  this.$container.classList.remove('js-hidden')

  // add buttons to open and close panel
  this.$closeBtn = this.createCloseButton()
  this.$openBtn = this.createOpenButton()

  // list all datasets names
  this.datasetList = this.$controls.map($control => $control.dataset.layerControl)

  // create mapping between dataset and layer, one per control item
  this.loadAllLayers()

  // listen for changes to URL
  const boundSetControls = this.setControls.bind(this)
  window.addEventListener('popstate', function (event) {
    console.log('URL has changed - back button')
    boundSetControls()
  })

  // initial set up of controls (default or urlParams)
  const urlParams = (new URL(document.location)).searchParams
  if (!urlParams.has(this.options.layerURLParamName)) {
    // if not set then use default checked controls
    this.updateURL()
  } else {
    // use URL params if available
    this.setControls()
    this._initialLoadWithLayers = true
  }

  // listen for changes on each checkbox and change the URL
  const boundControlChkbxChangeHandler = this.onControlChkbxChange.bind(this)
  this.$controls.forEach(function ($control) {
    $control.addEventListener('change', boundControlChkbxChangeHandler, true)
  }, this)

  return this
}

LayerControls.prototype.createCloseButton = function () {
  const button = document.createElement('button')
  button.classList.add('app-map__close-btn')
  button.dataset.action = 'close'
  const label = document.createElement('span')
  label.textContent = 'Close layer panel'
  label.classList.add('wra-visually-hidden')
  button.appendChild(label)
  this.$container.appendChild(button)

  const boundTogglePanel = this.togglePanel.bind(this)
  button.addEventListener('click', boundTogglePanel)
  return button
}

LayerControls.prototype.createOpenButton = function () {
  const button = document.createElement('button')
  button.classList.add('app-map__open-btn', 'app-map__overlay', 'js-hidden')
  button.dataset.action = 'open'
  const label = document.createElement('span')
  label.textContent = 'Open layer panel'
  label.classList.add('wra-visually-hidden')
  button.appendChild(label)
  this.wramap.getMap().getContainer().appendChild(button)

  const boundTogglePanel = this.togglePanel.bind(this)
  button.addEventListener('click', boundTogglePanel)
  return button
}

LayerControls.prototype.togglePanel = function (e) {
  const action = e.target.dataset.action
  const opening = (action === 'open')
  // set aria attributes
  this.$container.setAttribute('aria-hidden', !opening)
  this.$container.setAttribute('open', opening)
  if (opening) {
    this.$container.classList.remove('app-map__side-panel--collapsed')
    this.$openBtn.classList.add('js-hidden')
    // focus on the panel when opening
    this.$container.focus()
  } else {
    this.$container.classList.add('app-map__side-panel--collapsed')
    this.$openBtn.classList.remove('js-hidden')
    // focus on open btn when closing panel
    this.$openBtn.focus()
  }
}

LayerControls.prototype.onControlChkbxChange = function (e) {
  console.log('Has been toggled', e.target, this)
  // get the control containing changed checkbox
  // var $clickedControl = e.target.closest(this.layerControlSelector)

  // when a control is changed update the URL params
  this.updateURL()
}

// should this return an array or a single control?
LayerControls.prototype.getControlByName = function (dataset) {
  for (let i = 0; i < this.$controls.length; i++) {
    const $control = this.$controls[i]
    if ($control.dataset.layerControl === dataset) {
      return $control
    }
  }
  return undefined
}

LayerControls.prototype.createVectorLayer = function (layerId, datasetName, _type, paintOptions) {
  // if there is a tileSource for the layer use that or default to the group one
  const tileSource = this.map.getSource(datasetName + '-source') ? datasetName + '-source' : this.tileSource
  console.log('TileSource:', tileSource)
  this.map.addLayer({
    id: layerId,
    type: _type,
    source: tileSource,
    'source-layer': datasetName,
    paint: paintOptions
  })
}

LayerControls.prototype.loadAllLayers = function () {
  //const availableDatasets = []
  const that = this

  this.$controls.forEach(function ($control) {
    const datasetName = that.getDatasetName($control)
    const endpoint = that.getDatasetEndpoint($control)
    const layerColour = that.getDatasetColour($control)

    // handle cases where endpoint has been left blank
    // allows data to be loaded/added at a later point
    if (endpoint) {
      that.wramap.addGeojsonSource(datasetName, endpoint)
      that.trackDataLoad($control, datasetName)
    } else {
      that.wramap.addEmptySource(datasetName, endpoint)
    }

    // in future might be more than polygon
    that.wramap.addPolygonLayer(datasetName, datasetName, {
      fillColor: layerColour,
      fillOpacity: 0.4,
      lineColor: layerColour,
      lineOpacity: 0.8,
      lineWidth: 1
    })
  })
}

LayerControls.prototype.enable = function ($control) {
  console.log('enable', this.getDatasetName($control))
  const $chkbx = $control.querySelector('input[type="checkbox"]')
  $chkbx.checked = true
  $control.dataset.layerControlActive = 'true'
  $control.classList.remove(this.layerControlDeactivatedClass)
  this.wramap.togglePolygonLayerVisibility(this.getDatasetName($control), true)
}

LayerControls.prototype.disable = function ($control) {
  console.log('disable', this.getDatasetName($control))
  const $chkbx = $control.querySelector('input[type="checkbox"]')
  $chkbx.checked = false
  $control.dataset.layerControlActive = 'false'
  $control.classList.add(this.layerControlDeactivatedClass)
  this.wramap.togglePolygonLayerVisibility(this.getDatasetName($control), false)
}

/**
 * Sets the checkboxes based on ?layer= URL params
 */
LayerControls.prototype.setControls = function () {
  const urlParams = (new URL(document.location)).searchParams

  let enabledLayerNames = []
  if (urlParams.has(this.options.layerURLParamName)) {
    // get the names of the enabled and disabled layers
    // only care about layers that exist
    enabledLayerNames = urlParams.getAll(this.options.layerURLParamName).filter(name => this.datasetList.indexOf(name) > -1)
    console.log('Enable:', enabledLayerNames)
  }

  const datasetNamesClone = [].concat(this.datasetList)
  const disabledLayerNames = datasetNamesClone.filter(name => enabledLayerNames.indexOf(name) === -1)

  // map the names to the controls
  const toEnable = enabledLayerNames.map(name => this.getControlByName(name))
  const toDisable = disabledLayerNames.map(name => this.getControlByName(name))

  // pass correct this arg
  toEnable.forEach(this.enable, this)
  toDisable.forEach(this.disable, this)
}

LayerControls.prototype.trackDataLoad = function ($control, datasetName) {
  // add a class for whilst it is loading
  $control.classList.add('layer-loading')

  const map = this.wramap.map

  function loadedHandler (e) {
    if (map.getSource(datasetName) && map.isSourceLoaded(datasetName)) {
      console.log(`${datasetName} source loaded!`)
      $control.classList.remove('layer-loading')
      map.off('sourcedata', loadedHandler)
    }
  }
  map.on('sourcedata', loadedHandler)
}

/**
 * Updates the URL by adding or removing ?layer= params based on latest changes to checkboxes
 */
LayerControls.prototype.updateURL = function () {
  const urlParams = (new URL(document.location)).searchParams
  const enabledLayers = this.enabledLayers().map($control => this.getDatasetName($control))

  urlParams.delete(this.options.layerURLParamName)
  enabledLayers.forEach(name => urlParams.append(this.options.layerURLParamName, name))
  const newURL = window.location.pathname + '?' + urlParams.toString() + window.location.hash
  // add entry to history, does not fire event so need to call setControls
  window.history.pushState({}, '', newURL)
  this.setControls()
}

LayerControls.prototype.getCheckbox = function ($control) {
  return $control.querySelector('input[type="checkbox"]')
}

LayerControls.prototype.enabledLayers = function () {
  return this.$controls.filter($control => this.getCheckbox($control).checked)
}

LayerControls.prototype.disabledLayers = function () {
  return this.$controls.filter($control => !this.getCheckbox($control).checked)
}

LayerControls.prototype.getDatasetName = function ($control) {
  return $control.dataset.layerControl
}

LayerControls.prototype.getDatasetEndpoint = function ($control) {
  return $control.dataset.layerEndpoint
}

LayerControls.prototype.getDatasetType = function ($control) {
  return $control.dataset.layerDataType
}

LayerControls.prototype.getDatasetColour = function ($control) {
  return $control.dataset.layerColour
}

LayerControls.prototype.getZoomRestriction = function ($control) {
  return $control.dataset.layerControlZoom
}

/**
 * Extracts and splits style options from style data attribute string
 * @param  {Element} $control a control item
 */
LayerControls.prototype.getStyle = function ($control) {
  const defaultColour = '#003078'
  const defaultOpacity = 0.5
  const defaultWeight = 2
  const s = $control.dataset.styleOptions
  const parts = s.split(',')
  return {
    colour: parts[0] || defaultColour,
    opacity: parseFloat(parts[1]) || defaultOpacity,
    weight: parseInt(parts[2]) || defaultWeight
  }
}

LayerControls.prototype.setOptions = function (opts) {
  const options = opts || {}
  this.options = utils.extend(layerControsDefaults, options)
}

const layerControsDefaults = {
  layerControlSelector: '[data-layer-control]',
  layerControlDeactivatedClass: 'deactivated-control',
  controlsContainerClass: 'app-map__side-panel',
  layerURLParamName: 'dataset',
  closeBtnClass: 'app-map__close-btn',
  openBtnClass: 'app-map__open-btn'
}

export default LayerControls
