import utils from '../utils.js'

function Checker ($item) {
  this.$item = $item
}

Checker.prototype.init = function (options) {
  this.setOptions(options)
  console.log('init checker for', this.options.datasetName)
  this.pageLang = document.querySelector('html').lang

  this.$container = this.$item.closest(this.options.containerSelector)

  this.$propertiesList = this.$item.querySelector('.app-statement__properties')

  const boundDataRetrievedHandler = this.dataRetrievedHandler.bind(this)
  this.$container.addEventListener(this.options.dataEventName, boundDataRetrievedHandler)

  return this
}

Checker.prototype.addClass = function (classname) {
  this.$item.classList.add(classname)
}

Checker.prototype.check = function (features) {
  if (features.length) {
    this.showItem()
    this.display(features)
    console.log(this.options.datasetName, 'display the item and change the text')
  } else {
    this.hideItem()
  }
}

Checker.prototype.createElement = function (tag, textContent, classlist) {
  const $el = document.createElement(tag)
  $el.textContent = textContent
  if (classlist && classlist.length) {
    classlist.forEach((cls) => $el.classList.add(cls))
  }
  return $el
}

Checker.prototype.dataRetrievedHandler = function (e) {
  console.log('data retrieved, perform check for ', typeof (this))
  const relevantFeatures = this.getRelevantFeatures(e.detail.data.features)
  this.check(relevantFeatures)
}

Checker.prototype.display = function (features) {
  const $type = this.$item.querySelector('[data-locator="data-record-type"]')
  const $value = this.$item.querySelector('[data-locator="data-record-value"]')
  $type.textContent = $type.dataset.recordType

  // use attribute relevant to page language - defaults to english
  let attributeLang = 'en'
  const hasLangOption = Object.keys(this.options.nameAttribute).includes(this.pageLang)
  if (hasLangOption) {
    attributeLang = this.pageLang
  }
  $value.textContent = features[0].properties[this.options.nameAttribute[attributeLang]]

  // temporary for prototype
  // add warning message if welsh name not available
  if (!hasLangOption) {
    const warningText = $value.dataset.noWelshWarning
    $value.appendChild(this.createElement('span', `(${warningText})`, ['app-statement__warning']))
  }

  // if markup for properties list exists then display the properties
  if (this.$propertiesList) {
    this.displayProperties(features[0])
  }
}

Checker.prototype.displayProperties = function (feature) {
  const that = this
  // reset list
  this.$propertiesList.textContent = ''

  Object.keys(feature.properties).forEach(function (property) {
    const $group = that.createElement('div', '', ['app-dl__item__group'])
    $group.appendChild(that.createElement('dt', property))
    $group.appendChild(that.createElement('dd', feature.properties[property]))
    that.$propertiesList.appendChild($group)
  })
}

Checker.prototype.getItem = function () {
  return this.$item
}

Checker.prototype.getRelevantFeatures = function (features) {
  const dataType = this.options.datasetName
  return features.filter(function (feature) {
    if (feature.id.includes(dataType)) {
      return true
    }
    return false
  })
}

Checker.prototype.hideItem = function () {
  this.addClass('js-hidden')
}

Checker.prototype.removeClass = function (classname) {
  this.$item.classList.remove(classname)
}

Checker.prototype.showItem = function () {
  this.removeClass('js-hidden')
}

Checker.prototype.setOptions = function (opts) {
  const options = opts || {}
  this.options = utils.extend(checkerDefaults, options)
  console.log(this.options)
  // check if string or object provided for nameAttribute
  if (typeof this.options.nameAttribute === 'string') {
    const en = this.options.nameAttribute
    this.options.nameAttribute = {
      en: en
    }
  }
}

const checkerDefaults = {
  containerSelector: '[data-locator="locator-summary"]',
  dataEventName: 'dataRetrieved',
  datasetName: 'nationalBoundaries', // should rename to dataset name part
  nameAttribute: 'name'
}

export default Checker
